import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { A as AppShell } from "./AppShell-BGKyT93p.js";
import { History, FileText, Upload, Loader2, Camera, Pencil, CheckCircle2, X } from "lucide-react";
import { useState, useRef } from "react";
import { a as actions } from "./router-CYur2j8s.js";
import { toast } from "sonner";
import "./PhoneFrame-CGwlULp_.js";
import "@tanstack/react-query";
import "@supabase/supabase-js";
const DAY = 864e5;
const KNOWN_STORES = ["sm hypermarket", "sm supermarket", "puregold", "robinsons", "savemore", "waltermart", "shopwise", "rustans", "landers", "s&r"];
const CATEGORY_HINTS = [
  { keywords: ["rice", "bigas", "oats", "flour", "noodle", "pasta", "pancit", "bread", "tinapay"], cat: "Grains", days: 60, unit: "pcs" },
  { keywords: ["egg", "itlog", "chicken", "manok", "pork", "baboy", "beef", "baka", "fish", "isda", "bangus", "tilapia", "tofu", "tokwa", "hotdog", "longganisa", "tocino"], cat: "Protein", days: 7, unit: "pcs" },
  { keywords: ["kangkong", "pechay", "talong", "kalabasa", "ampalaya", "sayote", "garlic", "bawang", "onion", "sibuyas", "tomato", "kamatis", "ginger", "luya", "cabbage", "lettuce", "carrot", "potato"], cat: "Vegetables", days: 7, unit: "pcs" },
  { keywords: ["milk", "gatas", "cheese", "keso", "butter", "yogurt", "cream"], cat: "Dairy", days: 14, unit: "ml" },
  { keywords: ["soy", "toyo", "vinegar", "suka", "patis", "oil", "mantika", "sugar", "asukal", "salt", "asin", "ketchup", "mayo", "magic sarap"], cat: "Condiments", days: 180, unit: "ml" },
  { keywords: ["chips", "biscuit", "cracker", "candy", "chocolate", "skyflakes"], cat: "Snacks", days: 90, unit: "pcs" },
  { keywords: ["coffee", "kape", "tea", "juice", "soda", "coke", "sprite", "water", "tubig"], cat: "Beverages", days: 90, unit: "pcs" }
];
function categorize(name) {
  const n = name.toLowerCase();
  for (const h of CATEGORY_HINTS) {
    if (h.keywords.some((k) => n.includes(k))) return { cat: h.cat, days: h.days, unit: h.unit };
  }
  return { cat: "Other", days: 30, unit: "pcs" };
}
function detectStore(text) {
  const head = text.slice(0, 200).toLowerCase();
  for (const s of KNOWN_STORES) {
    if (head.includes(s)) return s.replace(/\b\w/g, (c) => c.toUpperCase());
  }
  const first = text.split(/\n/).find((l) => l.trim().length > 2);
  return first ? first.trim().slice(0, 30) : "Receipt";
}
function detectDate(text) {
  const m = text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (m) {
    const yy = m[3].length === 2 ? 2e3 + parseInt(m[3]) : parseInt(m[3]);
    const d = new Date(yy, parseInt(m[2]) - 1, parseInt(m[1]));
    if (!isNaN(d.getTime())) return d.getTime();
  }
  return Date.now();
}
function parseLines(text) {
  const lines = text.split(/\n/).map((l) => l.replace(/\s+/g, " ").trim()).filter((l) => l.length > 2);
  const out = [];
  const priceRe = /(\d+\.\d{2})\s*$/;
  const qtyRe = /^(\d+)\s*[xX@]\s*/;
  const skipRe = /(total|subtotal|change|cash|vat|tax|tin|or\s*#|tend|invoice|receipt|thank you|cashier|qty|disc)/i;
  for (const line of lines) {
    if (skipRe.test(line)) continue;
    const pm = line.match(priceRe);
    if (!pm) continue;
    const price = parseFloat(pm[1]);
    if (!isFinite(price) || price <= 0 || price > 1e4) continue;
    let rest = line.replace(priceRe, "").trim();
    let qty = 1;
    const qm = rest.match(qtyRe);
    if (qm) {
      qty = parseInt(qm[1]) || 1;
      rest = rest.replace(qtyRe, "").trim();
    }
    const name = rest.replace(/[^A-Za-z0-9 &\-]/g, "").trim();
    if (name.length < 2) continue;
    const { cat, days, unit } = categorize(name);
    out.push({
      name: name.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()),
      qty,
      unit,
      category: cat,
      price,
      expiresAt: Date.now() + days * DAY,
      confirmed: false
    });
  }
  return out;
}
function detectTotal(text, fallback) {
  const m = text.match(/total[^0-9]*(\d+\.\d{2})/i);
  if (m) return parseFloat(m[1]);
  return fallback;
}
async function ocrReceipt(file, onProgress) {
  onProgress(2, "Loading OCR engine…");
  const Tesseract = (await import("tesseract.js")).default;
  const { data } = await Tesseract.recognize(file, "eng", {
    logger: (m) => {
      const pct = Math.round((m.progress ?? 0) * 100);
      onProgress(Math.max(5, pct), m.status || "Working…");
    }
  });
  const text = data.text || "";
  const items = parseLines(text);
  const sum = items.reduce((s, i) => s + (i.price ?? 0), 0);
  return {
    store: detectStore(text),
    date: detectDate(text),
    total: detectTotal(text, sum),
    items,
    rawText: text
  };
}
const categories = ["Grains", "Protein", "Vegetables", "Dairy", "Condiments", "Snacks", "Beverages", "Other"];
function ScannerPage() {
  const [phase, setPhase] = useState("idle");
  const [progress, setProgress] = useState(0);
  const [label, setLabel] = useState("");
  const [store, setStore] = useState("");
  const [drafts, setDrafts] = useState([]);
  const [editIdx, setEditIdx] = useState(null);
  const fileRef = useRef(null);
  const camRef = useRef(null);
  const runOCR = async (file) => {
    setPhase("scanning");
    setProgress(2);
    setLabel("Loading OCR…");
    try {
      const parsed = await ocrReceipt(file, (pct, lbl) => {
        setProgress(pct);
        setLabel(lbl);
      });
      if (parsed.items.length === 0) {
        toast.error("Couldn't extract items — try a clearer photo or add manually.");
        setPhase("idle");
        return;
      }
      setStore(parsed.store);
      setDrafts(parsed.items.map((d) => ({
        ...d,
        confirmed: false
      })));
      setPhase("review");
      toast.success(`Found ${parsed.items.length} items from ${parsed.store}`);
    } catch (e) {
      toast.error("OCR failed: " + (e instanceof Error ? e.message : "unknown"));
      setPhase("idle");
    }
  };
  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (f) void runOCR(f);
    e.target.value = "";
  };
  const addBlank = () => {
    setDrafts((arr) => [...arr, {
      name: "New Item",
      qty: 1,
      unit: "pcs",
      category: "Other",
      price: 0,
      expiresAt: Date.now() + 14 * 864e5,
      confirmed: false
    }]);
    setEditIdx(drafts.length);
  };
  const total = drafts.reduce((s, d) => s + (d.price ?? 0), 0);
  const commit = () => {
    const items = drafts.map(({
      confirmed: _c,
      ...rest
    }) => rest);
    actions.bulkAddPantry(items, total, store || "Receipt");
    setPhase("done");
  };
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsxs("header", { className: "px-6 pt-8 pb-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-extrabold tracking-tight", children: "Receipt Scanner" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-primary", children: "Real on-device OCR (Tesseract.js)" })
      ] }),
      /* @__PURE__ */ jsxs(Link, { to: "/receipts", className: "inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold", children: [
        /* @__PURE__ */ jsx(History, { className: "h-3.5 w-3.5" }),
        " History"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "px-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative aspect-[3/4] rounded-2xl border-2 border-dashed border-border bg-card/40 p-4", children: [
        /* @__PURE__ */ jsx(Corner, { className: "left-2 top-2" }),
        /* @__PURE__ */ jsx(Corner, { className: "right-2 top-2 rotate-90" }),
        /* @__PURE__ */ jsx(Corner, { className: "left-2 bottom-2 -rotate-90" }),
        /* @__PURE__ */ jsx(Corner, { className: "right-2 bottom-2 rotate-180" }),
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 grid place-items-center text-center px-6", children: /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(FileText, { className: "mx-auto h-12 w-12 text-muted-foreground" }),
          /* @__PURE__ */ jsxs("p", { className: "mt-2 text-xs text-fresh", children: [
            phase === "idle" && "Capture or upload a receipt photo",
            phase === "scanning" && label,
            phase === "review" && `Found ${drafts.length} items`,
            phase === "done" && "Added to pantry ✓"
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsx("input", { ref: fileRef, type: "file", accept: "image/*", hidden: true, onChange: onFile }),
      /* @__PURE__ */ jsx("input", { ref: camRef, type: "file", accept: "image/*", capture: "environment", hidden: true, onChange: onFile }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4 grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxs("button", { onClick: () => fileRef.current?.click(), disabled: phase === "scanning", className: "flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-sm font-semibold disabled:opacity-60", children: [
          /* @__PURE__ */ jsx(Upload, { className: "h-4 w-4" }),
          " Upload Photo"
        ] }),
        /* @__PURE__ */ jsxs("button", { onClick: () => camRef.current?.click(), disabled: phase === "scanning", className: "flex items-center justify-center gap-2 rounded-xl bg-gradient-honey py-3 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-60", children: [
          phase === "scanning" ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Camera, { className: "h-4 w-4" }),
          " Capture"
        ] })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-3 text-center text-[11px] text-muted-foreground", children: /* @__PURE__ */ jsx("span", { className: "rounded-full border border-border px-2.5 py-1", children: "Works offline · No data leaves your phone" }) })
    ] }),
    phase === "scanning" && /* @__PURE__ */ jsx("section", { className: "mt-6 px-6", children: /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-card p-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "grid h-10 w-10 place-items-center rounded-lg bg-secondary", children: /* @__PURE__ */ jsx(FileText, { className: "h-5 w-5 text-muted-foreground" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 text-xs", children: [
          /* @__PURE__ */ jsx("p", { className: "text-foreground capitalize", children: label || "Processing" }),
          /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Reading line items…" })
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "text-xs font-semibold", children: [
          progress,
          "%"
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-2 h-1.5 overflow-hidden rounded-full bg-secondary", children: /* @__PURE__ */ jsx("div", { className: "h-full rounded-full bg-gradient-honey transition-all", style: {
        width: `${progress}%`
      } }) })
    ] }) }),
    phase === "review" && /* @__PURE__ */ jsxs("section", { className: "mt-6 px-6 pb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-base font-bold", children: "Review Items" }),
        /* @__PURE__ */ jsxs("span", { className: "rounded-full bg-warn/15 px-2 py-0.5 text-[10px] font-bold text-warn", children: [
          drafts.filter((d) => !d.confirmed).length,
          " need review"
        ] })
      ] }),
      /* @__PURE__ */ jsx("input", { value: store, onChange: (e) => setStore(e.target.value), className: "mt-2 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm", placeholder: "Store name" }),
      /* @__PURE__ */ jsxs("p", { className: "mt-1 text-xs text-fresh", children: [
        "₱",
        total.toFixed(2),
        " total · ",
        drafts.length,
        " items · Tap ✓ to confirm, ✎ to edit"
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-3 space-y-2", children: drafts.map((r, i) => /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-border bg-card p-3", children: editIdx === i ? /* @__PURE__ */ jsx(DraftEditor, { draft: r, onSave: (d) => {
        setDrafts((arr) => arr.map((x, idx) => idx === i ? {
          ...d,
          confirmed: true
        } : x));
        setEditIdx(null);
      }, onCancel: () => setEditIdx(null) }) : /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("span", { className: `grid h-9 w-9 place-items-center rounded-md text-xs font-bold ${r.confirmed ? "bg-fresh/20 text-fresh" : "bg-warn/20 text-warn"}`, children: r.name.charAt(0).toUpperCase() }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-sm font-semibold truncate", children: [
            r.name,
            " · ",
            r.qty,
            r.unit
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-muted-foreground", children: [
            "₱",
            r.price?.toFixed(2),
            " · ",
            r.category
          ] })
        ] }),
        /* @__PURE__ */ jsxs("button", { onClick: () => setEditIdx(i), className: "flex items-center gap-1 rounded-full bg-honey-deep/80 px-2.5 py-1 text-[11px] font-semibold text-primary-foreground", children: [
          /* @__PURE__ */ jsx(Pencil, { className: "h-3 w-3" }),
          " Edit"
        ] }),
        /* @__PURE__ */ jsx("button", { onClick: () => setDrafts((arr) => arr.map((x, idx) => idx === i ? {
          ...x,
          confirmed: !x.confirmed
        } : x)), className: `grid h-7 w-7 place-items-center rounded-md ${r.confirmed ? "text-fresh" : "text-muted-foreground"}`, children: /* @__PURE__ */ jsx(CheckCircle2, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsx("button", { onClick: () => setDrafts((arr) => arr.filter((_, idx) => idx !== i)), className: "grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:text-danger", children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
      ] }) }, i)) }),
      /* @__PURE__ */ jsx("button", { onClick: addBlank, className: "mt-2 w-full rounded-xl border border-dashed border-border py-2 text-xs font-semibold text-muted-foreground", children: "+ Add item manually" }),
      /* @__PURE__ */ jsxs("button", { onClick: commit, className: "mt-4 w-full rounded-xl bg-gradient-fresh py-3 text-sm font-bold text-[oklch(0.2_0.04_150)]", children: [
        "Add ",
        drafts.length,
        " items to Pantry"
      ] })
    ] }),
    phase === "done" && /* @__PURE__ */ jsx("section", { className: "mt-6 px-6 pb-6", children: /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-fresh/40 bg-fresh/10 p-5 text-center", children: [
      /* @__PURE__ */ jsx(CheckCircle2, { className: "mx-auto h-10 w-10 text-fresh" }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-base font-bold", children: "Receipt logged!" }),
      /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
        "₱",
        total.toFixed(2),
        " tracked in budget"
      ] }),
      /* @__PURE__ */ jsx("button", { onClick: () => {
        setPhase("idle");
        setDrafts([]);
      }, className: "mt-4 w-full rounded-xl border border-border bg-card py-2.5 text-sm font-semibold", children: "Scan another" })
    ] }) })
  ] });
}
function DraftEditor({
  draft,
  onSave,
  onCancel
}) {
  const [d, setD] = useState(draft);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsx("input", { value: d.name, onChange: (e) => setD({
      ...d,
      name: e.target.value
    }), className: "w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm" }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-2", children: [
      /* @__PURE__ */ jsx("input", { type: "number", value: d.qty, onChange: (e) => setD({
        ...d,
        qty: parseFloat(e.target.value) || 0
      }), className: "rounded-md border border-border bg-background px-2 py-1.5 text-sm", placeholder: "Qty" }),
      /* @__PURE__ */ jsx("input", { value: d.unit, onChange: (e) => setD({
        ...d,
        unit: e.target.value
      }), className: "rounded-md border border-border bg-background px-2 py-1.5 text-sm", placeholder: "Unit" }),
      /* @__PURE__ */ jsx("input", { type: "number", value: d.price ?? 0, onChange: (e) => setD({
        ...d,
        price: parseFloat(e.target.value) || 0
      }), className: "rounded-md border border-border bg-background px-2 py-1.5 text-sm", placeholder: "₱" })
    ] }),
    /* @__PURE__ */ jsx("select", { value: d.category, onChange: (e) => setD({
      ...d,
      category: e.target.value
    }), className: "w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm", children: categories.map((c) => /* @__PURE__ */ jsx("option", { value: c, children: c }, c)) }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsx("button", { onClick: onCancel, className: "flex-1 rounded-md border border-border py-1.5 text-xs font-semibold", children: "Cancel" }),
      /* @__PURE__ */ jsx("button", { onClick: () => onSave(d), className: "flex-1 rounded-md bg-gradient-honey py-1.5 text-xs font-bold text-primary-foreground", children: "Save" })
    ] })
  ] });
}
function Corner({
  className = ""
}) {
  return /* @__PURE__ */ jsx("span", { className: `absolute h-5 w-5 border-l-2 border-t-2 border-fresh ${className}` });
}
export {
  ScannerPage as component
};
