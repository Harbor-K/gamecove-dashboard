import React, { useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Area, CartesianGrid, ComposedChart, Line, ReferenceDot, ReferenceLine, XAxis, YAxis } from "recharts";
import { InfoTooltip } from "../ui/InfoTooltip";
import { LOCALE } from "../../i18n/locale";

// Port of the repo's Figma `Chart / Line` (components/dashboard/line-chart.tsx, h283):
// Y axis w48, ticks 12px chart/label left-aligned, grid chart/grid, baseline text/secondary, plot top 9,
// X labels 16 below the baseline (first = start, last = end). Line 2px, area = chart/area/{primary|muted}-0…4.
// Data hover: vertical guide + dot on the line(s) + tooltip above:
//   date (secondary) / divider / ● name · value (Bold) / sub line / ▲ change vs prior day (up = positive, down = critical).
// The change is computed from the series itself (prior day's value); percent charts change in pp, others in %.
// Optional: value labels above every point (pointLabels) and an end label such as "N/A" (endLabel) — Figma Retention D1.

export type ChartSeries = {
  key: string;
  /** null = can't be calculated that day (line breaks, never drawn as 0) */
  values: (number | null)[];
  /** line colour token, e.g. --gc-chart-series-primary */
  stroke: string;
  area?: "primary" | "muted";
  /** name shown in the hover tooltip (● name · value) */
  name?: string;
};
export type HoverRow = { label?: string; value: string; sub?: string };

const AREA_STOPS = [0, 33, 62, 88, 100];
const TICK_COUNT = 5;
const PLOT_TOP = 9;
const Y_AXIS_W = 48;
const X_AXIS_H = 34;
const END_NOTE_ICON = 16;
const zoom = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--gc-zoom")) || 1;

const PRIOR_DAY = LOCALE === "ko" ? "전날 대비" : "prior day";
const PP = LOCALE === "ko" ? "%p" : "pp";
const trim = (n: number) => String(Number(n.toFixed(1)));

/** Change vs the prior day. null when either day can't be calculated or the prior day is 0 (no % from zero). */
function priorDayChange(values: (number | null)[], i: number, points: boolean): { dir: "up" | "down" | "flat"; label: string } | null {
  if (i <= 0) return null;
  const v = values[i];
  const p = values[i - 1];
  if (v === null || v === undefined || p === null || p === undefined) return null;
  const diff = points ? v - p : p === 0 ? null : ((v - p) / p) * 100;
  if (diff === null) return null;
  const rounded = Number(diff.toFixed(1));
  const dir = rounded > 0 ? "up" : rounded < 0 ? "down" : "flat";
  return { dir, label: `${trim(Math.abs(rounded))}${points ? PP : "%"}` };
}

/** Icon / triangle (same shape as the delta chip), 12px. */
function Triangle({ dir }: { dir: "up" | "down" }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0" style={dir === "down" ? { transform: "rotate(180deg)" } : undefined}>
      <path
        d="M6 16C5.81429 16 5.63225 15.9483 5.47427 15.8507C5.31629 15.753 5.18863 15.6133 5.10557 15.4472C5.02252 15.2811 4.98736 15.0952 5.00404 14.9102C5.02072 14.7252 5.08857 14.5486 5.2 14.4L11.2 6.4C11.2931 6.2758 11.4139 6.175 11.5528 6.10557C11.6916 6.03614 11.8448 6 12 6C12.1552 6 12.3084 6.03614 12.4472 6.10557C12.5861 6.175 12.7069 6.2758 12.8 6.4L18.8 14.4C18.9114 14.5486 18.9793 14.7252 18.996 14.9102C19.0126 15.0952 18.9775 15.2811 18.8944 15.4472C18.8114 15.6133 18.6837 15.753 18.5257 15.8507C18.3678 15.9483 18.1857 16 18 16H6Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function LineChart({
  labels,
  series,
  axisMax,
  formatTick,
  curve = "linear",
  height = 283,
  endNote,
  endLabel,
  pointLabels,
  hover,
}: {
  labels: string[];
  series: ChartSeries[];
  axisMax: number;
  formatTick: (v: number) => string;
  curve?: "linear" | "monotone";
  height?: number;
  /** ⓘ next to the point where the last day is N/A (D1 retention) */
  endNote?: string;
  /** text at the last day when it can't be calculated (e.g. "N/A"), drawn just above the baseline at the right edge */
  endLabel?: string;
  /** value label above every point + 8px dot (Figma Retention D1: 12 Bold text/primary) */
  pointLabels?: (v: number) => string;
  /** day index → tooltip rows (null = no hover that day) */
  hover?: (index: number) => { header: string; rows: HoverRow[] } | null;
}) {
  const id = useId().replace(/:/g, "");
  // __axis keeps the axis and grid drawn even when every value is null (D7)
  const data = labels.map((label, i) => ({ label, __axis: 0, ...Object.fromEntries(series.map((s) => [s.key, s.values[i]])) }));
  const ticks = Array.from({ length: TICK_COUNT + 1 }, (_, i) => (axisMax / TICK_COUNT) * i);
  const last = labels.length - 1;
  const before = series[0]?.values.slice(0, last).filter((v): v is number => v !== null);
  const lastValue = before?.length ? before[before.length - 1] : axisMax / 2;
  const endNoteY = lastValue > axisMax / 2 ? lastValue / 3 : lastValue / 2;
  /** Percent charts (retention) change in percentage points, counts and times in % (CLAUDE.md: D1 delta = pp). */
  const points = formatTick(axisMax).trim().endsWith("%");

  const boxRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    setWidth(el.offsetWidth);
    let t: ReturnType<typeof setTimeout> | undefined;
    const ro = new ResizeObserver(() => {
      clearTimeout(t);
      t = setTimeout(() => setWidth(el.offsetWidth), 120);
    });
    ro.observe(el);
    return () => {
      clearTimeout(t);
      ro.disconnect();
    };
  }, []);

  const [active, setActive] = useState<number | null>(null);
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null);
  const content = active !== null && hover ? hover(active) : null;
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!hover || !boxRef.current || last < 0) return;
    const rect = boxRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom();
    const i = last === 0 ? 0 : Math.round(((x - Y_AXIS_W) / (width - Y_AXIS_W)) * last);
    setActive(Math.min(Math.max(i, 0), last));
  };
  useLayoutEffect(() => {
    const box = boxRef.current;
    if (active === null || !content || !box) return setAnchor(null);
    const z = zoom();
    const dot = box.querySelector(".gc-hover-dot");
    if (dot) {
      const d = dot.getBoundingClientRect();
      setAnchor({ x: (d.left + d.width / 2) / z, y: d.top / z });
    } else {
      const r = box.getBoundingClientRect();
      const x = Y_AXIS_W + (last === 0 ? 0 : ((width - Y_AXIS_W) * active) / last);
      setAnchor({ x: r.left / z + x, y: r.top / z + (PLOT_TOP + height - X_AXIS_H) / 2 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, width, content === null]);

  /** Which series a tooltip row belongs to: labelled rows match the series key (New → new, PC → pc), else the top series. */
  const seriesFor = (row: HoverRow, i: number): ChartSeries | undefined => {
    if (row.label) {
      const k = row.label.toLowerCase();
      return series.find((s) => s.key.toLowerCase() === k || s.name?.toLowerCase() === k) ?? series[i];
    }
    return series[series.length - 1];
  };

  return (
    <div
      ref={boxRef}
      style={{ height }}
      className="w-full select-none [&_*:focus]:outline-none [&_svg.recharts-surface]:overflow-visible"
      onPointerMove={onPointerMove}
      onPointerLeave={() => setActive(null)}
    >
      {width > 0 && (
        <ComposedChart width={width} height={height} data={data} margin={{ top: PLOT_TOP, right: 0, bottom: 0, left: 0 }}>
          <defs>
            {(["primary", "muted"] as const).map((tone) => (
              <linearGradient key={tone} id={`${id}-${tone}`} x1="0" y1="0" x2="0" y2="1">
                {AREA_STOPS.map((offset, i) => (
                  <stop key={offset} offset={`${offset}%`} stopColor={`var(--gc-chart-area-${tone}-${i})`} />
                ))}
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid vertical={false} stroke="var(--gc-chart-grid)" strokeWidth={1} />
          <YAxis
            width={Y_AXIS_W}
            domain={[0, axisMax]}
            ticks={ticks}
            axisLine={false}
            tickLine={false}
            interval={0}
            tick={({ y, payload }: { y?: number | string; payload?: { value: number } }) => (
              <text x={0} y={Number(y)} dy={4} textAnchor="start" fill="var(--gc-chart-label)" style={{ fontSize: 12 }}>
                {formatTick(payload?.value ?? 0)}
              </text>
            )}
          />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            interval={0}
            height={X_AXIS_H}
            tick={({ x, y, payload, index }: { x?: number | string; y?: number | string; payload?: { value: string }; index?: number }) => (
              <text
                x={Number(x)}
                y={Number(y) + 16}
                dy={9}
                textAnchor={index === 0 ? "start" : index === last ? "end" : "middle"}
                fill="var(--gc-chart-label)"
                style={{ fontSize: 12 }}
              >
                {payload?.value}
              </text>
            )}
          />
          {/* Baseline (Figma Gridline 6: text/secondary) */}
          <ReferenceLine y={0} stroke="var(--gc-text-secondary)" strokeWidth={1} />
          {/* Hover guide: vertical line at the hovered day */}
          {content && active !== null && <ReferenceLine x={labels[active]} stroke="var(--gc-text-secondary)" strokeWidth={1} />}
          {series
            .filter((s) => s.area)
            .map((s) => (
              <Area
                key={`${s.key}-area`}
                type={curve}
                dataKey={s.key}
                stroke="none"
                fill={`url(#${id}-${s.area})`}
                fillOpacity={1}
                dot={false}
                activeDot={false}
                isAnimationActive={false}
              />
            ))}
          <Line dataKey="__axis" stroke="none" dot={false} activeDot={false} isAnimationActive={false} legendType="none" />
          {series.map((s) => (
            <Line
              key={s.key}
              type={curve}
              dataKey={s.key}
              stroke={`var(${s.stroke})`}
              strokeWidth={2}
              dot={pointLabels ? { r: 4, fill: `var(${s.stroke})`, stroke: "none" } : false}
              activeDot={false}
              isAnimationActive={false}
              label={
                pointLabels
                  ? ({ x, y, value }: { x?: number | string; y?: number | string; value?: number | null }) =>
                      value === null || value === undefined ? (
                        <g />
                      ) : (
                        <text x={Number(x)} y={Number(y) - 12} textAnchor="middle" fill="var(--gc-text-primary)" style={{ fontSize: 12, fontWeight: 700 }}>
                          {pointLabels(value)}
                        </text>
                      )
                  : undefined
              }
            />
          ))}
          {content &&
            active !== null &&
            series.flatMap((s, k) =>
              s.values[active] === null || s.values[active] === undefined
                ? []
                : [
                    <ReferenceDot key={`halo-${s.key}`} x={labels[active]} y={s.values[active]!} r={8} fill={`var(${s.stroke})`} fillOpacity={0.24} stroke="none" />,
                    <ReferenceDot
                      key={`dot-${s.key}`}
                      x={labels[active]}
                      y={s.values[active]!}
                      r={5}
                      fill={`var(${s.stroke})`}
                      stroke="none"
                      className={k === series.length - 1 ? "gc-hover-dot" : undefined}
                    />,
                  ],
            )}
          {endLabel && (
            <ReferenceDot
              x={labels[last]}
              y={axisMax * 0.08}
              shape={({ cx, cy }: { cx?: number; cy?: number }) => (
                <text x={Number(cx)} y={Number(cy)} dy={4} textAnchor="end" fill="var(--gc-chart-label)" style={{ fontSize: 12 }}>
                  {endLabel}
                </text>
              )}
            />
          )}
          {endNote && (
            <ReferenceDot
              x={labels[last]}
              y={endNoteY}
              shape={({ cx, cy }: { cx?: number; cy?: number }) => (
                <foreignObject
                  x={Math.min(Number(cx) - END_NOTE_ICON / 2, width - END_NOTE_ICON)}
                  y={Number(cy) - END_NOTE_ICON / 2}
                  width={END_NOTE_ICON}
                  height={END_NOTE_ICON}
                  className="overflow-visible"
                >
                  <InfoTooltip text={endNote} size={END_NOTE_ICON} strokeWidth={1.2} />
                </foreignObject>
              )}
            />
          )}
        </ComposedChart>
      )}
      {content &&
        anchor &&
        active !== null &&
        createPortal(
          <div
            role="tooltip"
            className="pointer-events-none fixed z-[100] flex w-0 flex-col items-center"
            style={{ left: anchor.x, top: anchor.y - 12, transform: "translateY(-100%)" }}
          >
            {/* Repo data tooltip surface: p16 radius 8, 1px border, shadow 0 4 12. The surface is light in both themes, so the
                secondary / positive / critical text uses the light tokens (data-theme="light"). */}
            <div className="flex w-max min-w-[180px] flex-col gap-2 rounded-md bg-bg-tooltip p-4 text-text-tooltip shadow-[inset_0_0_0_1px_var(--gc-border-tooltip),0_4px_12px_0_var(--gc-effect-shadow)]">
              <span data-theme="light" className="text-fs-14 leading-[1.5] text-text-secondary">
                {content.header}
              </span>
              <span data-theme="light" aria-hidden className="h-px w-full bg-border-default" />
              {content.rows.map((r, i) => {
                const s = seriesFor(r, i);
                const name = s?.name ?? r.label;
                const change = s ? priorDayChange(s.values, active, points) : null;
                return (
                  <div key={i} className="flex flex-col gap-1">
                    <span className="flex items-center gap-2 whitespace-nowrap text-fs-16 leading-[1.5]">
                      {s && <span aria-hidden className="size-3 shrink-0 rounded-full" style={{ background: `var(${s.stroke})` }} />}
                      {name && <span className="font-normal">{name}</span>}
                      {name && <span aria-hidden>·</span>}
                      <span className="font-bold">{r.value}</span>
                    </span>
                    {r.sub && (
                      <span data-theme="light" className="whitespace-nowrap text-fs-14 leading-[1.5] text-text-secondary">
                        {r.sub}
                      </span>
                    )}
                    {change && (
                      <span data-theme="light" className="flex items-center gap-1 whitespace-nowrap text-fs-14 leading-[1.5]">
                        {change.dir === "flat" ? (
                          <span className="text-text-secondary">– {change.label}</span>
                        ) : (
                          <span className={`flex items-center gap-1 ${change.dir === "up" ? "text-text-positive" : "text-text-critical"}`}>
                            <Triangle dir={change.dir} />
                            {change.label}
                          </span>
                        )}
                        <span className="text-text-secondary">{PRIOR_DAY}</span>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

/** Figma `Chart / Legend item` (Swatch=Line): 20×2 line + 14 secondary, gap 8; items 24 apart, centred. */
export function ChartLegend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-2">
          <span aria-hidden className="h-0.5 w-5 rounded-sm" style={{ background: `var(${item.color})` }} />
          <span className="text-label-default text-text-secondary">{item.label}</span>
        </span>
      ))}
    </div>
  );
}
