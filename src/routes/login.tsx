import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { Mascot } from "@/components/Mascot";
import { useState } from "react";
import { supabase } from "@/integration/supabase/client";

import { toast } from "sonner";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/` },
        });
        if (error) throw error;
        toast.success("Check your email to confirm, or sign in if confirmation is off.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate({ to: "/" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Auth failed");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/` },
    });
    if (error) { toast.error("Google sign-in failed: " + error.message); setBusy(false); }
  };

  return (
    <PhoneFrame>
      <div className="flex flex-1 flex-col items-center px-6 pt-12 pb-8">
        <Mascot id="bee-happy" size={140} />
        <h1 className="mt-2 text-2xl font-extrabold">PantryPal AI</h1>
        <p className="text-xs text-muted-foreground">Sign in to sync across devices</p>

        <form onSubmit={submit} className="mt-6 w-full space-y-3">
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="Email" className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required minLength={6} placeholder="Password (min 6)" className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm" />
          <button disabled={busy} type="submit" className="w-full rounded-xl bg-gradient-honey py-3 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-60">
            {busy ? "…" : mode === "signin" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <button onClick={google} disabled={busy} className="mt-3 w-full rounded-xl border border-border bg-card py-2.5 text-sm font-semibold disabled:opacity-60">
          Continue with Google
        </button>

        <button onClick={() => setMode((m) => (m === "signin" ? "signup" : "signin"))} className="mt-4 text-xs text-muted-foreground underline">
          {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>

        <button onClick={() => navigate({ to: "/" })} className="mt-6 text-xs text-primary font-semibold">
          Continue as guest →
        </button>
      </div>
    </PhoneFrame>
  );
}
