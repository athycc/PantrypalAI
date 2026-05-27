import { jsxs, jsx } from "react/jsx-runtime";
import { A as AppShell } from "./AppShell-BGKyT93p.js";
import { A as AppHeader } from "./AppHeader-7CGVlsH5.js";
import { LineChart, Pencil, TrendingUp, TrendingDown, AlertTriangle, FileDown, Download, Plus, Package, Coffee, ShoppingCart, Trash2 } from "lucide-react";
import { useState, useMemo } from "react";
import { u as useStore, w as weekStart, m as monthStart, R as RingPct, a as actions } from "./router-CYur2j8s.js";
import { M as Modal, F as Field, i as inputCls } from "./Modal-DOAf7IWV.js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import "./PhoneFrame-CGwlULp_.js";
import "@tanstack/react-router";
import "./Mascot-CpFl5W63.js";
import "@tanstack/react-query";
import "@supabase/supabase-js";
function esc(v) {
  if (v === void 0 || v === null) return "";
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function expensesToCSV(rows) {
  const header = ["Date", "Category", "Amount (PHP)", "Note"];
  const body = rows.slice().sort((a, b) => b.date - a.date).map((r) => [new Date(r.date).toISOString().slice(0, 10), r.category, r.amount.toFixed(2), r.note ?? ""].map(esc).join(","));
  return [header.join(","), ...body].join("\n");
}
function downloadFile(name, content, mime = "text/csv;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1e3);
}
function exportBudgetPDF(opts) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const now = /* @__PURE__ */ new Date();
  doc.setFillColor(247, 212, 136);
  doc.rect(0, 0, W, 70, "F");
  doc.setTextColor(40, 30, 10);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("PantryPal AI", 40, 32);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Budget Report — ${opts.range}`, 40, 52);
  doc.text(now.toLocaleString("en-PH"), W - 40, 52, { align: "right" });
  doc.setTextColor(20, 20, 20);
  doc.setFontSize(12);
  let y = 100;
  if (opts.user) {
    doc.text(`User: ${opts.user}`, 40, y);
    y += 18;
  }
  doc.text(`Budget:     PHP ${opts.budget.toLocaleString()}`, 40, y);
  y += 16;
  doc.text(`Spent:      PHP ${opts.spent.toLocaleString()}`, 40, y);
  y += 16;
  const rem = opts.budget - opts.spent;
  doc.setTextColor(rem >= 0 ? 30 : 180, rem >= 0 ? 130 : 30, 60);
  doc.text(`${rem >= 0 ? "Remaining" : "Over"}:  PHP ${Math.abs(rem).toLocaleString()}`, 40, y);
  doc.setTextColor(20, 20, 20);
  y += 20;
  const byCat = {};
  opts.expenses.forEach((e) => {
    byCat[e.category] = (byCat[e.category] || 0) + e.amount;
  });
  autoTable(doc, {
    startY: y,
    head: [["Category", "Amount (PHP)", "% of Budget"]],
    body: Object.entries(byCat).map(([k, v]) => [k, v.toFixed(2), `${Math.round(v / Math.max(opts.budget, 1) * 100)}%`]),
    headStyles: { fillColor: [247, 212, 136], textColor: 40 },
    styles: { fontSize: 10 }
  });
  const afterY = doc.lastAutoTable?.finalY ?? y;
  autoTable(doc, {
    startY: afterY + 20,
    head: [["Date", "Category", "Note", "Amount (PHP)"]],
    body: opts.expenses.slice().sort((a, b) => b.date - a.date).map((e) => [
      new Date(e.date).toLocaleDateString("en-PH"),
      e.category,
      e.note ?? "",
      e.amount.toFixed(2)
    ]),
    headStyles: { fillColor: [40, 40, 40] },
    styles: { fontSize: 9 }
  });
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(`PantryPal AI · Page ${i} of ${pages}`, W / 2, doc.internal.pageSize.getHeight() - 20, { align: "center" });
  }
  doc.save(`pantrypal-budget-${opts.range}-${now.toISOString().slice(0, 10)}.pdf`);
}
const catMeta = {
  "Groceries": {
    icon: ShoppingCart,
    color: "text-fresh",
    bar: "bg-fresh"
  },
  "Eating Out": {
    icon: Coffee,
    color: "text-honey",
    bar: "bg-honey"
  },
  "Snacks": {
    icon: Package,
    color: "text-warn",
    bar: "bg-warn"
  },
  "Miscellaneous": {
    icon: Package,
    color: "text-muted-foreground",
    bar: "bg-secondary"
  }
};
const cats = ["Groceries", "Eating Out", "Snacks", "Miscellaneous"];
const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
function BudgetPage() {
  const expenses = useStore((s) => s.expenses);
  const displayName = useStore((s) => s.displayName);
  const weeklyBudget = useStore((s) => s.weeklyBudget);
  const [range, setRange] = useState("week");
  const [addOpen, setAddOpen] = useState(false);
  const [editBudget, setEditBudget] = useState(false);
  const start = range === "week" ? weekStart() : range === "month" ? monthStart() : 0;
  const inRange = expenses.filter((e) => e.date >= start);
  const spent = inRange.reduce((s, e) => s + e.amount, 0);
  const budget = range === "month" ? weeklyBudget * 4 : range === "all" ? Math.max(spent, weeklyBudget) : weeklyBudget;
  const remaining = budget - spent;
  const pct = Math.min(100, Math.round(spent / Math.max(budget, 1) * 100));
  const overBudget = spent > budget;
  const byDay = useMemo(() => {
    const arr = Array(7).fill(0);
    inRange.forEach((e) => {
      arr[new Date(e.date).getDay()] += e.amount;
    });
    const max = Math.max(...arr, 1);
    return arr.map((v, i) => ({
      day: dayLabels[i],
      v,
      h: Math.max(4, Math.round(v / max * 100))
    }));
  }, [inRange]);
  const byCat = useMemo(() => cats.map((c) => {
    const s = inRange.filter((e) => e.category === c).reduce((sum, e) => sum + e.amount, 0);
    return {
      name: c,
      spent: s,
      pct: Math.min(100, Math.round(s / Math.max(budget, 1) * 100))
    };
  }), [inRange, budget]);
  const topDay = byDay.reduce((a, b) => b.v > a.v ? b : a, byDay[0]);
  const insight = overBudget ? `You're ₱${(spent - budget).toFixed(0)} over budget. Consider cooking from your pantry this week.` : topDay.v > 0 ? `You spend most on ${topDay.day}s (₱${topDay.v.toFixed(0)}). Try batch-cooking the day before.` : "No spending yet. Stay on track!";
  const exportCSV = () => {
    const csv = expensesToCSV(inRange);
    const stamp = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    downloadFile(`pantrypal-expenses-${range}-${stamp}.csv`, csv);
    toast.success(`Exported ${inRange.length} expenses to CSV`);
  };
  const exportPDF = () => {
    exportBudgetPDF({
      range,
      budget,
      spent,
      expenses: inRange,
      user: displayName
    });
    toast.success("PDF report downloaded");
  };
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(AppHeader, { greeting: "This week", title: "Budget" }),
    /* @__PURE__ */ jsxs("section", { className: "px-6", children: [
      /* @__PURE__ */ jsx("div", { className: "mb-3 inline-flex rounded-full border border-border bg-card p-1 text-xs font-bold", children: ["week", "month", "all"].map((r) => /* @__PURE__ */ jsx("button", { onClick: () => setRange(r), className: `rounded-full px-3 py-1 capitalize ${range === r ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`, children: r }, r)) }),
      /* @__PURE__ */ jsxs("button", { onClick: () => setEditBudget(true), className: "relative w-full overflow-hidden rounded-3xl bg-gradient-fresh p-5 text-left text-[oklch(0.2_0.04_150)] shadow-glow", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm font-semibold", children: [
            /* @__PURE__ */ jsx(LineChart, { className: "h-4 w-4" }),
            " ",
            range === "week" ? "Weekly" : range === "month" ? "Monthly" : "All-time",
            " Budget"
          ] }),
          /* @__PURE__ */ jsx(RingPct, { value: pct, stroke: overBudget ? "oklch(0.55 0.22 28)" : "oklch(0.25 0.05 150)" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "mt-6 text-3xl font-extrabold", children: [
          "₱",
          Math.max(0, remaining).toLocaleString()
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs", children: [
          overBudget ? "over budget" : "remaining",
          " of ₱",
          budget.toLocaleString(),
          " ",
          /* @__PURE__ */ jsx(Pencil, { className: "ml-1 inline h-3 w-3" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "mt-4 grid grid-cols-2 gap-3 px-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border bg-card p-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsx("span", { className: "grid h-7 w-7 place-items-center rounded-lg bg-fresh/15", children: /* @__PURE__ */ jsx(TrendingUp, { className: "h-4 w-4 text-fresh" }) }),
          "Budget"
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "mt-3 text-2xl font-extrabold", children: [
          "₱",
          budget.toLocaleString()
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border bg-card p-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsx("span", { className: `grid h-7 w-7 place-items-center rounded-lg ${overBudget ? "bg-danger/15" : "bg-fresh/15"}`, children: /* @__PURE__ */ jsx(TrendingDown, { className: `h-4 w-4 ${overBudget ? "text-danger" : "text-fresh"}` }) }),
          "Spent"
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "mt-3 text-2xl font-extrabold", children: [
          "₱",
          spent.toLocaleString()
        ] }),
        /* @__PURE__ */ jsxs("p", { className: `text-xs ${overBudget ? "text-danger" : "text-muted-foreground"}`, children: [
          inRange.length,
          " transactions"
        ] })
      ] })
    ] }),
    overBudget && /* @__PURE__ */ jsx("section", { className: "mt-4 px-6", children: /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-danger/40 bg-danger/10 p-3 text-xs text-danger flex items-start gap-2", children: [
      /* @__PURE__ */ jsx(AlertTriangle, { className: "h-4 w-4 mt-0.5" }),
      " ",
      /* @__PURE__ */ jsxs("span", { children: [
        "You're over budget for this ",
        range,
        ". Cook from your pantry to save."
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("section", { className: "mt-4 px-6", children: /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border bg-card p-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold", children: "Spending by day" }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-1.5", children: [
          /* @__PURE__ */ jsxs("button", { onClick: exportPDF, className: "inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-xs font-bold", children: [
            /* @__PURE__ */ jsx(FileDown, { className: "h-3 w-3" }),
            " PDF"
          ] }),
          /* @__PURE__ */ jsxs("button", { onClick: exportCSV, className: "inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-xs font-bold", children: [
            /* @__PURE__ */ jsx(Download, { className: "h-3 w-3" }),
            " CSV"
          ] }),
          /* @__PURE__ */ jsxs("button", { onClick: () => setAddOpen(true), className: "inline-flex items-center gap-1 rounded-full bg-gradient-honey px-3 py-1 text-xs font-bold text-primary-foreground shadow-glow", children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-3 w-3" }),
            " Expense"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-4 flex h-32 items-end justify-between gap-2", children: byDay.map((d) => /* @__PURE__ */ jsxs("div", { className: "flex flex-1 flex-col items-center gap-1", children: [
        /* @__PURE__ */ jsx("div", { className: `w-full rounded-md ${d.v > 0 ? "bg-gradient-honey" : "bg-secondary"}`, style: {
          height: `${d.h}%`
        } }),
        /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground", children: d.day })
      ] }, d.day)) })
    ] }) }),
    /* @__PURE__ */ jsxs("section", { className: "mt-5 px-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-base font-bold", children: "Categories" }),
      /* @__PURE__ */ jsx("div", { className: "mt-3 space-y-2", children: byCat.map((c) => {
        const meta = catMeta[c.name];
        const Icon = meta.icon;
        return /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border bg-card p-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("span", { className: "grid h-9 w-9 place-items-center rounded-xl bg-secondary", children: /* @__PURE__ */ jsx(Icon, { className: `h-4 w-4 ${meta.color}` }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsx("p", { className: "font-semibold", children: c.name }),
              /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-muted-foreground", children: [
                "₱",
                c.spent,
                " · ",
                c.pct,
                "% of budget"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-2 h-1.5 overflow-hidden rounded-full bg-secondary", children: /* @__PURE__ */ jsx("div", { className: `h-full rounded-full ${meta.bar}`, style: {
            width: `${c.pct}%`
          } }) })
        ] }, c.name);
      }) })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "mt-5 px-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-base font-bold", children: "Recent Expenses" }),
      /* @__PURE__ */ jsxs("div", { className: "mt-3 space-y-1.5", children: [
        inRange.length === 0 && /* @__PURE__ */ jsx("p", { className: "rounded-2xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground", children: "No expenses logged." }),
        inRange.slice(0, 12).map((e) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 rounded-xl border border-border bg-card p-3", children: [
          /* @__PURE__ */ jsx("span", { className: "grid h-8 w-8 place-items-center rounded-lg bg-secondary text-xs", children: e.category === "Groceries" ? "🛒" : e.category === "Eating Out" ? "🍔" : e.category === "Snacks" ? "🍪" : "📦" }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold truncate", children: e.note || e.category }),
            /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-muted-foreground", children: [
              new Date(e.date).toLocaleDateString("en-PH", {
                weekday: "short",
                month: "short",
                day: "numeric"
              }),
              " · ",
              e.category
            ] })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm font-bold", children: [
            "₱",
            e.amount
          ] }),
          /* @__PURE__ */ jsx("button", { onClick: () => actions.removeExpense(e.id), className: "grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:text-danger", children: /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5" }) })
        ] }, e.id))
      ] })
    ] }),
    /* @__PURE__ */ jsx("section", { className: "mt-5 px-6 pb-6", children: /* @__PURE__ */ jsx("div", { className: "rounded-2xl border border-fresh/40 bg-fresh/10 p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2", children: [
      /* @__PURE__ */ jsx("span", { className: "grid h-7 w-7 place-items-center rounded-lg bg-fresh/20", children: /* @__PURE__ */ jsx(TrendingUp, { className: "h-4 w-4 text-fresh" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-fresh", children: "Spending Insight" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-foreground/90", children: insight })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsx(AddExpenseModal, { open: addOpen, onClose: () => setAddOpen(false) }),
    /* @__PURE__ */ jsx(EditBudgetModal, { open: editBudget, onClose: () => setEditBudget(false), current: weeklyBudget })
  ] });
}
function AddExpenseModal({
  open,
  onClose
}) {
  const [amount, setAmount] = useState("");
  const [cat, setCat] = useState("Groceries");
  const [note, setNote] = useState("");
  const submit = (e) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;
    actions.addExpense({
      amount: amt,
      category: cat,
      note: note.trim() || void 0
    });
    setAmount("");
    setNote("");
    setCat("Groceries");
    onClose();
  };
  return /* @__PURE__ */ jsx(Modal, { open, onClose, title: "Log Expense", children: /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-3", children: [
    /* @__PURE__ */ jsx(Field, { label: "Amount (₱)", children: /* @__PURE__ */ jsx("input", { autoFocus: true, type: "number", step: "0.01", value: amount, onChange: (e) => setAmount(e.target.value), className: inputCls, placeholder: "0.00" }) }),
    /* @__PURE__ */ jsx(Field, { label: "Category", children: /* @__PURE__ */ jsx("select", { value: cat, onChange: (e) => setCat(e.target.value), className: inputCls, children: cats.map((c) => /* @__PURE__ */ jsx("option", { value: c, children: c }, c)) }) }),
    /* @__PURE__ */ jsx(Field, { label: "Note (optional)", children: /* @__PURE__ */ jsx("input", { value: note, onChange: (e) => setNote(e.target.value), className: inputCls, placeholder: "e.g. Jollibee lunch" }) }),
    /* @__PURE__ */ jsx("button", { type: "submit", className: "mt-2 w-full rounded-xl bg-gradient-honey py-3 text-sm font-bold text-primary-foreground shadow-glow", children: "Add Expense" })
  ] }) });
}
function EditBudgetModal({
  open,
  onClose,
  current
}) {
  const [v, setV] = useState(String(current));
  const submit = (e) => {
    e.preventDefault();
    const n = parseFloat(v);
    if (!n || n <= 0) return;
    actions.setBudget(n);
    onClose();
  };
  return /* @__PURE__ */ jsx(Modal, { open, onClose, title: "Weekly Budget", children: /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-3", children: [
    /* @__PURE__ */ jsx(Field, { label: "How much can you spend per week?", children: /* @__PURE__ */ jsx("input", { autoFocus: true, type: "number", value: v, onChange: (e) => setV(e.target.value), className: inputCls }) }),
    /* @__PURE__ */ jsx("button", { type: "submit", className: "w-full rounded-xl bg-gradient-fresh py-3 text-sm font-bold text-[oklch(0.2_0.04_150)]", children: "Save Budget" })
  ] }) });
}
export {
  BudgetPage as component
};
