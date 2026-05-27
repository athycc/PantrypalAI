import { jsx, jsxs } from "react/jsx-runtime";
import { P as PhoneFrame } from "./PhoneFrame-CGwlULp_.js";
import { Link } from "@tanstack/react-router";
import { Package, ScanLine, UtensilsCrossed, ShoppingBag, Wallet } from "lucide-react";
const items = [
  { to: "/", label: "Pantry", Icon: Package },
  { to: "/scanner", label: "Scanner", Icon: ScanLine },
  { to: "/meals", label: "Meals", Icon: UtensilsCrossed },
  { to: "/shopping", label: "List", Icon: ShoppingBag },
  { to: "/budget", label: "Budget", Icon: Wallet }
];
function BottomNav() {
  return /* @__PURE__ */ jsx("nav", { className: "sticky bottom-0 z-30 mt-auto border-t border-border bg-[var(--color-nav)]/95 backdrop-blur", children: /* @__PURE__ */ jsx("ul", { className: "flex items-center justify-around px-2 pb-3 pt-2.5", children: items.map(({ to, label, Icon }) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
    Link,
    {
      to,
      activeOptions: { exact: true },
      className: "group flex flex-col items-center gap-1 px-3 py-1 text-muted-foreground transition-colors data-[status=active]:text-primary",
      children: [
        /* @__PURE__ */ jsx("span", { className: "h-0.5 w-6 rounded-full bg-transparent group-data-[status=active]:bg-primary" }),
        /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5", strokeWidth: 2 }),
        /* @__PURE__ */ jsx("span", { className: "text-[11px] font-medium", children: label })
      ]
    }
  ) }, to)) }) });
}
function AppShell({ children }) {
  return /* @__PURE__ */ jsxs(PhoneFrame, { children: [
    /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto pb-2", children }),
    /* @__PURE__ */ jsx(BottomNav, {})
  ] });
}
export {
  AppShell as A
};
