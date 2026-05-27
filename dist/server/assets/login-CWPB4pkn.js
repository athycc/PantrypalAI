import { jsx, jsxs } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { P as PhoneFrame } from "./PhoneFrame-CGwlULp_.js";
import { a as Mascot } from "./Mascot-CpFl5W63.js";
import { useState } from "react";
import { s as supabase } from "./router-CYur2j8s.js";
import { toast } from "sonner";
import "@tanstack/react-query";
import "@supabase/supabase-js";
function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const {
          error
        } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        });
        if (error) throw error;
        toast.success("Check your email to confirm, or sign in if confirmation is off.");
      } else {
        const {
          error
        } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate({
          to: "/"
        });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Auth failed");
    } finally {
      setBusy(false);
    }
  };
  const google = async () => {
    setBusy(true);
    const {
      error
    } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`
      }
    });
    if (error) {
      toast.error("Google sign-in failed: " + error.message);
      setBusy(false);
    }
  };
  return /* @__PURE__ */ jsx(PhoneFrame, { children: /* @__PURE__ */ jsxs("div", { className: "flex flex-1 flex-col items-center px-6 pt-12 pb-8", children: [
    /* @__PURE__ */ jsx(Mascot, { id: "bee-happy", size: 140 }),
    /* @__PURE__ */ jsx("h1", { className: "mt-2 text-2xl font-extrabold", children: "PantryPal AI" }),
    /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Sign in to sync across devices" }),
    /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "mt-6 w-full space-y-3", children: [
      /* @__PURE__ */ jsx("input", { value: email, onChange: (e) => setEmail(e.target.value), type: "email", required: true, placeholder: "Email", className: "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm" }),
      /* @__PURE__ */ jsx("input", { value: password, onChange: (e) => setPassword(e.target.value), type: "password", required: true, minLength: 6, placeholder: "Password (min 6)", className: "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm" }),
      /* @__PURE__ */ jsx("button", { disabled: busy, type: "submit", className: "w-full rounded-xl bg-gradient-honey py-3 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-60", children: busy ? "…" : mode === "signin" ? "Sign In" : "Create Account" })
    ] }),
    /* @__PURE__ */ jsx("button", { onClick: google, disabled: busy, className: "mt-3 w-full rounded-xl border border-border bg-card py-2.5 text-sm font-semibold disabled:opacity-60", children: "Continue with Google" }),
    /* @__PURE__ */ jsx("button", { onClick: () => setMode((m) => m === "signin" ? "signup" : "signin"), className: "mt-4 text-xs text-muted-foreground underline", children: mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in" }),
    /* @__PURE__ */ jsx("button", { onClick: () => navigate({
      to: "/"
    }), className: "mt-6 text-xs text-primary font-semibold", children: "Continue as guest →" })
  ] }) });
}
export {
  LoginPage as component
};
