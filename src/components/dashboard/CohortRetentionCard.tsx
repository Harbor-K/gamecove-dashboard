import React, { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cohortDays, dateCohorts } from "../../data/dashboard";
import { LOCALE } from "../../i18n/locale";
import { CardHeader, CardShell } from "./CardHeader";

/**
 * Heatmap opacity, mapped linearly over the values in the table (CLAUDE.md heatmap rule):
 * min → 24% (accent), max → 70%. Text stays opaque. Unavailable cells show "N/A" in chart/label.
 */
function heatOpacity(value: number, min: number, max: number) {
  if (max <= min) return 0.7;
  return 0.24 + ((value - min) / (max - min)) * (0.7 - 0.24);
}

// Data hover tooltip copy (repo t.dashboard.hover). Numbers are formatted here, the sentence comes from the locale.
const H =
  LOCALE === "ko"
    ? { ofUsers: (returned: string, total: string) => `${total}명 중 ${returned}명`, notAvailable: "아직 확인할 수 없음" }
    : { ofUsers: (returned: string, total: string) => `${returned} of ${total} users`, notAvailable: "Not available yet" };
const nf = new Intl.NumberFormat(LOCALE === "ko" ? "ko-KR" : "en-US");

type TooltipRows = { value?: string; sub: string };

/** Cohort cell: % → returned players of the cohort (returned = % × cohort size, restored exactly). */
function cohortCell(v: number | null, users: number): TooltipRows {
  if (v === null) return { sub: H.notAvailable };
  return { value: `${v.toFixed(1)}%`, sub: H.ofUsers(nf.format(Math.round((v * users) / 100)), nf.format(users)) };
}

const EDGE = 8;
const CURSOR_GAP = 12;
const zoom = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--gc-zoom")) || 1;

/**
 * Repo `FloatingDataTooltip` (Figma 데이터 호버 툴팁_화이트): p16 gap4 radius 8, 1px border, shadow 0 4 12.
 * Value 14 Bold, sub line 14 Regular (3px closer under the value). Follows the cursor (right-below, flips at the edges).
 */
function FloatingTooltip({ rows, anchor }: { rows: TooltipRows; anchor: { x: number; y: number } }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const z = zoom();
    const r = el.getBoundingClientRect();
    const w = r.width / z;
    const h = r.height / z;
    const ax = anchor.x / z;
    const ay = anchor.y / z;
    const vw = window.innerWidth / z;
    const vh = window.innerHeight / z;
    let left = ax + CURSOR_GAP + w + EDGE <= vw ? ax + CURSOR_GAP : ax - CURSOR_GAP - w;
    let top = ay + CURSOR_GAP + h + EDGE <= vh ? ay + CURSOR_GAP : ay - CURSOR_GAP - h;
    left = Math.min(Math.max(EDGE, left), vw - w - EDGE);
    top = Math.min(Math.max(EDGE, top), vh - h - EDGE);
    setPos({ left, top });
  }, [anchor.x, anchor.y, rows]);

  return createPortal(
    <div
      ref={ref}
      role="tooltip"
      data-no-translate
      className="pointer-events-none fixed z-[100] flex flex-col items-start gap-1 whitespace-nowrap rounded-md bg-bg-tooltip p-4 text-text-tooltip select-none shadow-[inset_0_0_0_1px_var(--gc-border-tooltip),0_4px_12px_0_var(--gc-effect-shadow)]"
      style={{ left: pos?.left ?? 0, top: pos?.top ?? 0, visibility: pos ? "visible" : "hidden" }}
    >
      {rows.value && <span className="text-[14px] font-bold leading-[1.5]">{rows.value}</span>}
      <span className={`text-[14px] font-normal leading-[1.5] ${rows.value ? "-mt-[3px]" : ""}`}>{rows.sub}</span>
    </div>,
    document.body,
  );
}

/** Hover area on a cell (repo `DataHover`): the tooltip follows the cursor. */
function DataHover({ rows, className, children }: { rows: TooltipRows; className: string; children: ReactNode }) {
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null);
  return (
    <div className={className} onPointerMove={(e) => setAnchor({ x: e.clientX, y: e.clientY })} onPointerLeave={() => setAnchor(null)}>
      {children}
      {anchor && <FloatingTooltip rows={rows} anchor={anchor} />}
    </div>
  );
}

/** Date cohort retention (repo CohortCard, tone = accent): p32 gap40, header row 14 secondary, rows h40 gap8. */
export function CohortRetentionCard({ onExplore }: { onExplore?: () => void }) {
  const all = dateCohorts.flatMap((r) => r.retention.filter((v): v is number => v !== null));
  const min = Math.min(...all);
  const max = Math.max(...all);
  const cellGrid = { gridTemplateColumns: `repeat(${cohortDays.length}, minmax(0, 1fr))` };

  return (
    <CardShell className="overflow-hidden">
      <div className="flex flex-col gap-10 p-8">
        <CardHeader title="Date cohort retention" info="Retention of new players by first-play date" onExplore={onExplore} />
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-10 text-label-default text-text-secondary">
            <div className="flex w-[248px] shrink-0">
              <span className="w-32">Date cohort</span>
              <span className="w-[120px] text-right">Users</span>
            </div>
            <div className="grid min-w-0 flex-1 gap-2 text-center" style={cellGrid}>
              {cohortDays.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {dateCohorts.map((r) => (
              <div key={r.date} className="flex h-10 w-full items-center gap-10">
                <div className="flex w-[248px] shrink-0 items-center text-fs-16 leading-[1.5] text-text-secondary">
                  <span className="w-32">{r.date}</span>
                  <span className="w-[120px] text-right">{r.users}</span>
                </div>
                <div className="grid min-w-0 flex-1 gap-2" style={cellGrid}>
                  {r.retention.map((v, i) => (
                    <DataHover key={i} rows={cohortCell(v, r.users)} className="relative flex h-10 items-center justify-center rounded-md text-fs-16 leading-[1.5]">
                      {v !== null && (
                        <span aria-hidden className="absolute inset-0 rounded-md bg-chart-heatmap-accent" style={{ opacity: heatOpacity(v, min, max) }} />
                      )}
                      <span className={`relative ${v === null ? "text-chart-label" : "text-text-primary"}`}>{v === null ? "N/A" : `${v.toFixed(1)}%`}</span>
                    </DataHover>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CardShell>
  );
}
