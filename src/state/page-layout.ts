import { useSyncExternalStore } from "react";
import { pageCards, type PageKey } from "../data/page-cards";

// Which cards each analytics page shows, in what order (app memory — a reload starts from the default layout, like the rest of the UT).
export type PageLayout = { rows: string[]; memos: Record<string, string> };

const initial = (page: PageKey): PageLayout => ({ rows: [...pageCards[page].defaults], memos: {} });
const state: Record<PageKey, PageLayout> = { overview: initial("overview"), retention: initial("retention") };
const listeners: Record<PageKey, Set<() => void>> = { overview: new Set(), retention: new Set() };

function set(page: PageKey, next: (prev: PageLayout) => PageLayout) {
  state[page] = next(state[page]);
  listeners[page].forEach((l) => l());
}

export function usePageLayout(page: PageKey) {
  return useSyncExternalStore(
    (l) => {
      listeners[page].add(l);
      return () => listeners[page].delete(l);
    },
    () => state[page],
  );
}

const clampIndex = (i: number, len: number) => Math.max(0, Math.min(len, i));

export const layoutActions = {
  insert: (page: PageKey, id: string, at: number) =>
    set(page, (p) => {
      const rows = p.rows.filter((r) => r !== id);
      rows.splice(clampIndex(at, rows.length), 0, id);
      return { ...p, rows, memos: id.startsWith("memo:") && !(id in p.memos) ? { ...p.memos, [id]: "" } : p.memos };
    }),
  move: (page: PageKey, id: string, to: number) =>
    set(page, (p) => {
      const from = p.rows.indexOf(id);
      if (from < 0) return p;
      const rows = p.rows.filter((r) => r !== id);
      rows.splice(clampIndex(to > from ? to - 1 : to, rows.length), 0, id);
      return { ...p, rows };
    }),
  hide: (page: PageKey, id: string) => set(page, (p) => ({ ...p, rows: p.rows.filter((r) => r !== id) })),
  restore: (page: PageKey, id: string, at: number) =>
    set(page, (p) => {
      const rows = [...p.rows];
      rows.splice(clampIndex(at, rows.length), 0, id);
      return { ...p, rows };
    }),
  setMemo: (page: PageKey, id: string, text: string) => set(page, (p) => ({ ...p, memos: { ...p.memos, [id]: text } })),
  reset: (page: PageKey) => set(page, () => initial(page)),
};

/** Canvas screens can open with a card already added (seeded once per page). */
const seeded: Record<string, boolean> = {};
export function seedLayout(page: PageKey, id: string | undefined, at: number | undefined) {
  if (!id || seeded[page]) return;
  seeded[page] = true;
  layoutActions.insert(page, id, at ?? 0);
}
