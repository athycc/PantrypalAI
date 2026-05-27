import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { AppHeader } from "@/components/AppHeader";
import { Leaf, AlertCircle, CircleAlert, Plus, CheckCircle2, Trash2, Pencil, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { actions, daysUntil, pantryStatus, useStore, type Category, type PantryItem } from "@/lib/store";
import { Field, Modal, inputCls } from "@/components/Modal";
import { Mascot } from "@/components/Mascot";

export const Route = createFileRoute("/")({ component: PantryPage });

const filters = ["All", "Fresh", "Expiring", "Expired"] as const;
const categories: Category[] = ["Grains", "Protein", "Vegetables", "Dairy", "Condiments", "Snacks", "Beverages", "Other"];

function PantryPage() {
  const pantry = useStore((s) => s.pantry);
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [q, setQ] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<PantryItem | null>(null);

  const counts = useMemo(() => {
    const c = { fresh: 0, expiring: 0, expired: 0 };
    pantry.forEach((p) => c[pantryStatus(p)]++);
    return c;
  }, [pantry]);

  const visible = pantry
    .filter((i) => (filter === "All" ? true : pantryStatus(i) === filter.toLowerCase()))
    .filter((i) => (q ? i.name.toLowerCase().includes(q.toLowerCase()) : true))
    .sort((a, b) => a.expiresAt - b.expiresAt);

  const healthPct = pantry.length === 0 ? 100 : Math.round((counts.fresh / pantry.length) * 100);

  return (
    <AppShell>
      <AppHeader greeting="Kumusta," title="My Pantry" />

      <section className="px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-fresh p-5 text-[oklch(0.2_0.04_150)] shadow-glow">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Leaf className="h-4 w-4" /> Pantry Health
            </div>
            <RingPct value={healthPct} stroke="oklch(0.25 0.05 150)" />
          </div>
          <h2 className="mt-6 text-2xl font-extrabold leading-tight">{pantry.length} items<br />tracked</h2>
        </div>
      </section>

      <section className="mt-4 grid grid-cols-2 gap-3 px-6">
        <StatTile icon={<AlertCircle className="h-4 w-4 text-warn" />} label="Expiring" value={String(counts.expiring)} hint="≤ 3 days" tint="warn" />
        <StatTile icon={<CircleAlert className="h-4 w-4 text-danger" />} label="Expired" value={String(counts.expired)} hint="remove these" tint="danger" />
      </section>

      <section className="mt-5 px-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search pantry…" className="w-full rounded-full border border-border bg-card pl-9 pr-3 py-2 text-sm" />
        </div>
      </section>

      <section className="mt-3 flex items-center gap-2 px-6 pb-1">
        <div className="flex flex-1 gap-2 overflow-x-auto">
          {filters.map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition ${filter === f ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground"}`}>{f}</button>
          ))}
        </div>
        <button onClick={() => setAddOpen(true)} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-honey text-primary-foreground shadow-glow">
          <Plus className="h-5 w-5" />
        </button>
      </section>

      <section className="mt-3 space-y-2 px-6 pb-6">
        {visible.length === 0 && (
          <div className="text-center py-6">
            <Mascot id="bee-sleepy" size={110} className="mx-auto" />
            <p className="mt-2 text-sm font-semibold">Nothing here yet</p>
            <p className="text-xs text-muted-foreground">Tap + to add or scan a receipt.</p>
          </div>
        )}
        {visible.map((it) => {
          const status = pantryStatus(it);
          const d = daysUntil(it.expiresAt);
          const label = status === "expired" ? `${Math.abs(d)}d ago` : status === "expiring" ? (d <= 0 ? "Today" : `${d}d left`) : `${d}d`;
          return (
            <div key={it.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
              <div className={`grid h-10 w-10 place-items-center rounded-xl ${
                status === "fresh" ? "bg-fresh/15 text-fresh" :
                status === "expiring" ? "bg-warn/15 text-warn" :
                "bg-danger/15 text-danger"
              }`}>
                {status === "fresh" ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
              </div>
              <button onClick={() => setEditing(it)} className="flex-1 min-w-0 text-left">
                <p className="font-semibold text-foreground truncate">{it.name}</p>
                <p className="text-xs text-muted-foreground">{it.qty} {it.unit} · {it.category}</p>
              </button>
              <span className={`text-xs font-medium ${
                status === "fresh" ? "text-muted-foreground" :
                status === "expiring" ? "text-warn" : "text-danger"
              }`}>{label}</span>
              <button onClick={() => setEditing(it)} className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => actions.removePantryItem(it.id)} className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground hover:text-danger hover:border-danger/40">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </section>

      <PantryFormModal open={addOpen} onClose={() => setAddOpen(false)} />
      <PantryFormModal open={!!editing} onClose={() => setEditing(null)} initial={editing ?? undefined} />
    </AppShell>
  );
}

function PantryFormModal({ open, onClose, initial }: { open: boolean; onClose: () => void; initial?: PantryItem }) {
  const editing = !!initial;
  const [name, setName] = useState(initial?.name ?? "");
  const [qty, setQty] = useState(String(initial?.qty ?? 1));
  const [unit, setUnit] = useState(initial?.unit ?? "pcs");
  const [cat, setCat] = useState<Category>(initial?.category ?? "Other");
  const [days, setDays] = useState(String(initial ? Math.max(1, daysUntil(initial.expiresAt)) : 7));

  // Reset when initial changes
  const key = initial?.id ?? "new";
  useMemoReset(key, () => {
    setName(initial?.name ?? "");
    setQty(String(initial?.qty ?? 1));
    setUnit(initial?.unit ?? "pcs");
    setCat(initial?.category ?? "Other");
    setDays(String(initial ? Math.max(1, daysUntil(initial.expiresAt)) : 7));
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const expiresAt = Date.now() + (parseInt(days) || 7) * 86_400_000;
    if (editing && initial) {
      actions.updatePantryItem(initial.id, { name: name.trim(), qty: parseFloat(qty) || 1, unit, category: cat, expiresAt });
    } else {
      actions.addPantryItem({ name: name.trim(), qty: parseFloat(qty) || 1, unit, category: cat, expiresAt });
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={editing ? "Edit Item" : "Add to Pantry"}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Item name">
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Bangus" className={inputCls} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Quantity">
            <input type="number" step="0.1" value={qty} onChange={(e) => setQty(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Unit">
            <input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="pcs, g, kg, ml" className={inputCls} />
          </Field>
        </div>
        <Field label="Category">
          <select value={cat} onChange={(e) => setCat(e.target.value as Category)} className={inputCls}>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Expires in (days)">
          <input type="number" value={days} onChange={(e) => setDays(e.target.value)} className={inputCls} />
        </Field>
        <button type="submit" className="mt-2 w-full rounded-xl bg-gradient-honey py-3 text-sm font-bold text-primary-foreground shadow-glow">
          {editing ? "Save changes" : "Add Item"}
        </button>
      </form>
    </Modal>
  );
}

// tiny helper to re-init state when key changes
import { useEffect, useRef } from "react";
function useMemoReset(key: string, fn: () => void) {
  const last = useRef(key);
  useEffect(() => {
    if (last.current !== key) { last.current = key; fn(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}

function StatTile({ icon, label, value, hint, tint }: { icon: React.ReactNode; label: string; value: string; hint: string; tint: "warn" | "danger" }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className={`grid h-7 w-7 place-items-center rounded-lg ${tint === "warn" ? "bg-warn/15" : "bg-danger/15"}`}>{icon}</span>
        {label}
      </div>
      <p className="mt-3 text-3xl font-extrabold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

export function RingPct({ value, stroke = "oklch(0.22 0.04 60)" }: { value: number; stroke?: string }) {
  const r = 22; const c = 2 * Math.PI * r;
  const dash = (value / 100) * c;
  return (
    <div className="relative h-14 w-14">
      <svg viewBox="0 0 56 56" className="h-full w-full -rotate-90">
        <circle cx="28" cy="28" r={r} fill="none" stroke="oklch(1 0 0 / 0.18)" strokeWidth="5" />
        <circle cx="28" cy="28" r={r} fill="none" stroke={stroke} strokeWidth="5" strokeLinecap="round" strokeDasharray={`${dash} ${c}`} />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-xs font-bold" style={{ color: stroke }}>{value}%</span>
    </div>
  );
}
