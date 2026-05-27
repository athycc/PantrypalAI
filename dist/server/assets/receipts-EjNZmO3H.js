import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { A as AppShell } from "./AppShell-BGKyT93p.js";
import { A as AppHeader } from "./AppHeader-7CGVlsH5.js";
import { u as useStore, a as actions } from "./router-CYur2j8s.js";
import { ArrowLeft, Trash2, Receipt, Store } from "lucide-react";
import { useState } from "react";
import "./PhoneFrame-CGwlULp_.js";
import "./Mascot-CpFl5W63.js";
import "@tanstack/react-query";
import "sonner";
import "@supabase/supabase-js";
function ReceiptsPage() {
  const receipts = useStore((s) => s.receipts);
  const [openId, setOpenId] = useState(null);
  const open = receipts.find((r) => r.id === openId) ?? null;
  if (open) {
    return /* @__PURE__ */ jsxs(AppShell, { children: [
      /* @__PURE__ */ jsxs("header", { className: "px-6 pt-8 pb-4 flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => setOpenId(null), className: "grid h-9 w-9 place-items-center rounded-full border border-border bg-card", children: /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsx("h1", { className: "text-lg font-extrabold truncate", children: open.store }),
          /* @__PURE__ */ jsx("p", { className: "text-[11px] text-muted-foreground", children: new Date(open.date).toLocaleString("en-PH") })
        ] }),
        /* @__PURE__ */ jsx("button", { onClick: () => {
          actions.removeReceipt(open.id);
          setOpenId(null);
        }, className: "grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-danger", children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) })
      ] }),
      /* @__PURE__ */ jsx("section", { className: "px-6", children: /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border bg-card p-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Total" }),
        /* @__PURE__ */ jsxs("p", { className: "text-3xl font-extrabold text-honey", children: [
          "₱",
          open.total.toFixed(2)
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-muted-foreground", children: [
          open.items.length,
          " items"
        ] })
      ] }) }),
      /* @__PURE__ */ jsx("section", { className: "mt-4 px-6 pb-6 space-y-2", children: open.items.map((it, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 rounded-xl border border-border bg-card p-3", children: [
        /* @__PURE__ */ jsx("span", { className: "grid h-9 w-9 place-items-center rounded-md bg-secondary text-xs font-bold", children: it.name.charAt(0) }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold truncate", children: it.name }),
          /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-muted-foreground", children: [
            it.qty,
            " ",
            it.unit,
            " · ",
            it.category
          ] })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm font-bold", children: [
          "₱",
          (it.price ?? 0).toFixed(2)
        ] })
      ] }, i)) })
    ] });
  }
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(AppHeader, { greeting: "Recent", title: "Receipts" }),
    /* @__PURE__ */ jsx("section", { className: "px-6", children: receipts.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-dashed border-border p-8 text-center", children: [
      /* @__PURE__ */ jsx(Receipt, { className: "mx-auto h-10 w-10 text-muted-foreground" }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm font-semibold", children: "No receipts yet" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Scan a receipt to start tracking history." }),
      /* @__PURE__ */ jsx(Link, { to: "/scanner", className: "mt-4 inline-block rounded-xl bg-gradient-honey px-4 py-2 text-xs font-bold text-primary-foreground shadow-glow", children: "Scan Receipt" })
    ] }) : /* @__PURE__ */ jsx("ul", { className: "space-y-2", children: receipts.map((r) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("button", { onClick: () => setOpenId(r.id), className: "flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left hover:border-honey/60", children: [
      /* @__PURE__ */ jsx("span", { className: "grid h-11 w-11 place-items-center rounded-xl bg-honey/15", children: /* @__PURE__ */ jsx(Store, { className: "h-5 w-5 text-honey" }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm font-bold truncate", children: r.store }),
        /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-muted-foreground", children: [
          new Date(r.date).toLocaleDateString("en-PH", {
            month: "short",
            day: "numeric",
            year: "numeric"
          }),
          " · ",
          r.items.length,
          " items"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm font-extrabold text-honey", children: [
        "₱",
        r.total.toFixed(2)
      ] })
    ] }) }, r.id)) }) })
  ] });
}
export {
  ReceiptsPage as component
};
