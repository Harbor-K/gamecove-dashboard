import React, { useRef, useState } from "react";
import { Check, ChevronDown, Maximize, Minus, Plus } from "lucide-react";
import { FlowCanvas, ZoomButton } from "../mapping/MappingWorkspace";
import { MappingInsights } from "../mapping/MappingInsights";
import { TrackedNodeDrawer, type TrackedTab } from "./TrackedNodeDrawer";
import { EventsChip } from "./TrackingControls";
import { Button } from "../ui/Button";
import { ws, type MapSection } from "../../data/mapping-workspace";
import type { catalog } from "../../data/analysisSetup";
import type { MappingNode, NodeDetails, NodeMappingStatus } from "../../types/setup";
import { LOCALE } from "../../i18n/locale";

const L = (en: string, ko: string) => LOCALE === "ko" ? ko : en;

export function TrackingWorkspace({
  nodes, details, statuses, trackedEvents, initialNodeId, initialTab, onOpenDashboard,
}: {
  nodes: MappingNode[];
  details: Record<string, NodeDetails>;
  statuses: Record<string, NodeMappingStatus>;
  trackedEvents: (typeof catalog)[number][];
  initialNodeId?: string | null;
  initialTab?: TrackedTab;
  onOpenDashboard: () => void;
}) {
  const [selected, setSelected] = useState<string | null>(initialNodeId ?? nodes[0]?.id ?? null);
  const [tab, setTab] = useState<"sections" | "insights">("sections");
  const [zoom, setZoom] = useState(1);
  const panelRef = useRef<HTMLDivElement>(null);
  const eventsForNode = (id: string) => trackedEvents.filter(e => id === "lobby" ? e.scope === "lobby" : e.scope === "stages");
  const pending = (id: string) => ["pending", "requiresReview", "checking"].includes(statuses[id]);
  // Use the actual saved map and details; do not recreate the setup draft.
  const sections: MapSection[] = nodes.map(node => ({
    id: node.id,
    name: node.title,
    status: pending(node.id) ? "needsReview" : "confirmed",
    start: details[node.id]?.enter.value ?? "",
    clear: details[node.id]?.ends.value ?? "",
    fail: { source: "", text: "" },
    extra: [],
    evidence: details[node.id]?.about.value ?? "",
  }));
  const labels = Object.fromEntries(nodes.map(node => [node.id, L(`${eventsForNode(node.id).length} events`, `이벤트 ${eventsForNode(node.id).length}개`)]));
  const select = (id: string) => {
    if (!nodes.some(node => node.id === id)) return;
    setTab("sections");
    setSelected(id);
    window.setTimeout(() => panelRef.current?.querySelector(`[data-tracked-section="${id}"]`)?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 0);
  };
  const tabs = [{ id: "sections" as const, label: ws.panelTitle }, { id: "insights" as const, label: ws.insightsTab }];

  return (
    <div className="flex h-full w-full flex-col bg-bg-canvas">
      <div className="flex h-[72px] shrink-0 items-center gap-4 border-b border-border-default px-6">
        <h1 data-no-translate className="text-title-card font-bold text-text-primary">{ws.game}</h1>
        <span className="flex h-7 items-center gap-2 rounded-full bg-bg-selected px-3 text-label-default text-text-accent">
          <Check size={14} />
          {L("Mapped", "맵핑 완료")}
        </span>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-label-default text-text-secondary">{L("Tracking", "트래킹")}</span>
          <div className="relative h-10 w-[132px]">
            <EventsChip events={trackedEvents} right={0} inline />
          </div>
          <Button variant="secondary" onClick={onOpenDashboard}>{L("Open dashboard", "대시보드 보기")}</Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <div className="relative min-w-0 flex-1 overflow-hidden bg-bg-tracking-canvas"
          style={{ backgroundImage: "radial-gradient(var(--gc-chart-grid) 1px, transparent 1px)", backgroundSize: "20px 20px" }}>
          <div className="absolute inset-0 overflow-auto">
            <div className="flex min-h-full min-w-full items-start justify-center px-10 pb-40 pt-20">
              <div style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}>
                <FlowCanvas sections={sections} selected={selected} onSelect={select} nodeLabels={labels} />
              </div>
            </div>
          </div>
          <div className="absolute bottom-5 left-5 z-10 flex flex-wrap items-center gap-4 rounded-md bg-bg-surface px-4 py-2.5 text-caption-default text-text-secondary ring-1 ring-inset ring-border-default">
            <span className="flex items-center gap-2"><span aria-hidden className="h-[1.5px] w-6 bg-text-secondary" />{ws.legend.clear}</span>
            <span className="flex items-center gap-2"><span aria-hidden className="size-2 rounded-full bg-text-accent" />{L("Mapped section", "맵핑된 구간")}</span>
            {nodes.some(n => pending(n.id)) && <span className="flex items-center gap-2"><span aria-hidden className="size-2 rounded-full bg-status-pending" />{ws.needsReview}</span>}
          </div>
          <div className="absolute bottom-5 right-5 z-10 flex flex-col overflow-hidden rounded-md bg-bg-surface ring-1 ring-inset ring-border-default">
            <ZoomButton label={ws.zoomIn} onClick={() => setZoom(z => Math.min(1.6, +(z + .1).toFixed(2)))}><Plus size={16} strokeWidth={1.5} /></ZoomButton>
            <ZoomButton label={ws.zoomOut} onClick={() => setZoom(z => Math.max(.6, +(z - .1).toFixed(2)))}><Minus size={16} strokeWidth={1.5} /></ZoomButton>
            <ZoomButton label={ws.fit} onClick={() => setZoom(1)}><Maximize size={16} strokeWidth={1.5} /></ZoomButton>
          </div>
        </div>

        <div ref={panelRef} className="flex w-[40%] min-w-[400px] flex-col overflow-y-auto border-l border-border-default">
          <div className="sticky top-0 z-10 bg-bg-canvas px-6 pt-6">
            <div role="tablist" aria-label={L("Tracking panels", "트래킹 패널")} className="flex items-center gap-5 border-b border-border-default">
              {tabs.map(t => <button key={t.id} id={t.id === "insights" ? "mapping-insights-tab" : "tracking-sections-tab"}
                type="button" role="tab" aria-selected={tab === t.id}
                aria-controls={t.id === "insights" ? "mapping-insights-panel" : "tracking-sections-panel"}
                onClick={() => setTab(t.id)}
                className={`relative flex h-10 items-center text-body-default font-bold cursor-pointer ${tab === t.id ? "text-text-primary" : "text-text-secondary hover:text-text-primary"}`}>
                {t.label}{tab === t.id && <span aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 bg-text-accent" />}
              </button>)}
            </div>
          </div>
          {tab === "sections" ? (
            <div id="tracking-sections-panel" role="tabpanel" aria-labelledby="tracking-sections-tab" className="flex flex-col gap-3 p-6 pt-4">
              <p className="pb-1 text-label-default text-text-secondary">{L("Your saved game structure. Open a section to inspect its overview, tracked events and mapping.", "저장된 게임 구조예요. 구간을 펼쳐 현황, 추적 이벤트와 맵핑 정보를 확인하세요.")}</p>
              {nodes.map((node, index) => {
                const open = selected === node.id;
                const needs = pending(node.id);
                const count = eventsForNode(node.id).length;
                return <section key={node.id} data-tracked-section={node.id}
                  className={`shrink-0 overflow-hidden rounded-lg bg-bg-surface ring-inset ${open ? "ring-[1.5px] ring-border-accent" : "ring-1 ring-border-default"}`}>
                  <button type="button" aria-expanded={open} aria-controls={`tracked-detail-${node.id}`}
                    onClick={() => setSelected(current => current === node.id ? null : node.id)}
                    className="flex min-h-16 w-full items-center gap-3 px-5 py-4 text-left cursor-pointer hover:bg-bg-hover">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-bg-selected text-label-default font-bold text-text-primary">{index}</span>
                    <span className="min-w-0 flex-1 truncate text-body-default font-bold text-text-primary">{node.title}</span>
                    <span className={`flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-caption-default ${needs ? "bg-bg-pending-subtle text-status-pending" : "bg-bg-selected text-text-accent"}`}>
                      {needs ? ws.needsReview : <><Check size={12} />{L("Mapped", "맵핑됨")}</>}
                    </span>
                    <span className="shrink-0 text-caption-default text-text-secondary">{L(`${count} events`, `이벤트 ${count}개`)}</span>
                    <ChevronDown size={16} className="shrink-0 text-icon-secondary" style={{ transform: open ? "rotate(180deg)" : undefined }} />
                  </button>
                  {open && <div id={`tracked-detail-${node.id}`}>
                    <TrackedNodeDrawer embedded node={node} details={details[node.id]} status={statuses[node.id]}
                      events={eventsForNode(node.id)} prev={nodes[index-1]} next={nodes[index+1]}
                      initialTab={initialTab} onClose={() => setSelected(null)} onOpenDashboard={onOpenDashboard} />
                  </div>}
                </section>;
              })}
            </div>
          ) : <MappingInsights onSelectSection={select} />}
        </div>
      </div>
    </div>
  );
}
