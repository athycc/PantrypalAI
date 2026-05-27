import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { A as AppShell } from "./AppShell-BGKyT93p.js";
import { A as AppHeader } from "./AppHeader-7CGVlsH5.js";
import { Flame, Zap, AlertTriangle, ShoppingBag, Clock, Check, ChefHat } from "lucide-react";
import { useState, useMemo } from "react";
import { u as useStore, w as weekStart, R as RingPct, a as actions } from "./router-CYur2j8s.js";
import { M as MEALS, m as matchScore } from "./meals-CRWZUL1w.js";
import { M as Modal } from "./Modal-DOAf7IWV.js";
import { a as Mascot } from "./Mascot-CpFl5W63.js";
import "./PhoneFrame-CGwlULp_.js";
import "@tanstack/react-query";
import "sonner";
import "@supabase/supabase-js";
const DIETS = ["none", "vegetarian", "pescatarian", "halal"];
const VEG_BLOCK = ["chicken", "pork", "beef", "fish", "bangus"];
const PESC_BLOCK = ["chicken", "pork", "beef"];
const HALAL_BLOCK = ["pork"];
function MealsPage() {
  const pantry = useStore((s) => s.pantry);
  const expenses = useStore((s) => s.expenses);
  const budget = useStore((s) => s.weeklyBudget);
  const shopping = useStore((s) => s.shopping);
  const diet = useStore((s) => s.diet);
  const [tipidOnly, setTipidOnly] = useState(true);
  const [activeMeal, setActiveMeal] = useState(null);
  const pantryNames = pantry.map((p) => p.name);
  const spent = useMemo(() => {
    const ws = weekStart();
    return expenses.filter((e) => e.date >= ws).reduce((s, e) => s + e.amount, 0);
  }, [expenses]);
  const remaining = budget - spent;
  const daysLeft = 7 - (/* @__PURE__ */ new Date()).getDay();
  const perDay = daysLeft > 0 ? Math.max(0, Math.round(remaining / daysLeft)) : 0;
  const usedPct = Math.min(100, Math.round(spent / Math.max(budget, 1) * 100));
  const ranked = useMemo(() => {
    const block = diet === "vegetarian" ? VEG_BLOCK : diet === "pescatarian" ? PESC_BLOCK : diet === "halal" ? HALAL_BLOCK : [];
    return MEALS.filter((m) => !m.ingredients.some((i) => block.includes(i))).map((m) => ({
      meal: m,
      ...matchScore(m, pantryNames)
    })).filter((x) => !tipidOnly || x.meal.tipid).sort((a, b) => b.pct - a.pct);
  }, [pantryNames, tipidOnly, diet]);
  const readyNow = ranked.filter((r) => r.pct === 100);
  const topMissing = useMemo(() => {
    const counts = /* @__PURE__ */ new Map();
    ranked.slice(0, 4).forEach((r) => r.missing.forEach((m) => counts.set(m, (counts.get(m) ?? 0) + 1)));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([n]) => n);
  }, [ranked]);
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(AppHeader, { greeting: "Tipid mode on!", title: "Meals", accent: "honey" }),
    /* @__PURE__ */ jsx("section", { className: "px-6", children: /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden rounded-3xl bg-gradient-honey p-5 text-primary-foreground shadow-glow", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm font-semibold", children: [
          /* @__PURE__ */ jsx(Flame, { className: "h-4 w-4" }),
          " Tipid Mode"
        ] }),
        /* @__PURE__ */ jsx(RingPct, { value: usedPct, stroke: "oklch(0.22 0.04 60)" })
      ] }),
      /* @__PURE__ */ jsxs("h2", { className: "mt-6 text-2xl font-extrabold leading-tight", children: [
        "₱",
        Math.max(0, remaining).toLocaleString(),
        /* @__PURE__ */ jsx("br", {}),
        /* @__PURE__ */ jsxs("span", { className: "text-sm font-medium opacity-80", children: [
          "left of ₱",
          budget,
          " this week"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("section", { className: "mt-4 grid grid-cols-2 gap-3 px-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border bg-card p-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsx("span", { className: "grid h-7 w-7 place-items-center rounded-lg bg-fresh/15", children: /* @__PURE__ */ jsx(Flame, { className: "h-4 w-4 text-fresh" }) }),
          "Per Day"
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "mt-3 text-3xl font-extrabold", children: [
          "₱",
          perDay
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "budget for ",
          daysLeft || 1,
          " days"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border bg-card p-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsx("span", { className: "grid h-7 w-7 place-items-center rounded-lg bg-honey/15", children: /* @__PURE__ */ jsx(Flame, { className: "h-4 w-4 text-honey" }) }),
          "Pantry"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-3 text-3xl font-extrabold", children: pantry.length }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-fresh", children: "items available" })
      ] })
    ] }),
    readyNow.length > 0 && /* @__PURE__ */ jsx("section", { className: "mt-5 px-6", children: /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-fresh/40 bg-fresh/10 p-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm font-bold text-fresh", children: [
        /* @__PURE__ */ jsx(Zap, { className: "h-4 w-4" }),
        " Cook right now (",
        readyNow.length,
        ")"
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "mt-1 text-xs text-foreground/80", children: [
        "You have everything for: ",
        readyNow.slice(0, 3).map((r) => r.meal.name).join(", ")
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("section", { className: "mt-5 px-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("h3", { className: "text-sm font-bold uppercase tracking-wide text-foreground", children: [
          "Recommended (",
          diet,
          ")"
        ] }),
        /* @__PURE__ */ jsx("button", { onClick: () => setTipidOnly((v) => !v), className: `rounded-full px-3 py-1 text-[11px] font-bold ${tipidOnly ? "bg-honey text-primary-foreground" : "border border-border text-muted-foreground"}`, children: tipidOnly ? "Tipid only" : "Show all" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-2 flex gap-1.5 overflow-x-auto pb-1", children: DIETS.map((d) => /* @__PURE__ */ jsx("button", { onClick: () => actions.setProfile({
        diet: d
      }), className: `shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold capitalize ${diet === d ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground"}`, children: d }, d)) }),
      /* @__PURE__ */ jsx("div", { className: "mt-3 space-y-2", children: ranked.map(({
        meal,
        pct,
        have,
        missing
      }) => /* @__PURE__ */ jsxs("button", { onClick: () => setActiveMeal(meal), className: "flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left transition hover:border-primary/50", children: [
        /* @__PURE__ */ jsx("div", { className: "grid h-12 w-12 place-items-center rounded-xl bg-fresh/15 text-2xl", children: meal.emoji }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold truncate", children: meal.name }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs", children: [
            /* @__PURE__ */ jsxs("span", { className: "text-fresh font-semibold", children: [
              "₱",
              meal.priceMin,
              "–",
              meal.priceMax
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
              " · ",
              meal.kcal,
              " kcal · ",
              meal.minutes,
              "m"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "mt-1 text-[10px] text-muted-foreground", children: [
            have.length,
            "/",
            meal.ingredients.length,
            " ingredients ",
            missing.length > 0 && /* @__PURE__ */ jsxs("span", { className: "text-warn", children: [
              "· need ",
              missing.join(", ")
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: `rounded-full px-2 py-0.5 text-[10px] font-bold ${pct === 100 ? "bg-fresh/20 text-fresh" : pct >= 50 ? "bg-warn/20 text-warn" : "bg-danger/20 text-danger"}`, children: [
          pct,
          "%"
        ] })
      ] }, meal.id)) })
    ] }),
    topMissing.length > 0 && /* @__PURE__ */ jsx("section", { className: "mt-5 px-6", children: /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-honey/40 bg-honey/10 p-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm font-semibold text-honey", children: [
        /* @__PURE__ */ jsx(AlertTriangle, { className: "h-4 w-4" }),
        " Missing across top meals: ",
        topMissing.join(", ")
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-2 flex flex-wrap gap-2", children: topMissing.map((m) => {
        const inList = shopping.some((s) => s.name.toLowerCase() === m.toLowerCase());
        return /* @__PURE__ */ jsxs("button", { onClick: () => actions.addToShoppingList(m), disabled: inList, className: "rounded-full bg-honey/30 px-3 py-1 text-[11px] font-semibold text-honey disabled:opacity-50", children: [
          inList ? "✓ " : "+ ",
          m
        ] }, m);
      }) }),
      /* @__PURE__ */ jsxs(Link, { to: "/shopping", className: "mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-foreground/80", children: [
        /* @__PURE__ */ jsx(ShoppingBag, { className: "h-3.5 w-3.5" }),
        " Open shopping list →"
      ] })
    ] }) }),
    ranked.length === 0 && /* @__PURE__ */ jsxs("section", { className: "mt-6 px-6 text-center", children: [
      /* @__PURE__ */ jsx(Mascot, { id: "bee-sleepy", size: 120, className: "mx-auto" }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm font-semibold", children: "No meals match this filter." }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Try turning Tipid off or pick a different diet." })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "pb-6" }),
    /* @__PURE__ */ jsx(Modal, { open: !!activeMeal, onClose: () => setActiveMeal(null), title: activeMeal?.name ?? "", children: activeMeal && /* @__PURE__ */ jsx(MealDetail, { meal: activeMeal, pantryNames, onClose: () => setActiveMeal(null) }) })
  ] });
}
function MealDetail({
  meal,
  pantryNames,
  onClose
}) {
  const {
    have,
    missing,
    pct
  } = matchScore(meal, pantryNames);
  const canCook = missing.length === 0;
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "grid h-14 w-14 place-items-center rounded-2xl bg-fresh/15 text-3xl", children: meal.emoji }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsx(Clock, { className: "inline h-3 w-3" }),
          " ",
          meal.minutes,
          " min · ",
          meal.kcal,
          " kcal"
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm font-bold text-fresh", children: [
          "₱",
          meal.priceMin,
          "–₱",
          meal.priceMax
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: `ml-auto rounded-full px-3 py-1 text-xs font-bold ${pct === 100 ? "bg-fresh/20 text-fresh" : "bg-warn/20 text-warn"}`, children: [
        pct,
        "% ready"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xs font-bold uppercase text-muted-foreground", children: "Ingredients" }),
      /* @__PURE__ */ jsxs("div", { className: "mt-2 flex flex-wrap gap-1.5", children: [
        have.map((h) => /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-fresh/15 px-2.5 py-1 text-xs text-fresh", children: [
          /* @__PURE__ */ jsx(Check, { className: "h-3 w-3" }),
          " ",
          h
        ] }, h)),
        missing.map((m) => /* @__PURE__ */ jsxs("span", { className: "rounded-full bg-warn/15 px-2.5 py-1 text-xs text-warn", children: [
          "need ",
          m
        ] }, m))
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xs font-bold uppercase text-muted-foreground", children: "Steps" }),
      /* @__PURE__ */ jsx("ol", { className: "mt-2 space-y-1.5 text-sm", children: meal.steps.map((s, i) => /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxs("span", { className: "font-bold text-primary", children: [
          i + 1,
          "."
        ] }),
        " ",
        s
      ] }, i)) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-5 flex gap-2", children: [
      missing.length > 0 && /* @__PURE__ */ jsx("button", { onClick: () => {
        missing.forEach((m) => actions.addToShoppingList(m));
        onClose();
      }, className: "flex-1 rounded-xl border border-honey/50 bg-honey/10 py-2.5 text-sm font-bold text-honey", children: "+ Shopping list" }),
      /* @__PURE__ */ jsxs("button", { onClick: () => {
        actions.cookMeal(meal.id, have);
        onClose();
      }, disabled: !canCook, className: "flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-honey py-2.5 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-50", children: [
        /* @__PURE__ */ jsx(ChefHat, { className: "h-4 w-4" }),
        " Cook Now"
      ] })
    ] }),
    !canCook && /* @__PURE__ */ jsx("p", { className: "mt-2 text-center text-[11px] text-muted-foreground", children: "Add missing ingredients to enable cooking" })
  ] });
}
export {
  MealsPage as component
};
