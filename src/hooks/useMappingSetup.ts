import { useEffect, useRef, useState } from "react";
import { aiMappedNodes, aiNodeDetails, defaultApplyTo, mappingLoadingMs, previewMappedDetails, scriptReview } from "../data/mapping";
import type { NodeDetails, NodeMappingStatus } from "../types/setup";
import { useScreenInit } from "../useScreenInit.js";
import type { OnboardingState } from "../components/mapping/OnboardingPopup";
import type { Resolution } from "../components/mapping/ReviewDrawer";
import type { TrackedTab } from "../components/tracking/TrackedNodeDrawer";

/** "idle" = Tracking after mapping (nodes show tracked counts). */
export type Phase = "intro" | "step1" | "step2" | "step3" | "mappingApproval" | "mapped" | "idle";
type LoadingKind = "save" | "mapping" | "applying";

const nodes = aiMappedNodes;
const NODES_ENTERED_MS = 120 + (nodes.length - 1) * 70 + 420 + 150;
const LATER_STEP_POPUP_DELAY_MS = 400;
const LIGHT_UP_START_MS = 500;
const LIGHT_UP_STEP_MS = 450;
const MODAL_EXIT_MS = 200;

// Saved map lives in app memory: leaving Tracking and coming back shows the mapped view (a reload starts over).
let savedMap: { details: Record<string, NodeDetails>; statuses: Record<string, NodeMappingStatus> } | null = null;
export const isMappingSaved = () => savedMap !== null;

/** Mapping (Steps 1–3) → "game mapped" → Tracking (after mapping). */
export function useMappingSetup() {
  const screenInit = useScreenInit() as { phase?: Phase; viewNode?: string; tab?: TrackedTab };
  const initialPhase: Phase = screenInit.phase ?? (savedMap ? "idle" : "intro");
  const afterMapping = initialPhase === "mapped" || initialPhase === "idle";
  const [phase, setPhase] = useState<Phase>(initialPhase);
  const [entering, setEntering] = useState(false);
  const [popup, setPopup] = useState<OnboardingState>("expanded");
  const [loadingKind, setLoadingKind] = useState<LoadingKind>("save");
  const [popupKey, setPopupKey] = useState(0);
  const [popupDelay, setPopupDelay] = useState(0);
  const [leave, setLeave] = useState<"mapping" | null>(null);

  // Step 2
  const [details, setDetails] = useState<Record<string, NodeDetails>>(() =>
    savedMap?.details ?? (afterMapping ? previewMappedDetails : aiNodeDetails),
  );
  const [reviewed, setReviewed] = useState<string[]>(() =>
    initialPhase === "step2" || initialPhase === "intro" || initialPhase === "step1" ? [] : nodes.map((n) => n.id),
  );
  const [openId, setOpenId] = useState<string | null>(null);
  const [draft, setDraft] = useState<NodeDetails | null>(null);
  const [checked, setChecked] = useState<string[]>([]);
  const [applyTo, setApplyTo] = useState<Record<string, string[]>>({});

  // Step 3
  const [statuses, setStatuses] = useState<Record<string, NodeMappingStatus>>(() =>
    savedMap?.statuses ??
    (initialPhase === "step3"
      ? Object.fromEntries(nodes.map((n) => [n.id, scriptReview[n.id] ? "requiresReview" : "ready"]))
      : initialPhase === "mappingApproval"
        ? Object.fromEntries(nodes.map((n) => [n.id, "ready"]))
        : afterMapping
          ? Object.fromEntries(nodes.map((n) => [n.id, "fullyMapped"]))
          : {}),
  );
  const [mappedOpen, setMappedOpen] = useState(initialPhase === "mapped");
  const [mappingApprovals, setMappingApprovals] = useState<string[]>(() =>
    initialPhase === "mappingApproval" ? nodes.map((n) => `mapping-${n.id}`) : [],
  );
  const [mappingApplying, setMappingApplying] = useState(false);

  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  // Remember the saved map once mapping is applied.
  useEffect(() => {
    if (phase === "mapped" || phase === "idle") savedMap = { details, statuses };
  }, [phase, details, statuses]);

  const enterStep = (next: Phase, popupAfterMs?: number) => {
    const animateNodes = next === "step1";
    setPhase(next);
    setPopup("expanded");
    setPopupKey((k) => k + 1);
    setPopupDelay(popupAfterMs ?? (animateNodes ? NODES_ENTERED_MS : LATER_STEP_POPUP_DELAY_MS));
    if (animateNodes) {
      setEntering(true);
      later(() => setEntering(false), NODES_ENTERED_MS + 600);
    }
  };

  const closeDrawer = () => {
    setOpenId(null);
    setDraft(null);
    setChecked([]);
  };

  const runLoading = (kind: LoadingKind, ms: number, done: () => void) => {
    closeDrawer();
    setLoadingKind(kind);
    setPopup("loading");
    later(done, ms);
  };

  // ── Mapping flow ──
  const goToMapping = () => enterStep("step1", NODES_ENTERED_MS + MODAL_EXIT_MS);

  const step1Next = () => runLoading("save", mappingLoadingMs.step1to2, () => enterStep("step2"));

  const step2Next = () =>
    runLoading("mapping", mappingLoadingMs.step2to3, () => {
      const order = [...nodes].sort((a, b) => a.x - b.x);
      setStatuses(Object.fromEntries(order.map((n) => [n.id, "checking"])));
      order.forEach((n, i) =>
        later(() => setStatuses((s) => ({ ...s, [n.id]: scriptReview[n.id] ? "requiresReview" : "ready" })), LIGHT_UP_START_MS + i * LIGHT_UP_STEP_MS),
      );
      enterStep("step3", LIGHT_UP_START_MS + order.length * LIGHT_UP_STEP_MS + 200);
    });

  // AI can propose the map, but a developer must explicitly approve every change before it is saved.
  const requestMappingApproval = () => {
    closeDrawer();
    setPopup("minimised");
    setPhase("mappingApproval");
  };

  const approveMappingChanges = () => {
    setMappingApplying(true);
    later(() => {
      setMappingApplying(false);
      setStatuses((s) => Object.fromEntries(Object.entries(s).map(([id, v]) => [id, v === "pending" ? v : "fullyMapped"])));
      setPhase("mapped");
      setMappedOpen(true);
    }, mappingLoadingMs.apply);
  };

  /**
   * v22 mapping workspace: "지도 저장". Sections still marked 확인 필요 are saved as pending (like "Leave this pending");
   * everything else is fully mapped. Then the same "Your game is mapped!" modal → Overview.
   */
  const saveWorkspaceMap = (pendingIds: string[]) => {
    setMappingApplying(true);
    later(() => {
      setMappingApplying(false);
      setStatuses(Object.fromEntries(nodes.map((n) => [n.id, pendingIds.includes(n.id) ? "pending" : "fullyMapped"])));
      setReviewed(nodes.map((n) => n.id));
      setPhase("mapped");
      setMappedOpen(true);
    }, mappingLoadingMs.apply);
  };

  const back = (to: Phase) => {
    closeDrawer();
    setPopup("expanded");
    setPhase(to);
  };

  // Step 2 drawer
  const openStep2 = (id: string) => {
    const others = applyTo[id] ?? defaultApplyTo[id] ?? [];
    setOpenId(id);
    setDraft(details[id]);
    setChecked(others);
  };
  const toggleOther = (id: string) => setChecked((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
  const resetStep2 = () => {
    if (!openId) return;
    setDraft(aiNodeDetails[openId]);
    setChecked(defaultApplyTo[openId] ?? []);
  };
  const saveStep2 = () => {
    if (!openId || !draft) return;
    const saved = Object.fromEntries(
      Object.entries(draft).map(([k, f]) => [k, { ...f, identified: f.identified || f.value.trim().length > 0 }]),
    ) as NodeDetails;
    setDetails((d) => ({ ...d, [openId]: saved, ...Object.fromEntries(checked.map((id) => [id, saved])) }));
    setApplyTo((a) => ({ ...a, [openId]: checked }));
    setReviewed((r) => [...new Set([...r, openId, ...checked])]);
    closeDrawer();
  };

  // Step 3 drawer
  const openStep3 = (id: string) => setOpenId(id);
  const saveStep3 = (resolution: Resolution | null) => {
    if (!openId) return;
    const id = openId;
    closeDrawer();
    if (!resolution) return;
    if (resolution.kind !== "pending") {
      const value = resolution.kind === "candidate" ? `The stage ends when ${resolution.value} reports completion.` : resolution.value;
      setDetails((d) => ({ ...d, [id]: { ...d[id], ends: { value, identified: true } } }));
    }
    setStatuses((s) => ({ ...s, [id]: "checking" }));
    later(() => setStatuses((s) => ({ ...s, [id]: resolution.kind === "pending" ? "pending" : "ready" })), mappingLoadingMs.resolveCheck);
  };

  /** Close the "mapped" modal and stay on Tracking (after mapping). */
  const toIdle = () => {
    setMappedOpen(false);
    setPhase("idle");
  };

  const requestLeave = () => setLeave("mapping");

  const reviewedCount = reviewed.length;
  const blocked = Object.values(statuses).some((s) => s === "requiresReview" || s === "checking");

  return {
    nodes,
    phase,
    setPhase,
    entering,
    popup,
    setPopup,
    loadingKind,
    popupKey,
    popupDelay,
    leave,
    setLeave,
    requestLeave,
    details,
    reviewed,
    reviewedCount,
    openId,
    draft,
    setDraft,
    checked,
    statuses,
    blocked,
    mappedOpen,
    mappingApprovals,
    setMappingApprovals,
    mappingApplying,
    goToMapping,
    step1Next,
    step2Next,
    requestMappingApproval,
    approveMappingChanges,
    saveWorkspaceMap,
    back,
    openStep2,
    toggleOther,
    resetStep2,
    saveStep2,
    openStep3,
    saveStep3,
    closeDrawer,
    toIdle,
    initialViewNode: screenInit.viewNode ?? null,
    initialTab: screenInit.tab,
  };
}
