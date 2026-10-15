import React, { useState, type ReactNode } from "react";
import { Check } from "lucide-react";
import type { TrackingEventId, TrackingItem } from "../../types/setup";
import { SmallButton } from "../ui/Button";
import { InfoTooltip } from "../ui/InfoTooltip";
import { Dot } from "../ui/StatusParts";
import { AutoRecordedNotice } from "./AutoRecordedNotice";
import { LoggingIntro } from "./LoggingDrawer";

export type ItemFacts = { scopeLabels: string[]; properties: string[]; coverage: string[] };

function SectionHeader({ tone, label, tip }: { tone: "positive" | "critical"; label: string; tip: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex size-4 items-center justify-center">
        <Dot tone={tone} size={10} />
      </span>
      <span className="text-fs-16 font-bold leading-[1.6] text-text-primary">{label}</span>
      <InfoTooltip text={tip} tone="primary" />
    </div>
  );
}

function Detail({ label, tip, children }: { label: string; tip: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        <span className="text-label-default text-text-secondary">{label}</span>
        <InfoTooltip text={tip} size={14} />
      </div>
      {children}
    </div>
  );
}

function ItemDetails({ facts }: { facts: ItemFacts }) {
  return (
    <>
      <div aria-hidden className="h-px w-full bg-border-default" />
      <div className="flex flex-col gap-4">
        <Detail label="Applies to" tip="Where in your mapped game this event is recorded. Stages share one event and are told apart by stage_id.">
          <span className="text-label-default text-text-primary">{facts.scopeLabels.join(" · ")}</span>
        </Detail>
        <Detail label="Properties" tip="Extra values saved with this event, so you can break results down — for example by stage.">
          {facts.properties.length > 0 && <span className="text-label-default text-text-primary">{facts.properties.join(", ")}</span>}
          <AutoRecordedNotice />
        </Detail>
        <Detail label="Coverage" tip="The analyses you picked that rely on this event.">
          <span className="text-label-default text-text-primary">{facts.coverage.join(" · ")}</span>
        </Detail>
      </div>
    </>
  );
}

// Step 2 — Review what to track (tracking)
export function LoggingStep2({
  ready,
  requiresSetup,
  facts,
  readyOn,
  onToggleReady,
  pending,
  onTogglePending,
}: {
  ready: TrackingItem[];
  requiresSetup: TrackingItem[];
  facts: (id: TrackingEventId) => ItemFacts;
  readyOn: TrackingEventId[];
  onToggleReady: (id: TrackingEventId) => void;
  pending: TrackingEventId[];
  onTogglePending: (id: TrackingEventId) => void;
}) {
  const [open, setOpen] = useState<TrackingEventId[]>([]);
  const toggleOpen = (id: TrackingEventId) => setOpen((o) => (o.includes(id) ? o.filter((x) => x !== id) : [...o, id]));
  const detailsButton = (id: TrackingEventId) => (
    <SmallButton aria-expanded={open.includes(id)} onClick={() => toggleOpen(id)}>
      {open.includes(id) ? "Hide details" : "View details"}
    </SmallButton>
  );

  return (
    <>
      <LoggingIntro
        title="Review what to track"
        description="Check the data needed for your selected analyses. Choose what to track now and what to set up later."
      />

      {ready.length > 0 && (
        <section className="flex flex-col gap-4">
          <SectionHeader tone="positive" label="Ready to track" tip="Data GameCove can start collecting right away from your current game structure." />
          {ready.map((item) => {
            const on = readyOn.includes(item.id);
            const expanded = open.includes(item.id);
            return (
              <div key={item.id} className={`flex flex-col gap-4 rounded-lg bg-bg-canvas px-6 pt-4 ring-1 ring-inset ring-border-default ${expanded ? "pb-6" : "pb-4"}`}>
                <div className="flex h-8 items-center gap-3">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={on}
                    aria-label={item.label}
                    onClick={() => onToggleReady(item.id)}
                    className={`flex size-5 shrink-0 items-center justify-center rounded-sm cursor-pointer ${on ? "bg-icon-primary text-icon-inverse" : "ring-1 ring-inset ring-icon-secondary"}`}
                  >
                    {on && <Check size={14} strokeWidth={2.5} />}
                  </button>
                  <span className="min-w-0 flex-1 truncate text-fs-16 font-bold leading-[1.6] text-text-primary">{item.label}</span>
                  {detailsButton(item.id)}
                </div>
                {expanded && <ItemDetails facts={facts(item.id)} />}
              </div>
            );
          })}
        </section>
      )}

      {requiresSetup.length > 0 && (
        <section className="flex flex-col gap-4">
          <SectionHeader
            tone="critical"
            label="Requires setup"
            tip="Data that needs code changes in your game before it can be tracked. You can add it to pending and set it up later."
          />
          {requiresSetup.map((item) => {
            const added = pending.includes(item.id);
            const expanded = open.includes(item.id);
            return (
              <div key={item.id} className={`flex flex-col gap-4 rounded-lg bg-bg-canvas px-6 pt-4 ring-1 ring-inset ring-border-default ${expanded ? "pb-6" : "pb-4"}`}>
                <div className="flex flex-col gap-2">
                  <div className="flex h-8 items-center gap-3">
                    <span className="min-w-0 flex-1 truncate text-fs-16 font-bold leading-[1.6] text-text-secondary">{item.label}</span>
                    <div className="flex items-center gap-2">
                      {detailsButton(item.id)}
                      <SmallButton onClick={() => onTogglePending(item.id)}>{added ? "Cancel" : "Add to pending"}</SmallButton>
                    </div>
                  </div>
                  {added && (
                    <p className="flex items-center gap-2 text-label-default text-status-pending" style={{ animation: "gc-fade-in 200ms ease-out both" }}>
                      <Dot tone="pending" />
                      Added to pending. You can set this up after applying.
                    </p>
                  )}
                </div>
                {expanded && <ItemDetails facts={facts(item.id)} />}
              </div>
            );
          })}
        </section>
      )}
    </>
  );
}
