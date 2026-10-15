import React, { useState } from "react";
import { CardHeader, CardShell } from "../dashboard/CardHeader";
import { Facts } from "./AnalyticsCards";
import type { StageRow } from "../../data/analytics";
import { lobbyLeavers, stageBlock, stageCohort } from "../../data/page-cards";

// Cards that only exist as "카드 추가" options (same card frame as the rest of the page: CardShell p32, title 24 Bold + ⓘ, 14 subtitle).
// Values come in through data/page-cards.ts (v8 dataset) or the existing stageRows.

function Head({ title, info, subtitle, onExplore }: { title: string; info: string; subtitle: string; onExplore?: () => void }) {
  return (
    <div className="flex flex-col gap-1">
      <CardHeader title={title} info={info} onExplore={onExplore} />
      <p className="text-label-default text-text-secondary">{subtitle}</p>
    </div>
  );
}

/** 로비에서 나간 신규 플레이어 — time in lobby, next-day return, device mix vs new players who started a stage. */
export function LobbyLeaversCard({ onExplore }: { onExplore?: () => void }) {
  const c = lobbyLeavers;
  return (
    <CardShell className="gap-8 p-8">
      <Head title={c.title} info={c.info} subtitle={c.subtitle} onExplore={onExplore} />
      <Facts items={c.facts} />
      <div className="flex flex-col gap-4">
        <span className="text-body-default font-bold text-text-primary">{c.deviceTitle}</span>
        {c.devices.map((d) => (
          <div key={d.label} className="flex items-center gap-4">
            <span className="w-[120px] shrink-0 text-body-default text-text-primary">{d.label}</span>
            <span className="w-[100px] shrink-0 text-label-default text-text-secondary">{c.playersLabel(d.n)}</span>
            <span className="relative h-3 min-w-0 flex-1 overflow-hidden rounded-full bg-chart-bar-track">
              <span className="absolute inset-y-0 left-0 rounded-full bg-status-pending" style={{ width: `${d.share}%` }} />
            </span>
            <span className="w-[64px] shrink-0 text-right text-body-default font-bold text-text-primary">{d.share.toFixed(1)}%</span>
            <span className="w-[200px] shrink-0 text-caption-default text-text-secondary">{c.compareLabel(d.compare)}</span>
          </div>
        ))}
        <p className="text-caption-default text-text-secondary">{c.note}</p>
      </div>
    </CardShell>
  );
}

/** 스테이지별 클리어율·실패 횟수 — clear-rate bars + fails, lowest clear rate in red (same rows as the stage table). */
export function StageBlockCard({ rows, onExplore }: { rows: StageRow[]; onExplore?: () => void }) {
  const c = stageBlock;
  return (
    <CardShell className="gap-8 p-8">
      <Head title={c.title} info={c.info} subtitle={c.subtitle} onExplore={onExplore} />
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4 text-label-default text-text-secondary">
          <span className="w-[120px] shrink-0" />
          <span className="min-w-0 flex-1">{c.clearLabel}</span>
          <span className="w-[72px] shrink-0" />
          <span className="w-[160px] shrink-0 text-right">{c.failsLabel}</span>
        </div>
        {rows.map((r) => (
          <div key={r.stage} className="flex h-[26px] items-center gap-4">
            <span className="w-[120px] shrink-0 text-body-default font-bold text-text-primary">{r.stage}</span>
            <span className="relative h-3 min-w-0 flex-1 overflow-hidden rounded-full bg-chart-bar-track">
              <span className={`absolute inset-y-0 left-0 rounded-full ${r.low ? "bg-status-critical" : "bg-chart-series-primary"}`} style={{ width: `${r.clearRate}%` }} />
            </span>
            <span className={`w-[72px] shrink-0 text-right text-body-default font-bold ${r.low ? "text-text-critical" : "text-text-primary"}`}>{r.clearRate.toFixed(1)}%</span>
            <span className={`w-[160px] shrink-0 text-right text-body-default ${r.low ? "text-text-critical" : "text-text-primary"}`}>{c.fails(r.fails)}</span>
          </div>
        ))}
      </div>
    </CardShell>
  );
}

/** 첫날 도달 스테이지별 리텐션 — heatmap (chart/heatmap/emphasis: min 15% → max 70%), N/A when not measurable. */
export function StageCohortCard({ onExplore }: { onExplore?: () => void }) {
  const c = stageCohort;
  const values = c.rows.flatMap((r) => r.cells.filter((x): x is [number, number] => x !== null).map(([a, n]) => (a / n) * 100));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const opacity = (v: number) => (max <= min ? 0.7 : 0.15 + ((v - min) / (max - min)) * (0.7 - 0.15));
  const grid = { gridTemplateColumns: `repeat(${c.days.length}, minmax(0, 1fr))` };
  const [hover, setHover] = useState<string | null>(null);
  return (
    <CardShell className="gap-8 p-8">
      <Head title={c.title} info={c.info} subtitle={c.subtitle} onExplore={onExplore} />
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-4 text-label-default text-text-secondary">
          <span className="w-[120px] shrink-0">{c.groupLabel}</span>
          <span className="w-[100px] shrink-0 text-right">{c.usersLabel}</span>
          <div className="grid min-w-0 flex-1 gap-2 text-center" style={grid}>
            {c.days.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {c.rows.map((r) => (
            <div key={r.label} className="flex h-10 items-center gap-4 text-label-default text-text-secondary">
              <span className="w-[120px] shrink-0">{r.label}</span>
              <span className="w-[100px] shrink-0 text-right">{r.users}</span>
              <div className="grid min-w-0 flex-1 gap-2" style={grid}>
                {r.cells.map((cell, i) => {
                  const key = `${r.label}-${i}`;
                  const v = cell ? (cell[0] / cell[1]) * 100 : null;
                  return (
                    <div
                      key={key}
                      onPointerEnter={() => setHover(key)}
                      onPointerLeave={() => setHover(null)}
                      className="relative flex h-10 items-center justify-center rounded-md text-fs-16 leading-[1.6]"
                    >
                      {v !== null && <span aria-hidden className="absolute inset-0 rounded-md" style={{ background: "var(--gc-chart-heatmap-emphasis)", opacity: opacity(v) }} />}
                      <span className={`relative ${v === null ? "text-chart-label" : "text-text-primary"}`}>{v === null ? "N/A" : `${v.toFixed(1)}%`}</span>
                      {hover === key && (
                        <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-bg-tooltip px-3 py-2 text-label-default text-text-tooltip shadow-[inset_0_0_0_1px_var(--gc-border-tooltip),0_4px_12px_0_var(--gc-effect-shadow)]">
                          {cell ? c.ofPlayers(cell[0], cell[1]) : c.notAvailable}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </CardShell>
  );
}
