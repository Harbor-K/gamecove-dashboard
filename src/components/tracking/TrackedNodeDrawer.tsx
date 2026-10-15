import React, { useState } from "react";
import { ArrowRight, CircleCheck } from "lucide-react";
import { exitRates, funnelStepLabels, stageProgression } from "../../data/dashboard";
import { fieldLabels, fieldOrder } from "../../data/mapping";
import type { catalog } from "../../data/analysisSetup";
import type { MappingNode, NodeDetails, NodeMappingStatus } from "../../types/setup";
import { DrawerClose, DrawerFrame } from "../setup/DrawerFrame";
import { FieldBadge } from "../mapping/FieldBadge";
import { SmallButton } from "../ui/Button";

export type TrackedTab = "overview" | "data" | "mapping";
type TrackedEvent = (typeof catalog)[number];
/** Recorded with every event automatically (repo Catalog common values). */
const COMMON_PROPERTIES = ["player_id", "session_id", "timestamp"];
const TABS: { id: TrackedTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "data", label: "Data" },
  { id: "mapping", label: "Mapping" },
];

// Repo `TrackedNodeDrawer`: title + close, Overview / Data / Mapping tabs.
export function TrackedNodeDrawer({
  node,
  details,
  status,
  prev,
  next,
  initialTab = "overview",
  events = [],
  onClose,
  onOpenDashboard,
  embedded = false,
}: {
  embedded?: boolean;
  node: MappingNode;
  details: NodeDetails;
  status?: NodeMappingStatus;
  prev?: MappingNode;
  next?: MappingNode;
  initialTab?: TrackedTab;
  /** Tracked events that apply to this node (Catalog scope). */
  events?: TrackedEvent[];
  onClose: () => void;
  onOpenDashboard: () => void;
}) {
  const [tab, setTab] = useState<TrackedTab>(initialTab);
  const Frame = embedded ? EmbeddedFrame : DrawerFrame;
  return (
    <Frame
      header={
        <div className="shrink-0">
          {!embedded && <header className="flex h-20 items-center gap-4 p-6">
            <h2 className="min-w-0 flex-1 truncate text-[20px] font-bold leading-[1.3] text-text-primary">{node.title}</h2>
            <DrawerClose label="Close" onClick={onClose} />
          </header>}
          <div role="tablist" className="flex h-[49px] items-end px-6 shadow-[inset_0_-1px_0_var(--gc-border-default)]">
            {TABS.map((t) => {
              const on = t.id === tab;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setTab(t.id)}
                  className={`flex h-12 w-24 items-center justify-center text-fs-16 leading-[1.6] cursor-pointer transition-colors duration-150 ${
                    on ? "text-text-primary" : "text-text-secondary hover:text-text-primary"
                  }`}
                  style={on ? { boxShadow: "inset 0 -2px 0 var(--gc-text-accent)" } : undefined}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-6 p-6">
        {tab === "overview" && <OverviewTab node={node} details={details} onOpenDashboard={onOpenDashboard} />}
        {tab === "data" && <DataTab events={events} />}
        {tab === "mapping" && <MappingTab details={details} status={status} prev={prev} next={next} />}
      </div>
    </Frame>
  );
}

function EmbeddedFrame({ header, children }: { header: React.ReactNode; children: React.ReactNode }) {
  return <div className="flex min-w-0 flex-col border-t border-border-default">{header}{children}</div>;
}

function SectionTitle({ children, caption }: { children: React.ReactNode; caption?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <h3 className="text-fs-16 font-bold leading-[1.6] text-text-primary">{children}</h3>
      {caption && <span className="text-caption-default text-text-secondary">{caption}</span>}
    </div>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-md bg-bg-canvas px-4 py-3 ring-1 ring-inset ring-border-default">
      <span className="text-caption-default text-text-secondary">{label}</span>
      <span className="text-[20px] font-bold leading-[1.3] text-text-primary">{value}</span>
    </div>
  );
}

// ── Overview: what this place is + how it performed (dashboard data, last 7 days) ──
function OverviewTab({ node, details, onOpenDashboard }: { node: MappingNode; details: NodeDetails; onOpenDashboard: () => void }) {
  const stageNo = node.id.startsWith("stage-") ? Number(node.id.split("-")[1]) : null;
  const stage = stageNo ? stageProgression.find((s) => s.stage === stageNo) : undefined;
  const exit = exitRates.find((e) => e.area === node.title);

  const tiles: { label: string; value: string }[] = stage
    ? [
        { label: "Clear rate", value: stage.clearRate },
        { label: "Session exit rate", value: exit ? `${exit.rate}%` : "N/A" },
        { label: "Avg. first-clear time", value: stage.firstClearTime },
        { label: "Avg. failures to first clear", value: stage.failuresToClear },
      ]
    : [
        { label: "Session exit rate", value: exit ? `${exit.rate}%` : "N/A" },
        { label: "Players who entered Stage 1", value: `${stageProgression[0].users[0]} players` },
      ];

  return (
    <>
      <section className="flex flex-col gap-3">
        <SectionTitle>About</SectionTitle>
        <div className="flex flex-col gap-2">
          <span className="flex h-6 w-fit items-center rounded-full bg-bg-canvas px-2 text-caption-default text-text-secondary ring-1 ring-inset ring-border-default">
            {node.role}
          </span>
          <p className="text-body-default text-text-secondary">{details.about.value}</p>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <SectionTitle caption="Last 7 days">Key metrics</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          {tiles.map((t) => (
            <MetricTile key={t.label} {...t} />
          ))}
        </div>
      </section>

      {stage && (
        <section className="flex flex-col gap-3">
          <SectionTitle caption="Unique players">Progression funnel</SectionTitle>
          <div className="flex flex-col gap-3">
            {stage.users.map((count, i) => {
              const pct = (count / stage.users[0]) * 100;
              return (
                <div key={funnelStepLabels[i]} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-3 text-label-default">
                    <span className="text-text-secondary">{funnelStepLabels[i]}</span>
                    <span className="text-text-primary">
                      {count} <span className="text-text-secondary">· {pct.toFixed(1)}%</span>
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-chart-bar-track">
                    <div className="h-full rounded-full bg-chart-series-primary" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <div>
        <SmallButton onClick={onOpenDashboard}>Open dashboard</SmallButton>
      </div>
    </>
  );
}

// ── Data: events applied to this node (repo TrackedNodeDrawer Data tab) ──
function DataTab({ events }: { events: TrackedEvent[] }) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-fs-16 font-bold leading-[1.6] text-text-primary">Tracked events</h3>
      {events.length === 0 ? (
        <p className="text-label-default text-text-secondary">No events are tracked here yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {events.map((e) => (
            <div key={e.id} className="flex flex-col gap-2 rounded-md bg-bg-canvas px-4 py-3 ring-1 ring-inset ring-border-default">
              <div className="flex items-center gap-2">
                <span aria-hidden className="size-2 shrink-0 rounded-full bg-status-positive" />
                <span data-no-translate className="min-w-0 flex-1 truncate text-label-default font-bold text-text-primary">{e.id}</span>
                <span className="text-caption-default text-text-positive">Active</span>
              </div>
              <span className="text-label-default text-text-secondary">{e.label}</span>
              <div data-no-translate className="flex flex-wrap gap-1.5">
                {[...e.properties, ...COMMON_PROPERTIES].map((p) => (
                  <span key={p} className="flex h-6 items-center rounded-full bg-bg-surface px-2 text-caption-default text-text-secondary ring-1 ring-inset ring-border-default">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ── Mapping: the context confirmed in Game Setup ──
function MappingTab({ details, status, prev, next }: { details: NodeDetails; status?: NodeMappingStatus; prev?: MappingNode; next?: MappingNode }) {
  const pending = status === "pending";
  return (
    <>
      <div className="flex items-center gap-2 text-label-default text-text-positive">
        <CircleCheck size={16} strokeWidth={1.5} className="shrink-0" />
        <span>Confirmed in Game Setup</span>
      </div>

      {fieldOrder.map((key) => {
        const field = details[key];
        const isPending = pending && key === "ends";
        const filled = field.value.trim().length > 0;
        return (
          <section key={key} className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-label-default text-text-secondary">{fieldLabels[key]}</span>
              <FieldBadge identified={filled} pending={isPending} />
            </div>
            <p className="rounded-md bg-bg-canvas px-3 py-[11px] text-body-default text-text-primary ring-1 ring-inset ring-border-default">
              {isPending ? "Kept pending in Game Setup. GameCove won't infer an end point for this stage." : filled ? field.value : "—"}
            </p>
          </section>
        );
      })}

      <div className="h-px w-full bg-border-default" />

      <section className="flex flex-col gap-3">
        <h3 className="text-fs-16 font-bold leading-[1.6] text-text-primary">Connections</h3>
        <div className="flex flex-col gap-2 text-label-default">
          <ConnectionRow label="Comes from" value={prev?.title} />
          <ConnectionRow label="Leads to" value={next?.title} />
        </div>
      </section>

      <div>
        <SmallButton>Edit mapping</SmallButton>
      </div>
    </>
  );
}

function ConnectionRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-text-secondary">{label}</span>
      {value ? (
        <span className="flex items-center gap-1 text-text-primary">
          {label === "Leads to" && <ArrowRight size={14} strokeWidth={1.5} className="text-icon-secondary" />}
          {value}
        </span>
      ) : (
        <span className="text-text-secondary">{label === "Comes from" ? "Game start" : "End of journey"}</span>
      )}
    </div>
  );
}
