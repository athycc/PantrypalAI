import { jsxs, jsx } from "react/jsx-runtime";
import { AlertTriangle, Cloud, Loader2, CloudOff, Settings } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { a as Mascot } from "./Mascot-CpFl5W63.js";
import { e as useSyncStatus, u as useStore } from "./router-CYur2j8s.js";
function SyncBadge({ compact = false }) {
  const { status, lastSync } = useSyncStatus();
  const map = {
    offline: { Icon: CloudOff, label: "Offline", cls: "text-muted-foreground" },
    syncing: { Icon: Loader2, label: "Syncing…", cls: "text-honey animate-spin" },
    idle: { Icon: Cloud, label: lastSync ? `Synced ${timeAgo(lastSync)}` : "Synced", cls: "text-fresh" },
    error: { Icon: AlertTriangle, label: "Sync error", cls: "text-danger" }
  }[status];
  const { Icon } = map;
  return /* @__PURE__ */ jsxs("span", { title: map.label, className: `inline-flex items-center gap-1 rounded-full border border-border bg-card/60 px-2 py-1 text-[10px] font-semibold ${status === "error" ? "text-danger" : "text-muted-foreground"}`, children: [
    /* @__PURE__ */ jsx(Icon, { className: `h-3 w-3 ${map.cls}` }),
    !compact && /* @__PURE__ */ jsx("span", { children: map.label })
  ] });
}
function timeAgo(t) {
  const s = Math.round((Date.now() - t) / 1e3);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  return `${Math.round(s / 3600)}h ago`;
}
function AppHeader({ greeting, title, accent = "primary" }) {
  const mascot = useStore((s) => s.mascot);
  const name = useStore((s) => s.displayName);
  return /* @__PURE__ */ jsxs("header", { className: "flex items-start justify-between px-6 pt-8 pb-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx(Mascot, { id: mascot, size: 44 }),
      /* @__PURE__ */ jsxs("div", { children: [
        greeting && /* @__PURE__ */ jsxs("p", { className: `text-xs font-semibold ${accent === "honey" ? "text-honey" : "text-primary"}`, children: [
          greeting,
          " ",
          name
        ] }),
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-extrabold tracking-tight text-foreground", children: title })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(SyncBadge, { compact: true }),
      /* @__PURE__ */ jsx(Link, { to: "/settings", "aria-label": "Settings", className: "grid h-10 w-10 place-items-center rounded-full border border-border bg-card/60 text-muted-foreground hover:text-foreground", children: /* @__PURE__ */ jsx(Settings, { className: "h-5 w-5" }) })
    ] })
  ] });
}
export {
  AppHeader as A
};
