import { Cloud, CloudOff, Loader2, AlertTriangle } from "lucide-react";
import { useSyncStatus } from "@/lib/sync-status";

export function SyncBadge({ compact = false }: { compact?: boolean }) {
  const { status, lastSync } = useSyncStatus();
  const map = {
    offline: { Icon: CloudOff, label: "Offline", cls: "text-muted-foreground" },
    syncing: { Icon: Loader2, label: "Syncing…", cls: "text-honey animate-spin" },
    idle: { Icon: Cloud, label: lastSync ? `Synced ${timeAgo(lastSync)}` : "Synced", cls: "text-fresh" },
    error: { Icon: AlertTriangle, label: "Sync error", cls: "text-danger" },
  }[status];
  const { Icon } = map;
  return (
    <span title={map.label} className={`inline-flex items-center gap-1 rounded-full border border-border bg-card/60 px-2 py-1 text-[10px] font-semibold ${status === "error" ? "text-danger" : "text-muted-foreground"}`}>
      <Icon className={`h-3 w-3 ${map.cls}`} />
      {!compact && <span>{map.label}</span>}
    </span>
  );
}

function timeAgo(t: number): string {
  const s = Math.round((Date.now() - t) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  return `${Math.round(s / 3600)}h ago`;
}
