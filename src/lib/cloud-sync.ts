// Cloud sync: pull from Supabase, push local mutations, realtime live updates.
// Works in tandem with the local store. Off when signed out.
import { supabase } from "@/integration/supabase/client";
import { getState, id, setCloudPusher, setState, type Diet, type MascotId, type PantryItem, type Theme } from "./store";
import { setSyncStatus } from "./sync-status";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any;

let userId: string | null = null;
let active = false;
let realtime: ReturnType<typeof supabase.channel> | null = null;
let pending = 0;

type PushOp = { kind: string; payload: unknown };

async function flushOp(op: PushOp) {
  if (!userId) return;
  pending++; setSyncStatus("syncing");
  try {
    switch (op.kind) {
      case "pantry.add": {
        const i = op.payload as PantryItem;
        await sb.from("pantry_items").upsert({
          id: i.id, user_id: userId, name: i.name, qty: i.qty, unit: i.unit,
          category: i.category, expires_at: new Date(i.expiresAt).toISOString(), price: i.price ?? null,
        });
        break;
      }
      case "pantry.update": {
        const { id: pid, patch } = op.payload as { id: string; patch: Partial<PantryItem> };
        const u: Record<string, unknown> = {};
        if (patch.name !== undefined) u.name = patch.name;
        if (patch.qty !== undefined) u.qty = patch.qty;
        if (patch.unit !== undefined) u.unit = patch.unit;
        if (patch.category !== undefined) u.category = patch.category;
        if (patch.expiresAt !== undefined) u.expires_at = new Date(patch.expiresAt).toISOString();
        if (patch.price !== undefined) u.price = patch.price;
        await sb.from("pantry_items").update(u).eq("id", pid).eq("user_id", userId);
        break;
      }
      case "pantry.remove": {
        const { id: pid } = op.payload as { id: string };
        await sb.from("pantry_items").delete().eq("id", pid).eq("user_id", userId);
        break;
      }
      case "expense.add": {
        const e = op.payload as { id: string; amount: number; category: string; note?: string; date: number };
        await sb.from("expenses").upsert({
          id: e.id, user_id: userId, amount: e.amount, category: e.category, note: e.note ?? null,
          date: new Date(e.date).toISOString(),
        });
        break;
      }
      case "expense.remove": {
        const { id: eid } = op.payload as { id: string };
        await sb.from("expenses").delete().eq("id", eid).eq("user_id", userId);
        break;
      }
      case "shopping.add":
      case "shopping.update": {
        const s = op.payload as { id: string; name: string; done: boolean };
        await sb.from("shopping_items").upsert({ id: s.id, user_id: userId, name: s.name, done: s.done });
        break;
      }
      case "shopping.remove": {
        const { id: sid } = op.payload as { id: string };
        await sb.from("shopping_items").delete().eq("id", sid).eq("user_id", userId);
        break;
      }
      case "cooked.add": {
        const c = op.payload as { id: string; mealId: string; date: number };
        await sb.from("cooked_meals").upsert({ id: c.id, user_id: userId, meal_id: c.mealId, date: new Date(c.date).toISOString() });
        break;
      }
      case "profile.update": {
        const p = op.payload as Record<string, unknown>;
        const u: Record<string, unknown> = {};
        if ("displayName" in p) u.display_name = p.displayName;
        if ("mascot" in p) u.mascot = p.mascot;
        if ("diet" in p) u.diet = p.diet;
        if ("theme" in p) u.theme = p.theme;
        if ("onboarded" in p) u.onboarded = p.onboarded;
        if ("weeklyBudget" in p) u.weekly_budget = p.weeklyBudget;
        if ("weekly_budget" in p) u.weekly_budget = (p as { weekly_budget: number }).weekly_budget;
        u.updated_at = new Date().toISOString();
        await sb.from("profiles").update(u).eq("id", userId);
        break;
      }
    }
  } catch (e) {
    console.warn("[cloud-sync] flush failed", op.kind, e);
    setSyncStatus("error");
  } finally {
    pending = Math.max(0, pending - 1);
    if (pending === 0) setSyncStatus("idle");
  }
}

export async function pullFromCloud() {
  if (!userId) return;
  const [profile, pantry, expenses, shopping, cooked] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("pantry_items").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    supabase.from("expenses").select("*").eq("user_id", userId).order("date", { ascending: false }),
    supabase.from("shopping_items").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    supabase.from("cooked_meals").select("*").eq("user_id", userId).order("date", { ascending: false }),
  ]);

  setState((s) => ({
    ...s,
    displayName: profile.data?.display_name ?? s.displayName,
    mascot: (profile.data?.mascot as MascotId) ?? s.mascot,
    diet: (profile.data?.diet as Diet) ?? s.diet,
    theme: (profile.data?.theme as Theme) ?? s.theme,
    weeklyBudget: Number(profile.data?.weekly_budget ?? s.weeklyBudget),
    onboarded: profile.data?.onboarded ?? s.onboarded,
    pantry: (pantry.data ?? []).map((r) => ({
      id: r.id, name: r.name, qty: Number(r.qty), unit: r.unit, category: r.category as PantryItem["category"],
      addedAt: r.created_at ? new Date(r.created_at).getTime() : Date.now(),
      expiresAt: new Date(r.expires_at).getTime(),
      price: r.price !== null ? Number(r.price) : undefined,
    })),
    expenses: (expenses.data ?? []).map((r) => ({
      id: r.id, amount: Number(r.amount), category: r.category as never,
      note: r.note ?? undefined, date: new Date(r.date).getTime(),
    })),
    shopping: (shopping.data ?? []).map((r) => ({ id: r.id, name: r.name, done: r.done })),
    cooked: (cooked.data ?? []).map((r) => ({ id: r.id, mealId: r.meal_id, date: new Date(r.date).getTime() })),
  }));
}

export async function pushAllLocalToCloud() {
  if (!userId) return;
  const s = getState();
  // Profile
  await sb.from("profiles").update({
    display_name: s.displayName, mascot: s.mascot, diet: s.diet, theme: s.theme,
    weekly_budget: s.weeklyBudget, onboarded: s.onboarded, updated_at: new Date().toISOString(),
  }).eq("id", userId);

  if (s.pantry.length) {
    await sb.from("pantry_items").upsert(s.pantry.map((i) => ({
      id: i.id, user_id: userId, name: i.name, qty: i.qty, unit: i.unit, category: i.category,
      expires_at: new Date(i.expiresAt).toISOString(), price: i.price ?? null,
    })));
  }
  if (s.expenses.length) {
    await sb.from("expenses").upsert(s.expenses.map((e) => ({
      id: e.id, user_id: userId, amount: e.amount, category: e.category, note: e.note ?? null,
      date: new Date(e.date).toISOString(),
    })));
  }
  if (s.shopping.length) {
    await sb.from("shopping_items").upsert(s.shopping.map((i) => ({
      id: i.id, user_id: userId, name: i.name, done: i.done,
    })));
  }
}

function subscribeRealtime() {
  if (realtime) supabase.removeChannel(realtime);
  realtime = supabase
    .channel("pantrypal-sync")
    .on("postgres_changes", { event: "*", schema: "public", table: "pantry_items", filter: `user_id=eq.${userId}` }, () => pullFromCloud())
    .on("postgres_changes", { event: "*", schema: "public", table: "expenses", filter: `user_id=eq.${userId}` }, () => pullFromCloud())
    .on("postgres_changes", { event: "*", schema: "public", table: "shopping_items", filter: `user_id=eq.${userId}` }, () => pullFromCloud())
    .on("postgres_changes", { event: "*", schema: "public", table: "profiles", filter: `id=eq.${userId}` }, () => pullFromCloud())
    .subscribe();
}

export async function startCloudSync(uid: string, opts: { mergeLocal: boolean }) {
  userId = uid;
  active = true;
  setSyncStatus("syncing");
  setCloudPusher((op) => { void flushOp(op); });

  try {
    await sb.from("profiles").upsert({ id: uid }, { onConflict: "id", ignoreDuplicates: true });
    if (opts.mergeLocal) await pushAllLocalToCloud();
    await pullFromCloud();
    subscribeRealtime();
    setSyncStatus("idle");
  } catch (e) {
    console.warn("[cloud-sync] start failed", e);
    setSyncStatus("error");
  }
}

export function stopCloudSync() {
  active = false;
  userId = null;
  setCloudPusher(null);
  if (realtime) { supabase.removeChannel(realtime); realtime = null; }
  setSyncStatus("offline");
}

export function isSyncing() { return active; }
export { id as newId };
