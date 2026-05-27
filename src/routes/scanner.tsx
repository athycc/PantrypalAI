import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Camera, Upload, FileText, CheckCircle2, Pencil, X, Loader2, History } from "lucide-react";
import { useRef, useState } from "react";
import { actions, type Category, type PantryItem } from "@/lib/store";
import { ocrReceipt, type ParsedLine } from "@/lib/ocr";
import { toast } from "sonner";

export const Route = createFileRoute("/scanner")({ component: ScannerPage });

const categories: Category[] = ["Grains", "Protein", "Vegetables", "Dairy", "Condiments", "Snacks", "Beverages", "Other"];

function ScannerPage() {
  const [phase, setPhase] = useState<"idle" | "scanning" | "review" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const [label, setLabel] = useState("");
  const [store, setStore] = useState("");
  const [drafts, setDrafts] = useState<ParsedLine[]>([]);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);

  const runOCR = async (file: File) => {
    setPhase("scanning"); setProgress(2); setLabel("Loading OCR…");
    try {
      const parsed = await ocrReceipt(file, (pct, lbl) => { setProgress(pct); setLabel(lbl); });
      if (parsed.items.length === 0) {
        toast.error("Couldn't extract items — try a clearer photo or add manually.");
        setPhase("idle"); return;
      }
      setStore(parsed.store);
      setDrafts(parsed.items.map((d) => ({ ...d, confirmed: false })));
      setPhase("review");
      toast.success(`Found ${parsed.items.length} items from ${parsed.store}`);
    } catch (e) {
      toast.error("OCR failed: " + (e instanceof Error ? e.message : "unknown"));
      setPhase("idle");
    }
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) void runOCR(f);
    e.target.value = "";
  };

  const addBlank = () => {
    setDrafts((arr) => [...arr, { name: "New Item", qty: 1, unit: "pcs", category: "Other", price: 0, expiresAt: Date.now() + 14 * 86_400_000, confirmed: false }]);
    setEditIdx(drafts.length);
  };

  const total = drafts.reduce((s, d) => s + (d.price ?? 0), 0);

  const commit = () => {
    const items: Omit<PantryItem, "id" | "addedAt">[] = drafts.map(({ confirmed: _c, ...rest }) => rest);
    actions.bulkAddPantry(items, total, store || "Receipt");
    setPhase("done");
  };

  return (
    <AppShell>
      <header className="px-6 pt-8 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Receipt Scanner</h1>
          <p className="text-xs text-primary">Real on-device OCR (Tesseract.js)</p>
        </div>
        <Link to="/receipts" className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold">
          <History className="h-3.5 w-3.5" /> History
        </Link>
      </header>

      <section className="px-6">
        <div className="relative aspect-[3/4] rounded-2xl border-2 border-dashed border-border bg-card/40 p-4">
          <Corner className="left-2 top-2" />
          <Corner className="right-2 top-2 rotate-90" />
          <Corner className="left-2 bottom-2 -rotate-90" />
          <Corner className="right-2 bottom-2 rotate-180" />
          <div className="absolute inset-0 grid place-items-center text-center px-6">
            <div>
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-xs text-fresh">
                {phase === "idle" && "Capture or upload a receipt photo"}
                {phase === "scanning" && label}
                {phase === "review" && `Found ${drafts.length} items`}
                {phase === "done" && "Added to pantry ✓"}
              </p>
            </div>
          </div>
        </div>

        <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
        <input ref={camRef} type="file" accept="image/*" capture="environment" hidden onChange={onFile} />

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button onClick={() => fileRef.current?.click()} disabled={phase === "scanning"} className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-sm font-semibold disabled:opacity-60">
            <Upload className="h-4 w-4" /> Upload Photo
          </button>
          <button onClick={() => camRef.current?.click()} disabled={phase === "scanning"} className="flex items-center justify-center gap-2 rounded-xl bg-gradient-honey py-3 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-60">
            {phase === "scanning" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />} Capture
          </button>
        </div>

        <p className="mt-3 text-center text-[11px] text-muted-foreground">
          <span className="rounded-full border border-border px-2.5 py-1">Works offline · No data leaves your phone</span>
        </p>
      </section>

      {phase === "scanning" && (
        <section className="mt-6 px-6">
          <div className="rounded-xl border border-border bg-card p-3">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-secondary"><FileText className="h-5 w-5 text-muted-foreground" /></div>
              <div className="flex-1 text-xs">
                <p className="text-foreground capitalize">{label || "Processing"}</p>
                <p className="text-muted-foreground">Reading line items…</p>
              </div>
              <span className="text-xs font-semibold">{progress}%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-gradient-honey transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </section>
      )}

      {phase === "review" && (
        <section className="mt-6 px-6 pb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold">Review Items</h2>
            <span className="rounded-full bg-warn/15 px-2 py-0.5 text-[10px] font-bold text-warn">
              {drafts.filter((d) => !d.confirmed).length} need review
            </span>
          </div>
          <input value={store} onChange={(e) => setStore(e.target.value)} className="mt-2 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm" placeholder="Store name" />
          <p className="mt-1 text-xs text-fresh">₱{total.toFixed(2)} total · {drafts.length} items · Tap ✓ to confirm, ✎ to edit</p>

          <div className="mt-3 space-y-2">
            {drafts.map((r, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-3">
                {editIdx === i ? (
                  <DraftEditor draft={r} onSave={(d) => { setDrafts((arr) => arr.map((x, idx) => idx === i ? { ...d, confirmed: true } : x)); setEditIdx(null); }} onCancel={() => setEditIdx(null)} />
                ) : (
                  <div className="flex items-center gap-3">
                    <span className={`grid h-9 w-9 place-items-center rounded-md text-xs font-bold ${r.confirmed ? "bg-fresh/20 text-fresh" : "bg-warn/20 text-warn"}`}>
                      {r.name.charAt(0).toUpperCase()}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{r.name} · {r.qty}{r.unit}</p>
                      <p className="text-[11px] text-muted-foreground">₱{r.price?.toFixed(2)} · {r.category}</p>
                    </div>
                    <button onClick={() => setEditIdx(i)} className="flex items-center gap-1 rounded-full bg-honey-deep/80 px-2.5 py-1 text-[11px] font-semibold text-primary-foreground">
                      <Pencil className="h-3 w-3" /> Edit
                    </button>
                    <button onClick={() => setDrafts((arr) => arr.map((x, idx) => idx === i ? { ...x, confirmed: !x.confirmed } : x))} className={`grid h-7 w-7 place-items-center rounded-md ${r.confirmed ? "text-fresh" : "text-muted-foreground"}`}>
                      <CheckCircle2 className="h-5 w-5" />
                    </button>
                    <button onClick={() => setDrafts((arr) => arr.filter((_, idx) => idx !== i))} className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:text-danger">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button onClick={addBlank} className="mt-2 w-full rounded-xl border border-dashed border-border py-2 text-xs font-semibold text-muted-foreground">+ Add item manually</button>

          <button onClick={commit} className="mt-4 w-full rounded-xl bg-gradient-fresh py-3 text-sm font-bold text-[oklch(0.2_0.04_150)]">
            Add {drafts.length} items to Pantry
          </button>
        </section>
      )}

      {phase === "done" && (
        <section className="mt-6 px-6 pb-6">
          <div className="rounded-2xl border border-fresh/40 bg-fresh/10 p-5 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-fresh" />
            <p className="mt-2 text-base font-bold">Receipt logged!</p>
            <p className="text-xs text-muted-foreground">₱{total.toFixed(2)} tracked in budget</p>
            <button onClick={() => { setPhase("idle"); setDrafts([]); }} className="mt-4 w-full rounded-xl border border-border bg-card py-2.5 text-sm font-semibold">
              Scan another
            </button>
          </div>
        </section>
      )}
    </AppShell>
  );
}

function DraftEditor({ draft, onSave, onCancel }: { draft: ParsedLine; onSave: (d: ParsedLine) => void; onCancel: () => void }) {
  const [d, setD] = useState(draft);
  return (
    <div className="space-y-2">
      <input value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm" />
      <div className="grid grid-cols-3 gap-2">
        <input type="number" value={d.qty} onChange={(e) => setD({ ...d, qty: parseFloat(e.target.value) || 0 })} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm" placeholder="Qty" />
        <input value={d.unit} onChange={(e) => setD({ ...d, unit: e.target.value })} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm" placeholder="Unit" />
        <input type="number" value={d.price ?? 0} onChange={(e) => setD({ ...d, price: parseFloat(e.target.value) || 0 })} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm" placeholder="₱" />
      </div>
      <select value={d.category} onChange={(e) => setD({ ...d, category: e.target.value as Category })} className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm">
        {categories.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 rounded-md border border-border py-1.5 text-xs font-semibold">Cancel</button>
        <button onClick={() => onSave(d)} className="flex-1 rounded-md bg-gradient-honey py-1.5 text-xs font-bold text-primary-foreground">Save</button>
      </div>
    </div>
  );
}

function Corner({ className = "" }: { className?: string }) {
  return <span className={`absolute h-5 w-5 border-l-2 border-t-2 border-fresh ${className}`} />;
}
