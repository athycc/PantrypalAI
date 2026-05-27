import { useSyncExternalStore } from "react";

export type SyncStatus = "offline" | "idle" | "syncing" | "error";
type Snapshot = { status: SyncStatus; lastSync: number | null };

let snapshot: Snapshot = { status: "offline", lastSync: null };
const listeners = new Set<() => void>();

function emit() { listeners.forEach((l) => l()); }

export function setSyncStatus(s: SyncStatus) {
  // Always produce a new object reference when state actually changes,
  // and keep the SAME reference between changes so useSyncExternalStore
  // doesn't loop ("getSnapshot should be cached").
  if (snapshot.status === s && s !== "idle") return;
  snapshot = { status: s, lastSync: s === "idle" ? Date.now() : snapshot.lastSync };
  emit();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}
function getSnapshot() { return snapshot; }

export function useSyncStatus() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
