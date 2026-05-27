import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { AppHeader } from "@/components/AppHeader";
import { Mascot } from "@/components/Mascot";
import { MASCOTS } from "@/lib/mascots";
import { actions, useStore, type Diet, type MascotId } from "@/lib/store";
import { supabase } from "@/integration/supabase/client";
import { useEffect, useState } from "react";
import { LogOut, LogIn, RefreshCw, Trash2, Cloud, Moon, Sun } from "lucide-react";
import { toast } from "sonner";
import { pullFromCloud, pushAllLocalToCloud } from "@/lib/cloud-sync";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

function SettingsPage() {
  const navigate = useNavigate();
  const name = useStore((s) => s.displayName);
  const mascot = useStore((s) => s.mascot);
  const diet = useStore((s) => s.diet);
  const theme = useStore((s) => s.theme);
  const budget = useStore((s) => s.weeklyBudget);
  const profile = { name, mascot, diet, theme, budget };
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setEmail(s?.user?.email ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
  };

  return (
    <AppShell>
      <AppHeader greeting="Hi" title="Settings" />

      <section className="px-6 space-y-4 pb-6">
        {/* Account */}
        <Card title="Account">
          {email ? (
            <>
              <p className="text-xs text-muted-foreground">Signed in as</p>
              <p className="font-semibold">{email}</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button onClick={async () => { try { await pullFromCloud(); toast.success("Pulled from cloud"); } catch { toast.error("Failed"); } }} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card py-2 text-xs font-semibold">
                  <Cloud className="h-3.5 w-3.5" /> Pull
                </button>
                <button onClick={async () => { try { await pushAllLocalToCloud(); toast.success("Pushed to cloud"); } catch { toast.error("Failed"); } }} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card py-2 text-xs font-semibold">
                  <RefreshCw className="h-3.5 w-3.5" /> Push
                </button>
              </div>
              <button onClick={signOut} className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-danger/40 bg-danger/10 py-2 text-xs font-semibold text-danger">
                <LogOut className="h-3.5 w-3.5" /> Sign out
              </button>
            </>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">Guest mode (data saved on this device only)</p>
              <Link to="/login" className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-honey py-2.5 text-sm font-bold text-primary-foreground shadow-glow">
                <LogIn className="h-4 w-4" /> Sign in / Sign up
              </Link>
            </>
          )}
        </Card>

        {/* Profile */}
        <Card title="Profile">
          <label className="block">
            <span className="text-xs text-muted-foreground">Display name</span>
            <input value={profile.name} onChange={(e) => actions.setProfile({ displayName: e.target.value })} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm" />
          </label>
          <p className="mt-3 text-xs text-muted-foreground">Bee mascot</p>
          <div className="mt-1 grid grid-cols-4 gap-2">
            {MASCOTS.map((m) => (
              <button key={m.id} onClick={() => actions.setProfile({ mascot: m.id as MascotId })} className={`rounded-xl border-2 p-1 ${profile.mascot === m.id ? "border-primary" : "border-border"}`}>
                <Mascot id={m.id} size={48} />
              </button>
            ))}
          </div>
        </Card>

        {/* Preferences */}
        <Card title="Preferences">
          <div className="flex items-center justify-between">
            <span className="text-sm">Theme</span>
            <button onClick={() => actions.setProfile({ theme: profile.theme === "dark" ? "light" : "dark" })} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold">
              {profile.theme === "dark" ? <><Moon className="h-3.5 w-3.5" /> Dark</> : <><Sun className="h-3.5 w-3.5" /> Light</>}
            </button>
          </div>
          <div className="mt-3">
            <p className="text-xs text-muted-foreground">Diet</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {(["none", "vegetarian", "pescatarian", "halal"] as Diet[]).map((d) => (
                <button key={d} onClick={() => actions.setProfile({ diet: d })} className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${profile.diet === d ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground"}`}>{d}</button>
              ))}
            </div>
          </div>
          <label className="mt-3 block">
            <span className="text-xs text-muted-foreground">Weekly budget (₱)</span>
            <input type="number" value={profile.budget} onChange={(e) => actions.setBudget(parseFloat(e.target.value) || 0)} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm" />
          </label>
        </Card>

        {/* Danger zone */}
        <Card title="Data">
          <button onClick={() => { actions.loadDemoData(); toast.success("Demo data loaded"); }} className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-border bg-card py-2 text-xs font-semibold">
            Load demo data
          </button>
          <button onClick={() => { if (confirm("Reset all local data?")) { actions.resetAll(); navigate({ to: "/onboarding" }); } }} className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-danger/40 bg-danger/10 py-2 text-xs font-semibold text-danger">
            <Trash2 className="h-3.5 w-3.5" /> Reset everything
          </button>
        </Card>

        <p className="text-center text-[10px] text-muted-foreground">PantryPal AI v3 · Made for Pinoy students</p>
      </section>
    </AppShell>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="mb-2 text-xs font-bold uppercase text-muted-foreground">{title}</p>
      {children}
    </div>
  );
}
