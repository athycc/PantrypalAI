import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { AppHeader } from "@/components/AppHeader";
import { Flame, AlertTriangle, ChefHat, Clock, ShoppingBag, Check, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { RingPct } from "./index";
import { actions, useStore, weekStart } from "@/lib/store";
import { MEALS, matchScore, type Meal } from "@/lib/meals";
import { Modal } from "@/components/Modal";
import { Mascot } from "@/components/Mascot";

export const Route = createFileRoute("/meals")({ component: MealsPage });

const DIETS = ["none", "vegetarian", "pescatarian", "halal"] as const;
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
  const [activeMeal, setActiveMeal] = useState<Meal | null>(null);

  const pantryNames = pantry.map((p) => p.name);

  const spent = useMemo(() => {
    const ws = weekStart();
    return expenses.filter((e) => e.date >= ws).reduce((s, e) => s + e.amount, 0);
  }, [expenses]);
  const remaining = budget - spent;
  const daysLeft = 7 - new Date().getDay();
  const perDay = daysLeft > 0 ? Math.max(0, Math.round(remaining / daysLeft)) : 0;
  const usedPct = Math.min(100, Math.round((spent / Math.max(budget, 1)) * 100));

  const ranked = useMemo(() => {
    const block = diet === "vegetarian" ? VEG_BLOCK : diet === "pescatarian" ? PESC_BLOCK : diet === "halal" ? HALAL_BLOCK : [];
    return MEALS
      .filter((m) => !m.ingredients.some((i) => block.includes(i)))
      .map((m) => ({ meal: m, ...matchScore(m, pantryNames) }))
      .filter((x) => !tipidOnly || x.meal.tipid)
      .sort((a, b) => b.pct - a.pct);
  }, [pantryNames, tipidOnly, diet]);

  const readyNow = ranked.filter((r) => r.pct === 100);

  const topMissing = useMemo(() => {
    const counts = new Map<string, number>();
    ranked.slice(0, 4).forEach((r) => r.missing.forEach((m) => counts.set(m, (counts.get(m) ?? 0) + 1)));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([n]) => n);
  }, [ranked]);

  return (
    <AppShell>
      <AppHeader greeting="Tipid mode on!" title="Meals" accent="honey" />

      <section className="px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-honey p-5 text-primary-foreground shadow-glow">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Flame className="h-4 w-4" /> Tipid Mode
            </div>
            <RingPct value={usedPct} stroke="oklch(0.22 0.04 60)" />
          </div>
          <h2 className="mt-6 text-2xl font-extrabold leading-tight">₱{Math.max(0, remaining).toLocaleString()}<br /><span className="text-sm font-medium opacity-80">left of ₱{budget} this week</span></h2>
        </div>
      </section>

      <section className="mt-4 grid grid-cols-2 gap-3 px-6">
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-fresh/15"><Flame className="h-4 w-4 text-fresh" /></span>
            Per Day
          </div>
          <p className="mt-3 text-3xl font-extrabold">₱{perDay}</p>
          <p className="text-xs text-muted-foreground">budget for {daysLeft || 1} days</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-honey/15"><Flame className="h-4 w-4 text-honey" /></span>
            Pantry
          </div>
          <p className="mt-3 text-3xl font-extrabold">{pantry.length}</p>
          <p className="text-xs text-fresh">items available</p>
        </div>
      </section>

      {readyNow.length > 0 && (
        <section className="mt-5 px-6">
          <div className="rounded-2xl border border-fresh/40 bg-fresh/10 p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-fresh">
              <Zap className="h-4 w-4" /> Cook right now ({readyNow.length})
            </div>
            <p className="mt-1 text-xs text-foreground/80">You have everything for: {readyNow.slice(0, 3).map((r) => r.meal.name).join(", ")}</p>
          </div>
        </section>
      )}

      <section className="mt-5 px-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">Recommended ({diet})</h3>
          <button onClick={() => setTipidOnly((v) => !v)} className={`rounded-full px-3 py-1 text-[11px] font-bold ${tipidOnly ? "bg-honey text-primary-foreground" : "border border-border text-muted-foreground"}`}>
            {tipidOnly ? "Tipid only" : "Show all"}
          </button>
        </div>
        <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
          {DIETS.map((d) => (
            <button key={d} onClick={() => actions.setProfile({ diet: d })} className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold capitalize ${diet === d ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground"}`}>{d}</button>
          ))}
        </div>
        <div className="mt-3 space-y-2">
          {ranked.map(({ meal, pct, have, missing }) => (
            <button key={meal.id} onClick={() => setActiveMeal(meal)} className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left transition hover:border-primary/50">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-fresh/15 text-2xl">{meal.emoji}</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{meal.name}</p>
                <p className="text-xs">
                  <span className="text-fresh font-semibold">₱{meal.priceMin}–{meal.priceMax}</span>
                  <span className="text-muted-foreground"> · {meal.kcal} kcal · {meal.minutes}m</span>
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground">{have.length}/{meal.ingredients.length} ingredients {missing.length > 0 && <span className="text-warn">· need {missing.join(", ")}</span>}</p>
              </div>
              <div className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${pct === 100 ? "bg-fresh/20 text-fresh" : pct >= 50 ? "bg-warn/20 text-warn" : "bg-danger/20 text-danger"}`}>
                {pct}%
              </div>
            </button>
          ))}
        </div>
      </section>

      {topMissing.length > 0 && (
        <section className="mt-5 px-6">
          <div className="rounded-2xl border border-honey/40 bg-honey/10 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-honey">
              <AlertTriangle className="h-4 w-4" /> Missing across top meals: {topMissing.join(", ")}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {topMissing.map((m) => {
                const inList = shopping.some((s) => s.name.toLowerCase() === m.toLowerCase());
                return (
                  <button key={m} onClick={() => actions.addToShoppingList(m)} disabled={inList} className="rounded-full bg-honey/30 px-3 py-1 text-[11px] font-semibold text-honey disabled:opacity-50">
                    {inList ? "✓ " : "+ "}{m}
                  </button>
                );
              })}
            </div>
            <Link to="/shopping" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-foreground/80">
              <ShoppingBag className="h-3.5 w-3.5" /> Open shopping list →
            </Link>
          </div>
        </section>
      )}

      {ranked.length === 0 && (
        <section className="mt-6 px-6 text-center">
          <Mascot id="bee-sleepy" size={120} className="mx-auto" />
          <p className="mt-2 text-sm font-semibold">No meals match this filter.</p>
          <p className="text-xs text-muted-foreground">Try turning Tipid off or pick a different diet.</p>
        </section>
      )}
      <div className="pb-6" />

      <Modal open={!!activeMeal} onClose={() => setActiveMeal(null)} title={activeMeal?.name ?? ""}>
        {activeMeal && <MealDetail meal={activeMeal} pantryNames={pantryNames} onClose={() => setActiveMeal(null)} />}
      </Modal>
    </AppShell>
  );
}

function MealDetail({ meal, pantryNames, onClose }: { meal: Meal; pantryNames: string[]; onClose: () => void }) {
  const { have, missing, pct } = matchScore(meal, pantryNames);
  const canCook = missing.length === 0;
  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-fresh/15 text-3xl">{meal.emoji}</div>
        <div>
          <p className="text-xs text-muted-foreground"><Clock className="inline h-3 w-3" /> {meal.minutes} min · {meal.kcal} kcal</p>
          <p className="text-sm font-bold text-fresh">₱{meal.priceMin}–₱{meal.priceMax}</p>
        </div>
        <div className={`ml-auto rounded-full px-3 py-1 text-xs font-bold ${pct === 100 ? "bg-fresh/20 text-fresh" : "bg-warn/20 text-warn"}`}>{pct}% ready</div>
      </div>
      <div className="mt-4">
        <p className="text-xs font-bold uppercase text-muted-foreground">Ingredients</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {have.map((h) => <span key={h} className="inline-flex items-center gap-1 rounded-full bg-fresh/15 px-2.5 py-1 text-xs text-fresh"><Check className="h-3 w-3" /> {h}</span>)}
          {missing.map((m) => <span key={m} className="rounded-full bg-warn/15 px-2.5 py-1 text-xs text-warn">need {m}</span>)}
        </div>
      </div>
      <div className="mt-4">
        <p className="text-xs font-bold uppercase text-muted-foreground">Steps</p>
        <ol className="mt-2 space-y-1.5 text-sm">
          {meal.steps.map((s, i) => (
            <li key={i} className="flex gap-2"><span className="font-bold text-primary">{i + 1}.</span> {s}</li>
          ))}
        </ol>
      </div>
      <div className="mt-5 flex gap-2">
        {missing.length > 0 && (
          <button onClick={() => { missing.forEach((m) => actions.addToShoppingList(m)); onClose(); }} className="flex-1 rounded-xl border border-honey/50 bg-honey/10 py-2.5 text-sm font-bold text-honey">
            + Shopping list
          </button>
        )}
        <button
          onClick={() => { actions.cookMeal(meal.id, have); onClose(); }}
          disabled={!canCook}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-honey py-2.5 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-50"
        >
          <ChefHat className="h-4 w-4" /> Cook Now
        </button>
      </div>
      {!canCook && <p className="mt-2 text-center text-[11px] text-muted-foreground">Add missing ingredients to enable cooking</p>}
    </div>
  );
}
