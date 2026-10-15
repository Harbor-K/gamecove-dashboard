import { useSyncExternalStore } from "react";
import { boardTitles, type BoardVariant, type EventId } from "../data/analysisSetup";

// App-memory stores (a reload starts the UT over, same as the repo — nothing goes to localStorage).

function createStore<T>(initial: T) {
  let value = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => value,
    set: (next: T | ((prev: T) => T)) => {
      value = typeof next === "function" ? (next as (p: T) => T)(value) : next;
      listeners.forEach((l) => l());
    },
    subscribe: (l: () => void) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
  };
}

// ── Analysis boards ──
export type AnalysisBoard = {
  id: string;
  name: string;
  description: string;
  question: string;
  variant: BoardVariant;
  askedAt: number;
  /** Built with COVY (first answer in): only then does it show under Analysis Board in the nav. */
  ready: boolean;
};
export const boardStore = createStore<AnalysisBoard[]>([]);
export const useBoards = () => useSyncExternalStore(boardStore.subscribe, boardStore.get);

let seq = 0;
/** A board exists once its question is sent and joins the nav once COVY has built it. Name = board title. */
export function createBoard(question: string, variant: BoardVariant, askedAt = Date.now()): AnalysisBoard {
  const board: AnalysisBoard = { id: `b${Date.now().toString(36)}${seq++}`, name: boardTitles[variant], description: "", question, variant, askedAt, ready: false };
  boardStore.set((list) => [...list, board]);
  return board;
}
export const updateBoard = (id: string, patch: Partial<AnalysisBoard>) =>
  boardStore.set((list) => list.map((b) => (b.id === id ? { ...b, ...patch } : b)));

// ── Tracking (shared by COVY and the Tracking page) ──
export const trackingStore = createStore<EventId[]>([]);
export const useTrackedEvents = () => useSyncExternalStore(trackingStore.subscribe, trackingStore.get);
export const addTrackedEvents = (ids: EventId[]) => trackingStore.set((cur) => [...cur, ...ids.filter((id) => !cur.includes(id))]);

// ── Canvas screens (?mp_screen=) can open straight on a step of the analysis setup ──
export type SetupScreen = "building" | "explained" | "plan" | "approval" | "script" | "installed";
export const SEED_BOARD_ID = "seed";
let seeded = false;
/** Idempotent: puts the board (and, for "installed", the tracked events) a screen needs into app memory. */
export function seedFromScreen(screen: { setup?: SetupScreen; variant?: BoardVariant; question?: string }) {
  if (!screen.setup || seeded) return;
  seeded = true;
  if (screen.setup === "building") return;
  const variant = screen.variant ?? "stageBehavior";
  boardStore.set([
    { id: SEED_BOARD_ID, name: boardTitles[variant], description: "", question: screen.question ?? "", variant, askedAt: 0, ready: true },
  ]);
  if (screen.setup === "installed") addTrackedEvents(["session_started", "lobby_entered", "stage_entered", "session_ended"]);
}
