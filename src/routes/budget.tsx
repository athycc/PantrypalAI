import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { AppHeader } from "@/components/AppHeader";
import { TrendingUp, TrendingDown, ShoppingCart, Coffee, Package, LineChart, Plus, Trash2, Pencil, Download, AlertTriangle, FileDown } from "lucide-react";
import { useMemo, useState } from "react";
import { RingPct } from "./index";
import { actions, useStore, weekStart, monthStart, type ExpenseCategory } from "@/lib/store";
import { Field, Modal, inputCls } from "@/components/Modal";
import { expensesToCSV, downloadFile } from "@/lib/csv";
import { exportBudgetPDF } from "@/lib/pdf";
import { toast } from "sonner";

export const Route = createFileRoute("/budget")({ component: BudgetPage });

const catMeta: Record<ExpenseCategory, { icon: typeof ShoppingCart; color: string; bar: string }> = {
  "Groceries": { icon: ShoppingCart, color: "text-fresh", bar: "bg-fresh" },
  "Eating Out": { icon: Coffee, color: "text-honey", bar: "bg-honey" },
  "Snacks": { icon: Package, color: "text-warn", bar: "bg-warn" },
  "Miscellaneous": { icon: Package, color: "text-muted-foreground", bar: "bg-secondary" },
};
const cats: ExpenseCategory[] = ["Groceries", "Eating Out", "Snacks", "Miscellaneous"];
const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function BudgetPage() {
  const expenses = useStore((s) => s.expenses);
  const displayName = useStore((s) => s.displayName);
  const weeklyBudget = useStore((s) => s.weeklyBudget);
  const [range, setRange] = useState<"week" | "month" | "all">("week");
  const [addOpen, setAddOpen] = useState(false);
  const [editBudget, setEditBudget] = useState(false);

  const start = range === "week" ? weekStart() : range === "month" ? monthStart() : 0;
  const inRange = expenses.filter((e) => e.date >= start);
  const spent = inRange.reduce((s, e) => s + e.amount, 0);
  const budget = range === "month" ? weeklyBudget * 4 : range === "all" ? Math.max(spent, weeklyBudget) : weeklyBudget;
  const remaining = budget - spent;
  const pct = Math.min(100, Math.round((spent / Math.max(budget, 1)) * 100));
  const overBudget = spent > budget;

  const byDay = useMemo(() => {
    const arr = Array(7).fill(0) as number[];
    inRange.forEach((e) => { arr[new Date(e.date).getDay()] += e.amount; });
    const max = Math.max(...arr, 1);
    return arr.map((v, i) => ({ day: dayLabels[i], v, h: Math.max(4, Math.round((v / max) * 100)) }));
  }, [inRange]);

  const byCat = useMemo(() => cats.map((c) => {
    const s = inRange.filter((e) => e.category === c).reduce((sum, e) => sum + e.amount, 0);
    return { name: c, spent: s, pct: Math.min(100, Math.round((s / Math.max(budget, 1)) * 100)) };
  }), [inRange, budget]);

  const topDay = byDay.reduce((a, b) => (b.v > a.v ? b : a), byDay[0]);
  const insight = overBudget
    ? `You're ₱${(spent - budget).toFixed(0)} over budget. Consider cooking from your pantry this week.`
    : topDay.v > 0
      ? `You spend most on ${topDay.day}s (₱${topDay.v.toFixed(0)}). Try batch-cooking the day before.`
      : "No spending yet. Stay on track!";

  const exportCSV = () => {
    const csv = expensesToCSV(inRange);
    const stamp = new Date().toISOString().slice(0, 10);
    downloadFile(`pantrypal-expenses-${range}-${stamp}.csv`, csv);
    toast.success(`Exported ${inRange.length} expenses to CSV`);
  };
  const exportPDF = () => {
    exportBudgetPDF({ range, budget, spent, expenses: inRange, user: displayName });
    toast.success("PDF report downloaded");
  };


  return (
    <AppShell>
      <AppHeader greeting="This week" title="Budget" />

      <section className="px-6">
        <div className="mb-3 inline-flex rounded-full border border-border bg-card p-1 text-xs font-bold">
          {(["week", "month", "all"] as const).map((r) => (
            <button key={r} onClick={() => setRange(r)} className={`rounded-full px-3 py-1 capitalize ${range === r ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{r}</button>
          ))}
        </div>
        <button onClick={() => setEditBudget(true)} className="relative w-full overflow-hidden rounded-3xl bg-gradient-fresh p-5 text-left text-[oklch(0.2_0.04_150)] shadow-glow">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <LineChart className="h-4 w-4" /> {range === "week" ? "Weekly" : range === "month" ? "Monthly" : "All-time"} Budget
            </div>
            <RingPct value={pct} stroke={overBudget ? "oklch(0.55 0.22 28)" : "oklch(0.25 0.05 150)"} />
          </div>
          <p className="mt-6 text-3xl font-extrabold">₱{Math.max(0, remaining).toLocaleString()}</p>
          <p className="text-xs">{overBudget ? "over budget" : "remaining"} of ₱{budget.toLocaleString()} <Pencil className="ml-1 inline h-3 w-3" /></p>
        </button>
      </section>

      <section className="mt-4 grid grid-cols-2 gap-3 px-6">
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-fresh/15"><TrendingUp className="h-4 w-4 text-fresh" /></span>
            Budget
          </div>
          <p className="mt-3 text-2xl font-extrabold">₱{budget.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className={`grid h-7 w-7 place-items-center rounded-lg ${overBudget ? "bg-danger/15" : "bg-fresh/15"}`}><TrendingDown className={`h-4 w-4 ${overBudget ? "text-danger" : "text-fresh"}`} /></span>
            Spent
          </div>
          <p className="mt-3 text-2xl font-extrabold">₱{spent.toLocaleString()}</p>
          <p className={`text-xs ${overBudget ? "text-danger" : "text-muted-foreground"}`}>{inRange.length} transactions</p>
        </div>
      </section>

      {overBudget && (
        <section className="mt-4 px-6">
          <div className="rounded-2xl border border-danger/40 bg-danger/10 p-3 text-xs text-danger flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 mt-0.5" /> <span>You're over budget for this {range}. Cook from your pantry to save.</span>
          </div>
        </section>
      )}

      <section className="mt-4 px-6">
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Spending by day</p>
            <div className="flex gap-1.5">
              <button onClick={exportPDF} className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-xs font-bold">
                <FileDown className="h-3 w-3" /> PDF
              </button>
              <button onClick={exportCSV} className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-xs font-bold">
                <Download className="h-3 w-3" /> CSV
              </button>
              <button onClick={() => setAddOpen(true)} className="inline-flex items-center gap-1 rounded-full bg-gradient-honey px-3 py-1 text-xs font-bold text-primary-foreground shadow-glow">
                <Plus className="h-3 w-3" /> Expense
              </button>
            </div>
          </div>
          <div className="mt-4 flex h-32 items-end justify-between gap-2">
            {byDay.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                <div className={`w-full rounded-md ${d.v > 0 ? "bg-gradient-honey" : "bg-secondary"}`} style={{ height: `${d.h}%` }} />
                <span className="text-[10px] text-muted-foreground">{d.day}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-5 px-6">
        <h3 className="text-base font-bold">Categories</h3>
        <div className="mt-3 space-y-2">
          {byCat.map((c) => {
            const meta = catMeta[c.name];
            const Icon = meta.icon;
            return (
              <div key={c.name} className="rounded-2xl border border-border bg-card p-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-secondary"><Icon className={`h-4 w-4 ${meta.color}`} /></span>
                  <div className="flex-1">
                    <p className="font-semibold">{c.name}</p>
                    <p className="text-[11px] text-muted-foreground">₱{c.spent} · {c.pct}% of budget</p>
                  </div>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div className={`h-full rounded-full ${meta.bar}`} style={{ width: `${c.pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-5 px-6">
        <h3 className="text-base font-bold">Recent Expenses</h3>
        <div className="mt-3 space-y-1.5">
          {inRange.length === 0 && <p className="rounded-2xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">No expenses logged.</p>}
          {inRange.slice(0, 12).map((e) => (
            <div key={e.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-secondary text-xs">{e.category === "Groceries" ? "🛒" : e.category === "Eating Out" ? "🍔" : e.category === "Snacks" ? "🍪" : "📦"}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{e.note || e.category}</p>
                <p className="text-[10px] text-muted-foreground">{new Date(e.date).toLocaleDateString("en-PH", { weekday: "short", month: "short", day: "numeric" })} · {e.category}</p>
              </div>
              <p className="text-sm font-bold">₱{e.amount}</p>
              <button onClick={() => actions.removeExpense(e.id)} className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:text-danger">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-5 px-6 pb-6">
        <div className="rounded-2xl border border-fresh/40 bg-fresh/10 p-4">
          <div className="flex items-start gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-fresh/20"><TrendingUp className="h-4 w-4 text-fresh" /></span>
            <div>
              <p className="text-sm font-bold text-fresh">Spending Insight</p>
              <p className="mt-1 text-xs text-foreground/90">{insight}</p>
            </div>
          </div>
        </div>
      </section>

      <AddExpenseModal open={addOpen} onClose={() => setAddOpen(false)} />
      <EditBudgetModal open={editBudget} onClose={() => setEditBudget(false)} current={weeklyBudget} />
    </AppShell>
  );
}

function AddExpenseModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [amount, setAmount] = useState("");
  const [cat, setCat] = useState<ExpenseCategory>("Groceries");
  const [note, setNote] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;
    actions.addExpense({ amount: amt, category: cat, note: note.trim() || undefined });
    setAmount(""); setNote(""); setCat("Groceries");
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose} title="Log Expense">
      <form onSubmit={submit} className="space-y-3">
        <Field label="Amount (₱)">
          <input autoFocus type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputCls} placeholder="0.00" />
        </Field>
        <Field label="Category">
          <select value={cat} onChange={(e) => setCat(e.target.value as ExpenseCategory)} className={inputCls}>
            {cats.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Note (optional)">
          <input value={note} onChange={(e) => setNote(e.target.value)} className={inputCls} placeholder="e.g. Jollibee lunch" />
        </Field>
        <button type="submit" className="mt-2 w-full rounded-xl bg-gradient-honey py-3 text-sm font-bold text-primary-foreground shadow-glow">
          Add Expense
        </button>
      </form>
    </Modal>
  );
}

function EditBudgetModal({ open, onClose, current }: { open: boolean; onClose: () => void; current: number }) {
  const [v, setV] = useState(String(current));
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseFloat(v);
    if (!n || n <= 0) return;
    actions.setBudget(n);
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose} title="Weekly Budget">
      <form onSubmit={submit} className="space-y-3">
        <Field label="How much can you spend per week?">
          <input autoFocus type="number" value={v} onChange={(e) => setV(e.target.value)} className={inputCls} />
        </Field>
        <button type="submit" className="w-full rounded-xl bg-gradient-fresh py-3 text-sm font-bold text-[oklch(0.2_0.04_150)]">
          Save Budget
        </button>
      </form>
    </Modal>
  );
}
