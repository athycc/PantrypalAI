// Browser-only OCR using Tesseract.js. Import only inside event handlers.
import type { Category } from "./store";

export type ParsedLine = {
  name: string;
  qty: number;
  unit: string;
  category: Category;
  price?: number;
  expiresAt: number;
  confirmed: boolean;
};

export type ParsedReceipt = {
  store: string;
  date: number;
  total: number;
  items: ParsedLine[];
  rawText: string;
};

const DAY = 86_400_000;
const KNOWN_STORES = ["sm hypermarket", "sm supermarket", "puregold", "robinsons", "savemore", "waltermart", "shopwise", "rustans", "landers", "s&r"];

const CATEGORY_HINTS: { keywords: string[]; cat: Category; days: number; unit: string }[] = [
  { keywords: ["rice", "bigas", "oats", "flour", "noodle", "pasta", "pancit", "bread", "tinapay"], cat: "Grains", days: 60, unit: "pcs" },
  { keywords: ["egg", "itlog", "chicken", "manok", "pork", "baboy", "beef", "baka", "fish", "isda", "bangus", "tilapia", "tofu", "tokwa", "hotdog", "longganisa", "tocino"], cat: "Protein", days: 7, unit: "pcs" },
  { keywords: ["kangkong", "pechay", "talong", "kalabasa", "ampalaya", "sayote", "garlic", "bawang", "onion", "sibuyas", "tomato", "kamatis", "ginger", "luya", "cabbage", "lettuce", "carrot", "potato"], cat: "Vegetables", days: 7, unit: "pcs" },
  { keywords: ["milk", "gatas", "cheese", "keso", "butter", "yogurt", "cream"], cat: "Dairy", days: 14, unit: "ml" },
  { keywords: ["soy", "toyo", "vinegar", "suka", "patis", "oil", "mantika", "sugar", "asukal", "salt", "asin", "ketchup", "mayo", "magic sarap"], cat: "Condiments", days: 180, unit: "ml" },
  { keywords: ["chips", "biscuit", "cracker", "candy", "chocolate", "skyflakes"], cat: "Snacks", days: 90, unit: "pcs" },
  { keywords: ["coffee", "kape", "tea", "juice", "soda", "coke", "sprite", "water", "tubig"], cat: "Beverages", days: 90, unit: "pcs" },
];

function categorize(name: string): { cat: Category; days: number; unit: string } {
  const n = name.toLowerCase();
  for (const h of CATEGORY_HINTS) {
    if (h.keywords.some((k) => n.includes(k))) return { cat: h.cat, days: h.days, unit: h.unit };
  }
  return { cat: "Other", days: 30, unit: "pcs" };
}

function detectStore(text: string): string {
  const head = text.slice(0, 200).toLowerCase();
  for (const s of KNOWN_STORES) {
    if (head.includes(s)) return s.replace(/\b\w/g, (c) => c.toUpperCase());
  }
  // fall back to first non-empty line
  const first = text.split(/\n/).find((l) => l.trim().length > 2);
  return first ? first.trim().slice(0, 30) : "Receipt";
}

function detectDate(text: string): number {
  const m = text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (m) {
    const yy = m[3].length === 2 ? 2000 + parseInt(m[3]) : parseInt(m[3]);
    const d = new Date(yy, parseInt(m[2]) - 1, parseInt(m[1]));
    if (!isNaN(d.getTime())) return d.getTime();
  }
  return Date.now();
}

function parseLines(text: string): ParsedLine[] {
  const lines = text.split(/\n/).map((l) => l.replace(/\s+/g, " ").trim()).filter((l) => l.length > 2);
  const out: ParsedLine[] = [];
  const priceRe = /(\d+\.\d{2})\s*$/;
  const qtyRe = /^(\d+)\s*[xX@]\s*/;
  const skipRe = /(total|subtotal|change|cash|vat|tax|tin|or\s*#|tend|invoice|receipt|thank you|cashier|qty|disc)/i;

  for (const line of lines) {
    if (skipRe.test(line)) continue;
    const pm = line.match(priceRe);
    if (!pm) continue;
    const price = parseFloat(pm[1]);
    if (!isFinite(price) || price <= 0 || price > 10000) continue;
    let rest = line.replace(priceRe, "").trim();
    let qty = 1;
    const qm = rest.match(qtyRe);
    if (qm) { qty = parseInt(qm[1]) || 1; rest = rest.replace(qtyRe, "").trim(); }
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
      confirmed: false,
    });
  }
  return out;
}

function detectTotal(text: string, fallback: number): number {
  const m = text.match(/total[^0-9]*(\d+\.\d{2})/i);
  if (m) return parseFloat(m[1]);
  return fallback;
}

export async function ocrReceipt(
  file: File | Blob | string,
  onProgress: (pct: number, label: string) => void,
): Promise<ParsedReceipt> {
  onProgress(2, "Loading OCR engine…");
  const Tesseract = (await import("tesseract.js")).default;
  const { data } = await Tesseract.recognize(file, "eng", {
    logger: (m: { status: string; progress?: number }) => {
      const pct = Math.round((m.progress ?? 0) * 100);
      onProgress(Math.max(5, pct), m.status || "Working…");
    },
  });
  const text = data.text || "";
  const items = parseLines(text);
  const sum = items.reduce((s, i) => s + (i.price ?? 0), 0);
  return {
    store: detectStore(text),
    date: detectDate(text),
    total: detectTotal(text, sum),
    items,
    rawText: text,
  };
}
