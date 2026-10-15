import React, { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight } from "lucide-react";
import { CardHeader, CardShell } from "../dashboard/CardHeader";
import { DeltaChip } from "../dashboard/DeltaChip";
import { InfoTooltip } from "../ui/InfoTooltip";
import { LOCALE } from "../../i18n/locale";
import type { AttentionTarget, Kpi, StageRow } from "../../data/analytics";
import { chartHowTo, flowBandTip, flowNodeDrop, flowNodeTip, funnelTip, type Tip } from "../../data/analytics-tips";
import { flows as flowData, funnel as funnelData, stageTableCopy } from "../../data/analytics";

// Cards for Overview (summary) · Retention · Explore (investigate) — Figma Page 18.
// Every value comes in through props from data/analytics.ts; nothing is computed or written here.

const vsLastWeek = LOCALE === "ko" ? "지난주 대비" : "vs last week";
const noComparison = LOCALE === "ko" ? "— 비교 데이터 없음" : "— No comparison data";

const zoom = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--gc-zoom")) || 1;
const TIP_GAP = 14;
const TIP_EDGE = 8;

/**
 * Data hover tip that follows the cursor (same surface as the line chart tooltip: p16 radius 8, 1px border, shadow).
 * The surface is light in both themes, so secondary / critical / hint text uses the light tokens.
 */
function DataTip({ tip, at }: { tip: Tip; at: { x: number; y: number } }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const z = zoom();
    const r = el.getBoundingClientRect();
    const w = r.width / z;
    const h = r.height / z;
    const x = at.x / z;
    const y = at.y / z;
    const vw = window.innerWidth / z;
    const vh = window.innerHeight / z;
    let left = x + TIP_GAP + w + TIP_EDGE <= vw ? x + TIP_GAP : x - TIP_GAP - w;
    let top = y + TIP_GAP + h + TIP_EDGE <= vh ? y + TIP_GAP : y - TIP_GAP - h;
    left = Math.min(Math.max(TIP_EDGE, left), vw - w - TIP_EDGE);
    top = Math.min(Math.max(TIP_EDGE, top), vh - h - TIP_EDGE);
    setPos({ left, top });
  }, [at.x, at.y, tip]);
  const tone = { secondary: "text-text-secondary", positive: "text-text-positive", critical: "text-text-critical", hint: "text-text-accent" } as const;
  return createPortal(
    <div
      ref={ref}
      role="tooltip"
      data-no-translate
      className="pointer-events-none fixed z-[100] flex w-max max-w-[320px] flex-col gap-2 rounded-md bg-bg-tooltip p-4 text-text-tooltip shadow-[inset_0_0_0_1px_var(--gc-border-tooltip),0_4px_12px_0_var(--gc-effect-shadow)]"
      style={{ left: pos?.left ?? 0, top: pos?.top ?? 0, visibility: pos ? "visible" : "hidden" }}
    >
      <span data-theme="light" className="text-fs-14 leading-[1.5] text-text-secondary">
        {tip.header}
      </span>
      <span data-theme="light" aria-hidden className="h-px w-full bg-border-default" />
      {tip.title && (
        <span className="flex items-center gap-2 text-fs-16 leading-[1.5]">
          {tip.title.color && <span aria-hidden className="size-3 shrink-0 rounded-full" style={{ background: tip.title.color }} />}
          {tip.title.label && <span className="font-normal">{tip.title.label}</span>}
          {tip.title.label && <span aria-hidden>·</span>}
          <span className="font-bold">{tip.title.value}</span>
        </span>
      )}
      {tip.lines.map((l, i) => (
        <span key={i} data-theme="light" className={`text-fs-14 leading-[1.5] ${tone[l.tone ?? "secondary"]}`}>
          {l.text}
        </span>
      ))}
    </div>,
    document.body,
  );
}

/** Hover state for a tip: what is hovered + where the cursor is. */
function useTip<T>() {
  const [hover, setHover] = useState<{ key: T; x: number; y: number } | null>(null);
  const bind = (key: T) => ({
    onPointerMove: (e: React.PointerEvent) => setHover({ key, x: e.clientX, y: e.clientY }),
    onPointerLeave: () => setHover((h) => (h && h.key === key ? null : h)),
  });
  return { hover, bind };
}

/** One line under a chart title telling a first-time user how to read it. */
function HowTo({ text }: { text: string }) {
  return <p className="text-label-default text-text-secondary">{text}</p>;
}

/** Figma `KPI card` row: 4 cells gap16, p24 gap16 radius 16. */
export function KpiCards({ items, onOpen }: { items: Kpi[]; onOpen?: (id: string) => void }) {
  return (
    <div className="flex w-full gap-4">
      {items.map((k) => (
        <div
          key={k.id}
          role={onOpen ? "link" : undefined}
          tabIndex={onOpen ? 0 : undefined}
          onClick={() => onOpen?.(k.id)}
          onKeyDown={(e) => e.key === "Enter" && onOpen?.(k.id)}
          className={`flex min-w-0 flex-1 flex-col gap-4 rounded-lg bg-bg-surface p-6 ring-1 ring-inset ring-border-default ${onOpen ? "cursor-pointer hover:bg-bg-hover" : ""}`}
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-label-default text-text-primary">{k.label}</span>
              <InfoTooltip text={k.info} tone="primary" size={16} strokeWidth={1.2} />
            </div>
            <span className="text-[40px] font-bold leading-[1.5] text-text-primary">{k.value}</span>
          </div>
          <div className="flex h-6 items-center gap-2">
            {k.delta ? (
              <>
                <DeltaChip direction={k.delta.direction} label={k.delta.label} />
                <span className="text-label-default text-text-secondary">{vsLastWeek}</span>
              </>
            ) : (
              <span className="text-label-default text-text-secondary">{noComparison}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

const secondaryBtn =
  "flex h-9 shrink-0 items-center gap-2 rounded-md border border-border-button-secondary bg-bg-button-secondary bg-clip-padding px-3 text-label-default text-text-button-secondary cursor-pointer hover:bg-bg-hover hover:text-text-primary";

/** Needs attention: 3 problems, most important first. No side bar; each problem has its own call to action. */
export function NeedsAttention({
  title,
  subtitle,
  items,
  onCta,
}: {
  title: string;
  subtitle: string;
  items: { value: string; tag: string; text: string; cta: string; target: AttentionTarget }[];
  onCta: (target: AttentionTarget) => void;
}) {
  return (
    <CardShell className="gap-6 p-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-[24px] font-bold leading-[1.5] text-text-primary">{title}</h2>
        <p className="text-label-default text-text-secondary">{subtitle}</p>
      </div>
      <div className="flex flex-col gap-3">
        {items.map((it) => (
          <div key={it.tag} className="flex items-center gap-6 rounded-md bg-bg-canvas px-4 py-4 ring-1 ring-inset ring-border-default">
            <span className="w-[120px] shrink-0 text-[32px] font-bold leading-[1.5] text-text-critical">{it.value}</span>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="text-caption-default font-bold text-text-secondary">{it.tag}</span>
              <span className="text-body-default text-text-primary">{it.text}</span>
            </div>
            <button type="button" onClick={() => onCta(it.target)} className={secondaryBtn}>
              {it.cta}
              <ArrowUpRight size={14} strokeWidth={1.5} />
            </button>
          </div>
        ))}
      </div>
    </CardShell>
  );
}

/** Small engagement tiles under the DAU chart. */
export function Tiles({ items }: { items: { label: string; value: string; sub: string }[] }) {
  return (
    <div className="grid w-full grid-cols-3 gap-4">
      {items.map((t) => (
        <div key={t.label} className="flex flex-col gap-1 rounded-lg bg-bg-surface p-6 ring-1 ring-inset ring-border-default">
          <span className="text-label-default text-text-secondary">{t.label}</span>
          <span className="text-display-metric text-text-primary">{t.value}</span>
          <span className="text-caption-default text-text-secondary">{t.sub}</span>
        </div>
      ))}
    </div>
  );
}

function Track({ ratio, tone, height = 10 }: { ratio: number; tone: "primary" | "critical" | "muted"; height?: number }) {
  const fill = tone === "critical" ? "bg-status-critical" : tone === "muted" ? "bg-chart-series-muted" : "bg-chart-series-primary";
  return (
    <span className="relative block w-full overflow-hidden rounded-full bg-chart-bar-track" style={{ height }}>
      <span className={`absolute inset-y-0 left-0 rounded-full ${fill}`} style={{ width: `${Math.max(0, Math.min(1, ratio)) * 100}%` }} />
    </span>
  );
}

/** Stage funnel table (all players). `children` = extra panels (Explore: Stage 4 flow + stars). */
export function StageTableCard({ rows, onExplore, children }: { rows: StageRow[]; onExplore?: () => void; children?: ReactNode }) {
  const c = stageTableCopy;
  const pct = (v: number) => `${v.toFixed(1)}%`;
  return (
    <CardShell className="gap-8 p-8">
      <div className="flex flex-col gap-1">
        <CardHeader title={c.title} info={c.info} onExplore={onExplore} />
        <p className="text-label-default text-text-secondary">{c.subtitle}</p>
      </div>
      <div className="flex flex-col">
        <div className="grid grid-cols-[120px_140px_minmax(0,1fr)_160px_150px_130px] items-center gap-4 rounded-md bg-bg-canvas px-3 py-2 text-label-default text-text-secondary">
          {c.cols.map((h) => (
            <span key={h}>{h}</span>
          ))}
        </div>
        {rows.map((r) => {
          const tone = r.low ? "text-text-critical" : "text-text-primary";
          return (
            <div key={r.stage} className="grid grid-cols-[120px_140px_minmax(0,1fr)_160px_150px_130px] items-center gap-4 border-b border-border-default px-3 py-3 text-body-default">
              <span className="font-bold text-text-primary">{r.stage}</span>
              <span className="text-text-primary">{r.entered}</span>
              <span className="flex items-center gap-3">
                <span className="w-full max-w-[320px]">
                  <Track ratio={r.clearRate / 100} tone={r.low ? "critical" : "primary"} />
                </span>
                <span className={`w-14 shrink-0 ${tone} ${r.low ? "font-bold" : ""}`}>{pct(r.clearRate)}</span>
              </span>
              <span className={tone}>{r.fails}</span>
              <span className={tone}>{r.firstClear}</span>
              <span className={`${tone} ${r.low ? "font-bold" : ""}`}>{pct(r.exit)}</span>
            </div>
          );
        })}
      </div>
      {children}
    </CardShell>
  );
}

/** Horizontal bars with a label column, count column and value (Retention by first-day progress). */
export function ProgressRetentionCard({
  title,
  info,
  subtitle,
  rows,
  playersLabel,
  scaleMax,
  note,
  onExplore,
}: {
  title: string;
  info: string;
  subtitle: string;
  rows: { label: string; players: number; d1: number; small?: boolean }[];
  playersLabel: (n: number, small?: boolean) => string;
  scaleMax: number;
  note: string;
  onExplore?: () => void;
}) {
  return (
    <CardShell className="gap-8 p-8">
      <div className="flex flex-col gap-1">
        <CardHeader title={title} info={info} onExplore={onExplore} />
        <p className="text-label-default text-text-secondary">{subtitle}</p>
      </div>
      <div className="flex flex-col gap-4">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-4">
            <span className="w-[140px] shrink-0 text-body-default font-bold text-text-primary">{r.label}</span>
            <span className="w-[200px] shrink-0 text-label-default text-text-secondary">{playersLabel(r.players, r.small)}</span>
            <span className="min-w-0 flex-1">
              <Track ratio={r.d1 / scaleMax} tone={r.small ? "muted" : "primary"} height={12} />
            </span>
            <span className="w-20 shrink-0 text-right text-body-default font-bold text-text-primary">{r.d1.toFixed(1)}%</span>
          </div>
        ))}
      </div>
      <p className="text-caption-default text-text-secondary">{note}</p>
    </CardShell>
  );
}

// ── Explore ──

/** First-session funnel: bars = % of players who entered the lobby; dropped part is shaded, the selected drop is outlined. */
export function FunnelCard({ selected, onSelect, onExplore }: { selected: number; onSelect: (step: number) => void; onExplore?: () => void }) {
  const f = funnelData;
  const H = 220;
  const { hover, bind } = useTip<number>();
  return (
    <CardShell className="gap-8 p-8">
      <div className="flex flex-col gap-1">
        <CardHeader title={f.title} info={f.info} onExplore={onExplore} />
        <p className="text-label-default text-text-secondary">{f.subtitle}</p>
      </div>
      <HowTo text={chartHowTo.funnel} />
      <div className="flex items-end gap-12">
        <div className="flex flex-col gap-1">
          <span className="text-label-default text-text-secondary">{f.overallLabel}</span>
          <span className="text-metric-number text-text-primary">{f.overall}</span>
          <span className="text-caption-default text-text-secondary">{f.overallSub}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-label-default text-text-secondary">{f.biggestLabel}</span>
          <span className="text-metric-number text-text-critical">{f.biggest}</span>
          <span className="text-caption-default text-text-secondary">{f.biggestSub}</span>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {f.steps.map((s, i) => {
          const sel = i === selected;
          const dim = hover !== null && hover.key !== i;
          return (
            <div key={s.label} className="flex min-w-0 flex-col gap-2 transition-opacity duration-150" style={{ opacity: dim ? 0.45 : 1 }}>
              <span className="flex items-center gap-2">
                <span className="text-caption-default font-bold text-text-secondary">{i + 1}</span>
                <span className="text-body-default font-bold text-text-primary">{s.label}</span>
              </span>
              <span className="flex items-baseline gap-2">
                <span className="text-display-metric text-text-primary">{((s.users / f.total) * 100).toFixed(1)}%</span>
                <span className="text-label-default text-text-secondary">{f.playersLabel(s.users)}</span>
              </span>
              <div
                {...bind(i)}
                role={s.drop ? "button" : undefined}
                tabIndex={s.drop ? 0 : undefined}
                aria-label={`${s.label}: ${f.playersLabel(s.users)}`}
                onClick={() => s.drop && onSelect(i)}
                onKeyDown={(e) => e.key === "Enter" && s.drop && onSelect(i)}
                className={`relative w-full overflow-hidden rounded-t-md ${s.drop ? "cursor-pointer" : "cursor-default"} ${
                  sel ? "bg-bg-critical-subtle ring-1 ring-inset ring-border-critical-subtle" : "bg-chart-bar-track"
                }`}
                style={{ height: H }}
              >
                {/* The empty part above the bar = players who didn't get here (tinted on hover) */}
                {hover?.key === i && s.drop && (
                  <span
                    aria-hidden
                    className="absolute inset-x-0 top-0 bg-bg-critical-subtle"
                    style={{ height: `${100 - (s.users / f.total) * 100}%`, animation: "gc-fade-in 120ms ease-out both" }}
                  />
                )}
                <span
                  className={`absolute inset-x-0 bottom-0 rounded-t-md bg-chart-series-primary transition-[filter] duration-150 ${hover?.key === i ? "brightness-110" : ""}`}
                  style={{ height: `${(s.users / f.total) * 100}%` }}
                />
              </div>
              {s.drop ? (
                <div className="flex flex-col items-start gap-2">
                  <span className={`text-label-default ${sel ? "text-text-critical" : "text-text-secondary"}`}>{f.dropLabel(s.drop.users, s.drop.pct)}</span>
                  <button
                    type="button"
                    aria-pressed={sel}
                    onClick={() => onSelect(i)}
                    className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-label-default cursor-pointer hover:bg-bg-hover ${
                      sel ? "bg-bg-ai-subtle text-text-primary ring-1 ring-inset ring-border-accent" : "bg-bg-subtle text-text-primary ring-1 ring-inset ring-border-default"
                    }`}
                  >
                    {sel ? f.insteadSelected : f.instead}
                    <ArrowUpRight size={14} strokeWidth={1.5} />
                  </button>
                </div>
              ) : (
                <span className="text-label-default text-text-secondary">{f.start}</span>
              )}
            </div>
          );
        })}
      </div>
      {hover && <DataTip tip={funnelTip(hover.key)} at={hover} />}
    </CardShell>
  );
}

const FLOW_FILL = {
  forward: { fill: "var(--gc-chart-series-primary)", op: 0.32 },
  left: { fill: "var(--gc-status-critical)", op: 0.36 },
  other: { fill: "var(--gc-chart-series-muted)", op: 0.28 },
} as const;
const NODE_FILL = { forward: "var(--gc-chart-series-primary)", left: "var(--gc-status-critical)", other: "var(--gc-chart-series-muted)" } as const;

/** Sankey of the first session (SVG, scales with the card). Node heights ∝ players; bands keep the order of the source node. */
export function FlowsCard({ drop, onSelectDrop }: { drop: number; onSelectDrop?: (step: number) => void }) {
  const d = flowData;
  const view = d.dropView[drop];
  const lit = new Set(view?.nodes ?? []);
  // Hover: a band, or a box (lights every band in and out of it); the rest fades so one path is easy to follow
  const { hover, bind } = useTip<string>();
  const hoverNode = hover?.key.startsWith("node:") ? hover.key.slice(5) : null;
  const hoverBand = hover?.key.startsWith("band:") ? hover.key.slice(5) : null;
  const W = 1200;
  const COLS = [0, 400, 800, 1080];
  const NW = 14;
  const k = 340 / 641;
  const GAP = 36;
  const TOP = 8;
  // place nodes per column, top → bottom
  const pos: Record<string, { x: number; y: number; h: number }> = {};
  [0, 1, 2, 3].forEach((c) => {
    let y = TOP;
    d.nodes.filter((n) => n.col === c).forEach((n) => {
      pos[n.id] = { x: COLS[c], y, h: Math.max(3, n.n * k) };
      y += n.n * k + GAP;
    });
  });
  const outY: Record<string, number> = {};
  const inY: Record<string, number> = {};
  const bands = d.links.map(([from, to, n, kind]) => {
    const a = pos[from];
    const b = pos[to];
    const y0 = (outY[from] ??= a.y);
    const y1 = (inY[to] ??= b.y);
    outY[from] += n * k;
    inY[to] += n * k;
    const h = n * k;
    const x0 = a.x + NW;
    const x1 = b.x;
    const mx = (x0 + x1) / 2;
    const path = `M${x0},${y0} C${mx},${y0} ${mx},${y1} ${x1},${y1} L${x1},${y1 + h} C${mx},${y1 + h} ${mx},${y0 + h} ${x0},${y0 + h} Z`;
    return { key: `${from}-${to}`, from, to, n, path, kind, lit: lit.has(to) };
  });
  const H = Math.max(...Object.values(pos).map((p) => p.y + p.h)) + 40;
  return (
    <CardShell className="gap-6 p-8">
      <div className="flex flex-col gap-1">
        <CardHeader title={d.title} info={d.info} />
        <p className="text-label-default text-text-secondary">{d.subtitle}</p>
      </div>
      <HowTo text={chartHowTo.flows} />
      {view && (
        <p key={drop} className="rounded-md bg-bg-ai-subtle px-4 py-3 text-body-default text-text-primary ring-1 ring-inset ring-border-accent" style={{ animation: "gc-fade-in 200ms ease-out both" }}>
          {view.note}
        </p>
      )}
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={d.title}>
        {bands.map((b) => {
          const base = FLOW_FILL[b.kind].op;
          const hovering = hoverBand !== null || hoverNode !== null;
          const on = hoverBand === b.key || (hoverNode !== null && (b.from === hoverNode || b.to === hoverNode));
          const op = hovering ? (on ? Math.min(0.8, base * 2.1) : base * 0.3) : lit.size && !b.lit ? base * 0.45 : b.lit ? Math.min(0.75, base * 1.9) : base;
          return (
            <path
              key={b.key}
              d={b.path}
              fill={FLOW_FILL[b.kind].fill}
              fillOpacity={op}
              className="cursor-default"
              style={{ transition: "fill-opacity 160ms" }}
              {...bind(`band:${b.key}`)}
            />
          );
        })}
        {d.nodes.map((n) => {
          const p = pos[n.id];
          const cy = p.y + p.h / 2;
          return (
            <g
              key={n.id}
              {...bind(`node:${n.id}`)}
              onClick={() => flowNodeDrop[n.id] !== undefined && onSelectDrop?.(flowNodeDrop[n.id])}
              className={flowNodeDrop[n.id] !== undefined && onSelectDrop ? "cursor-pointer" : "cursor-default"}
              style={{
                opacity:
                  hoverNode && hoverNode !== n.id && !bands.some((b) => (b.from === hoverNode && b.to === n.id) || (b.to === hoverNode && b.from === n.id)) ? 0.45 : 1,
                transition: "opacity 160ms",
              }}
            >
              {/* Wider invisible hit area so the thin box and its label are easy to point at */}
              <rect x={p.x - 6} y={p.y - 6} width={220} height={Math.max(p.h, 30) + 12} fill="transparent" />
              <rect x={p.x} y={p.y} width={NW} height={p.h} rx={3} fill={NODE_FILL[n.kind]} />
              {lit.has(n.id) && <rect x={p.x - 3} y={p.y - 3} width={NW + 6} height={p.h + 6} rx={5} fill="none" stroke="var(--gc-border-accent)" strokeWidth={1.5} />}
              <text x={p.x + NW + 10} y={cy - 4} fill="var(--gc-text-primary)" fontSize={14} fontWeight={700}>
                {n.title}
              </text>
              <text x={p.x + NW + 10} y={cy + 14} fill={n.kind === "left" ? "var(--gc-text-critical)" : "var(--gc-text-secondary)"} fontSize={12}>
                {n.sub}
              </text>
            </g>
          );
        })}
        {d.steps.map((s, i) => (
          <text key={s} x={COLS[i]} y={H - 8} fill="var(--gc-chart-label)" fontSize={12} fontWeight={700}>
            {s}
          </text>
        ))}
      </svg>
      {hover && (
        <DataTip
          at={hover}
          tip={
            hoverNode
              ? flowNodeTip(hoverNode)
              : (() => {
                  const b = bands.find((x) => x.key === hoverBand)!;
                  return flowBandTip(b.from, b.to, b.n, b.kind);
                })()
          }
        />
      )}
      <div className="flex items-center gap-4">
        {d.legend.map((l) => (
          <span key={l.label} className="flex items-center gap-2 text-caption-default text-text-secondary">
            <span className="size-3 rounded-sm" style={{ background: FLOW_FILL[l.kind].fill, opacity: 0.7 }} />
            {l.label}
          </span>
        ))}
      </div>
    </CardShell>
  );
}

/** Vertical histogram (stars collected). Highlighted bars are critical, the rest muted. */
export function Histogram({
  values,
  labels,
  highlight,
  height = 96,
  tip,
  howTo,
}: {
  values: number[];
  labels: string[];
  highlight: number[];
  height?: number;
  /** bar index → hover tip */
  tip?: (i: number) => Tip;
  howTo?: string;
}) {
  const max = Math.max(...values);
  const { hover, bind } = useTip<number>();
  return (
    <div className="flex w-full flex-col gap-3">
      {howTo && <HowTo text={howTo} />}
      <div className="flex w-full items-end gap-4">
      {values.map((v, i) => {
        const hi = highlight.includes(i);
        return (
          <div
            key={labels[i]}
            {...(tip ? bind(i) : {})}
            className="flex min-w-0 flex-1 flex-col items-center gap-1 transition-opacity duration-150"
            style={{ opacity: hover && hover.key !== i ? 0.45 : 1 }}
          >
            <span className={`text-label-default ${hi ? "font-bold text-text-critical" : "text-text-secondary"}`}>{v}</span>
            <span className={`w-full rounded-t-md ${hi ? "bg-status-critical" : "bg-chart-series-muted"}`} style={{ height: Math.max(2, (height * v) / max) }} />
            <span className="text-caption-default text-text-secondary">{labels[i]}</span>
          </div>
        );
      })}
      </div>
      {hover && tip && <DataTip tip={tip(hover.key)} at={hover} />}
    </div>
  );
}

export function Facts({ items }: { items: { value: string; text: string }[] }) {
  return (
    <div className="grid w-full gap-4" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
      {items.map((f) => (
        <div key={f.value} className="flex flex-col gap-1 rounded-md bg-bg-canvas p-4 ring-1 ring-inset ring-border-default">
          <span className="text-display-metric text-text-primary">{f.value}</span>
          <span className="text-label-default text-text-secondary">{f.text}</span>
        </div>
      ))}
    </div>
  );
}

export function SimpleCard({ title, info, subtitle, children, onExplore }: { title: string; info: string; subtitle: string; children: ReactNode; onExplore?: () => void }) {
  return (
    <CardShell className="gap-8 p-8">
      <div className="flex flex-col gap-1">
        <CardHeader title={title} info={info} onExplore={onExplore} />
        <p className="text-label-default text-text-secondary">{subtitle}</p>
      </div>
      {children}
    </CardShell>
  );
}

/** Bordered panel inside a card (Stage 4 flow / stars). */
export function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 rounded-md p-6 ring-1 ring-inset ring-border-default">
      <span className="text-body-default font-bold text-text-primary">{title}</span>
      {children}
    </div>
  );
}

/** Split bar for where sessions went after a stage. */
export function SplitBar({ parts, total }: { parts: { n: number; kind: "left" | "muted" | "forward"; label: string }[]; total: number }) {
  const fill = { left: "bg-status-critical", muted: "bg-chart-series-muted", forward: "bg-chart-series-primary" } as const;
  return (
    <div className="flex w-full gap-0.5">
      {parts.map((p) => (
        <div key={p.label} className="flex min-w-0 flex-col gap-2" style={{ width: `${(p.n / total) * 100}%` }}>
          <span className={`h-4 w-full rounded-sm ${fill[p.kind]}`} />
          <span className={`text-caption-default ${p.kind === "left" ? "text-text-critical" : "text-text-secondary"}`}>{p.label}</span>
        </div>
      ))}
    </div>
  );
}

export function SessionsTable({
  cols,
  rows,
  quit,
  cleared,
}: {
  cols: string[];
  rows: { time: string; player: string; device: string; path: string; length: string; result: "quit" | "cleared"; detail: string }[];
  quit: string;
  cleared: string;
}) {
  const grid = "grid grid-cols-[150px_100px_100px_200px_110px_minmax(0,1fr)] items-center gap-4 px-3";
  return (
    <div className="flex flex-col">
      <div className={`${grid} rounded-md bg-bg-canvas py-2 text-label-default text-text-secondary`}>
        {cols.map((c) => (
          <span key={c}>{c}</span>
        ))}
      </div>
      {rows.map((r) => (
        <div key={r.time + r.player} className={`${grid} border-b border-border-default py-3 text-label-default text-text-primary`}>
          <span>{r.time}</span>
          <span className="text-text-primary">{r.player}</span>
          <span>{r.device}</span>
          <span>{r.path}</span>
          <span>{r.length}</span>
          <span className="flex items-center gap-2">
            <span
              className={`rounded-sm px-2 py-0.5 text-caption-default font-bold ${r.result === "quit" ? "bg-bg-critical-subtle text-text-critical" : "bg-bg-positive-subtle text-text-positive"}`}
            >
              {r.result === "quit" ? quit : cleared}
            </span>
            <span className="text-text-secondary">{r.detail}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
