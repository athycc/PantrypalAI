import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, useRouter, Link, Outlet, HeadContent, Scripts, useNavigate, useLocation, createFileRoute, lazyRouteComponent, createRouter } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { useRef, useSyncExternalStore, useEffect } from "react";
import { Toaster } from "sonner";
import { createClient } from "@supabase/supabase-js";
const appCss = "/assets/style-DomPlSDH.css";
const KEY = "pantrypal:v3";
const day = 864e5;
function demoSeed() {
  const now = Date.now();
  return {
    pantry: [
      { id: id(), name: "Rice", qty: 5, unit: "kg", category: "Grains", addedAt: now, expiresAt: now + 45 * day, price: 265 },
      { id: id(), name: "Eggs", qty: 6, unit: "pcs", category: "Protein", addedAt: now, expiresAt: now + 12 * day, price: 72 },
      { id: id(), name: "Kangkong", qty: 1, unit: "bundle", category: "Vegetables", addedAt: now, expiresAt: now + 1 * day, price: 25 },
      { id: id(), name: "Tofu", qty: 200, unit: "g", category: "Protein", addedAt: now, expiresAt: now - 1 * day, price: 38 },
      { id: id(), name: "Soy Sauce", qty: 1, unit: "L", category: "Condiments", addedAt: now, expiresAt: now + 120 * day, price: 98 },
      { id: id(), name: "Garlic", qty: 100, unit: "g", category: "Vegetables", addedAt: now, expiresAt: now + 20 * day, price: 30 },
      { id: id(), name: "Onion", qty: 3, unit: "pcs", category: "Vegetables", addedAt: now, expiresAt: now + 14 * day, price: 35 }
    ],
    expenses: [
      { id: id(), amount: 265, category: "Groceries", note: "Rice 5kg", date: now - 6 * day },
      { id: id(), amount: 72, category: "Groceries", note: "Eggs", date: now - 5 * day },
      { id: id(), amount: 89, category: "Eating Out", note: "Jollibee", date: now - 3 * day },
      { id: id(), amount: 45, category: "Eating Out", note: "Lugaw", date: now - 1 * day }
    ]
  };
}
function blank() {
  return {
    pantry: [],
    expenses: [],
    cooked: [],
    shopping: [],
    receipts: [],
    weeklyBudget: 800,
    displayName: "Friend",
    mascot: "bee-chef",
    diet: "none",
    theme: "dark",
    onboarded: false
  };
}
function id() {
  return Math.random().toString(36).slice(2, 10);
}
let state = load();
const listeners$1 = /* @__PURE__ */ new Set();
function load() {
  if (typeof window === "undefined") return blank();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const v2 = localStorage.getItem("pantrypal:v2");
      const base = blank();
      if (v2) {
        try {
          const old = JSON.parse(v2);
          return {
            ...base,
            pantry: old.pantry ?? [],
            expenses: old.expenses ?? [],
            cooked: old.cooked ?? [],
            shopping: Array.isArray(old.shoppingList) ? old.shoppingList.map((n) => ({ id: id(), name: n, done: false })) : [],
            weeklyBudget: old.weeklyBudget ?? 800,
            onboarded: true
          };
        } catch {
        }
      }
      localStorage.setItem(KEY, JSON.stringify(base));
      return base;
    }
    return { ...blank(), ...JSON.parse(raw) };
  } catch {
    return blank();
  }
}
function persist() {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(state));
  listeners$1.forEach((l) => l());
}
function set(updater) {
  state = updater(state);
  persist();
}
function shallowEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (typeof a !== "object" || a === null || typeof b !== "object" || b === null) return false;
  const ak = Object.keys(a);
  const bk = Object.keys(b);
  if (ak.length !== bk.length) return false;
  for (const k of ak) {
    if (!Object.is(a[k], b[k])) return false;
  }
  return true;
}
function useStore(selector) {
  const cacheRef = useRef(void 0);
  const getCached = () => {
    const next = selector(state);
    if (cacheRef.current && shallowEqual(cacheRef.current.value, next)) {
      return cacheRef.current.value;
    }
    cacheRef.current = { value: next };
    return next;
  };
  return useSyncExternalStore(
    (cb) => {
      listeners$1.add(cb);
      return () => listeners$1.delete(cb);
    },
    getCached,
    getCached
  );
}
function getState() {
  return state;
}
function setState(updater) {
  set(updater);
}
let cloudPush = null;
function setCloudPusher(fn) {
  cloudPush = fn;
}
function push(kind, payload) {
  if (cloudPush) cloudPush({ kind, payload });
}
const actions = {
  addPantryItem(item) {
    const full = { ...item, id: id(), addedAt: Date.now() };
    set((s) => ({ ...s, pantry: [full, ...s.pantry] }));
    push("pantry.add", full);
  },
  updatePantryItem(itemId, patch) {
    set((s) => ({ ...s, pantry: s.pantry.map((p) => p.id === itemId ? { ...p, ...patch } : p) }));
    push("pantry.update", { id: itemId, patch });
  },
  removePantryItem(itemId) {
    set((s) => ({ ...s, pantry: s.pantry.filter((p) => p.id !== itemId) }));
    push("pantry.remove", { id: itemId });
  },
  consumeIngredients(names) {
    set((s) => {
      const used = /* @__PURE__ */ new Set();
      for (const n of names) {
        const found = s.pantry.find(
          (p) => !used.has(p.id) && (p.name.toLowerCase().includes(n.toLowerCase()) || n.toLowerCase().includes(p.name.toLowerCase()))
        );
        if (found) used.add(found.id);
      }
      used.forEach((uid) => push("pantry.remove", { id: uid }));
      return { ...s, pantry: s.pantry.filter((p) => !used.has(p.id)) };
    });
  },
  addExpense(e) {
    const full = { ...e, id: id(), date: e.date ?? Date.now() };
    set((s) => ({ ...s, expenses: [full, ...s.expenses] }));
    push("expense.add", full);
  },
  removeExpense(eid) {
    set((s) => ({ ...s, expenses: s.expenses.filter((e) => e.id !== eid) }));
    push("expense.remove", { id: eid });
  },
  setBudget(amount) {
    set((s) => ({ ...s, weeklyBudget: amount }));
    push("profile.update", { weekly_budget: amount });
  },
  cookMeal(mealId, ingredientNames) {
    const c = { id: id(), mealId, date: Date.now() };
    set((s) => ({ ...s, cooked: [c, ...s.cooked] }));
    push("cooked.add", c);
    actions.consumeIngredients(ingredientNames);
  },
  addToShoppingList(name) {
    set((s) => {
      if (s.shopping.some((i) => i.name.toLowerCase() === name.toLowerCase())) return s;
      const item = { id: id(), name, done: false };
      push("shopping.add", item);
      return { ...s, shopping: [...s.shopping, item] };
    });
  },
  toggleShopping(itemId) {
    set((s) => ({
      ...s,
      shopping: s.shopping.map((i) => i.id === itemId ? { ...i, done: !i.done } : i)
    }));
    const it = state.shopping.find((i) => i.id === itemId);
    if (it) push("shopping.update", it);
  },
  removeFromShopping(itemId) {
    set((s) => ({ ...s, shopping: s.shopping.filter((i) => i.id !== itemId) }));
    push("shopping.remove", { id: itemId });
  },
  clearDoneShopping() {
    const done = state.shopping.filter((i) => i.done);
    set((s) => ({ ...s, shopping: s.shopping.filter((i) => !i.done) }));
    done.forEach((d) => push("shopping.remove", { id: d.id }));
  },
  bulkAddPantry(items, totalSpent, store) {
    const full = items.map((i) => ({ ...i, id: id(), addedAt: Date.now() }));
    const exp = { id: id(), amount: totalSpent, category: "Groceries", note: store, date: Date.now() };
    const receipt = {
      id: id(),
      store,
      date: Date.now(),
      total: totalSpent,
      items: items.map((i) => ({ name: i.name, qty: i.qty, unit: i.unit, category: i.category, price: i.price }))
    };
    set((s) => ({ ...s, pantry: [...full, ...s.pantry], expenses: [exp, ...s.expenses], receipts: [receipt, ...s.receipts] }));
    full.forEach((i) => push("pantry.add", i));
    push("expense.add", exp);
  },
  removeReceipt(rid) {
    set((s) => ({ ...s, receipts: s.receipts.filter((r) => r.id !== rid) }));
  },
  setProfile(patch) {
    set((s) => ({ ...s, ...patch }));
    push("profile.update", patch);
  },
  loadDemoData() {
    const seed = demoSeed();
    set((s) => ({ ...s, pantry: seed.pantry, expenses: seed.expenses }));
    seed.pantry.forEach((i) => push("pantry.add", i));
    seed.expenses.forEach((e) => push("expense.add", e));
  },
  resetAll() {
    state = { ...blank(), theme: state.theme };
    persist();
  },
  replaceAll(next) {
    set((s) => ({ ...s, ...next }));
  }
};
function daysUntil(ms) {
  return Math.ceil((ms - Date.now()) / 864e5);
}
function pantryStatus(item) {
  const d = daysUntil(item.expiresAt);
  if (d < 0) return "expired";
  if (d <= 3) return "expiring";
  return "fresh";
}
function weekStart() {
  const d = /* @__PURE__ */ new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d.getTime();
}
function monthStart() {
  const d = /* @__PURE__ */ new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(1);
  return d.getTime();
}
function ThemeApplier() {
  const theme = useStore((s) => s.theme);
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);
  return null;
}
function createSupabaseClient() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    const missing = [
      ...!SUPABASE_URL ? ["SUPABASE_URL"] : [],
      ...!SUPABASE_PUBLISHABLE_KEY ? ["SUPABASE_PUBLISHABLE_KEY"] : []
    ];
    const message = `Missing Supabase environment variable(s): ${missing.join(", ")}. Connect Supabase in  Cloud.`;
    console.error(`[Supabase] ${message}`);
    throw new Error(message);
  }
  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: typeof window !== "undefined" ? localStorage : void 0,
      persistSession: true,
      autoRefreshToken: true
    }
  });
}
let _supabase;
const supabase = new Proxy({}, {
  get(_, prop, receiver) {
    if (!_supabase) _supabase = createSupabaseClient();
    return Reflect.get(_supabase, prop, receiver);
  }
});
let snapshot = { status: "offline", lastSync: null };
const listeners = /* @__PURE__ */ new Set();
function emit() {
  listeners.forEach((l) => l());
}
function setSyncStatus(s) {
  if (snapshot.status === s && s !== "idle") return;
  snapshot = { status: s, lastSync: s === "idle" ? Date.now() : snapshot.lastSync };
  emit();
}
function subscribe(cb) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
function getSnapshot() {
  return snapshot;
}
function useSyncStatus() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
const sb = supabase;
let userId = null;
let realtime = null;
let pending = 0;
async function flushOp(op) {
  if (!userId) return;
  pending++;
  setSyncStatus("syncing");
  try {
    switch (op.kind) {
      case "pantry.add": {
        const i = op.payload;
        await sb.from("pantry_items").upsert({
          id: i.id,
          user_id: userId,
          name: i.name,
          qty: i.qty,
          unit: i.unit,
          category: i.category,
          expires_at: new Date(i.expiresAt).toISOString(),
          price: i.price ?? null
        });
        break;
      }
      case "pantry.update": {
        const { id: pid, patch } = op.payload;
        const u = {};
        if (patch.name !== void 0) u.name = patch.name;
        if (patch.qty !== void 0) u.qty = patch.qty;
        if (patch.unit !== void 0) u.unit = patch.unit;
        if (patch.category !== void 0) u.category = patch.category;
        if (patch.expiresAt !== void 0) u.expires_at = new Date(patch.expiresAt).toISOString();
        if (patch.price !== void 0) u.price = patch.price;
        await sb.from("pantry_items").update(u).eq("id", pid).eq("user_id", userId);
        break;
      }
      case "pantry.remove": {
        const { id: pid } = op.payload;
        await sb.from("pantry_items").delete().eq("id", pid).eq("user_id", userId);
        break;
      }
      case "expense.add": {
        const e = op.payload;
        await sb.from("expenses").upsert({
          id: e.id,
          user_id: userId,
          amount: e.amount,
          category: e.category,
          note: e.note ?? null,
          date: new Date(e.date).toISOString()
        });
        break;
      }
      case "expense.remove": {
        const { id: eid } = op.payload;
        await sb.from("expenses").delete().eq("id", eid).eq("user_id", userId);
        break;
      }
      case "shopping.add":
      case "shopping.update": {
        const s = op.payload;
        await sb.from("shopping_items").upsert({ id: s.id, user_id: userId, name: s.name, done: s.done });
        break;
      }
      case "shopping.remove": {
        const { id: sid } = op.payload;
        await sb.from("shopping_items").delete().eq("id", sid).eq("user_id", userId);
        break;
      }
      case "cooked.add": {
        const c = op.payload;
        await sb.from("cooked_meals").upsert({ id: c.id, user_id: userId, meal_id: c.mealId, date: new Date(c.date).toISOString() });
        break;
      }
      case "profile.update": {
        const p = op.payload;
        const u = {};
        if ("displayName" in p) u.display_name = p.displayName;
        if ("mascot" in p) u.mascot = p.mascot;
        if ("diet" in p) u.diet = p.diet;
        if ("theme" in p) u.theme = p.theme;
        if ("onboarded" in p) u.onboarded = p.onboarded;
        if ("weeklyBudget" in p) u.weekly_budget = p.weeklyBudget;
        if ("weekly_budget" in p) u.weekly_budget = p.weekly_budget;
        u.updated_at = (/* @__PURE__ */ new Date()).toISOString();
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
async function pullFromCloud() {
  if (!userId) return;
  const [profile, pantry, expenses, shopping, cooked] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("pantry_items").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    supabase.from("expenses").select("*").eq("user_id", userId).order("date", { ascending: false }),
    supabase.from("shopping_items").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    supabase.from("cooked_meals").select("*").eq("user_id", userId).order("date", { ascending: false })
  ]);
  setState((s) => ({
    ...s,
    displayName: profile.data?.display_name ?? s.displayName,
    mascot: profile.data?.mascot ?? s.mascot,
    diet: profile.data?.diet ?? s.diet,
    theme: profile.data?.theme ?? s.theme,
    weeklyBudget: Number(profile.data?.weekly_budget ?? s.weeklyBudget),
    onboarded: profile.data?.onboarded ?? s.onboarded,
    pantry: (pantry.data ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      qty: Number(r.qty),
      unit: r.unit,
      category: r.category,
      addedAt: r.created_at ? new Date(r.created_at).getTime() : Date.now(),
      expiresAt: new Date(r.expires_at).getTime(),
      price: r.price !== null ? Number(r.price) : void 0
    })),
    expenses: (expenses.data ?? []).map((r) => ({
      id: r.id,
      amount: Number(r.amount),
      category: r.category,
      note: r.note ?? void 0,
      date: new Date(r.date).getTime()
    })),
    shopping: (shopping.data ?? []).map((r) => ({ id: r.id, name: r.name, done: r.done })),
    cooked: (cooked.data ?? []).map((r) => ({ id: r.id, mealId: r.meal_id, date: new Date(r.date).getTime() }))
  }));
}
async function pushAllLocalToCloud() {
  if (!userId) return;
  const s = getState();
  await sb.from("profiles").update({
    display_name: s.displayName,
    mascot: s.mascot,
    diet: s.diet,
    theme: s.theme,
    weekly_budget: s.weeklyBudget,
    onboarded: s.onboarded,
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", userId);
  if (s.pantry.length) {
    await sb.from("pantry_items").upsert(s.pantry.map((i) => ({
      id: i.id,
      user_id: userId,
      name: i.name,
      qty: i.qty,
      unit: i.unit,
      category: i.category,
      expires_at: new Date(i.expiresAt).toISOString(),
      price: i.price ?? null
    })));
  }
  if (s.expenses.length) {
    await sb.from("expenses").upsert(s.expenses.map((e) => ({
      id: e.id,
      user_id: userId,
      amount: e.amount,
      category: e.category,
      note: e.note ?? null,
      date: new Date(e.date).toISOString()
    })));
  }
  if (s.shopping.length) {
    await sb.from("shopping_items").upsert(s.shopping.map((i) => ({
      id: i.id,
      user_id: userId,
      name: i.name,
      done: i.done
    })));
  }
}
function subscribeRealtime() {
  if (realtime) supabase.removeChannel(realtime);
  realtime = supabase.channel("pantrypal-sync").on("postgres_changes", { event: "*", schema: "public", table: "pantry_items", filter: `user_id=eq.${userId}` }, () => pullFromCloud()).on("postgres_changes", { event: "*", schema: "public", table: "expenses", filter: `user_id=eq.${userId}` }, () => pullFromCloud()).on("postgres_changes", { event: "*", schema: "public", table: "shopping_items", filter: `user_id=eq.${userId}` }, () => pullFromCloud()).on("postgres_changes", { event: "*", schema: "public", table: "profiles", filter: `id=eq.${userId}` }, () => pullFromCloud()).subscribe();
}
async function startCloudSync(uid, opts) {
  userId = uid;
  setSyncStatus("syncing");
  setCloudPusher((op) => {
    void flushOp(op);
  });
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
function stopCloudSync() {
  userId = null;
  setCloudPusher(null);
  if (realtime) {
    supabase.removeChannel(realtime);
    realtime = null;
  }
  setSyncStatus("offline");
}
function NotFoundComponent() {
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Page not found." }),
    /* @__PURE__ */ jsx(Link, { to: "/", className: "mt-6 inline-block rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground", children: "Go home" })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router2 = useRouter();
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4 text-center", children: /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold text-foreground", children: "Something went wrong" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: error.message }),
    /* @__PURE__ */ jsx("button", { onClick: () => {
      router2.invalidate();
      reset();
    }, className: "mt-6 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground", children: "Try again" })
  ] }) });
}
const Route$a = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "PantryPal AI — Scan, Track, Save" },
      { name: "description", content: "AI-powered pantry, meal & budget companion for Filipino students and dormers." },
      { name: "theme-color", content: "#f7d488" }
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$a.useRouteContext();
  return /* @__PURE__ */ jsxs(QueryClientProvider, { client: queryClient, children: [
    /* @__PURE__ */ jsx(ThemeApplier, {}),
    /* @__PURE__ */ jsx(Bootstrap, {}),
    /* @__PURE__ */ jsx(Outlet, {}),
    /* @__PURE__ */ jsx(Toaster, { position: "top-center", toastOptions: { style: { background: "var(--card)", color: "var(--foreground)", border: "1px solid var(--border)" } } })
  ] });
}
function Bootstrap() {
  const navigate = useNavigate();
  const location = useLocation();
  const onboarded = useStore((s) => s.onboarded);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const path = location.pathname;
    const skip = path === "/onboarding" || path === "/login";
    if (!onboarded && !skip) navigate({ to: "/onboarding" });
  }, [onboarded, location.pathname, navigate]);
  useEffect(() => {
    let started = false;
    supabase.auth.getSession().then(({ data: data2 }) => {
      if (data2.session && !started) {
        started = true;
        void startCloudSync(data2.session.user.id, { mergeLocal: true });
      }
    });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        void startCloudSync(session.user.id, { mergeLocal: true });
      } else if (event === "SIGNED_OUT") {
        stopCloudSync();
      }
    });
    return () => data.subscription.unsubscribe();
  }, []);
  return null;
}
const BASE_URL = "";
const Route$9 = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries = [
          { path: "/", priority: "1.0" },
          { path: "/scanner", priority: "0.8" },
          { path: "/meals", priority: "0.8" },
          { path: "/budget", priority: "0.8" },
          { path: "/shopping", priority: "0.7" },
          { path: "/settings", priority: "0.5" },
          { path: "/login", priority: "0.6" }
        ];
        const urls = entries.map((e) => `  <url><loc>${BASE_URL}${e.path}</loc><priority>${e.priority}</priority></url>`).join("\n");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
        return new Response(xml, { headers: { "Content-Type": "application/xml" } });
      }
    }
  }
});
const $$splitComponentImporter$8 = () => import("./shopping-DN1AKIqk.js");
const Route$8 = createFileRoute("/shopping")({
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./settings-DQelUrpP.js");
const Route$7 = createFileRoute("/settings")({
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./scanner-DtCXbjUQ.js");
const Route$6 = createFileRoute("/scanner")({
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./receipts-EjNZmO3H.js");
const Route$5 = createFileRoute("/receipts")({
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./onboarding-B-8oaJAb.js");
const Route$4 = createFileRoute("/onboarding")({
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./meals-B-8oaJAb.js");
const Route$3 = createFileRoute("/meals")({
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./login-CWPB4pkn.js");
const Route$2 = createFileRoute("/login")({
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./budget-CsF_HKcs.js");
const Route$1 = createFileRoute("/budget")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./index-_uEyGqMX.js");
const Route = createFileRoute("/")({
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
function RingPct({
  value,
  stroke = "oklch(0.22 0.04 60)"
}) {
  const r = 22;
  const c = 2 * Math.PI * r;
  const dash = value / 100 * c;
  return /* @__PURE__ */ jsxs("div", { className: "relative h-14 w-14", children: [
    /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 56 56", className: "h-full w-full -rotate-90", children: [
      /* @__PURE__ */ jsx("circle", { cx: "28", cy: "28", r, fill: "none", stroke: "oklch(1 0 0 / 0.18)", strokeWidth: "5" }),
      /* @__PURE__ */ jsx("circle", { cx: "28", cy: "28", r, fill: "none", stroke, strokeWidth: "5", strokeLinecap: "round", strokeDasharray: `${dash} ${c}` })
    ] }),
    /* @__PURE__ */ jsxs("span", { className: "absolute inset-0 grid place-items-center text-xs font-bold", style: {
      color: stroke
    }, children: [
      value,
      "%"
    ] })
  ] });
}
const SitemapDotxmlRoute = Route$9.update({
  id: "/sitemap.xml",
  path: "/sitemap.xml",
  getParentRoute: () => Route$a
});
const ShoppingRoute = Route$8.update({
  id: "/shopping",
  path: "/shopping",
  getParentRoute: () => Route$a
});
const SettingsRoute = Route$7.update({
  id: "/settings",
  path: "/settings",
  getParentRoute: () => Route$a
});
const ScannerRoute = Route$6.update({
  id: "/scanner",
  path: "/scanner",
  getParentRoute: () => Route$a
});
const ReceiptsRoute = Route$5.update({
  id: "/receipts",
  path: "/receipts",
  getParentRoute: () => Route$a
});
const OnboardingRoute = Route$4.update({
  id: "/onboarding",
  path: "/onboarding",
  getParentRoute: () => Route$a
});
const MealsRoute = Route$3.update({
  id: "/meals",
  path: "/meals",
  getParentRoute: () => Route$a
});
const LoginRoute = Route$2.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => Route$a
});
const BudgetRoute = Route$1.update({
  id: "/budget",
  path: "/budget",
  getParentRoute: () => Route$a
});
const IndexRoute = Route.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$a
});
const rootRouteChildren = {
  IndexRoute,
  BudgetRoute,
  LoginRoute,
  MealsRoute,
  OnboardingRoute,
  ReceiptsRoute,
  ScannerRoute,
  SettingsRoute,
  ShoppingRoute,
  SitemapDotxmlRoute
};
const routeTree = Route$a._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  RingPct as R,
  actions as a,
  pullFromCloud as b,
  pushAllLocalToCloud as c,
  daysUntil as d,
  useSyncStatus as e,
  monthStart as m,
  pantryStatus as p,
  router as r,
  supabase as s,
  useStore as u,
  weekStart as w
};
