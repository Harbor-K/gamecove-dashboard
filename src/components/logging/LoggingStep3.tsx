import React, { type ReactNode } from "react";
import { observationScript } from "../../data/logging";
import type { AnalysisId, TrackingEventId } from "../../types/setup";
import { analysisById, trackingItemById } from "../../utils/logging";
import { SmallButton } from "../ui/Button";
import { InfoTooltip } from "../ui/InfoTooltip";
import { DataChip, Dot } from "../ui/StatusParts";
import { AutoRecordedNotice } from "./AutoRecordedNotice";
import { LoggingIntro } from "./LoggingDrawer";

function Section({ label, tip, children }: { label: string; tip?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-1">
        <span className="text-label-default text-text-primary">{label}</span>
        {tip && <InfoTooltip text={tip} size={14} />}
      </div>
      {children}
    </section>
  );
}

const card = "flex flex-col rounded-lg bg-bg-canvas px-6 pt-4 pb-6 ring-1 ring-inset ring-border-default";

// Step 3 — Final review (logging setup)
export function LoggingStep3({
  analyses,
  readyEvents,
  readyProperties,
  pending,
  onViewScript,
}: {
  analyses: { id: AnalysisId; scopeLabels: string[] }[];
  readyEvents: TrackingEventId[];
  readyProperties: string[];
  pending: { id: TrackingEventId; neededFor: string[] }[];
  onViewScript: () => void;
}) {
  return (
    <>
      <LoggingIntro title="Final review" description="Check your analyses, tracking selections, and pending setup. You will approve each proposed change before anything is applied." />

      <Section label="Analyses">
        <div className={`${card} gap-4`}>
          {analyses.map((a) => (
            <div key={a.id} className="flex flex-col gap-0.5">
              <span className="text-body-default text-text-primary">{analysisById[a.id].label}</span>
              <span className="text-label-default text-text-secondary">{a.scopeLabels.join(" · ")}</span>
            </div>
          ))}
        </div>
      </Section>

      {readyEvents.length > 0 && (
        <>
          <Section label="Events & properties">
            <div className={`${card} gap-4`}>
              <div className="flex flex-col gap-2">
                <span className="text-label-default text-text-secondary">Events</span>
                <div className="flex flex-wrap gap-2">
                  {readyEvents.map((id) => (
                    <DataChip key={id}>{trackingItemById[id].label}</DataChip>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-label-default text-text-secondary">Properties</span>
                {readyProperties.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {readyProperties.map((p) => (
                      <DataChip key={p}>{p}</DataChip>
                    ))}
                  </div>
                )}
                <AutoRecordedNotice />
              </div>
            </div>
          </Section>

          <Section
            label="Script to be added"
            tip="A single logger GameCove adds to your game on the server. It only listens for the Ready-to-track events you kept on — your gameplay code stays the same."
          >
            <div className={`${card} gap-2`}>
              <span className="text-fs-16 font-bold leading-[1.6] text-text-primary">{observationScript.name}</span>
              <div className="flex items-center gap-2">
                <span className="flex h-6 items-center rounded-sm bg-bg-selected px-2 text-label-default text-text-primary">{observationScript.location}</span>
              </div>
              <div className="flex pt-2">
                <SmallButton onClick={onViewScript}>View script</SmallButton>
              </div>
            </div>
          </Section>
        </>
      )}

      {pending.length > 0 && (
        <Section label="Pending" tip="Events that need extra setup in your game code. They are saved as pending, and you can set them up any time from Tracking.">
          {pending.map((p) => (
            <div key={p.id} className={`${card} gap-1`}>
              <div className="flex items-center gap-2">
                <span className="flex size-4 items-center justify-center">
                  <Dot tone="pending" />
                </span>
                <span className="text-fs-16 font-bold leading-[1.6] text-text-primary">{trackingItemById[p.id].label}</span>
              </div>
              <p className="text-label-default text-text-secondary">Needed for {p.neededFor.join(" · ")}.</p>
            </div>
          ))}
        </Section>
      )}
    </>
  );
}
