import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  analysisSuggestions,
  approvalRunMs,
  boardBuildMs,
  boardPlan,
  copy,
  explainBoard,
  loggerInstalled,
  loggingPlan,
  prototypeOnly,
  rejected,
  setupIntent,
  steer,
  type BoardVariant,
  type EventId,
  type SetupAnswer,
} from "../data/analysisSetup";
import { tr } from "../i18n/translate";
import { addTrackedEvents, boardStore, seedFromScreen, SEED_BOARD_ID, trackingStore, updateBoard, type AnalysisBoard, type SetupScreen } from "../state/store";
import { askCovy, type CovyResponse } from "../utils/covy";
import { useScreenInit } from "../useScreenInit.js";

export type ApprovalStatus = "pending" | "running" | "approved" | "rejected";
export type AgentTurn =
  | { role: "user"; text: string }
  | { role: "assistant"; status: "pending"; label: string }
  | { role: "assistant"; status: "done"; response: CovyResponse }
  | { role: "assistant"; status: "done"; setup: SetupAnswer }
  | { role: "approval"; status: ApprovalStatus; events: EventId[] };

/** Where the analysis-setup conversation is (repo CovyPhase, simplified). */
type SetupStage = "explained" | "planned" | "awaitingApproval" | "installed";
type Setup = { boardId: string; variant: BoardVariant; stage: SetupStage };

type AgentState = {
  open: boolean;
  expanded: boolean;
  width: number;
  thread: AgentTurn[];
  /** The board this conversation is about (null on dashboard pages). */
  setupBoardId: string | null;
  toggle: () => void;
  close: () => void;
  setExpanded: (v: boolean) => void;
  ask: (text: string) => void;
  newChat: () => void;
  startAnalysis: (board: AnalysisBoard) => void;
  approve: () => void;
  reject: () => void;
  /** Script modal (View script on the approval card). */
  scriptOpen: boolean;
  setScriptOpen: (v: boolean) => void;
};

const AgentContext = createContext<AgentState | null>(null);
const rand = (min: number, max: number) => min + Math.random() * (max - min);
const goalBubble = (question: string) => copy.analysisGoal(tr(question));

/** Thread for a canvas screen that opens on a step of the setup (built from the same answers). */
function seededThread(stage: SetupScreen, variant: BoardVariant): { thread: AgentTurn[]; setup: Setup } | null {
  if (stage === "building") return null;
  const q = analysisSuggestions[variant === "stageBehavior" ? 0 : 1];
  const thread: AgentTurn[] = [{ role: "user", text: goalBubble(q) }, { role: "assistant", status: "done", setup: explainBoard(variant) }];
  if (stage === "explained") return { thread, setup: { boardId: SEED_BOARD_ID, variant, stage: "explained" } };
  thread.push({ role: "user", text: copy.yesSetup }, { role: "assistant", status: "done", setup: loggingPlan(variant, []) });
  if (stage === "plan") return { thread, setup: { boardId: SEED_BOARD_ID, variant, stage: "planned" } };
  const obs = boardPlan(variant, []).observation.map((e) => e.id);
  thread.push({ role: "user", text: copy.yesLogger });
  if (stage === "approval" || stage === "script") {
    thread.push({ role: "approval", status: "pending", events: obs });
    return { thread, setup: { boardId: SEED_BOARD_ID, variant, stage: "awaitingApproval" } };
  }
  thread.push({ role: "approval", status: "approved", events: obs }, { role: "assistant", status: "done", setup: loggerInstalled(variant, obs, obs) });
  return { thread, setup: { boardId: SEED_BOARD_ID, variant, stage: "installed" } };
}

export function AgentProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  // The screen decides the mode: the setup conversation answers on analysis boards, dashboard data elsewhere.
  const pathRef = useRef("");
  pathRef.current = useLocation().pathname;
  const screenInit = useScreenInit() as { agentOpen?: boolean; setup?: SetupScreen; variant?: BoardVariant };
  const [initial] = useState(() => {
    seedFromScreen({ ...screenInit, question: analysisSuggestions[screenInit.variant === "newPlayerProgression" ? 1 : 0] });
    return screenInit.setup ? seededThread(screenInit.setup, screenInit.variant ?? "stageBehavior") : null;
  });
  const [open, setOpen] = useState(screenInit.agentOpen ?? Boolean(initial));
  const [expanded, setExpanded] = useState(false);
  const [thread, setThread] = useState<AgentTurn[]>(initial?.thread ?? []);
  const [scriptOpen, setScriptOpen] = useState(screenInit.setup === "script");
  const setupRef = useRef<Setup | null>(initial?.setup ?? null);
  const [setupBoardId, setSetupBoardId] = useState<string | null>(initial?.setup.boardId ?? null);
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  const setSetup = (s: Setup | null) => {
    setupRef.current = s;
    setSetupBoardId(s?.boardId ?? null);
  };
  /** Replace the trailing pending turn. */
  const resolve = (turn: AgentTurn) =>
    setThread((t) => {
      const next = [...t];
      if (next.length && next[next.length - 1].role === "assistant" && (next[next.length - 1] as { status: string }).status === "pending") next[next.length - 1] = turn;
      else next.push(turn);
      return next;
    });
  const setPendingLabel = (label: string) =>
    setThread((t) => t.map((turn, i) => (i === t.length - 1 && turn.role === "assistant" && turn.status === "pending" ? { ...turn, label } : turn)));
  const answer = (setup: SetupAnswer) => resolve({ role: "assistant", status: "done", setup });

  const newChat = useCallback(() => {
    clearTimers();
    setThread([]);
    setSetup(null);
    setScriptOpen(false);
  }, []);

  /** Board question sent: first bubble = the analysis goal; COVY explains the board when the board is drawn. */
  const startAnalysis = useCallback((board: AnalysisBoard) => {
    clearTimers();
    setOpen(true);
    setScriptOpen(false);
    setSetup({ boardId: board.id, variant: board.variant, stage: "explained" });
    setThread([{ role: "user", text: goalBubble(board.question) }, { role: "assistant", status: "pending", label: copy.pending.buildAnalysis }]);
    later(() => {
      // Board built: it now shows under Analysis Board in the nav (expanded).
      updateBoard(board.id, { ready: true });
      answer(explainBoard(board.variant));
    }, Math.max(0, board.askedAt + boardBuildMs - Date.now()) + rand(0, 200));
  }, []);

  const goToTracking = () => {
    answer({ sections: [{ heading: "", paragraphs: [copy.wentToTracking] }], followUps: [] });
    navigate("/projects/bouncebounce/tracking");
  };

  const ask = useCallback((text: string) => {
    const q = text.trim();
    if (!q) return;
    setOpen(true);
    const setup = pathRef.current.endsWith("/analysis-board") ? setupRef.current : null;
    clearTimers();

    // Dashboard pages: the existing data answers.
    if (!setup) {
      setThread((t) => [...t, { role: "user", text: q }, { role: "assistant", status: "pending", label: copy.pending.generic }]);
      later(() => resolve({ role: "assistant", status: "done", response: askCovy(q) }), 1100);
      return;
    }

    const intent = setupIntent(q);
    const tracked = trackingStore.get();
    const observation = boardPlan(setup.variant, tracked).observation.map((e) => e.id);
    const pending = (label: string) => setThread((t) => [...t, { role: "user", text: q }, { role: "assistant", status: "pending", label }]);

    if (intent === "tracking") {
      pending(copy.pending.generic);
      later(goToTracking, rand(200, 330));
      return;
    }
    if (intent === "continue") {
      pending(copy.pending.generic);
      later(() => answer(observation.length ? loggingPlan(setup.variant, tracked) : prototypeOnly()), rand(200, 330));
      return;
    }
    if (intent === "yes" && setup.stage === "explained") {
      // "Checking the current Tracking setup..." → "Identifying the required events..." → plan
      pending(copy.pending.checkTracking);
      later(() => setPendingLabel(copy.pending.identifyEvents), rand(470, 800));
      later(() => {
        setSetup({ ...setup, stage: "planned" });
        answer(loggingPlan(setup.variant, tracked));
      }, rand(1000, 1400));
      return;
    }
    if (intent === "yes" && setup.stage === "planned") {
      pending(copy.pending.prepareLogger);
      later(() => {
        if (!observation.length) {
          answer(loggingPlan(setup.variant, tracked));
          return;
        }
        setSetup({ ...setup, stage: "awaitingApproval" });
        resolve({ role: "approval", status: "pending", events: observation });
      }, rand(400, 670));
      return;
    }
    if (intent === "yes" && setup.stage === "installed") {
      pending(copy.pending.generic);
      later(() => answer(prototypeOnly()), rand(200, 330));
      return;
    }
    pending(copy.pending.generic);
    later(() => answer(steer()), rand(200, 330));
  }, []);

  const approve = useCallback(() => {
    const setup = setupRef.current;
    if (!setup) return;
    setScriptOpen(false);
    let events: EventId[] = [];
    setThread((t) =>
      t.map((turn) => {
        if (turn.role === "approval" && turn.status === "pending") {
          events = turn.events;
          return { ...turn, status: "running" };
        }
        return turn;
      }),
    );
    later(() => {
      addTrackedEvents(events);
      setSetup({ ...setup, stage: "installed" });
      setThread((t) => [
        ...t.map((turn) => (turn.role === "approval" && turn.status === "running" ? { ...turn, status: "approved" as const } : turn)),
        { role: "assistant", status: "done", setup: loggerInstalled(setup.variant, events, trackingStore.get()) },
      ]);
    }, approvalRunMs);
  }, []);

  const reject = useCallback(() => {
    const setup = setupRef.current;
    if (!setup) return;
    setScriptOpen(false);
    setSetup({ ...setup, stage: "planned" });
    setThread((t) => [
      ...t.map((turn) => (turn.role === "approval" && turn.status === "pending" ? { ...turn, status: "rejected" as const } : turn)),
      { role: "assistant", status: "done", setup: rejected() },
    ]);
  }, []);

  const value = useMemo<AgentState>(
    () => ({
      open,
      expanded,
      width: 480,
      thread,
      setupBoardId,
      toggle: () => setOpen((o) => !o),
      close: () => {
        setOpen(false);
        setExpanded(false);
      },
      setExpanded,
      ask,
      newChat,
      startAnalysis,
      approve,
      reject,
      scriptOpen,
      setScriptOpen,
    }),
    [open, expanded, thread, setupBoardId, ask, newChat, startAnalysis, approve, reject, scriptOpen],
  );

  return <AgentContext.Provider value={value}>{children}</AgentContext.Provider>;
}

export function useAgent() {
  const ctx = useContext(AgentContext);
  if (!ctx) throw new Error("useAgent must be used inside AgentProvider");
  return ctx;
}

/** Board from app memory (used by the panel's context chip and the board page). */
export const getBoard = (id: string | null) => boardStore.get().find((b) => b.id === id) ?? null;
