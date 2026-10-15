import React, { useLayoutEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CoachMark } from "../components/mapping/CoachMark";
import { DeveloperApprovalPanel, type ApprovalItem } from "../components/mapping/DeveloperApprovalPanel";
import { GameConnectedModal } from "../components/mapping/GameConnectedModal";
import { GameMappedModal } from "../components/mapping/GameMappedModal";
import { LeaveSetupModal } from "../components/mapping/LeaveSetupModal";
import { MappingCanvas } from "../components/mapping/MappingCanvas";
import { TrackingWorkspace } from "../components/tracking/TrackingWorkspace";
import { MappingWorkspace } from "../components/mapping/MappingWorkspace";
import { NodeDetailDrawer } from "../components/mapping/NodeDetailDrawer";
import { ReviewDrawer } from "../components/mapping/ReviewDrawer";
import { DRAWER_W } from "../components/setup/DrawerFrame";
import { scriptReview } from "../data/mapping";
import { useMappingSetup } from "../hooks/useMappingSetup";
import { catalog } from "../data/analysisSetup";
import { setupRailStore } from "../state/shell";
import { useTrackedEvents } from "../state/store";
import type { NodeRowStatus } from "../types/setup";

const loadingTexts = {
  save: { title: "Saving your map", caption: "Getting the next step ready…" },
  mapping: { title: "Mapping to your script", caption: "Matching your nodes to the game script…" },
  applying: { title: "Saving your map", caption: "Saving the nodes you confirmed…" },
};

const ZOOM_STEP = 1.2;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 2;

type Coach = {
  targetId: string;
  step: number;
  title: string;
  description: string;
  progress?: string;
  link?: { label: string; onClick: () => void };
  nextLabel?: string;
  onNext?: () => void;
  onBack?: () => void;
  clickHint?: boolean;
  loading?: boolean;
};

export function TrackingPage() {
  const navigate = useNavigate();
  const { projectId = "bouncebounce" } = useParams();
  const toOverview = () => navigate(`/projects/${projectId}/overview`);
  const s = useMappingSetup();

  const { phase, nodes, openId } = s;
  const tracked = phase === "idle";
  // Game Setup (connected popup → mapping → "mapped") = minimal icon rail; Tracking after mapping = full nav.
  useLayoutEffect(() => {
    setupRailStore.set(phase !== "idle");
  }, [phase]);
  useLayoutEffect(() => () => setupRailStore.set(null), []);
  const [viewId, setViewId] = useState<string | null>(s.initialViewNode);
  const [zoom, setZoom] = useState(1);
  // Shared with COVY: events approved on an analysis board show up here.
  const trackedIds = useTrackedEvents();
  const trackedEvents = catalog.filter((e) => trackedIds.includes(e.id));
  // Node counts follow the Catalog scope — session events only count in the Events total.
  const eventsForNode = (id: string) => trackedEvents.filter((e) => (id === "lobby" ? e.scope === "lobby" : e.scope === "stages"));

  const mappingDrawerOpen = openId !== null && (phase === "step2" || phase === "step3");
  const trackedDrawerOpen = tracked && viewId !== null;
  const drawerOpen = mappingDrawerOpen || trackedDrawerOpen;
  const openNode = nodes.find((node) => node.id === openId) ?? null;
  const viewIndex = nodes.findIndex((node) => node.id === viewId);
  const viewNode = viewIndex >= 0 ? nodes[viewIndex] : null;

  const canvasStatuses: Record<string, NodeRowStatus> | undefined =
    phase === "step3" || phase === "mappingApproval" || phase === "mapped"
      ? s.statuses
      : tracked
        ? Object.fromEntries(nodes.map((node) => [node.id, eventsForNode(node.id).length ? ("tracked" as const) : ("idle" as const)]))
        : undefined;
  const statusLabels = tracked ? Object.fromEntries(nodes.map((node) => [node.id, `${eventsForNode(node.id).length} tracked`])) : undefined;

  const stateOf = (id: string) => {
    if (mappingDrawerOpen && id === openId) return "selected" as const;
    if (trackedDrawerOpen && id === viewId) return "selected" as const;
    if (phase === "step2" && mappingDrawerOpen && s.checked.includes(id)) return "highlighted" as const;
    if (phase === "step2" && s.reviewed.includes(id)) return "reviewed" as const;
    return "default" as const;
  };

  // ── Product-tour guide: a short tooltip next to the node the developer acts on next ──
  const stepNumber = phase === "step1" ? 1 : phase === "step2" ? 2 : phase === "step3" ? 3 : null;
  const firstUnreviewed = nodes.find((node) => !s.reviewed.includes(node.id));
  const flagged = nodes.find((node) => s.statuses[node.id] === "requiresReview");
  const stillChecking = nodes.some((node) => s.statuses[node.id] === "checking");
  const pendingCount = nodes.filter((node) => s.statuses[node.id] === "pending").length;
  const lastNode = nodes[nodes.length - 1];
  // Loading stays on the node whose guide the developer just clicked (no jump to another node).
  const lastCoachTarget = useRef<string>(nodes[0].id);

  let coach: Coach | null = null;
  if (stepNumber && !mappingDrawerOpen) {
    if (s.popup === "loading" || s.mappingApplying) {
      const text = loadingTexts[s.mappingApplying ? "applying" : s.loadingKind];
      coach = { targetId: lastCoachTarget.current, step: stepNumber, title: text.title, description: text.caption, loading: true };
    } else if (phase === "step1" && !s.entering) {
      coach = {
        targetId: nodes[0].id,
        step: 1,
        title: "Check the map AI drafted",
        description: "GameCove drew your player journey from your script. It uses this map to suggest analysis and logging.",
        onNext: s.step1Next,
      };
    } else if (phase === "step2") {
      const progress = `${s.reviewedCount} of ${nodes.length} nodes confirmed`;
      coach = firstUnreviewed
        ? {
            targetId: firstUnreviewed.id,
            step: 2,
            title: `Confirm ${firstUnreviewed.title}`,
            description: "Click to check how AI read this node. Fix anything wrong, then confirm.",
            progress,
            clickHint: true,
            onBack: () => s.back("step1"),
            onNext: () => s.openStep2(firstUnreviewed.id),
          }
        : {
            targetId: lastNode.id,
            step: 2,
            title: "All nodes confirmed",
            description: "Next, GameCove checks your map against the script.",
            progress,
            onBack: () => s.back("step1"),
            onNext: s.step2Next,
          };
    } else if (phase === "step3" && !stillChecking) {
      coach = flagged
        ? {
            targetId: flagged.id,
            step: 3,
            title: `Resolve ${flagged.title}`,
            description: "AI couldn't tell how this stage ends. Click to choose or keep it pending.",
            clickHint: true,
            onBack: () => s.back("step2"),
            onNext: () => s.openStep3(flagged.id),
          }
        : {
            targetId: lastNode.id,
            step: 3,
            title: "Save your map",
            description: `${nodes.length - pendingCount} nodes confirmed${pendingCount ? ` · ${pendingCount} kept pending` : ""}. Your game script stays unchanged.`,
            link: { label: "View changes", onClick: s.requestMappingApproval },
            onBack: () => s.back("step2"),
            nextLabel: "Save map",
            onNext: s.approveMappingChanges,
          };
    }
  }

  if (coach && !coach.loading) lastCoachTarget.current = coach.targetId;

  const mappingApprovalItems: ApprovalItem[] = nodes.map((node) => {
    const changed = s.details[node.id];
    const status = s.statuses[node.id];
    return {
      id: `mapping-${node.id}`,
      label: `${node.title} context`,
      detail:
        status === "pending"
          ? "Keep the end condition pending. GameCove will not infer or save an endpoint for this stage."
          : `${changed.about.value} Entry: ${changed.enter.value}`,
      tone: status === "pending" ? "pending" : "standard",
    };
  });

  const onNodeClick =
    phase === "step2"
      ? s.openStep2
      : phase === "step3"
        ? s.openStep3
        : tracked
          ? (id: string) => setViewId((current) => (current === id ? null : id))
          : undefined;

  // v22 redesign: the mapping itself (after "Go to Mapping", before "Your game is mapped!") is one workspace —
  // section cards on the left, the game-structure flow on the right, "지도 저장" in the top bar.
  const workspace = phase === "step1" || phase === "step2" || phase === "step3" || phase === "mappingApproval";
  if (workspace) {
    return (
      <div className="relative h-[calc(100vh/var(--gc-zoom)-56px)] w-full overflow-hidden">
        <MappingWorkspace saving={s.mappingApplying} onSave={s.saveWorkspaceMap} />
        <LeaveSetupModal
          kind={s.leave}
          onContinue={() => s.setLeave(null)}
          onLeave={() => {
            s.setLeave(null);
            toOverview();
          }}
        />
      </div>
    );
  }

  if (tracked) {
    return (
      <div className="relative h-[calc(100vh/var(--gc-zoom)-56px)] w-full overflow-hidden">
        <TrackingWorkspace
          nodes={nodes}
          details={s.details}
          statuses={s.statuses}
          trackedEvents={trackedEvents}
          initialNodeId={s.initialViewNode}
          initialTab={s.initialTab}
          onOpenDashboard={toOverview}
        />
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh/var(--gc-zoom)-56px)] w-full overflow-hidden">
      {phase === "intro" ? (
        <div className="h-full w-full bg-bg-tracking-canvas" />
      ) : (
        <MappingCanvas
          nodes={nodes}
          entering={s.entering}
          statuses={canvasStatuses}
          statusLabels={statusLabels}
          stateOf={stateOf}
          onNodeClick={onNodeClick}
          rightInset={drawerOpen ? DRAWER_W : 0}
          zoom={tracked ? zoom : 1}
          onBackgroundClick={tracked ? () => setViewId(null) : undefined}
          coachTargetId={coach?.targetId ?? null}
          renderCoach={
            coach
              ? (anchor, container) => (
                  <CoachMark
                    key={`${phase}-${coach!.targetId}-${coach!.loading ? "loading" : coach!.nextLabel ?? "next"}`}
                    anchor={anchor}
                    container={container}
                    onClose={s.requestLeave}
                    {...coach!}
                  />
                )
              : undefined
          }
        />
      )}

      {phase === "step2" && openNode && s.draft && (
        <NodeDetailDrawer
          key={openNode.id}
          node={openNode}
          draft={s.draft}
          onChange={s.setDraft}
          otherNodes={nodes.filter((node) => node.id !== openNode.id)}
          checkedIds={s.checked}
          onToggleOther={s.toggleOther}
          onReset={s.resetStep2}
          onSave={s.saveStep2}
          onClose={s.closeDrawer}
        />
      )}

      {phase === "step3" && openNode && (
        <ReviewDrawer
          key={openNode.id}
          node={openNode}
          details={s.details[openNode.id]}
          status={s.statuses[openNode.id] ?? "ready"}
          review={scriptReview[openNode.id]}
          onSave={s.saveStep3}
          onClose={s.closeDrawer}
        />
      )}

      {phase === "mappingApproval" && (
        <DeveloperApprovalPanel
          kind="mapping"
          mode="summary"
          items={mappingApprovalItems}
          onBack={() => s.back("step3")}
          onApprove={s.approveMappingChanges}
          applying={s.mappingApplying}
        />
      )}

      <GameConnectedModal open={phase === "intro"} onGoToMapping={s.goToMapping} onExploreDashboard={toOverview} />
      <GameMappedModal
        open={s.mappedOpen}
        onClose={s.toIdle}
        onGoToDashboard={() => {
          s.toIdle();
          toOverview();
        }}
      />
      <LeaveSetupModal
        kind={s.leave}
        onContinue={() => s.setLeave(null)}
        onLeave={() => {
          s.setLeave(null);
          toOverview();
        }}
      />
    </div>
  );
}
