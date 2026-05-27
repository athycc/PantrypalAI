import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { A as AppShell } from "./AppShell-BGKyT93p.js";
import { A as AppHeader } from "./AppHeader-7CGVlsH5.js";
import { M as MASCOTS, a as Mascot } from "./Mascot-CpFl5W63.js";
import { u as useStore, s as supabase, b as pullFromCloud, c as pushAllLocalToCloud, a as actions } from "./router-CYur2j8s.js";
import { useState, useEffect } from "react";
import { Cloud, RefreshCw, LogOut, LogIn, Moon, Sun, Trash2 } from "lucide-react";
import { toast } from "sonner";
import "./PhoneFrame-CGwlULp_.js";
import "@tanstack/react-query";
import "@supabase/supabase-js";
function SettingsPage() {
  const navigate = useNavigate();
  const name = useStore((s) => s.displayName);
  const mascot = useStore((s) => s.mascot);
  const diet = useStore((s) => s.diet);
  const theme = useStore((s) => s.theme);
  const budget = useStore((s) => s.weeklyBudget);
  const profile = {
    name,
    mascot,
    diet,
    theme,
    budget
  };
  const [email, setEmail] = useState(null);
  useEffect(() => {
    supabase.auth.getUser().then(({
      data: data2
    }) => setEmail(data2.user?.email ?? null));
    const {
      data
    } = supabase.auth.onAuthStateChange((_e, s) => setEmail(s?.user?.email ?? null));
    return () => data.subscription.unsubscribe();
  }, []);
  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
  };
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(AppHeader, { greeting: "Hi", title: "Settings" }),
    /* @__PURE__ */ jsxs("section", { className: "px-6 space-y-4 pb-6", children: [
      /* @__PURE__ */ jsx(Card, { title: "Account", children: email ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Signed in as" }),
        /* @__PURE__ */ jsx("p", { className: "font-semibold", children: email }),
        /* @__PURE__ */ jsxs("div", { className: "mt-3 grid grid-cols-2 gap-2", children: [
          /* @__PURE__ */ jsxs("button", { onClick: async () => {
            try {
              await pullFromCloud();
              toast.success("Pulled from cloud");
            } catch {
              toast.error("Failed");
            }
          }, className: "inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card py-2 text-xs font-semibold", children: [
            /* @__PURE__ */ jsx(Cloud, { className: "h-3.5 w-3.5" }),
            " Pull"
          ] }),
          /* @__PURE__ */ jsxs("button", { onClick: async () => {
            try {
              await pushAllLocalToCloud();
              toast.success("Pushed to cloud");
            } catch {
              toast.error("Failed");
            }
          }, className: "inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card py-2 text-xs font-semibold", children: [
            /* @__PURE__ */ jsx(RefreshCw, { className: "h-3.5 w-3.5" }),
            " Push"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("button", { onClick: signOut, className: "mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-danger/40 bg-danger/10 py-2 text-xs font-semibold text-danger", children: [
          /* @__PURE__ */ jsx(LogOut, { className: "h-3.5 w-3.5" }),
          " Sign out"
        ] })
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Guest mode (data saved on this device only)" }),
        /* @__PURE__ */ jsxs(Link, { to: "/login", className: "mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-honey py-2.5 text-sm font-bold text-primary-foreground shadow-glow", children: [
          /* @__PURE__ */ jsx(LogIn, { className: "h-4 w-4" }),
          " Sign in / Sign up"
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs(Card, { title: "Profile", children: [
        /* @__PURE__ */ jsxs("label", { className: "block", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "Display name" }),
          /* @__PURE__ */ jsx("input", { value: profile.name, onChange: (e) => actions.setProfile({
            displayName: e.target.value
          }), className: "mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-3 text-xs text-muted-foreground", children: "Bee mascot" }),
        /* @__PURE__ */ jsx("div", { className: "mt-1 grid grid-cols-4 gap-2", children: MASCOTS.map((m) => /* @__PURE__ */ jsx("button", { onClick: () => actions.setProfile({
          mascot: m.id
        }), className: `rounded-xl border-2 p-1 ${profile.mascot === m.id ? "border-primary" : "border-border"}`, children: /* @__PURE__ */ jsx(Mascot, { id: m.id, size: 48 }) }, m.id)) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { title: "Preferences", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Theme" }),
          /* @__PURE__ */ jsx("button", { onClick: () => actions.setProfile({
            theme: profile.theme === "dark" ? "light" : "dark"
          }), className: "inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold", children: profile.theme === "dark" ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Moon, { className: "h-3.5 w-3.5" }),
            " Dark"
          ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Sun, { className: "h-3.5 w-3.5" }),
            " Light"
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-3", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Diet" }),
          /* @__PURE__ */ jsx("div", { className: "mt-1 flex flex-wrap gap-1.5", children: ["none", "vegetarian", "pescatarian", "halal"].map((d) => /* @__PURE__ */ jsx("button", { onClick: () => actions.setProfile({
            diet: d
          }), className: `rounded-full px-3 py-1 text-xs font-semibold capitalize ${profile.diet === d ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground"}`, children: d }, d)) })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "mt-3 block", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "Weekly budget (₱)" }),
          /* @__PURE__ */ jsx("input", { type: "number", value: profile.budget, onChange: (e) => actions.setBudget(parseFloat(e.target.value) || 0), className: "mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { title: "Data", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => {
          actions.loadDemoData();
          toast.success("Demo data loaded");
        }, className: "inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-border bg-card py-2 text-xs font-semibold", children: "Load demo data" }),
        /* @__PURE__ */ jsxs("button", { onClick: () => {
          if (confirm("Reset all local data?")) {
            actions.resetAll();
            navigate({
              to: "/onboarding"
            });
          }
        }, className: "mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-danger/40 bg-danger/10 py-2 text-xs font-semibold text-danger", children: [
          /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5" }),
          " Reset everything"
        ] })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-center text-[10px] text-muted-foreground", children: "PantryPal AI v3 · Made for Pinoy students" })
    ] })
  ] });
}
function Card({
  title,
  children
}) {
  return /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border bg-card p-4", children: [
    /* @__PURE__ */ jsx("p", { className: "mb-2 text-xs font-bold uppercase text-muted-foreground", children: title }),
    children
  ] });
}
export {
  SettingsPage as component
};
