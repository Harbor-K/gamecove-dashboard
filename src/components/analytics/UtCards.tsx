import React, { type ReactNode } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import { CardShell, CardTitle } from "../dashboard/CardHeader";
import type { Related } from "../../data/ut-overviews";

// Building blocks for the user-test designs (Figma Page 18: Overview v6 + Explore Heap flow).
// Values and copy come in through props from data/ut-overviews.ts; nothing is written here.

const secondaryBtn =
  "flex h-9 shrink-0 items-center gap-2 rounded-md border border-border-button-secondary bg-bg-button-secondary bg-clip-padding px-3 text-label-default text-text-button-secondary cursor-pointer hover:bg-bg-hover hover:text-text-primary";

/** Card frame with title (+ⓘ), subtitle and one optional action (Explore / View all / Open Retention). */
export function UtCard({
  title,
  info,
  subtitle,
  action,
  children,
}: {
  title: string;
  info?: string;
  subtitle?: string;
  action?: { label: string; onClick: () => void };
  children: ReactNode;
}) {
  return (
    <CardShell className="gap-8 p-8">
      <div className="flex w-full items-start gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {info ? <CardTitle title={title} info={info} /> : <h2 className="text-[24px] font-bold leading-[1.5] text-text-primary">{title}</h2>}
          {subtitle && <p className="text-label-default text-text-secondary">{subtitle}</p>}
        </div>
        {action && (
          <button type="button" onClick={action.onClick} className={secondaryBtn}>
            {action.label}
          </button>
        )}
      </div>
      {children}
    </CardShell>
  );
}

/** Left column of a v6 section: step number + name, the question, "What to check" bullets. */
export function SectionIntro({ step, name, question, checks, checkLabel }: { step: string; name: string; question: string; checks: string[]; checkLabel: string }) {
  return (
    <div className="flex w-[320px] shrink-0 flex-col gap-4 pt-2">
      <div className="flex items-center gap-2">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-bg-subtle text-caption-default font-bold text-text-primary">{step}</span>
        <span className="text-body-default font-bold text-text-primary">{name}</span>
      </div>
      <p className="text-label-default text-text-secondary">{question}</p>
      <div className="flex flex-col gap-1">
        <span className="text-caption-default font-bold text-text-secondary">{checkLabel}</span>
        {checks.map((c) => (
          <span key={c} className="flex gap-2 text-label-default text-text-primary">
            <span aria-hidden className="text-text-secondary">·</span>
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Intro column + card, side by side (24 apart). */
export function Section({ intro, children }: { intro: ReactNode; children: ReactNode }) {
  return (
    <section className="flex w-full items-start gap-6">
      {intro}
      <div className="min-w-0 flex-1">{children}</div>
    </section>
  );
}

/** "Look closer" panel inside a card. */
export function Closer({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 rounded-md p-6 ring-1 ring-inset ring-border-default">
      <span className="flex items-center gap-2 text-body-default font-bold text-text-primary">
        <Search size={16} strokeWidth={1.5} className="shrink-0 text-icon-secondary" />
        {title}
      </span>
      {children}
    </div>
  );
}

/** "Next:" row of related links. */
export function RelatedLinks({ label, items, onGo }: { label: string; items: Related[]; onGo: (r: Related) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-label-default text-text-secondary">{label}</span>
      {items.map((r) => (
        <button
          key={r.label}
          type="button"
          onClick={() => onGo(r)}
          className="flex items-center gap-2 rounded-md bg-bg-subtle px-4 py-2 text-label-default text-text-primary ring-1 ring-inset ring-border-default cursor-pointer hover:bg-bg-hover"
        >
          {r.label}
          <ArrowUpRight size={14} strokeWidth={1.5} className="shrink-0" />
        </button>
      ))}
    </div>
  );
}

/** v6 funnel: % of lobby players per step, bar 200 high, players + drop line (biggest drop in critical). */
export function FunnelColumns({ steps, total, playersLabel }: { steps: { label: string; users: number; note: null | { text: string; worst?: boolean } }[]; total: number; playersLabel: (n: number) => string }) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {steps.map((s) => {
        const pct = (s.users / total) * 100;
        return (
          <div key={s.label} className="flex min-w-0 flex-col gap-2">
            <span className="text-display-metric text-text-primary">{pct === 100 ? "100%" : `${pct.toFixed(1)}%`}</span>
            <div className="relative h-[200px] w-full overflow-hidden rounded-t-md bg-chart-bar-track">
              <span className="absolute inset-x-0 bottom-0 rounded-t-md bg-chart-series-primary" style={{ height: `${pct}%` }} />
            </div>
            <span className="text-body-default font-bold text-text-primary">{s.label}</span>
            <span className="text-label-default text-text-secondary">{playersLabel(s.users)}</span>
            {s.note && <span className={`text-label-default ${s.note.worst ? "font-bold text-text-critical" : "text-text-secondary"}`}>{s.note.text}</span>}
          </div>
        );
      })}
    </div>
  );
}

/** v6 stage progress: clear rate bars per stage; the lowest one is critical with a "Lowest" chip. */
export function StageColumns({ cols, lowest }: { cols: { stage: string; rate: number; entered: string; fails: string; exit: string; low?: boolean }[]; lowest: string }) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {cols.map((c) => (
        <div key={c.stage} className="flex min-w-0 flex-col gap-2">
          <span className="flex items-center gap-2">
            <span className={`text-display-metric ${c.low ? "text-text-critical" : "text-text-primary"}`}>{c.rate.toFixed(1)}%</span>
            {c.low && <span className="rounded-full bg-bg-critical-subtle px-3 py-0.5 text-caption-default font-bold text-text-critical">{lowest}</span>}
          </span>
          <div className="relative h-[200px] w-full overflow-hidden rounded-t-md bg-chart-bar-track">
            <span className={`absolute inset-x-0 bottom-0 rounded-t-md ${c.low ? "bg-status-critical" : "bg-chart-series-primary"}`} style={{ height: `${c.rate}%` }} />
          </div>
          <span className="text-body-default font-bold text-text-primary">{c.stage}</span>
          <span className="text-label-default text-text-secondary">{c.entered}</span>
          <span className={`text-label-default ${c.low ? "text-text-critical" : "text-text-primary"}`}>{c.fails}</span>
          <span className="text-label-default text-text-secondary">{c.exit}</span>
        </div>
      ))}
    </div>
  );
}

/** Horizontal bars: label · count · track (scale 0–scaleMax) · value. */
export function ProgressBars({ rows, playersLabel, scaleMax }: { rows: { label: string; players: number; d1: number; small?: boolean }[]; playersLabel: (n: number, small?: boolean) => string; scaleMax: number }) {
  return (
    <div className="flex flex-col gap-4">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-4">
          <span className="w-[120px] shrink-0 text-body-default font-bold text-text-primary">{r.label}</span>
          <span className="w-[180px] shrink-0 text-label-default text-text-secondary">{playersLabel(r.players, r.small)}</span>
          <span className="relative h-3 min-w-0 flex-1 overflow-hidden rounded-full bg-chart-bar-track">
            <span className={`absolute inset-y-0 left-0 rounded-full ${r.small ? "bg-chart-series-muted" : "bg-chart-series-primary"}`} style={{ width: `${Math.min(1, r.d1 / scaleMax) * 100}%` }} />
          </span>
          <span className="w-[72px] shrink-0 text-right text-body-default font-bold text-text-primary">{r.d1.toFixed(1)}%</span>
        </div>
      ))}
    </div>
  );
}

// ── Overview 2 (Heap flow) ──

/** Question + the 4 investigation steps (step 1 = where you start). Clicking a step scrolls to it. */
export function InvestigationCard({ eyebrow, question, sub, steps }: { eyebrow: string; question: string; sub: string; steps: { n: string; name: string; text: string; tag: string }[] }) {
  return (
    <CardShell className="gap-8 p-8">
      <div className="flex flex-col gap-2">
        <span className="text-caption-default font-bold text-text-secondary">{eyebrow}</span>
        <h2 className="text-[24px] font-bold leading-[1.5] text-text-primary">{question}</h2>
        <p className="text-label-default text-text-secondary">{sub}</p>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {steps.map((s, i) => (
          <button
            key={s.n}
            type="button"
            onClick={() => document.getElementById(`ut-step-${s.n}`)?.scrollIntoView({ behavior: "smooth", block: "start" })}
            className={`flex flex-col items-start gap-2 rounded-md bg-bg-canvas p-4 text-left ring-1 ring-inset cursor-pointer hover:bg-bg-hover ${i === 0 ? "ring-border-accent" : "ring-border-default"}`}
          >
            <span className="flex items-center gap-2">
              <span className={`flex size-7 shrink-0 items-center justify-center rounded-full text-label-default font-bold text-text-primary ${i === 0 ? "bg-bg-ai-subtle ring-1 ring-inset ring-border-accent" : "bg-bg-subtle"}`}>{s.n}</span>
              <span className="text-body-default font-bold text-text-primary">{s.name}</span>
            </span>
            <span className="text-label-default text-text-secondary">{s.text}</span>
            <span className="w-fit rounded-full bg-bg-subtle px-3 py-0.5 text-caption-default font-bold text-text-secondary">{s.tag}</span>
          </button>
        ))}
      </div>
    </CardShell>
  );
}

/** "STEP n OF 4" label above a step's cards (scroll target for the step cards above). */
export function StepLabel({ id, eyebrow, title, sub }: { id: string; eyebrow: string; title: string; sub: string }) {
  return (
    <div id={id} className="flex scroll-mt-[184px] flex-col gap-1 pt-4">
      <span className="text-caption-default font-bold text-text-accent">{eyebrow}</span>
      <span className="text-[20px] font-bold leading-[1.5] text-text-primary">{title}</span>
      <span className="text-label-default text-text-secondary">{sub}</span>
    </div>
  );
}

/** Two groups side by side + insight callout. */
export function GroupCompare({
  groups,
  insight,
  caveat,
}: {
  groups: { name: string; tone: "primary" | "critical"; n: string; rows: string[][]; then: string }[];
  insight: string;
  caveat: string;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4">
        {groups.map((g) => (
          <div key={g.name} className="flex flex-col gap-4 rounded-md bg-bg-canvas p-6">
            <span className="flex items-center gap-2 text-body-default font-bold text-text-primary">
              <span aria-hidden className={`size-3 shrink-0 rounded-full ${g.tone === "primary" ? "bg-chart-series-primary" : "bg-status-critical"}`} />
              {g.name}
            </span>
            <span className="text-display-metric text-text-primary">{g.n}</span>
            {g.rows.map(([k, v]) => (
              <span key={k} className="flex items-center justify-between gap-4 text-label-default">
                <span className="text-text-secondary">{k}</span>
                <span className="font-bold text-text-primary">{v}</span>
              </span>
            ))}
            <span aria-hidden className="h-px w-full bg-border-default" />
            <span className="text-label-default text-text-primary">{g.then}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-1 rounded-md bg-bg-ai-subtle p-4 ring-1 ring-inset ring-border-accent">
        <span className="text-body-default font-bold text-text-primary">{insight}</span>
        <span className="text-caption-default text-text-secondary">{caveat}</span>
      </div>
    </div>
  );
}

const SEG = { lobby: "bg-chart-series-muted", bad: "bg-status-critical", good: "bg-chart-series-primary" } as const;
const EV = { plain: "text-text-primary", run: "text-text-primary", bad: "font-bold text-text-critical", good: "font-bold text-text-positive" } as const;
const clock = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;

/** Real sessions: time split (lobby / stage) as one bar + the order of what happened. */
export function SessionTimelines({
  sessions,
  sessionLabel,
  footnote,
}: {
  sessions: { who: string; result: string; bad: boolean; total: number; segs: [string, number][]; events: [string, string, "plain" | "run" | "bad" | "good"][] }[];
  sessionLabel: string;
  footnote: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      {sessions.map((s) => (
        <div key={s.who} className="flex flex-col gap-3 rounded-md bg-bg-canvas p-4">
          <div className="flex items-center gap-3">
            <span className="text-body-default font-bold text-text-primary">{s.who}</span>
            <span className={`rounded-full px-3 py-0.5 text-caption-default font-bold ${s.bad ? "bg-bg-critical-subtle text-text-critical" : "bg-bg-positive-subtle text-text-positive"}`}>{s.result}</span>
            <span className="flex-1" />
            <span className="text-label-default text-text-secondary">
              {sessionLabel} {clock(s.total)}
            </span>
          </div>
          <div className="flex h-3 w-full overflow-hidden rounded-full">
            {s.segs.map(([kind, sec], i) => (
              <span key={i} className={SEG[kind as keyof typeof SEG]} style={{ width: `${(sec / s.total) * 100}%`, minWidth: 1 }} />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {s.events.map(([time, label, kind], i) => (
              <React.Fragment key={i}>
                <span className={`flex items-center gap-2 rounded-md px-2 py-1 ${kind === "run" ? "bg-bg-subtle" : ""}`}>
                  <span className="text-caption-default font-bold text-text-secondary">{time}</span>
                  <span className={`text-label-default ${EV[kind]}`}>{label}</span>
                </span>
                {i < s.events.length - 1 && <span className="text-label-default text-text-secondary">→</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      ))}
      <p className="text-caption-default text-text-secondary">{footnote}</p>
    </div>
  );
}

/** Data that isn't collected yet, with its status. */
export function DataGaps({ items }: { items: { what: string; data: string; status: string; pending: boolean }[] }) {
  return (
    <div className="flex flex-col">
      {items.map((g, i) => (
        <div key={g.what} className={`flex items-center gap-4 py-3 ${i > 0 ? "border-t border-border-default" : ""}`}>
          <span className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-body-default font-bold text-text-primary">{g.what}</span>
            <span className="text-label-default text-text-secondary">{g.data}</span>
          </span>
          <span className={`shrink-0 rounded-full px-3 py-0.5 text-caption-default font-bold ${g.pending ? "bg-bg-pending-subtle text-status-pending" : "bg-bg-subtle text-text-secondary"}`}>{g.status}</span>
        </div>
      ))}
    </div>
  );
}

/** Hypotheses: title + status chip, why / how / data rows. */
export function Hypotheses({
  items,
  labels,
}: {
  items: { n: string; title: string; why: string; how: string; status: string; ready: boolean; data: string[] }[];
  labels: { why: string; how: string; data: string };
}) {
  return (
    <div className="flex flex-col gap-4">
      {items.map((h) => (
        <div key={h.n} className="flex gap-4 rounded-md bg-bg-canvas p-6">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-bg-subtle text-label-default font-bold text-text-primary">{h.n}</span>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <span className="flex flex-wrap items-center gap-3">
              <span className="text-body-default font-bold text-text-primary">{h.title}</span>
              <span className={`rounded-full px-3 py-0.5 text-caption-default font-bold ${h.ready ? "bg-bg-positive-subtle text-text-positive" : "bg-bg-pending-subtle text-status-pending"}`}>{h.status}</span>
            </span>
            {[
              [labels.why, h.why],
              [labels.how, h.how],
            ].map(([k, v]) => (
              <span key={k} className="flex gap-2 text-label-default">
                <span className="w-[120px] shrink-0 font-bold text-text-secondary">{k}</span>
                <span className="min-w-0 flex-1 text-text-primary">{v}</span>
              </span>
            ))}
            <span className="flex flex-wrap items-center gap-2 text-label-default">
              <span className="w-[120px] shrink-0 font-bold text-text-secondary">{labels.data}</span>
              {h.data.map((d) => (
                <span key={d} className="rounded-full bg-bg-subtle px-3 py-0.5 text-caption-default font-bold text-text-secondary">
                  {d}
                </span>
              ))}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
