import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { AppHeader } from "@/components/AppHeader";
import { actions, useStore } from "@/lib/store";
import { Receipt as ReceiptIcon, Trash2, ArrowLeft, Store } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/receipts")({ component: ReceiptsPage });

function ReceiptsPage() {
  const receipts = useStore((s) => s.receipts);
  const [openId, setOpenId] = useState<string | null>(null);
  const open = receipts.find((r) => r.id === openId) ?? null;

  if (open) {
    return (
      <AppShell>
        <header className="px-6 pt-8 pb-4 flex items-center gap-3">
          <button onClick={() => setOpenId(null)} className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-extrabold truncate">{open.store}</h1>
            <p className="text-[11px] text-muted-foreground">{new Date(open.date).toLocaleString("en-PH")}</p>
          </div>
          <button onClick={() => { actions.removeReceipt(open.id); setOpenId(null); }} className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-danger">
            <Trash2 className="h-4 w-4" />
          </button>
        </header>
        <section className="px-6">
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-3xl font-extrabold text-honey">₱{open.total.toFixed(2)}</p>
            <p className="text-[11px] text-muted-foreground">{open.items.length} items</p>
          </div>
        </section>
        <section className="mt-4 px-6 pb-6 space-y-2">
          {open.items.map((it, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
              <span className="grid h-9 w-9 place-items-center rounded-md bg-secondary text-xs font-bold">{it.name.charAt(0)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{it.name}</p>
                <p className="text-[11px] text-muted-foreground">{it.qty} {it.unit} · {it.category}</p>
              </div>
              <p className="text-sm font-bold">₱{(it.price ?? 0).toFixed(2)}</p>
            </div>
          ))}
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <AppHeader greeting="Recent" title="Receipts" />
      <section className="px-6">
        {receipts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center">
            <ReceiptIcon className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-2 text-sm font-semibold">No receipts yet</p>
            <p className="text-xs text-muted-foreground">Scan a receipt to start tracking history.</p>
            <Link to="/scanner" className="mt-4 inline-block rounded-xl bg-gradient-honey px-4 py-2 text-xs font-bold text-primary-foreground shadow-glow">Scan Receipt</Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {receipts.map((r) => (
              <li key={r.id}>
                <button onClick={() => setOpenId(r.id)} className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left hover:border-honey/60">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-honey/15"><Store className="h-5 w-5 text-honey" /></span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{r.store}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(r.date).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })} · {r.items.length} items
                    </p>
                  </div>
                  <p className="text-sm font-extrabold text-honey">₱{r.total.toFixed(2)}</p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}
