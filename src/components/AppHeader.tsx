import { Settings } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Mascot } from "./Mascot";
import { useStore } from "@/lib/store";
import { SyncBadge } from "./SyncBadge";

export function AppHeader({ greeting, title, accent = "primary" }: { greeting?: string; title: string; accent?: "primary" | "honey" }) {
  const mascot = useStore((s) => s.mascot);
  const name = useStore((s) => s.displayName);
  return (
    <header className="flex items-start justify-between px-6 pt-8 pb-4">
      <div className="flex items-center gap-3">
        <Mascot id={mascot} size={44} />
        <div>
          {greeting && (
            <p className={`text-xs font-semibold ${accent === "honey" ? "text-honey" : "text-primary"}`}>{greeting} {name}</p>
          )}
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{title}</h1>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <SyncBadge compact />
        <Link to="/settings" aria-label="Settings" className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card/60 text-muted-foreground hover:text-foreground">
          <Settings className="h-5 w-5" />
        </Link>
      </div>
    </header>
  );
}
