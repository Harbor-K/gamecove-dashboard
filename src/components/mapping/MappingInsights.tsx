import React from "react";
import { InfoTooltip } from "../ui/InfoTooltip";
import { LineChartIcon } from "../icons/MappingIcons";
import { comparisonInsights, ws, type ComparisonMetric } from "../../data/mapping-workspace";

function ComparisonBar({ metric }: { metric: ComparisonMetric }) {
  const max = Math.max(metric.ours.value, metric.cohort.value, 1);
  const ourWidth = Math.max((metric.ours.value / max) * 100, 8);
  const cohortWidth = Math.max((metric.cohort.value / max) * 100, 8);
  const direction = metric.direction === "higherIsBetter" ? metric.ours.value - metric.cohort.value : metric.cohort.value - metric.ours.value;
  const isPositive = direction >= 0;

  return (
    <article className="flex flex-col gap-3 rounded-lg bg-bg-canvas p-4 ring-1 ring-inset ring-border-default">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-1">
          <h3 className="text-label-default font-bold text-text-primary">{metric.label}</h3>
          <InfoTooltip text={metric.definition} size={14} />
        </div>
        <span className={`shrink-0 text-caption-default font-bold ${isPositive ? "text-text-positive" : "text-status-pending"}`}>
          {metric.delta}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <MetricRow label={ws.ourGame} value={metric.ours.label} width={ourWidth} tone="ours" />
        <MetricRow label={ws.similarCohort} value={metric.cohort.label} width={cohortWidth} tone="cohort" />
      </div>
    </article>
  );
}

function MetricRow({ label, value, width, tone }: { label: string; value: string; width: number; tone: "ours" | "cohort" }) {
  return (
    <div className="grid grid-cols-[104px_minmax(0,1fr)_auto] items-center gap-2">
      <span className="truncate text-caption-default text-text-secondary">{label}</span>
      <span className="h-2 overflow-hidden rounded-full bg-chart-bar-track">
        <span className={`block h-full rounded-full ${tone === "ours" ? "bg-chart-bar-accent" : "bg-chart-bar-default"}`} style={{ width: `${width}%` }} />
      </span>
      <span className="w-[48px] text-right text-caption-default text-text-primary">{value}</span>
    </div>
  );
}

/** Simulated comparison context; never presents a benchmark as connected external telemetry. */
export function MappingInsights({ onSelectSection }: { onSelectSection: (sectionId: string) => void }) {
  return (
    <div className="flex flex-col gap-6 px-6 pb-6 pt-4" role="tabpanel" id="mapping-insights-panel" aria-labelledby="mapping-insights-tab">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-md bg-bg-ai-subtle text-icon-ai">
            <LineChartIcon />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <h2 className="text-body-default font-bold text-text-primary">{ws.insightsTitle}</h2>
            <p className="text-label-default text-text-secondary">{ws.insightsHint}</p>
          </div>
        </div>
        <div className="rounded-md bg-bg-pending-subtle px-3 py-2 text-caption-default text-status-pending ring-1 ring-inset ring-border-pending-subtle">
          {ws.sampleDataNotice}
        </div>
      </div>

      <section className="flex flex-col gap-3" aria-labelledby="comparison-context-title">
        <div className="flex items-center gap-1">
          <h3 id="comparison-context-title" className="text-label-default font-bold text-text-primary">
            {ws.comparisonContext}
          </h3>
          <InfoTooltip text={ws.matchCriteriaTip} size={14} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {comparisonInsights.context.map((item) => (
            <div key={item.label} className="flex min-h-16 flex-col gap-1 rounded-md bg-bg-canvas p-3 ring-1 ring-inset ring-border-default">
              <span className="text-caption-default text-text-secondary">{item.label}</span>
              <span className="text-label-default font-bold text-text-primary">{item.value}</span>
            </div>
          ))}
        </div>
        <p className="text-caption-default text-text-secondary">{comparisonInsights.contextNote}</p>
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="benchmark-title">
        <div className="flex items-center gap-1">
          <h3 id="benchmark-title" className="text-label-default font-bold text-text-primary">
            {ws.benchmarkComparison}
          </h3>
          <InfoTooltip text={ws.benchmarkTip} size={14} />
        </div>
        <div className="flex flex-col gap-3">
          {comparisonInsights.metrics.map((metric) => (
            <ComparisonBar key={metric.id} metric={metric} />
          ))}
        </div>
        <p className="text-caption-default text-text-secondary">{comparisonInsights.cohortNote}</p>
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="observations-title">
        <h3 id="observations-title" className="text-label-default font-bold text-text-primary">
          {ws.observations}
        </h3>
        <div className="flex flex-col gap-2">
          {comparisonInsights.observations.map((observation) => (
            <div key={observation.id} className="flex flex-col gap-2 rounded-md bg-bg-surface p-4 ring-1 ring-inset ring-border-default">
              <div className="flex items-start gap-2">
                <span aria-hidden className={`mt-1.5 size-1.5 shrink-0 rounded-full ${observation.tone === "attention" ? "bg-status-pending" : "bg-text-accent"}`} />
                <p className="text-label-default text-text-primary">{observation.text}</p>
              </div>
              {observation.sectionId && (
                <button
                  type="button"
                  onClick={() => onSelectSection(observation.sectionId!)}
                  className="w-fit rounded-md px-2 py-1 text-caption-default text-text-accent cursor-pointer hover:bg-bg-hover"
                >
                  {ws.viewSection(observation.sectionName)}
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
