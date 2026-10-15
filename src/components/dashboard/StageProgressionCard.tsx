import React, { useState } from "react";
import { TriangleAlert } from "lucide-react";
import { funnelStepLabels, stageProgression } from "../../data/dashboard";
import { funnelRows, pct } from "../../utils/funnel";
import { InfoTooltip } from "../ui/InfoTooltip";
import { CardHeader, CardShell } from "./CardHeader";

function Hatch({ strong = false, small = false }: { strong?: boolean; small?: boolean }) {
  const color = strong ? "var(--gc-chart-series-exit)" : "var(--gc-chart-funnel-dropped-stripe)";
  const [line, period] = small ? [1.5, 3.5] : [3.5, 10];
  return (
    <span
      aria-hidden
      className="absolute inset-0"
      style={{
        opacity: strong ? 0.3 : small ? 0.6 : 0.4,
        backgroundImage: `repeating-linear-gradient(-45deg, ${color} 0 ${line}px, transparent ${line}px ${period}px)`,
      }}
    />
  );
}

function LegendSwatch({ label, dropped = false }: { label: string; dropped?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <span className={`relative size-3 overflow-hidden rounded-sm ${dropped ? "bg-chart-funnel-dropped" : "bg-chart-bar-default"}`}>{dropped && <Hatch small />}</span>
      <span className="text-fs-14 leading-[1.5] text-text-secondary">{label}</span>
    </span>
  );
}

const kpiInfo = {
  clear: "Share of players who entered the stage and cleared it in the selected period.",
  time: "Average active playtime from first stage entry to first clear, including failed attempts.",
  failures: "Average number of failed attempts before the first clear.",
};

/** Stage progression: stage tabs → KPI summary → progression funnel (biggest drop-off highlighted). */
export function StageProgressionCard({ onExplore }: { onExplore?: (question: string) => void }) {
  const [stage, setStage] = useState(2);
  const data = stageProgression.find((s) => s.stage === stage)!;
  const rows = funnelRows(data.users);
  const maxDropLabel = funnelStepLabels[Math.max(0, rows.findIndex((r) => r.isMaxDrop))];
  const kpis = [
    { label: "Clear rate", value: data.clearRate, info: kpiInfo.clear },
    { label: "Avg. first-clear time", value: data.firstClearTime, info: kpiInfo.time },
    { label: "Avg. failures to first clear", value: data.failuresToClear, info: kpiInfo.failures },
  ];

  return (
    <CardShell className="gap-11 p-8">
      <div className="flex flex-col gap-3">
        <CardHeader
          title="Stage progression"
          info="Unique players who entered the stage, earned each star, and cleared it in the selected period. The step with the biggest drop-off is highlighted."
          cardFilters
          onExplore={() => onExplore?.(`Why do players drop at ${maxDropLabel}?`)}
        />
        <div role="tablist" className="flex shadow-[inset_0_-1px_0_var(--gc-border-default)]">
          {stageProgression.map((s) => {
            const sel = s.stage === stage;
            return (
              <button
                key={s.stage}
                type="button"
                role="tab"
                aria-selected={sel}
                onClick={() => setStage(s.stage)}
                className={`flex h-12 w-24 items-center justify-center text-fs-16 leading-[1.5] cursor-pointer ${
                  sel ? "text-text-primary shadow-[inset_0_-2px_0_var(--gc-icon-primary)]" : "text-text-secondary hover:text-text-primary"
                }`}
              >
                Stage {s.stage}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-[52px]">
        <div className="flex items-center gap-5">
          {kpis.map((k, i) => (
            <div key={k.label} className="flex items-center gap-5">
              {i > 0 && <span aria-hidden className="h-14 w-px bg-bg-subtle" />}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <span className="flex items-center gap-1 text-label-default text-text-secondary">
                    {k.label}
                    <InfoTooltip text={k.info} size={13} />
                  </span>
                  <span className="text-[40px] font-bold leading-[1.5] text-text-primary">{k.value}</span>
                </div>
                <span className="text-caption-default text-text-secondary">— No comparison data</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-6">
            <h3 className="text-[18px] font-bold leading-[1.5] text-text-primary">Progression funnel</h3>
            <div className="flex items-center gap-6">
              <LegendSwatch label="Reached" />
              <LegendSwatch label="Dropped" dropped />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <div className="flex text-label-default text-text-secondary">
                <span className="w-[216px] shrink-0">Step</span>
                <span className="flex-1" />
                <span className="w-28 shrink-0 text-right">Users</span>
                <span className="w-[152px] shrink-0 text-right">Drop-off</span>
              </div>
              <div className="h-px w-full bg-bg-subtle" />
            </div>
            <div className="flex flex-col gap-4">
              {rows.map((r, i) => {
                const dropped = r.previousReach - r.reachRate;
                return (
                  <div key={funnelStepLabels[i]} className="flex h-9 items-center">
                    <span className={`w-[216px] shrink-0 text-fs-16 leading-[1.5] text-text-primary ${r.isMaxDrop ? "font-bold" : ""}`}>{funnelStepLabels[i]}</span>
                    <span className="relative flex h-9 min-w-0 flex-1 overflow-hidden rounded-md bg-chart-bar-track">
                      <span
                        className={`flex h-full shrink-0 items-center justify-end bg-chart-bar-default pr-3 transition-[width] duration-300 ease-out ${dropped > 0 ? "rounded-l-md" : "rounded-md"}`}
                        style={{ width: `${r.reachRate}%` }}
                      >
                        <span className="whitespace-nowrap text-fs-14 leading-[1.5] text-text-primary">{pct(r.reachRate)}</span>
                      </span>
                      {dropped > 0 && (
                        <span className="relative h-full shrink-0 overflow-hidden rounded-r-md bg-chart-funnel-dropped" style={{ width: `${dropped}%` }}>
                          <Hatch strong={r.isMaxDrop} />
                        </span>
                      )}
                    </span>
                    <span className={`w-28 shrink-0 text-right text-fs-16 leading-[1.5] ${r.isMaxDrop ? "font-bold text-text-primary" : "text-text-secondary"}`}>{r.users}</span>
                    <span className="flex w-[152px] shrink-0 items-center justify-end gap-1 text-fs-16 leading-[1.5]">
                      {r.dropOff === null ? (
                        <span className="text-text-secondary">–</span>
                      ) : r.isMaxDrop ? (
                        <>
                          <TriangleAlert size={14} strokeWidth={1.8} className="shrink-0 text-text-critical" />
                          <span className="font-bold text-text-critical">{pct(r.dropOff)}</span>
                        </>
                      ) : (
                        <span className="text-text-primary">{pct(r.dropOff)}</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </CardShell>
  );
}
