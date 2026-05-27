import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Expense } from "./store";

export function exportBudgetPDF(opts: {
  range: string;
  budget: number;
  spent: number;
  expenses: Expense[];
  user?: string;
}) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const now = new Date();

  // Header band
  doc.setFillColor(247, 212, 136);
  doc.rect(0, 0, W, 70, "F");
  doc.setTextColor(40, 30, 10);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("PantryPal AI", 40, 32);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Budget Report — ${opts.range}`, 40, 52);
  doc.text(now.toLocaleString("en-PH"), W - 40, 52, { align: "right" });

  // Summary
  doc.setTextColor(20, 20, 20);
  doc.setFontSize(12);
  let y = 100;
  if (opts.user) { doc.text(`User: ${opts.user}`, 40, y); y += 18; }
  doc.text(`Budget:     PHP ${opts.budget.toLocaleString()}`, 40, y); y += 16;
  doc.text(`Spent:      PHP ${opts.spent.toLocaleString()}`, 40, y); y += 16;
  const rem = opts.budget - opts.spent;
  doc.setTextColor(rem >= 0 ? 30 : 180, rem >= 0 ? 130 : 30, 60);
  doc.text(`${rem >= 0 ? "Remaining" : "Over"}:  PHP ${Math.abs(rem).toLocaleString()}`, 40, y);
  doc.setTextColor(20, 20, 20); y += 20;

  // Category totals
  const byCat: Record<string, number> = {};
  opts.expenses.forEach((e) => { byCat[e.category] = (byCat[e.category] || 0) + e.amount; });
  autoTable(doc, {
    startY: y,
    head: [["Category", "Amount (PHP)", "% of Budget"]],
    body: Object.entries(byCat).map(([k, v]) => [k, v.toFixed(2), `${Math.round((v / Math.max(opts.budget, 1)) * 100)}%`]),
    headStyles: { fillColor: [247, 212, 136], textColor: 40 },
    styles: { fontSize: 10 },
  });

  // Transactions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const afterY = (doc as any).lastAutoTable?.finalY ?? y;
  autoTable(doc, {
    startY: afterY + 20,
    head: [["Date", "Category", "Note", "Amount (PHP)"]],
    body: opts.expenses
      .slice()
      .sort((a, b) => b.date - a.date)
      .map((e) => [
        new Date(e.date).toLocaleDateString("en-PH"),
        e.category,
        e.note ?? "",
        e.amount.toFixed(2),
      ]),
    headStyles: { fillColor: [40, 40, 40] },
    styles: { fontSize: 9 },
  });

  // Footer
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(`PantryPal AI · Page ${i} of ${pages}`, W / 2, doc.internal.pageSize.getHeight() - 20, { align: "center" });
  }

  doc.save(`pantrypal-budget-${opts.range}-${now.toISOString().slice(0, 10)}.pdf`);
}
