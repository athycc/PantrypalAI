import { jsxs, jsx } from "react/jsx-runtime";
import { A as AppShell } from "./AppShell-BGKyT93p.js";
import { A as AppHeader } from "./AppHeader-7CGVlsH5.js";
import { u as useStore, a as actions } from "./router-CYur2j8s.js";
import { a as Mascot } from "./Mascot-CpFl5W63.js";
import { Plus, Check, Trash2, Sparkles } from "lucide-react";
import { useState } from "react";
import "./PhoneFrame-CGwlULp_.js";
import "@tanstack/react-router";
import "@tanstack/react-query";
import "sonner";
import "@supabase/supabase-js";
function ShoppingPage() {
  const items = useStore((s) => s.shopping);
  const [name, setName] = useState("");
  const doneCount = items.filter((i) => i.done).length;
  const pendingCount = items.length - doneCount;
  const add = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    actions.addToShoppingList(name.trim());
    setName("");
  };
  const moveDoneToPantry = () => {
    const done = items.filter((i) => i.done);
    if (done.length === 0) return;
    done.forEach((i) => {
      actions.addPantryItem({
        name: i.name,
        qty: 1,
        unit: "pcs",
        category: "Other",
        expiresAt: Date.now() + 14 * 864e5
      });
      actions.removeFromShopping(i.id);
    });
  };
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(AppHeader, { greeting: "Pamalengke!", title: "Shopping", accent: "honey" }),
    /* @__PURE__ */ jsx("section", { className: "px-6", children: /* @__PURE__ */ jsxs("div", { className: "rounded-3xl bg-gradient-honey p-5 text-primary-foreground shadow-glow", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xs font-bold uppercase tracking-wide opacity-80", children: "Need to buy" }),
      /* @__PURE__ */ jsxs("p", { className: "mt-2 text-3xl font-extrabold", children: [
        pendingCount,
        " items"
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-xs opacity-80", children: [
        doneCount,
        " already in cart"
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("section", { className: "px-6 mt-4", children: /* @__PURE__ */ jsxs("form", { onSubmit: add, className: "flex gap-2", children: [
      /* @__PURE__ */ jsx("input", { value: name, onChange: (e) => setName(e.target.value), placeholder: "Add item…", className: "flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-sm" }),
      /* @__PURE__ */ jsx("button", { type: "submit", className: "grid h-11 w-11 place-items-center rounded-xl bg-gradient-honey text-primary-foreground shadow-glow", children: /* @__PURE__ */ jsx(Plus, { className: "h-5 w-5" }) })
    ] }) }),
    /* @__PURE__ */ jsxs("section", { className: "px-6 mt-4 space-y-2", children: [
      items.length === 0 && /* @__PURE__ */ jsxs("div", { className: "text-center py-8", children: [
        /* @__PURE__ */ jsx(Mascot, { id: "bee-sleepy", size: 120, className: "mx-auto" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm font-semibold", children: "All caught up!" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Add items here or from meal recommendations." })
      ] }),
      items.map((i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 rounded-xl border border-border bg-card p-3", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => actions.toggleShopping(i.id), className: `grid h-7 w-7 place-items-center rounded-full border-2 ${i.done ? "border-fresh bg-fresh text-background" : "border-border"}`, children: i.done && /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsx("span", { className: `flex-1 text-sm ${i.done ? "line-through text-muted-foreground" : "font-medium"}`, children: i.name }),
        /* @__PURE__ */ jsx("button", { onClick: () => actions.removeFromShopping(i.id), className: "grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:text-danger", children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) })
      ] }, i.id))
    ] }),
    doneCount > 0 && /* @__PURE__ */ jsxs("section", { className: "px-6 mt-4 pb-6 space-y-2", children: [
      /* @__PURE__ */ jsxs("button", { onClick: moveDoneToPantry, className: "w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-fresh py-3 text-sm font-bold text-[oklch(0.2_0.04_150)]", children: [
        /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4" }),
        " Move ",
        doneCount,
        " purchased to Pantry"
      ] }),
      /* @__PURE__ */ jsx("button", { onClick: () => actions.clearDoneShopping(), className: "w-full rounded-xl border border-border bg-card py-2 text-xs font-semibold", children: "Clear checked" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "pb-6" })
  ] });
}
export {
  ShoppingPage as component
};
