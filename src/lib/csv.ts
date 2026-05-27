import type { Expense } from "./store";

function esc(v: string | number | undefined): string {
  if (v === undefined || v === null) return "";
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function expensesToCSV(rows: Expense[]): string {
  const header = ["Date", "Category", "Amount (PHP)", "Note"];
  const body = rows
    .slice()
    .sort((a, b) => b.date - a.date)
    .map((r) => [new Date(r.date).toISOString().slice(0, 10), r.category, r.amount.toFixed(2), r.note ?? ""].map(esc).join(","));
  return [header.join(","), ...body].join("\n");
}

export function downloadFile(name: string, content: string, mime = "text/csv;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
