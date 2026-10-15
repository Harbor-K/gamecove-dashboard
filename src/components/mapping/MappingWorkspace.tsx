import React, { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "../ui/Button";
import { initialSections, scriptOptions, ws, type MapSection } from "../../data/mapping-workspace";
import { MappingInsights } from "./MappingInsights";

// Game Setup · mapping. Layout: page top bar → left section cards (≈40%) | right game-structure canvas (≈60%).
// One card open at a time; opening a card highlights its node, clicking a node opens its card.
// Save → onSave(ids still needing review) → the existing "Your game is mapped!" modal → Overview (flow unchanged).

const NODE_W = 240;
const NODE_H = 64;
const ROW = 152; // node + connector
/** room right of the nodes for the "Fail · leave" tag */
const TAG_W = 120;

// ── small pieces ──

function Chevron({ open }: { open?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden style={open ? { transform: "rotate(180deg)" } : undefined}>
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function Sparkle() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
function Check({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StatusBadge({ status }: { status: MapSection["status"] }) {
  return status === "confirmed" ? (
    <span className="flex h-6 shrink-0 items-center gap-1 rounded-sm bg-bg-ai-subtle px-2 text-caption-default font-bold text-text-accent">
      <Check size={12} />
      {ws.confirmed}
    </span>
  ) : (
    <span className="flex h-6 shrink-0 items-center gap-1.5 rounded-sm bg-bg-pending-subtle px-2 text-caption-default font-bold text-status-pending">
      <span aria-hidden className="size-1.5 rounded-full bg-status-pending" />
      {ws.needsReview}
    </span>
  );
}

function Select({ value, onChange, invalid }: { value: string; onChange: (v: string) => void; invalid?: boolean }) {
  return (
    <span className="relative flex w-full">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-control-40 w-full appearance-none rounded-md bg-bg-canvas pl-3 pr-9 text-label-default outline-none ring-1 ring-inset cursor-pointer ${
          invalid ? "ring-status-pending" : "ring-border-default"
        } ${value ? "text-text-primary" : "text-text-secondary"}`}
      >
        <option value="">{ws.choose}</option>
        {scriptOptions.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-icon-secondary">
        <Chevron />
      </span>
    </span>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-label-default text-text-secondary">{label}</span>
      {children}
    </div>
  );
}

function KebabMenu({ items }: { items: { label: string; onSelect: () => void; disabled?: boolean }[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={ws.menu.label}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="flex size-8 items-center justify-center rounded-md text-icon-secondary cursor-pointer hover:bg-bg-hover hover:text-icon-primary"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
          <circle cx="12" cy="5" r="1.6" fill="currentColor" />
          <circle cx="12" cy="12" r="1.6" fill="currentColor" />
          <circle cx="12" cy="19" r="1.6" fill="currentColor" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-20 flex w-[220px] flex-col rounded-md bg-bg-surface p-1 shadow-[inset_0_0_0_1px_var(--gc-border-default),0_4px_12px_0_var(--gc-effect-shadow)]">
          {items.map((it) => (
            <button
              key={it.label}
              type="button"
              disabled={it.disabled}
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                it.onSelect();
              }}
              className="flex h-control-40 items-center rounded-md px-3 text-left text-label-default text-text-primary cursor-pointer hover:bg-bg-hover disabled:cursor-default disabled:text-text-secondary disabled:hover:bg-transparent"
            >
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── left: section card ──

function SectionCard({
  section,
  index,
  open,
  onToggle,
  onChange,
  onConfirm,
  onReread,
  onRemove,
}: {
  section: MapSection;
  index: number;
  open: boolean;
  onToggle: () => void;
  onChange: (next: MapSection) => void;
  onConfirm: () => void;
  onReread: () => void;
  onRemove?: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [answer, setAnswer] = useState("");
  const firstField = useRef<HTMLDivElement>(null);
  const needs = section.status === "needsReview";
  const missing = !section.clear ? ws.needClear : !section.fail.source && !section.fail.text.trim() ? ws.needFail : null;

  return (
    <div
      data-section={section.id}
      className={`flex flex-col rounded-lg bg-bg-surface ring-inset ${open ? "ring-[1.5px] ring-border-accent" : "ring-1 ring-border-default"}`}
    >
      <div
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={onToggle}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onToggle())}
        className="flex h-[64px] items-center gap-3 rounded-lg pl-5 pr-3 cursor-pointer hover:bg-bg-hover"
      >
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-bg-subtle text-label-default font-bold text-text-primary">{index}</span>
        <span className="min-w-0 flex-1 truncate text-body-default font-bold text-text-primary">{section.name}</span>
        <StatusBadge status={section.status} />
        <KebabMenu
          items={[
            { label: ws.menu.reread, onSelect: onReread },
            { label: ws.menu.remove, onSelect: () => onRemove?.(), disabled: !onRemove },
          ]}
        />
        <span className="text-icon-secondary">
          <Chevron open={open} />
        </span>
      </div>

      {open && (
        <div className="flex flex-col gap-5 px-5 pb-5 pt-1">
          {needs && section.question && (
            <div className="flex flex-col gap-3 rounded-md bg-bg-pending-subtle p-4 ring-1 ring-inset ring-border-pending-subtle">
              <span className="flex items-center gap-2 text-caption-default font-bold text-status-pending">
                <Sparkle />
                {ws.aiAsks}
              </span>
              <p className="text-body-default text-text-primary">{section.question}</p>
              {section.candidates && (
                <div className="flex flex-wrap gap-2">
                  {section.candidates.map((c) => {
                    const forFail = c === "Humanoid > Died" || c === "TimerManager > OnTimeUp";
                    const selected = forFail ? section.fail.source === c : section.clear === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() =>
                          onChange(forFail ? { ...section, fail: { ...section.fail, source: c } } : { ...section, clear: c })
                        }
                        className={`flex h-8 items-center gap-1.5 rounded-md px-3 text-label-default cursor-pointer ring-1 ring-inset ${
                          selected ? "bg-bg-selected text-text-primary ring-border-accent" : "text-text-primary ring-border-default hover:bg-bg-hover"
                        }`}
                      >
                        {selected && <Check size={14} />}
                        {c}
                      </button>
                    );
                  })}
                </div>
              )}
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={2}
                placeholder={ws.answerPlaceholder}
                className="w-full resize-none rounded-md bg-bg-canvas px-3 py-2 text-label-default text-text-primary outline-none ring-1 ring-inset ring-border-default placeholder:text-text-secondary"
              />
            </div>
          )}

          <div ref={firstField} className="flex flex-col gap-4">
            <Field label={ws.start}>
              <Select value={section.start} onChange={(v) => onChange({ ...section, start: v })} />
            </Field>
            <Field label={ws.clear}>
              <Select value={section.clear} onChange={(v) => onChange({ ...section, clear: v })} invalid={needs && !section.clear} />
            </Field>
            <Field label={ws.fail}>
              <div className="flex flex-col gap-2">
                <Select
                  value={section.fail.source}
                  onChange={(v) => onChange({ ...section, fail: { ...section.fail, source: v } })}
                  invalid={needs && !section.fail.source && !section.fail.text.trim()}
                />
                <input
                  value={section.fail.text}
                  onChange={(e) => onChange({ ...section, fail: { ...section.fail, text: e.target.value } })}
                  placeholder={ws.failPlaceholder}
                  className="h-control-40 w-full rounded-md bg-bg-canvas px-3 text-label-default text-text-primary outline-none ring-1 ring-inset ring-border-default placeholder:text-text-secondary"
                />
              </div>
            </Field>
            {section.extra.map((v, i) => (
              <Field key={i} label={ws.extra(i + 1)}>
                <Select value={v} onChange={(nv) => onChange({ ...section, extra: section.extra.map((x, j) => (j === i ? nv : x)) })} />
              </Field>
            ))}
          </div>

          <div className="flex flex-col gap-3 rounded-md bg-bg-ai-subtle p-4">
            <span className="flex items-center gap-2 text-caption-default font-bold text-text-accent">
              <span className="text-icon-ai">
                <Sparkle />
              </span>
              {ws.aiRead}
            </span>
            <p className="text-label-default text-text-primary">{section.evidence}</p>
            {editing && <p className="text-caption-default text-text-secondary">{ws.editing}</p>}
            {missing && <p className="text-caption-default text-status-pending">{missing}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                disabled={!!missing}
                onClick={() => {
                  setEditing(false);
                  onConfirm();
                }}
                className={`flex h-8 items-center gap-1.5 rounded-md px-3 text-label-default font-semibold cursor-pointer disabled:cursor-default disabled:opacity-40 ${
                  section.status === "confirmed" && !editing ? "bg-bg-selected text-text-primary" : "bg-bg-button-primary text-text-on-button-primary hover-layer"
                }`}
              >
                <Check size={14} />
                {ws.yes}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(true);
                  firstField.current?.querySelector("select")?.focus();
                }}
                className="flex h-8 items-center rounded-md px-3 text-label-default text-text-primary ring-1 ring-inset ring-border-default cursor-pointer hover:bg-bg-hover"
              >
                {ws.edit}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onChange({ ...section, extra: [...section.extra, ""] })}
            className="self-start rounded-md px-2 py-1 text-label-default text-text-accent cursor-pointer hover:bg-bg-hover"
          >
            {ws.addCondition}
          </button>
        </div>
      )}
    </div>
  );
}

// ── right: game structure canvas ──

export function FlowCanvas({ sections, selected, onSelect, nodeLabels }: { sections: MapSection[]; selected: string | null; onSelect: (id: string) => void; nodeLabels?: Record<string, string> }) {
  const stages = sections.slice(1);
  const total = sections.length;
  const completeY = total * ROW;
  const width = NODE_W + TAG_W;
  const height = completeY + 48;
  const yOf = (i: number) => i * ROW;

  return (
    <div className="relative" style={{ width, height }}>
      <svg width={width} height={height} className="absolute inset-0 overflow-visible" aria-hidden>
        <defs>
          <marker id="gc-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 1L9 5L0 9" fill="none" stroke="var(--gc-text-secondary)" strokeWidth="1.5" />
          </marker>
        </defs>
        {/* solid: next section */}
        {sections.map((s, i) => (
          <line
            key={`n-${s.id}`}
            x1={NODE_W / 2}
            y1={yOf(i) + NODE_H}
            x2={NODE_W / 2}
            y2={i === total - 1 ? completeY - 2 : yOf(i + 1) - 2}
            stroke="var(--gc-text-secondary)"
            strokeWidth="1.5"
            markerEnd="url(#gc-arrow)"
          />
        ))}
      </svg>

      {/* connector labels */}
      {sections.map((s, i) => (
        <span
          key={`l-${s.id}`}
          className="absolute flex h-6 items-center rounded-full bg-bg-surface px-2.5 text-caption-default text-text-secondary ring-1 ring-inset ring-border-default"
          style={{ left: NODE_W / 2, top: yOf(i) + NODE_H + (ROW - NODE_H) / 2 - 12, transform: "translateX(-50%)" }}
        >
          {i === 0 ? ws.enter : ws.cleared}
        </span>
      ))}
      {/* "Fail · leave" tag right next to each stage (no return lines — they were too busy) */}
      {stages.map((s, k) => (
        <span
          key={`fl-${s.id}`}
          className="absolute flex h-6 items-center whitespace-nowrap rounded-full bg-bg-surface px-2.5 text-caption-default text-text-secondary ring-1 ring-inset ring-border-default"
          style={{ left: NODE_W + 12, top: yOf(k + 1) + NODE_H / 2 - 12 }}
        >
          {ws.failBack}
        </span>
      ))}

      {/* nodes */}
      {sections.map((s, i) => {
        const active = selected === s.id;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelect(s.id)}
            className={`absolute flex items-center gap-3 rounded-md bg-bg-surface px-4 text-left cursor-pointer transition-shadow hover:bg-bg-hover ${
              active ? "ring-[1.5px] ring-inset ring-border-accent shadow-[0_0_0_4px_var(--gc-effect-selected-ring)]" : "ring-1 ring-inset ring-border-default"
            }`}
            style={{ left: 0, top: yOf(i), width: NODE_W, height: NODE_H }}
          >
            <span className={`text-label-default font-bold ${active ? "text-text-accent" : "text-text-secondary"}`}>{i}</span>
            <span className="min-w-0 flex-1 truncate text-body-default font-bold text-text-primary">{s.name}</span>
            {nodeLabels?.[s.id] && <span className="shrink-0 text-caption-default text-text-secondary">{nodeLabels[s.id]}</span>}
            <span aria-hidden className={`size-2.5 shrink-0 rounded-full ${s.status === "confirmed" ? "bg-text-accent" : "bg-status-pending"}`} />
          </button>
        );
      })}

      {/* game complete */}
      <span
        className="absolute flex h-12 items-center justify-center gap-2 rounded-full bg-bg-surface text-body-default text-text-primary ring-1 ring-inset ring-border-default"
        style={{ left: 20, top: completeY, width: NODE_W - 40 }}
      >
        <span className="flex size-5 items-center justify-center rounded-full bg-bg-positive-subtle text-text-positive">
          <Check size={12} />
        </span>
        {ws.complete}
      </span>
    </div>
  );
}

export function ZoomButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex size-9 items-center justify-center text-icon-secondary cursor-pointer hover:bg-bg-hover hover:text-icon-primary"
    >
      {children}
    </button>
  );
}

// ── page ──

export function MappingWorkspace({ saving, onSave }: { saving: boolean; onSave: (pendingIds: string[]) => void }) {
  const [sections, setSections] = useState<MapSection[]>(initialSections);
  const [openId, setOpenId] = useState<string | null>("stage-3");
  const [panelTab, setPanelTab] = useState<"sections" | "insights">("sections");
  const [zoom, setZoom] = useState(1);
  const [note, setNote] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const done = sections.filter((s) => s.status === "confirmed").length;
  const update = (id: string, next: MapSection) => setSections((all) => all.map((s) => (s.id === id ? next : s)));

  const openFromCanvas = (id: string) => {
    setPanelTab("sections");
    setOpenId(id);
    window.setTimeout(() => listRef.current?.querySelector(`[data-section="${id}"]`)?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 0);
  };
  const addSection = () => {
    const n = sections.length; // lobby + n-1 stages → next stage number
    const id = `stage-${n}-${Date.now()}`;
    setSections((all) => [
      ...all,
      { id, name: ws.newSection(n), status: "needsReview", start: "", clear: "", fail: { source: "", text: "" }, extra: [], evidence: ws.newSectionQuestion, question: ws.newSectionQuestion },
    ]);
    openFromCanvas(id);
  };

  return (
    <div className="flex h-full w-full flex-col bg-bg-canvas">
      {/* top bar */}
      <div className="flex h-[72px] shrink-0 items-center gap-4 border-b border-border-default px-6">
        <h1 data-no-translate className="text-title-card font-bold text-text-primary">
          {ws.game}
        </h1>
        <span className="flex h-7 items-center gap-2 rounded-full bg-bg-pending-subtle px-3 text-label-default text-status-pending">
          <span aria-hidden className="size-1.5 rounded-full bg-status-pending" />
          {ws.statusBadge(done, sections.length)}
        </span>
        <div className="ml-auto flex items-center gap-3">
          <div className="relative">
            <Button variant="secondary" onClick={() => setNote((v) => !v)}>
              {ws.testPlay}
            </Button>
            {note && (
              <span className="absolute right-0 top-14 z-20 w-[280px] rounded-md bg-bg-tooltip p-3 text-label-default text-text-tooltip shadow-[inset_0_0_0_1px_var(--gc-border-tooltip),0_4px_12px_0_var(--gc-effect-shadow)]">
                {ws.testPlayNote}
              </span>
            )}
          </div>
          <Button variant="primary" disabled={saving} onClick={() => onSave(sections.filter((s) => s.status !== "confirmed").map((s) => s.id))}>
            {saving ? ws.saving : ws.save}
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-row-reverse">
        {/* right: editable sections or contextual comparison insights */}
        <div ref={listRef} className="flex w-[40%] min-w-[400px] flex-col overflow-y-auto border-l border-border-default">
          <div className="sticky top-0 z-10 bg-bg-canvas px-6 pt-6">
            <div role="tablist" aria-label={ws.panelTitle} className="flex items-center gap-5 border-b border-border-default">
              <button
                id="mapping-sections-tab"
                type="button"
                role="tab"
                aria-selected={panelTab === "sections"}
                aria-controls="mapping-sections-panel"
                onClick={() => setPanelTab("sections")}
                className={`relative flex h-10 items-center text-body-default font-bold cursor-pointer ${panelTab === "sections" ? "text-text-primary" : "text-text-secondary hover:text-text-primary"}`}
              >
                {ws.panelTitle}
                {panelTab === "sections" && <span aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 bg-text-accent" />}
              </button>
              <button
                id="mapping-insights-tab"
                type="button"
                role="tab"
                aria-selected={panelTab === "insights"}
                aria-controls="mapping-insights-panel"
                onClick={() => setPanelTab("insights")}
                className={`relative flex h-10 items-center text-body-default font-bold cursor-pointer ${panelTab === "insights" ? "text-text-primary" : "text-text-secondary hover:text-text-primary"}`}
              >
                {ws.insightsTab}
                {panelTab === "insights" && <span aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 bg-text-accent" />}
              </button>
            </div>
          </div>

          {panelTab === "sections" ? (
            <div id="mapping-sections-panel" role="tabpanel" aria-labelledby="mapping-sections-tab" className="flex flex-col gap-3 p-6 pt-4">
              <div className="flex flex-col gap-1 pb-1">
                <span className="text-label-default text-text-secondary">{ws.panelHint}</span>
              </div>
              {sections.map((s, i) => (
                <SectionCard
                  key={s.id}
                  section={s}
                  index={i}
                  open={openId === s.id}
                  onToggle={() => setOpenId((cur) => (cur === s.id ? null : s.id))}
                  onChange={(next) => update(s.id, next)}
                  onConfirm={() => update(s.id, { ...s, status: "confirmed" })}
                  onReread={() => update(s.id, initialSections.find((x) => x.id === s.id) ?? s)}
                  onRemove={
                    i === 0
                      ? undefined
                      : () => {
                          setSections((all) => all.filter((x) => x.id !== s.id));
                          if (openId === s.id) setOpenId(null);
                        }
                  }
                />
              ))}
              <button
                type="button"
                onClick={addSection}
                className="flex h-16 shrink-0 items-center justify-center rounded-lg border border-dashed border-border-default text-label-default text-text-secondary cursor-pointer hover:bg-bg-hover hover:text-text-primary"
              >
                {ws.addSection}
              </button>
            </div>
          ) : (
            <MappingInsights onSelectSection={openFromCanvas} />
          )}
        </div>

        {/* left: game structure canvas */}
        <div
          className="relative min-w-0 flex-1 overflow-hidden bg-bg-tracking-canvas"
          style={{ backgroundImage: "radial-gradient(var(--gc-chart-grid) 1px, transparent 1px)", backgroundSize: "20px 20px" }}
        >
          <div className="absolute inset-0 overflow-auto">
            <div className="flex min-h-full min-w-full items-start justify-center px-10 pb-40 pt-20">
              <div style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}>
                <FlowCanvas sections={sections} selected={openId} onSelect={openFromCanvas} />
              </div>
            </div>
          </div>

          {/* legend */}
          <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-5 whitespace-nowrap rounded-md bg-bg-surface px-4 py-2.5 text-caption-default text-text-secondary ring-1 ring-inset ring-border-default">
            <span className="flex items-center gap-2">
              <span aria-hidden className="h-[1.5px] w-6 bg-text-secondary" />
              {ws.legend.clear}
            </span>
            <span className="flex items-center gap-2">
              <span aria-hidden className="flex h-5 items-center rounded-full bg-bg-surface px-2 text-[11px] leading-none text-text-secondary ring-1 ring-inset ring-border-default">
                {ws.failBack}
              </span>
              {ws.legend.fail}
            </span>
            <span className="flex items-center gap-2">
              <span aria-hidden className="size-2.5 rounded-full bg-status-pending" />
              {ws.legend.review}
            </span>
          </div>

          {/* zoom */}
          <div className="absolute bottom-5 right-5 z-10 flex flex-col overflow-hidden rounded-md bg-bg-surface ring-1 ring-inset ring-border-default">
            <ZoomButton label={ws.zoomIn} onClick={() => setZoom((z) => Math.min(1.6, +(z + 0.1).toFixed(2)))}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </ZoomButton>
            <ZoomButton label={ws.zoomOut} onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.1).toFixed(2)))}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </ZoomButton>
            <ZoomButton label={ws.fit} onClick={() => setZoom(1)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </ZoomButton>
          </div>

          {saving && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-bg-scrim">
              <div className="flex w-[360px] flex-col gap-2 rounded-lg bg-bg-surface p-6 ring-1 ring-inset ring-border-default">
                <span className="text-body-default font-bold text-text-primary">{ws.savingTitle}</span>
                <span className="text-label-default text-text-secondary">{ws.savingCaption}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
