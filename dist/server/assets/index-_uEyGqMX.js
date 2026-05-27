import { jsxs, jsx } from "react/jsx-runtime";
import { A as AppShell } from "./AppShell-BGKyT93p.js";
import { A as AppHeader } from "./AppHeader-7CGVlsH5.js";
import { Leaf, AlertCircle, CircleAlert, Search, Plus, CheckCircle2, Pencil, Trash2 } from "lucide-react";
import { useState, useMemo, useRef, useEffect } from "react";
import { u as useStore, p as pantryStatus, d as daysUntil, a as actions } from "./router-CYur2j8s.js";
import { M as Modal, F as Field, i as inputCls } from "./Modal-DOAf7IWV.js";
import { a as Mascot } from "./Mascot-CpFl5W63.js";
import "./PhoneFrame-CGwlULp_.js";
import "@tanstack/react-router";
import "@tanstack/react-query";
import "sonner";
import "@supabase/supabase-js";
const filters = ["All", "Fresh", "Expiring", "Expired"];
const categories = ["Grains", "Protein", "Vegetables", "Dairy", "Condiments", "Snacks", "Beverages", "Other"];
function PantryPage() {
  const pantry = useStore((s) => s.pantry);
  const [filter, setFilter] = useState("All");
  const [q, setQ] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const counts = useMemo(() => {
    const c = {
      fresh: 0,
      expiring: 0,
      expired: 0
    };
    pantry.forEach((p) => c[pantryStatus(p)]++);
    return c;
  }, [pantry]);
  const visible = pantry.filter((i) => filter === "All" ? true : pantryStatus(i) === filter.toLowerCase()).filter((i) => q ? i.name.toLowerCase().includes(q.toLowerCase()) : true).sort((a, b) => a.expiresAt - b.expiresAt);
  const healthPct = pantry.length === 0 ? 100 : Math.round(counts.fresh / pantry.length * 100);
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(AppHeader, { greeting: "Kumusta,", title: "My Pantry" }),
    /* @__PURE__ */ jsx("section", { className: "px-6", children: /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden rounded-3xl bg-gradient-fresh p-5 text-[oklch(0.2_0.04_150)] shadow-glow", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm font-semibold", children: [
          /* @__PURE__ */ jsx(Leaf, { className: "h-4 w-4" }),
          " Pantry Health"
        ] }),
        /* @__PURE__ */ jsx(RingPct, { value: healthPct, stroke: "oklch(0.25 0.05 150)" })
      ] }),
      /* @__PURE__ */ jsxs("h2", { className: "mt-6 text-2xl font-extrabold leading-tight", children: [
        pantry.length,
        " items",
        /* @__PURE__ */ jsx("br", {}),
        "tracked"
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("section", { className: "mt-4 grid grid-cols-2 gap-3 px-6", children: [
      /* @__PURE__ */ jsx(StatTile, { icon: /* @__PURE__ */ jsx(AlertCircle, { className: "h-4 w-4 text-warn" }), label: "Expiring", value: String(counts.expiring), hint: "≤ 3 days", tint: "warn" }),
      /* @__PURE__ */ jsx(StatTile, { icon: /* @__PURE__ */ jsx(CircleAlert, { className: "h-4 w-4 text-danger" }), label: "Expired", value: String(counts.expired), hint: "remove these", tint: "danger" })
    ] }),
    /* @__PURE__ */ jsx("section", { className: "mt-5 px-6", children: /* @__PURE__ */ jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
      /* @__PURE__ */ jsx("input", { value: q, onChange: (e) => setQ(e.target.value), placeholder: "Search pantry…", className: "w-full rounded-full border border-border bg-card pl-9 pr-3 py-2 text-sm" })
    ] }) }),
    /* @__PURE__ */ jsxs("section", { className: "mt-3 flex items-center gap-2 px-6 pb-1", children: [
      /* @__PURE__ */ jsx("div", { className: "flex flex-1 gap-2 overflow-x-auto", children: filters.map((f) => /* @__PURE__ */ jsx("button", { onClick: () => setFilter(f), className: `shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition ${filter === f ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground"}`, children: f }, f)) }),
      /* @__PURE__ */ jsx("button", { onClick: () => setAddOpen(true), className: "grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-honey text-primary-foreground shadow-glow", children: /* @__PURE__ */ jsx(Plus, { className: "h-5 w-5" }) })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "mt-3 space-y-2 px-6 pb-6", children: [
      visible.length === 0 && /* @__PURE__ */ jsxs("div", { className: "text-center py-6", children: [
        /* @__PURE__ */ jsx(Mascot, { id: "bee-sleepy", size: 110, className: "mx-auto" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm font-semibold", children: "Nothing here yet" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Tap + to add or scan a receipt." })
      ] }),
      visible.map((it) => {
        const status = pantryStatus(it);
        const d = daysUntil(it.expiresAt);
        const label = status === "expired" ? `${Math.abs(d)}d ago` : status === "expiring" ? d <= 0 ? "Today" : `${d}d left` : `${d}d`;
        return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 rounded-2xl border border-border bg-card p-3", children: [
          /* @__PURE__ */ jsx("div", { className: `grid h-10 w-10 place-items-center rounded-xl ${status === "fresh" ? "bg-fresh/15 text-fresh" : status === "expiring" ? "bg-warn/15 text-warn" : "bg-danger/15 text-danger"}`, children: status === "fresh" ? /* @__PURE__ */ jsx(CheckCircle2, { className: "h-5 w-5" }) : /* @__PURE__ */ jsx(AlertCircle, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxs("button", { onClick: () => setEditing(it), className: "flex-1 min-w-0 text-left", children: [
            /* @__PURE__ */ jsx("p", { className: "font-semibold text-foreground truncate", children: it.name }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
              it.qty,
              " ",
              it.unit,
              " · ",
              it.category
            ] })
          ] }),
          /* @__PURE__ */ jsx("span", { className: `text-xs font-medium ${status === "fresh" ? "text-muted-foreground" : status === "expiring" ? "text-warn" : "text-danger"}`, children: label }),
          /* @__PURE__ */ jsx("button", { onClick: () => setEditing(it), className: "grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground", children: /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsx("button", { onClick: () => actions.removePantryItem(it.id), className: "grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground hover:text-danger hover:border-danger/40", children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) })
        ] }, it.id);
      })
    ] }),
    /* @__PURE__ */ jsx(PantryFormModal, { open: addOpen, onClose: () => setAddOpen(false) }),
    /* @__PURE__ */ jsx(PantryFormModal, { open: !!editing, onClose: () => setEditing(null), initial: editing ?? void 0 })
  ] });
}
function PantryFormModal({
  open,
  onClose,
  initial
}) {
  const editing = !!initial;
  const [name, setName] = useState(initial?.name ?? "");
  const [qty, setQty] = useState(String(initial?.qty ?? 1));
  const [unit, setUnit] = useState(initial?.unit ?? "pcs");
  const [cat, setCat] = useState(initial?.category ?? "Other");
  const [days, setDays] = useState(String(initial ? Math.max(1, daysUntil(initial.expiresAt)) : 7));
  const key = initial?.id ?? "new";
  useMemoReset(key, () => {
    setName(initial?.name ?? "");
    setQty(String(initial?.qty ?? 1));
    setUnit(initial?.unit ?? "pcs");
    setCat(initial?.category ?? "Other");
    setDays(String(initial ? Math.max(1, daysUntil(initial.expiresAt)) : 7));
  });
  const submit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const expiresAt = Date.now() + (parseInt(days) || 7) * 864e5;
    if (editing && initial) {
      actions.updatePantryItem(initial.id, {
        name: name.trim(),
        qty: parseFloat(qty) || 1,
        unit,
        category: cat,
        expiresAt
      });
    } else {
      actions.addPantryItem({
        name: name.trim(),
        qty: parseFloat(qty) || 1,
        unit,
        category: cat,
        expiresAt
      });
    }
    onClose();
  };
  return /* @__PURE__ */ jsx(Modal, { open, onClose, title: editing ? "Edit Item" : "Add to Pantry", children: /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-3", children: [
    /* @__PURE__ */ jsx(Field, { label: "Item name", children: /* @__PURE__ */ jsx("input", { autoFocus: true, value: name, onChange: (e) => setName(e.target.value), placeholder: "e.g. Bangus", className: inputCls }) }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsx(Field, { label: "Quantity", children: /* @__PURE__ */ jsx("input", { type: "number", step: "0.1", value: qty, onChange: (e) => setQty(e.target.value), className: inputCls }) }),
      /* @__PURE__ */ jsx(Field, { label: "Unit", children: /* @__PURE__ */ jsx("input", { value: unit, onChange: (e) => setUnit(e.target.value), placeholder: "pcs, g, kg, ml", className: inputCls }) })
    ] }),
    /* @__PURE__ */ jsx(Field, { label: "Category", children: /* @__PURE__ */ jsx("select", { value: cat, onChange: (e) => setCat(e.target.value), className: inputCls, children: categories.map((c) => /* @__PURE__ */ jsx("option", { value: c, children: c }, c)) }) }),
    /* @__PURE__ */ jsx(Field, { label: "Expires in (days)", children: /* @__PURE__ */ jsx("input", { type: "number", value: days, onChange: (e) => setDays(e.target.value), className: inputCls }) }),
    /* @__PURE__ */ jsx("button", { type: "submit", className: "mt-2 w-full rounded-xl bg-gradient-honey py-3 text-sm font-bold text-primary-foreground shadow-glow", children: editing ? "Save changes" : "Add Item" })
  ] }) });
}
function useMemoReset(key, fn) {
  const last = useRef(key);
  useEffect(() => {
    if (last.current !== key) {
      last.current = key;
      fn();
    }
  }, [key]);
}
function StatTile({
  icon,
  label,
  value,
  hint,
  tint
}) {
  return /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border bg-card p-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsx("span", { className: `grid h-7 w-7 place-items-center rounded-lg ${tint === "warn" ? "bg-warn/15" : "bg-danger/15"}`, children: icon }),
      label
    ] }),
    /* @__PURE__ */ jsx("p", { className: "mt-3 text-3xl font-extrabold text-foreground", children: value }),
    /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: hint })
  ] });
}
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
export {
  RingPct,
  PantryPage as component
};
