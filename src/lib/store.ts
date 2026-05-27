import { useRef, useSyncExternalStore } from "react";

export type Category = "Grains" | "Protein" | "Vegetables" | "Dairy" | "Condiments" | "Snacks" | "Beverages" | "Other";
export type PantryItem = {
  id: string;
  name: string;
  qty: number;
  unit: string;
  category: Category;
  addedAt: number;
  expiresAt: number;
  price?: number;
};
export type ExpenseCategory = "Groceries" | "Eating Out" | "Snacks" | "Miscellaneous";
export type Expense = {
  id: string;
  amount: number;
  category: ExpenseCategory;
  note?: string;
  date: number;
};
export type CookedMeal = { id: string; mealId: string; date: number };
export type ShoppingItem = { id: string; name: string; done: boolean };
export type Diet = "none" | "vegetarian" | "pescatarian" | "halal";
export type Theme = "light" | "dark";
export type MascotId = "bee-chef" | "bee-happy" | "bee-sleepy" | "bee-worried";
export type ReceiptItem = { name: string; qty: number; unit: string; category: Category; price?: number };
export type Receipt = { id: string; store: string; date: number; total: number; items: ReceiptItem[] };

export type State = {
  pantry: PantryItem[];
  expenses: Expense[];
  weeklyBudget: number;
  cooked: CookedMeal[];
  shopping: ShoppingItem[];
  receipts: Receipt[];
  displayName: string;
  mascot: MascotId;
  diet: Diet;
  theme: Theme;
  onboarded: boolean;
};

const KEY = "pantrypal:v3";
const day = 86_400_000;

export function demoSeed(): Pick<State, "pantry" | "expenses"> {
  const now = Date.now();
  return {
    pantry: [
      { id: id(), name: "Rice", qty: 5, unit: "kg", category: "Grains", addedAt: now, expiresAt: now + 45 * day, price: 265 },
      { id: id(), name: "Eggs", qty: 6, unit: "pcs", category: "Protein", addedAt: now, expiresAt: now + 12 * day, price: 72 },
      { id: id(), name: "Kangkong", qty: 1, unit: "bundle", category: "Vegetables", addedAt: now, expiresAt: now + 1 * day, price: 25 },
      { id: id(), name: "Tofu", qty: 200, unit: "g", category: "Protein", addedAt: now, expiresAt: now - 1 * day, price: 38 },
      { id: id(), name: "Soy Sauce", qty: 1, unit: "L", category: "Condiments", addedAt: now, expiresAt: now + 120 * day, price: 98 },
      { id: id(), name: "Garlic", qty: 100, unit: "g", category: "Vegetables", addedAt: now, expiresAt: now + 20 * day, price: 30 },
      { id: id(), name: "Onion", qty: 3, unit: "pcs", category: "Vegetables", addedAt: now, expiresAt: now + 14 * day, price: 35 },
    ],
    expenses: [
      { id: id(), amount: 265, category: "Groceries", note: "Rice 5kg", date: now - 6 * day },
      { id: id(), amount: 72, category: "Groceries", note: "Eggs", date: now - 5 * day },
      { id: id(), amount: 89, category: "Eating Out", note: "Jollibee", date: now - 3 * day },
      { id: id(), amount: 45, category: "Eating Out", note: "Lugaw", date: now - 1 * day },
    ],
  };
}

function blank(): State {
  return {
    pantry: [], expenses: [], cooked: [], shopping: [], receipts: [],
    weeklyBudget: 800,
    displayName: "Friend",
    mascot: "bee-chef",
    diet: "none",
    theme: "dark",
    onboarded: false,
  };
}

export function id() {
  return Math.random().toString(36).slice(2, 10);
}

let state: State = load();
const listeners = new Set<() => void>();

function load(): State {
  if (typeof window === "undefined") return blank();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      // migrate v2 if present
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
            shopping: Array.isArray(old.shoppingList)
              ? old.shoppingList.map((n: string) => ({ id: id(), name: n, done: false }))
              : [],
            weeklyBudget: old.weeklyBudget ?? 800,
            onboarded: true,
          };
        } catch { /* ignore */ }
      }
      localStorage.setItem(KEY, JSON.stringify(base));
      return base;
    }
    return { ...blank(), ...(JSON.parse(raw) as Partial<State>) } as State;
  } catch {
    return blank();
  }
}
function persist() {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
}
function set(updater: (s: State) => State) {
  state = updater(state);
  persist();
}

function shallowEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== "object" || a === null || typeof b !== "object" || b === null) return false;
  const ak = Object.keys(a as object);
  const bk = Object.keys(b as object);
  if (ak.length !== bk.length) return false;
  for (const k of ak) {
    if (!Object.is((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k])) return false;
  }
  return true;
}

export function useStore<T>(selector: (s: State) => T): T {
  // Cache the last returned value per call-site so object-returning selectors
  // don't break useSyncExternalStore's "snapshot must be cached" requirement.
  const cacheRef = useRef<{ value: T } | undefined>(undefined);
  const getCached = () => {
    const next = selector(state);
    if (cacheRef.current && shallowEqual(cacheRef.current.value, next)) {
      return cacheRef.current.value;
    }
    cacheRef.current = { value: next };
    return next;
  };
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    getCached,
    getCached,
  );
}

export function getState(): State { return state; }
export function setState(updater: (s: State) => State) { set(updater); }

// Optional cloud-sync hook: a function that gets called after every mutation
type CloudPusher = (op: { kind: string; payload: unknown }) => void;
let cloudPush: CloudPusher | null = null;
export function setCloudPusher(fn: CloudPusher | null) { cloudPush = fn; }
function push(kind: string, payload: unknown) {
  if (cloudPush) cloudPush({ kind, payload });
}

export const actions = {
  addPantryItem(item: Omit<PantryItem, "id" | "addedAt">) {
    const full: PantryItem = { ...item, id: id(), addedAt: Date.now() };
    set((s) => ({ ...s, pantry: [full, ...s.pantry] }));
    push("pantry.add", full);
  },
  updatePantryItem(itemId: string, patch: Partial<PantryItem>) {
    set((s) => ({ ...s, pantry: s.pantry.map((p) => (p.id === itemId ? { ...p, ...patch } : p)) }));
    push("pantry.update", { id: itemId, patch });
  },
  removePantryItem(itemId: string) {
    set((s) => ({ ...s, pantry: s.pantry.filter((p) => p.id !== itemId) }));
    push("pantry.remove", { id: itemId });
  },
  consumeIngredients(names: string[]) {
    set((s) => {
      const used = new Set<string>();
      for (const n of names) {
        const found = s.pantry.find(
          (p) => !used.has(p.id) && (p.name.toLowerCase().includes(n.toLowerCase()) || n.toLowerCase().includes(p.name.toLowerCase())),
        );
        if (found) used.add(found.id);
      }
      used.forEach((uid) => push("pantry.remove", { id: uid }));
      return { ...s, pantry: s.pantry.filter((p) => !used.has(p.id)) };
    });
  },
  addExpense(e: Omit<Expense, "id" | "date"> & { date?: number }) {
    const full: Expense = { ...e, id: id(), date: e.date ?? Date.now() };
    set((s) => ({ ...s, expenses: [full, ...s.expenses] }));
    push("expense.add", full);
  },
  removeExpense(eid: string) {
    set((s) => ({ ...s, expenses: s.expenses.filter((e) => e.id !== eid) }));
    push("expense.remove", { id: eid });
  },
  setBudget(amount: number) {
    set((s) => ({ ...s, weeklyBudget: amount }));
    push("profile.update", { weekly_budget: amount });
  },
  cookMeal(mealId: string, ingredientNames: string[]) {
    const c: CookedMeal = { id: id(), mealId, date: Date.now() };
    set((s) => ({ ...s, cooked: [c, ...s.cooked] }));
    push("cooked.add", c);
    actions.consumeIngredients(ingredientNames);
  },
  addToShoppingList(name: string) {
    set((s) => {
      if (s.shopping.some((i) => i.name.toLowerCase() === name.toLowerCase())) return s;
      const item: ShoppingItem = { id: id(), name, done: false };
      push("shopping.add", item);
      return { ...s, shopping: [...s.shopping, item] };
    });
  },
  toggleShopping(itemId: string) {
    set((s) => ({
      ...s,
      shopping: s.shopping.map((i) => (i.id === itemId ? { ...i, done: !i.done } : i)),
    }));
    const it = state.shopping.find((i) => i.id === itemId);
    if (it) push("shopping.update", it);
  },
  removeFromShopping(itemId: string) {
    set((s) => ({ ...s, shopping: s.shopping.filter((i) => i.id !== itemId) }));
    push("shopping.remove", { id: itemId });
  },
  clearDoneShopping() {
    const done = state.shopping.filter((i) => i.done);
    set((s) => ({ ...s, shopping: s.shopping.filter((i) => !i.done) }));
    done.forEach((d) => push("shopping.remove", { id: d.id }));
  },
  bulkAddPantry(items: Omit<PantryItem, "id" | "addedAt">[], totalSpent: number, store: string) {
    const full = items.map((i) => ({ ...i, id: id(), addedAt: Date.now() } as PantryItem));
    const exp: Expense = { id: id(), amount: totalSpent, category: "Groceries", note: store, date: Date.now() };
    const receipt: Receipt = {
      id: id(), store, date: Date.now(), total: totalSpent,
      items: items.map((i) => ({ name: i.name, qty: i.qty, unit: i.unit, category: i.category, price: i.price })),
    };
    set((s) => ({ ...s, pantry: [...full, ...s.pantry], expenses: [exp, ...s.expenses], receipts: [receipt, ...s.receipts] }));
    full.forEach((i) => push("pantry.add", i));
    push("expense.add", exp);
  },
  removeReceipt(rid: string) {
    set((s) => ({ ...s, receipts: s.receipts.filter((r) => r.id !== rid) }));
  },
  setProfile(patch: Partial<Pick<State, "displayName" | "mascot" | "diet" | "theme" | "onboarded" | "weeklyBudget">>) {
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
  replaceAll(next: Partial<State>) {
    set((s) => ({ ...s, ...next }));
  },
};

export function daysUntil(ms: number): number {
  return Math.ceil((ms - Date.now()) / 86_400_000);
}
export function pantryStatus(item: PantryItem): "fresh" | "expiring" | "expired" {
  const d = daysUntil(item.expiresAt);
  if (d < 0) return "expired";
  if (d <= 3) return "expiring";
  return "fresh";
}
export function weekStart(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d.getTime();
}
export function monthStart(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(1);
  return d.getTime();
}
