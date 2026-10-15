import React, { useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft } from "lucide-react";
import { CardHeader, CardShell } from "../dashboard/CardHeader";
import { CohortRetentionCard } from "../dashboard/CohortRetentionCard";
import { ChartLegend, LineChart, type ChartSeries, type HoverRow } from "../dashboard/LineChart";
import { NewReturningCard } from "../dashboard/LineChartCard";
import { chartDays, newUsers, returningUsers, trafficSourceLabels, trafficSources } from "../../data/dashboard";
import {
  areaLabels,
  categoryChipLabels,
  categoryColors,
  categoryLabels,
  defaultArea,
  takesBreakdown,
  type AreaId,
  type BreakdownKey,
  type Category,
  type ExploreMetric,
  type ExploreSlice,
} from "../../data/explore";
import { exploreData } from "../../data/explore-data";
import { LOCALE } from "../../i18n/locale";

// One card per metric, drawn from the Explore dataset with the page Breakdown (repo MetricCard).
// Breakdown on: a line per category (no area fill, no headline), half-height bars per category for bars.
// Filter (one category): the trend cards draw only that category's line (from the same dataset's category series).

const PRIMARY = "--gc-chart-series-primary";
const tick = (v: number) => String(Number(v.toFixed(2)));
const pctTick = (v: number) => `${Number(v.toFixed(2))}%`;
const fixed = (v: number | null, d = 1) => (v === null ? "N/A" : v.toFixed(d));
const toMinutesLabel = (h: number) => {
  const m = Math.round(h * 60);
  return `${Math.floor(m / 60)}h ${m % 60}m`;
};
const zoom = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--gc-zoom")) || 1;

/** Repo app/breakdown-colors.css (category colours for both themes). */
export function BreakdownColorStyles() {
  return (
    <style>{`
:root,[data-theme="dark"]{--gc-chart-breakdown-mobile:#3898f8;--gc-chart-breakdown-pc:#2fbfa0;--gc-chart-breakdown-tablet:#f2a541;--gc-chart-breakdown-console:#b283f5;--gc-chart-breakdown-new:#3898f8;--gc-chart-breakdown-returning:#f2a541}
[data-theme="light"]{--gc-chart-breakdown-mobile:#007dfa;--gc-chart-breakdown-pc:#0f9a7d;--gc-chart-breakdown-tablet:#d98a1f;--gc-chart-breakdown-console:#8b5cd6;--gc-chart-breakdown-new:#007dfa;--gc-chart-breakdown-returning:#d98a1f}
@media (prefers-color-scheme: light){[data-theme="system"]{--gc-chart-breakdown-mobile:#007dfa;--gc-chart-breakdown-pc:#0f9a7d;--gc-chart-breakdown-tablet:#d98a1f;--gc-chart-breakdown-console:#8b5cd6;--gc-chart-breakdown-new:#007dfa;--gc-chart-breakdown-returning:#d98a1f}}`}</style>
  );
}

/** Figma `Chart / Legend item` Swatch=Bar: 12px square radius 4 + 14 secondary, gap 8; items 24 apart, start aligned. */
function BarLegend({ categories }: { categories: Category[] }) {
  return (
    <div className="flex flex-wrap items-center gap-6">
      {categories.map((c) => (
        <span key={c} className="flex items-center gap-2">
          <span aria-hidden className="size-3 rounded-sm" style={{ background: `var(${categoryColors[c]})` }} />
          <span className="text-label-default text-text-secondary">{categoryLabels[c]}</span>
        </span>
      ))}
    </div>
  );
}

/** Breakdown bars: 18px bar per category (half of 36), gap 4. */
function BreakdownBars({ bars }: { bars: { category: Category; value: number | null }[] }) {
  return (
    <span className="flex min-w-0 flex-1 flex-col gap-1">
      {bars.map((b) => (
        <span key={b.category} className="relative h-[18px] rounded-sm bg-chart-bar-track">
          {b.value !== null && <span className="absolute inset-y-0 left-0 rounded-sm" style={{ width: `${b.value}%`, background: `var(${categoryColors[b.category]})` }} />}
        </span>
      ))}
    </span>
  );
}

/** Data hover tooltip (label · value rows) under the hovered bar. */
function HoverBox({ rows, children, className }: { rows: [string, string][]; children: ReactNode; className: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  return (
    <span
      ref={ref}
      className={className}
      onPointerMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (r) setPos({ x: e.clientX / zoom(), y: r.bottom / zoom() + 8 });
      }}
      onPointerLeave={() => setPos(null)}
    >
      {children}
      {pos &&
        createPortal(
          <div role="tooltip" className="pointer-events-none fixed z-[100] flex w-0 justify-center" style={{ left: pos.x, top: pos.y }}>
            <div className="grid w-max grid-cols-[auto_auto] gap-x-3 gap-y-1 rounded-md bg-bg-tooltip px-3 py-2 text-label-default text-text-tooltip shadow-[0_4px_12px_0_var(--gc-effect-shadow)]">
              {rows.map(([k, v]) => (
                <React.Fragment key={k}>
                  <span className="opacity-70">{k}</span>
                  <span className="font-bold">{v}</span>
                </React.Fragment>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </span>
  );
}

/** Selected / hovered row layer (12 / 4 bleed, radius 8). */
function RowLayer({ show }: { show: boolean }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute -inset-x-3 -inset-y-1 rounded-md bg-data-select-row transition-opacity ${show ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
    />
  );
}

/** Session exit rate (repo BarListCard): rows Lobby…Stage 4, highest = series primary, others bar default. */
export function ExitRateCard({ breakdown, selected, onSelect }: { breakdown: BreakdownKey; selected: AreaId | null; onSelect: (a: AreaId | null) => void }) {
  const rows = exploreData[breakdown].exitRate;
  const max = Math.max(...rows.map((r) => r.rate ?? 0));
  const cats = rows[0]?.breakdown?.map((b) => b.category) ?? null;
  return (
    <CardShell className="gap-10 p-8">
      <CardHeader title="Session exit rate" info="Share of sessions that ended in this area among sessions that visited it" cardFilters />
      {cats && <BarLegend categories={cats} />}
      <div className="grid grid-cols-[minmax(4rem,max-content)_minmax(0,1fr)_auto] gap-x-4 gap-y-6">
        {rows.map((r) => {
          const isSel = r.area === selected;
          return (
            <button
              key={r.area}
              type="button"
              aria-pressed={isSel}
              onClick={() => onSelect(isSel ? null : r.area)}
              className={`group relative col-span-3 grid grid-cols-subgrid items-center text-left cursor-pointer ${r.breakdown ? "min-h-9" : "h-9"}`}
            >
              <RowLayer show={isSel} />
              <span className={`relative whitespace-nowrap text-fs-16 leading-[1.5] ${isSel ? "text-text-primary" : "text-text-secondary group-hover:text-text-primary"}`}>
                {areaLabels[r.area]}
              </span>
              {r.breakdown ? (
                <BreakdownBars bars={r.breakdown.map((b) => ({ category: b.category, value: b.rate }))} />
              ) : (
                <HoverBox
                  className="relative h-9 min-w-0 flex-1 rounded-md bg-chart-bar-track"
                  rows={[
                    ["Visit", String(r.visits)],
                    ["Exit", String(r.exits)],
                    ["Rate", `${fixed(r.rate)}%`],
                  ]}
                >
                  {r.rate !== null && (
                    <span className={`absolute inset-y-0 left-0 rounded-md ${r.rate === max ? "bg-chart-series-primary" : "bg-chart-bar-default"}`} style={{ width: `${r.rate}%` }} />
                  )}
                </HoverBox>
              )}
              <span className="relative w-14 shrink-0 text-fs-16 leading-[1.6] text-text-primary">{fixed(r.rate)}%</span>
            </button>
          );
        })}
      </div>
    </CardShell>
  );
}

/** Session flow (repo FlowCard). Accordion under Exit rate = back bar; standalone = caption names the place. */
export function SessionFlowCard({ breakdown, area, onBack }: { breakdown: BreakdownKey; area: AreaId; onBack?: () => void }) {
  const flow = exploreData[breakdown].flow[area];
  const cats = flow.destinations[0]?.breakdown?.map((b) => b.category) ?? null;
  return (
    <CardShell className="overflow-hidden">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="flex h-10 w-full items-center gap-1 px-6 text-left text-label-default text-text-primary shadow-[inset_0_-1px_0_var(--gc-border-default)] cursor-pointer hover:bg-bg-hover"
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          {areaLabels[area]}
        </button>
      )}
      <div className="flex flex-col gap-10 p-8" style={{ animation: "gc-fade-in 220ms ease-out both" }}>
        <CardHeader title="Session flow" info="Next destination after each session’s last visit to the selected area" />
        {cats && <BarLegend categories={cats} />}
        <div className="relative flex flex-col">
          <div className="flex flex-col gap-1">
            <span className="text-fs-14 leading-[1.5] text-text-secondary">{onBack ? "Visit sessions" : `Sessions visiting ${areaLabels[area]}`}</span>
            <span className="text-[32px] font-bold leading-[48px] text-text-primary">{flow.visitSessions}</span>
          </div>
          <div className="absolute right-0 top-[67px] flex gap-4 text-fs-14 leading-[1.5] text-text-secondary">
            <span className="w-14 text-right">Sessions</span>
            {/* "Share" is also the board's Share button (공유) — this one means 비율 */}
            <span data-no-translate className="w-16 text-right">{LOCALE === "ko" ? "비율" : "Share"}</span>
          </div>
          <div className="relative mt-[27px] flex flex-col gap-3 pl-12">
            <span aria-hidden className="absolute -top-[19px] bottom-[18px] left-3 w-[1.5px] bg-chart-flow-line" />
            {flow.destinations.map((d, i) => {
              const end = d.to === "session_end";
              const fill = end ? "bg-chart-series-primary" : i <= 1 ? "bg-chart-bar-emphasis" : "bg-chart-bar-default";
              return (
                <div key={d.to} className={`relative flex items-center gap-4 ${d.breakdown ? "min-h-9" : "h-9"}`}>
                  <span aria-hidden className="absolute -left-9 top-1/2 h-[1.5px] w-6 -translate-y-1/2 bg-chart-flow-line" />
                  <span className={`w-40 shrink-0 truncate text-fs-16 leading-[1.5] text-text-primary ${end ? "font-bold" : ""}`}>{areaLabels[d.to]}</span>
                  {d.breakdown ? (
                    <BreakdownBars bars={d.breakdown.map((b) => ({ category: b.category, value: b.share }))} />
                  ) : (
                    <span className="relative h-9 min-w-0 flex-1 rounded-md bg-chart-bar-track">
                      <span className={`absolute inset-y-0 left-0 rounded-md ${fill}`} style={{ width: `${d.share}%` }} />
                    </span>
                  )}
                  <span className={`w-14 shrink-0 text-right text-fs-16 leading-[1.5] text-text-primary ${end ? "font-bold" : ""}`}>{d.sessions}</span>
                  <span className={`w-16 shrink-0 text-right text-fs-16 leading-[1.5] ${end ? "font-bold text-text-primary" : "text-text-secondary"}`}>{fixed(d.share)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </CardShell>
  );
}

/** Exit rate + Session flow accordion (24 apart). The selected place's flow opens under it. */
function ExitRateWithFlow({ breakdown, selection }: { breakdown: BreakdownKey; selection: AreaId | null }) {
  const [area, setArea] = useState<AreaId | null>(selection ?? defaultArea);
  return (
    <div className="flex w-full flex-col gap-6">
      <ExitRateCard breakdown={breakdown} selected={area} onSelect={setArea} />
      {area && <SessionFlowCard key={`${area}-${breakdown}`} breakdown={breakdown} area={area} onBack={() => setArea(null)} />}
    </div>
  );
}

// ── Line metrics ──
type LineDef = { title: string; info: string; legend: string; caption: string; axisMax: number; percent?: boolean; curve?: "linear" | "monotone"; unit: (v: number) => string };
type LineSeries = { category: Category | null; values: (number | null)[] }[];
type LineKey = "dau" | "playtimeAverage" | "playtimeTotal" | "sessionsPerUser" | "sessionsTotal" | "sessionTime" | "d1" | "d7";
type Extra = {
  segmented?: { options: string[]; value: string; onChange: (v: string) => void };
  endNote?: string;
  skipLastHover?: boolean;
  onExplore?: () => void;
  /** " · Mobile" when a filter is on */
  legendSuffix?: string;
};

/** Metrics whose card can show one category (Filter by). Bars / tables / cohorts don't take it yet. */
const FILTER_METRICS: ExploreMetric[] = ["dailyActiveUsers", "playtime", "sessions", "sessionTime", "d1Retention", "d7Retention"];
export const takesFilter = (m: ExploreMetric) => FILTER_METRICS.includes(m);
/** Which dataset slice holds a category's own series. */
const dimensionOf = (c: Category): Exclude<BreakdownKey, "none"> => (c === "new" || c === "returning" ? "visitType" : "device");

function lineCard(series: LineSeries, def: LineDef, extra: Extra = {}) {
  const broken = series.length > 1 || series[0]?.category != null;
  const chart: ChartSeries[] = broken
    ? series.map((s) => ({ key: s.category!, values: s.values, stroke: categoryColors[s.category!], name: categoryLabels[s.category!] }))
    : [{ key: "value", values: series[0].values, stroke: PRIMARY, area: "primary", name: `${def.legend}${extra.legendSuffix ?? ""}` }];
  const last = series[0].values[series[0].values.length - 1];
  const headlineValue = def.percent ? series[0].values.slice().reverse().find((v) => v !== null) ?? null : last;
  const hover = (i: number): { header: string; rows: HoverRow[] } | null => {
    if (extra.skipLastHover && i === chartDays.length - 1) return null;
    if (!broken) {
      const v = series[0].values[i];
      return { header: chartDays[i], rows: [{ value: v === null ? "N/A" : def.unit(v) }] };
    }
    return { header: chartDays[i], rows: series.map((s) => ({ label: categoryLabels[s.category!], value: s.values[i] === null ? "N/A" : def.unit(s.values[i]!) })) };
  };
  // Own frame (same as LineChartCard: p32 gap28 / top gap16 / chart block gap24) so the headline can drop with Breakdown on
  const headline = broken ? null : headlineValue === null ? "N/A" : def.unit(headlineValue);
  return (
    <CardShell className="gap-7 p-8">
      <div className="flex flex-col gap-4">
        <CardHeader title={def.title} info={def.info} segmented={extra.segmented} onExplore={extra.onExplore} />
        {headline !== null && (
          <div className="flex flex-col gap-1">
            <span className="text-label-default text-text-secondary">{def.caption}</span>
            <span className="text-[32px] font-bold leading-[1.5] text-text-primary">{headline}</span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-6">
        <LineChart
          labels={chartDays}
          series={chart}
          axisMax={def.axisMax}
          formatTick={def.percent ? pctTick : tick}
          curve={def.curve}
          endNote={broken ? undefined : extra.endNote}
          hover={hover}
        />
        <ChartLegend
          items={
            broken
              ? series.map((s) => ({ label: categoryLabels[s.category!], color: categoryColors[s.category!] }))
              : [{ label: `${def.legend}${extra.legendSuffix ?? ""}`, color: PRIMARY }]
          }
        />
      </div>
    </CardShell>
  );
}

type Pick = (key: LineKey) => LineSeries;

function PlaytimeCard({ pick, extra }: { pick: Pick; extra: Extra }) {
  const [mode, setMode] = useState("Average");
  const avg = mode === "Average";
  return lineCard(
    pick(avg ? "playtimeAverage" : "playtimeTotal"),
    {
      title: avg ? "Average Playtime" : "Total playtime",
      info: "Average — Average playtime per active player\nTotal — Playtime across all sessions that day",
      legend: avg ? "Avg. playtime" : "Total playtime",
      caption: "Today (Sep 22)",
      axisMax: avg ? 25 : 100,
      unit: avg ? (v) => `${v.toFixed(1)} min` : (v) => toMinutesLabel(v),
    },
    { ...extra, segmented: { options: ["Average", "Total"], value: mode, onChange: setMode } },
  );
}

function SessionsCard({ pick, extra }: { pick: Pick; extra: Extra }) {
  const [mode, setMode] = useState("Per user");
  const per = mode === "Per user";
  return lineCard(
    pick(per ? "sessionsPerUser" : "sessionsTotal"),
    {
      title: "Sessions",
      info: "Per user — Average sessions per active player\nTotal — All sessions that day",
      legend: per ? "Sessions per user" : "Total sessions",
      caption: "Today (Sep 22)",
      axisMax: per ? 2.5 : 500,
      unit: per ? (v) => `${v.toFixed(1)} sessions` : (v) => `${Math.round(v)} sessions`,
    },
    { ...extra, segmented: { options: ["Per user", "Total"], value: mode, onChange: setMode } },
  );
}

function NewAndReturning({ onExplore }: { onExplore?: () => void }) {
  const [visit, setVisit] = useState("New");
  const sel = visit === "New" ? "new" : "returning";
  const other = sel === "new" ? "returning" : "new";
  const nr = { new: newUsers, returning: returningUsers };
  return (
    <NewReturningCard
      title="New and returning users"
      info={"New — Players playing for the first time that day\nReturning — Players who have played before"}
      caption="Today (Sep 22)"
      headline={`${nr[sel][6]} users`}
      labels={chartDays}
      series={[
        { key: other, values: nr[other], stroke: "--gc-chart-context-secondary", area: "muted", name: other === "new" ? "New" : "Returning" },
        { key: sel, values: nr[sel], stroke: PRIMARY, area: "primary", name: sel === "new" ? "New" : "Returning" },
      ]}
      axisMax={250}
      formatTick={tick}
      legend={[
        { label: "New users", color: sel === "new" ? PRIMARY : "--gc-chart-context-secondary" },
        { label: "Returning users", color: sel === "returning" ? PRIMARY : "--gc-chart-context-secondary" },
      ]}
      curve="monotone"
      hover={(i) => ({ header: chartDays[i], rows: [{ label: "New", value: `${newUsers[i]} users` }, { label: "Returning", value: `${returningUsers[i]} users` }] })}
      segmented={{ options: ["New", "Returning"], value: visit, onChange: setVisit }}
      onExplore={onExplore}
      trafficTitle="Traffic sources"
      trafficInfo="Share of players by acquisition source within the selected New or Returning group"
      traffic={trafficSources[sel].map((s) => ({ id: s.id, label: trafficSourceLabels[s.id], share: s.share, value: `${Math.round(s.share)}%` }))}
    />
  );
}

/**
 * The card for a metric (+ selection). Breakdown is ignored by cards that don't take it (repo PD-01 / PD-07).
 * `filter` (one category) applies to the trend cards only (takesFilter); it is used instead of Breakdown.
 */
export function MetricCard({
  metric,
  selection,
  breakdown: pageBreakdown,
  filter = null,
  onExplore,
}: {
  metric: ExploreMetric;
  selection: AreaId | null;
  breakdown: BreakdownKey;
  filter?: Category | null;
  onExplore?: () => void;
}) {
  const breakdown = takesBreakdown(metric) ? pageBreakdown : "none";
  const useFilter = !!filter && takesFilter(metric);
  const pick: Pick = (key) => {
    if (useFilter) {
      const own = (exploreData[dimensionOf(filter!)] as ExploreSlice)[key].filter((s) => s.category === filter);
      if (own.length) return own.map((s) => ({ category: null, values: s.values }));
    }
    return exploreData[breakdown][key];
  };
  const extra: Extra = { onExplore, legendSuffix: useFilter ? ` · ${categoryChipLabels[filter!]}` : undefined };
  switch (metric) {
    case "dailyActiveUsers":
      return lineCard(
        pick("dau"),
        {
          title: "Daily active users",
          info: "Unique players who played at least once on each day",
          legend: "Daily active users",
          caption: "Today (Sep 22)",
          axisMax: 500,
          unit: (v) => `${Math.round(v)} users`,
        },
        extra,
      );
    case "playtime":
      return <PlaytimeCard pick={pick} extra={extra} />;
    case "sessions":
      return <SessionsCard pick={pick} extra={extra} />;
    case "sessionTime":
      return lineCard(
        pick("sessionTime"),
        {
          title: "Average session time",
          info: "Average duration of one session. Total session time is divided by the number of sessions",
          legend: "Avg. session time",
          caption: "Today (Sep 22)",
          axisMax: 25,
          unit: (v) => `${v.toFixed(1)} min`,
        },
        extra,
      );
    case "newAndReturning":
      return <NewAndReturning onExplore={onExplore} />;
    case "d1Retention":
      return lineCard(
        pick("d1"),
        {
          title: "Day 1 retention",
          info: "Share of new players who return the next calendar day",
          legend: "Day 1 retention",
          caption: "Latest cohort (Sep 21)",
          axisMax: 50,
          percent: true,
          curve: "monotone",
          unit: (v) => `${v.toFixed(1)}%`,
        },
        { ...extra, endNote: "Sep 22 D1 retention isn’t available yet", skipLastHover: true },
      );
    case "d7Retention":
      return lineCard(
        pick("d7"),
        {
          title: "Day 7 retention",
          info: "Share of new players who return 7 calendar days after first play",
          legend: "Day 7 retention",
          caption: "Latest cohort",
          axisMax: 10,
          percent: true,
          curve: "monotone",
          unit: (v) => `${v.toFixed(1)}%`,
        },
        extra,
      );
    case "dateCohortRetention":
      return <CohortRetentionCard onExplore={onExplore} />;
    case "exitRate":
      return <ExitRateWithFlow breakdown={breakdown} selection={selection} />;
    case "sessionFlow":
      return <SessionFlowCard breakdown={breakdown} area={selection ?? defaultArea} />;
  }
}
