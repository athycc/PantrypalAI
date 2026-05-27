import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { AppHeader } from "@/components/AppHeader";
import { actions, useStore } from "@/lib/store";
import { Mascot } from "@/components/Mascot";
import { Check, Plus, Trash2, Sparkles } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/shopping")({ component: ShoppingPage });

function ShoppingPage() {
  const items = useStore((s) => s.shopping);
  const [name, setName] = useState("");
  const doneCount = items.filter((i) => i.done).length;
  const pendingCount = items.length - doneCount;

  const add = (e: React.FormEvent) => {
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
        name: i.name, qty: 1, unit: "pcs", category: "Other",
        expiresAt: Date.now() + 14 * 86_400_000,
      });
      actions.removeFromShopping(i.id);
    });
  };

  return (
    <AppShell>
      <AppHeader greeting="Pamalengke!" title="Shopping" accent="honey" />

      <section className="px-6">
        <div className="rounded-3xl bg-gradient-honey p-5 text-primary-foreground shadow-glow">
          <p className="text-xs font-bold uppercase tracking-wide opacity-80">Need to buy</p>
          <p className="mt-2 text-3xl font-extrabold">{pendingCount} items</p>
          <p className="text-xs opacity-80">{doneCount} already in cart</p>
        </div>
      </section>

      <section className="px-6 mt-4">
        <form onSubmit={add} className="flex gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Add item…" className="flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-sm" />
          <button type="submit" className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-honey text-primary-foreground shadow-glow">
            <Plus className="h-5 w-5" />
          </button>
        </form>
      </section>

      <section className="px-6 mt-4 space-y-2">
        {items.length === 0 && (
          <div className="text-center py-8">
            <Mascot id="bee-sleepy" size={120} className="mx-auto" />
            <p className="mt-2 text-sm font-semibold">All caught up!</p>
            <p className="text-xs text-muted-foreground">Add items here or from meal recommendations.</p>
          </div>
        )}
        {items.map((i) => (
          <div key={i.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
            <button onClick={() => actions.toggleShopping(i.id)} className={`grid h-7 w-7 place-items-center rounded-full border-2 ${i.done ? "border-fresh bg-fresh text-background" : "border-border"}`}>
              {i.done && <Check className="h-4 w-4" />}
            </button>
            <span className={`flex-1 text-sm ${i.done ? "line-through text-muted-foreground" : "font-medium"}`}>{i.name}</span>
            <button onClick={() => actions.removeFromShopping(i.id)} className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:text-danger">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </section>

      {doneCount > 0 && (
        <section className="px-6 mt-4 pb-6 space-y-2">
          <button onClick={moveDoneToPantry} className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-fresh py-3 text-sm font-bold text-[oklch(0.2_0.04_150)]">
            <Sparkles className="h-4 w-4" /> Move {doneCount} purchased to Pantry
          </button>
          <button onClick={() => actions.clearDoneShopping()} className="w-full rounded-xl border border-border bg-card py-2 text-xs font-semibold">
            Clear checked
          </button>
        </section>
      )}
      <div className="pb-6" />
    </AppShell>
  );
}
