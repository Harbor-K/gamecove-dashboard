import { useSyncExternalStore } from "react";

// Minimal icon rail instead of the full nav while Game Setup (mapping) is on screen.
// Tracking sets it from the mapping phase; null = not decided by a page (ProjectShell falls back to the route).
let value: boolean | null = null;
const listeners = new Set<() => void>();

export const setupRailStore = {
  get: () => value,
  set: (next: boolean | null) => {
    if (next === value) return;
    value = next;
    listeners.forEach((l) => l());
  },
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
};

export const useSetupRail = () => useSyncExternalStore(setupRailStore.subscribe, setupRailStore.get);
