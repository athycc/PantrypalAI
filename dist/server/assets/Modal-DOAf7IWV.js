import { jsx, jsxs } from "react/jsx-runtime";
import { X } from "lucide-react";
import { useEffect } from "react";
function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return /* @__PURE__ */ jsx("div", { className: "absolute inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm md:rounded-[2.5rem]", onClick: onClose, children: /* @__PURE__ */ jsxs(
    "div",
    {
      className: "w-full max-h-[85%] overflow-y-auto rounded-t-3xl border-t border-border bg-card p-5 animate-in slide-in-from-bottom",
      onClick: (e) => e.stopPropagation(),
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pb-3", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-foreground", children: title }),
          /* @__PURE__ */ jsx("button", { onClick: onClose, className: "grid h-8 w-8 place-items-center rounded-full bg-secondary text-muted-foreground", children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
        ] }),
        children
      ]
    }
  ) });
}
function Field({ label, children }) {
  return /* @__PURE__ */ jsxs("label", { className: "block", children: [
    /* @__PURE__ */ jsx("span", { className: "mb-1 block text-xs font-semibold text-muted-foreground", children: label }),
    children
  ] });
}
const inputCls = "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none";
export {
  Field as F,
  Modal as M,
  inputCls as i
};
