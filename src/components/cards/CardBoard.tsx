import React, { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { boardCopy as C, memoDef, pageCards, type CardDef, type CardIcon, type PageKey } from "../../data/page-cards";
import { layoutActions, seedLayout, usePageLayout } from "../../state/page-layout";
import { useScreenInit } from "../../useScreenInit.js";
import type { MenuItem } from "../ui/Menu";

// "카드 추가" for Overview / Retention (interaction pattern from Mixpanel boards, GameCove dark theme):
// hover between rows → + at both edges · full-width "+ 카드 추가" bar at the bottom · both open the same menu
// (only this page's cards; ones already on the page are checked + disabled) · ⋮⋮ row handle (move / send / hide, drag to reorder).
// Cards themselves render unchanged — the board only places them.

type ScreenInit = {
  cardsPage?: PageKey;
  cardsMenu?: "gap" | "bottom";
  cardsGap?: number;
  cardsHoverGap?: number;
  cardsJustAdded?: string;
  cardsAddAt?: number;
};

const zoom = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--gc-zoom")) || 1;
const HIGHLIGHT_MS = 1800;

// ── icons ──

function Glyph({ icon }: { icon: CardIcon }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (icon) {
    case "funnel":
      return <path {...p} d="M5 5v14M10 9v10M15 13v6M20 16v3" />;
    case "people":
      return <path {...p} d="M9 11a3 3 0 100-6 3 3 0 000 6zM3.5 19c.6-3 2.9-5 5.5-5s4.9 2 5.5 5M16 5.5a3 3 0 010 5.5M18 14c1.4.7 2.3 2.4 2.6 5" />;
    case "bars":
      return <path {...p} d="M4 6h10M4 12h16M4 18h7" />;
    case "stars":
      return <path {...p} d="M12 4l2.3 4.7 5.2.8-3.8 3.6.9 5.1L12 15.8 7.4 18.2l.9-5.1L4.5 9.5l5.2-.8L12 4z" />;
    case "list":
      return <path {...p} d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01" />;
    case "table":
      return <path {...p} d="M4 5h16v14H4zM4 10h16M4 15h16M10 5v14" />;
    case "alert":
      return <path {...p} d="M12 4l9 15H3l9-15zM12 10v4M12 17h.01" />;
    case "trend":
      return <path {...p} d="M4 18l5-6 4 3 7-9M15 6h5v5" />;
    case "heatmap":
      return <path {...p} d="M4 4h4v4H4zM10 4h4v4h-4zM16 4h4v4h-4zM4 10h4v4H4zM10 10h4v4h-4zM4 16h4v4H4z" />;
    case "device":
      return <path {...p} d="M3 5h13v9H3zM7 18h5M9.5 14v4M18 9h3v10h-3z" />;
    case "tiles":
      return <path {...p} d="M4 5h7v6H4zM13 5h7v6h-7zM4 13h7v6H4zM13 13h7v6h-7z" />;
    default:
      return <path {...p} d="M6 4h9l4 4v12H6zM14 4v5h5M9 13h6M9 16h4" />;
  }
}
function CardGlyph({ def }: { def: CardDef }) {
  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-bg-subtle" style={{ color: `var(${def.tone})` }}>
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
        <Glyph icon={def.icon} />
      </svg>
    </span>
  );
}
const Plus = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);
const Check = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Grip = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
    {[7, 12, 17].flatMap((y) => [9, 15].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.5" fill="currentColor" />))}
  </svg>
);
const Lock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 11V8a4 4 0 018 0v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
const MenuIcon = ({ d }: { d: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d={d} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ── add menu (popover, ~480px) ──

type Anchor = { rect: DOMRect; align: "start" | "end" };

function AddCardMenu({ page, anchor, present, onPick, onClose }: { page: PageKey; anchor: Anchor; present: string[]; onPick: (id: string) => void; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const [query, setQuery] = useState("");
  const { catalog } = pageCards[page];
  const q = query.trim().toLowerCase();
  const match = (d: CardDef) => `${d.title} ${d.desc}`.toLowerCase().includes(q);
  const items = q ? catalog.filter(match) : catalog;
  const showMemo = !q || match(memoDef);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const z = zoom();
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const vw = window.innerWidth / z;
    const vh = window.innerHeight / z;
    const r = { left: anchor.rect.left / z, right: anchor.rect.right / z, top: anchor.rect.top / z, bottom: anchor.rect.bottom / z };
    let left = anchor.align === "start" ? r.left : r.right - w;
    left = Math.min(Math.max(8, left), vw - w - 8);
    let top = r.bottom + 8;
    if (top + h > vh - 8) top = Math.max(8, r.top - 8 - h);
    setPos({ left, top });
  }, [anchor, items.length, showMemo]);

  useEffect(() => {
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && onClose();
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const t = window.setTimeout(() => document.addEventListener("mousedown", close), 0);
    document.addEventListener("keydown", esc);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [onClose]);

  const row = (def: CardDef, disabled: boolean, onClick: () => void) => (
    <button
      key={def.id}
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left cursor-pointer hover:bg-bg-hover disabled:cursor-default disabled:hover:bg-transparent"
    >
      <span className={disabled ? "opacity-50" : ""}>
        <CardGlyph def={def} />
      </span>
      <span className={`flex min-w-0 flex-1 flex-col gap-0.5 ${disabled ? "opacity-50" : ""}`}>
        <span className="flex items-center gap-2">
          <span className="min-w-0 text-label-default font-bold text-text-primary">{def.title}</span>
          {def.recommended && !disabled && (
            <span className="flex h-5 shrink-0 items-center rounded-sm bg-bg-ai-subtle px-1.5 text-[11px] font-bold leading-none text-text-accent">
              {C.recommended}
            </span>
          )}
        </span>
        <span className="truncate text-caption-default text-text-secondary">{def.desc}</span>
      </span>
      {disabled && (
        <span className="flex shrink-0 items-center gap-1 text-caption-default text-text-secondary" title={C.added}>
          <Check />
        </span>
      )}
    </button>
  );

  return createPortal(
    <div
      ref={ref}
      role="dialog"
      aria-label={C.addBar}
      className="fixed z-[90] flex w-[480px] max-h-[min(640px,80vh)] flex-col rounded-lg bg-bg-surface shadow-[inset_0_0_0_1px_var(--gc-border-default),0_8px_24px_0_var(--gc-effect-shadow-lifted)]"
      style={{ left: pos?.left ?? 0, top: pos?.top ?? 0, visibility: pos ? "visible" : "hidden", animation: "gc-fade-in 140ms ease-out both" }}
    >
      <div className="p-3 pb-2">
        <label className="flex h-control-40 items-center gap-2 rounded-md bg-bg-canvas px-3 ring-1 ring-inset ring-border-default">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-icon-secondary">
            <path d="M21 21l-4.5-4.5M18 10.5a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={C.search}
            className="min-w-0 flex-1 bg-transparent text-label-default text-text-primary outline-none placeholder:text-text-secondary"
          />
        </label>
      </div>
      <div className="flex min-h-0 flex-col overflow-y-auto px-2 pb-2">
        {items.map((def) => {
          const on = present.includes(def.id);
          return row(def, on, () => onPick(def.id));
        })}
        {!items.length && !showMemo && <p className="px-3 py-6 text-center text-label-default text-text-secondary">{C.empty}</p>}
        {showMemo && (
          <>
            <span aria-hidden className="mx-3 my-2 h-px shrink-0 bg-border-default" />
            {row(memoDef, false, () => onPick(`memo:${Date.now().toString(36)}`))}
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}

// ── gap between rows: + at both edges ──
// While shown, the gap sits above the sticky filter bar (z-[15]) so its + buttons and tip are never cut off by the bar.

function Gap({
  index,
  forced,
  dropActive,
  onAdd,
  onDragOver,
  onDrop,
}: {
  index: number;
  forced: boolean;
  dropActive: boolean;
  onAdd: (el: HTMLElement, align: "start" | "end") => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}) {
  const show = forced ? "opacity-100" : "opacity-0 group-hover/gap:opacity-100";
  const btnBase = "flex size-8 items-center justify-center rounded-md bg-bg-surface text-text-accent ring-1 ring-inset ring-border-default cursor-pointer hover:bg-bg-hover";
  const btn = `absolute top-1/2 -mt-4 ${btnBase}`;
  return (
    <div
      data-gap={index}
      className={`group/gap relative h-12 w-full hover:z-[16] ${forced ? "z-[16]" : ""}`}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 top-1/2 h-0 border-t ${
          dropActive ? "border-solid border-border-accent opacity-100" : `border-dashed border-border-default ${show}`
        }`}
      />
      <button type="button" data-gap-plus={`${index}-start`} aria-label={C.addHere} onClick={(e) => onAdd(e.currentTarget, "start")} className={`${btn} -left-11 ${show}`}>
        <Plus />
      </button>
      <span className={`absolute -right-11 top-1/2 -mt-4 flex items-center ${show}`}>
        <span
          className={`pointer-events-none absolute right-10 whitespace-nowrap rounded-md bg-bg-tooltip px-2.5 py-1.5 text-label-default text-text-tooltip shadow-[inset_0_0_0_1px_var(--gc-border-tooltip),0_4px_12px_0_var(--gc-effect-shadow)] ${
            forced ? "opacity-100" : "opacity-0 group-hover/gap:opacity-100"
          }`}
        >
          {C.addHere}
        </span>
        <button type="button" data-gap-plus={`${index}-end`} aria-label={C.addHere} onClick={(e) => onAdd(e.currentTarget, "end")} className={btnBase}>
          <Plus />
        </button>
      </span>
    </div>
  );
}

// ── row handle ⋮⋮ ──

function RowHandle({
  canUp,
  canDown,
  locked,
  onTop,
  onBottom,
  onSend,
  onHide,
  onDragStart,
  onDragEnd,
}: {
  canUp: boolean;
  canDown: boolean;
  locked?: boolean;
  onTop?: () => void;
  onBottom?: () => void;
  onSend?: () => void;
  onHide?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);
  const item = (label: string, icon: string, fn: (() => void) | undefined, disabled: boolean, critical = false) => (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        setOpen(false);
        fn?.();
      }}
      className={`flex h-control-40 w-full items-center gap-3 rounded-md px-3 text-left text-label-default cursor-pointer hover:bg-bg-hover disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent ${
        critical ? "text-text-critical" : "text-text-primary"
      }`}
    >
      <MenuIcon d={icon} />
      {label}
    </button>
  );
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={C.handle}
        aria-expanded={open}
        draggable={!locked}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onClick={() => setOpen((o) => !o)}
        className={`flex size-8 items-center justify-center rounded-md text-icon-secondary hover:bg-bg-hover hover:text-icon-primary ${
          locked ? "cursor-pointer" : "cursor-grab active:cursor-grabbing"
        } ${open ? "bg-bg-hover text-icon-primary" : ""}`}
      >
        <Grip />
      </button>
      {open && (
        <div className="absolute right-0 top-10 z-30 flex w-[232px] flex-col rounded-lg bg-bg-surface p-1.5 shadow-[inset_0_0_0_1px_var(--gc-border-default),0_8px_24px_0_var(--gc-effect-shadow-lifted)]">
          {item(C.moveTop, "M12 19V5M6 11l6-6 6 6", onTop, locked || !canUp)}
          {item(C.moveBottom, "M12 5v14M6 13l6 6 6-6", onBottom, locked || !canDown)}
          <span aria-hidden className="mx-2 my-1.5 h-px bg-border-default" />
          {item(C.sendToBoard, "M4 6h7v7H4zM13 11h7v7h-7zM11 9.5h4.5V11", onSend, !!locked)}
          <span aria-hidden className="mx-2 my-1.5 h-px bg-border-default" />
          {item(C.hide, "M3 3l18 18M10.6 6.1A9.8 9.8 0 0112 6c5 0 8.5 4.5 9 6-.3.8-1.1 2.1-2.4 3.4M6.6 7.6C4.7 8.9 3.4 10.7 3 12c.5 1.5 4 6 9 6 1.6 0 3-.4 4.2-1.1M9.9 9.9a3 3 0 004.2 4.2", onHide, !!locked, true)}
        </div>
      )}
    </div>
  );
}

/** GameCove default card (Overview KPI row / Retention D1 · D7): always first — lock with a tip, row menu disabled. */
export function FixedCard({ children }: { children: ReactNode }) {
  const [tip, setTip] = useState(false);
  return (
    <div className="group/row relative w-full">
      {children}
      <div className="absolute -right-11 top-0 flex flex-col items-center gap-1">
        <span
          className="relative flex size-8 items-center justify-center text-icon-secondary"
          onMouseEnter={() => setTip(true)}
          onMouseLeave={() => setTip(false)}
          aria-label={C.fixedTip}
          role="img"
        >
          <Lock />
          {tip && (
            <span className="pointer-events-none absolute right-10 top-0 z-30 whitespace-nowrap rounded-md bg-bg-tooltip px-3 py-2 text-label-default text-text-tooltip shadow-[inset_0_0_0_1px_var(--gc-border-tooltip),0_4px_12px_0_var(--gc-effect-shadow)]">
              {C.fixedTip}
            </span>
          )}
        </span>
        <span className="opacity-0 transition-opacity group-hover/row:opacity-100 focus-within:opacity-100">
          <RowHandle canUp={false} canDown={false} locked />
        </span>
      </div>
    </div>
  );
}

/** Memo card: plain text note, kept in app memory with the layout. */
function MemoCard({ page, id, text }: { page: PageKey; id: string; text: string }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.max(96, el.scrollHeight)}px`;
  }, [text]);
  return (
    <section className="flex w-full flex-col gap-3 rounded-lg bg-bg-surface p-8 ring-1 ring-inset ring-border-default">
      <h2 className="text-[24px] font-bold leading-[1.5] text-text-primary">{C.memoTitle}</h2>
      <textarea
        ref={ref}
        value={text}
        onChange={(e) => layoutActions.setMemo(page, id, e.target.value)}
        placeholder={C.memoPlaceholder}
        className="w-full resize-none overflow-hidden bg-transparent text-body-default text-text-primary outline-none placeholder:text-text-secondary"
      />
    </section>
  );
}

function Toast({ text, action, onAction }: { text: string; action?: string; onAction?: () => void }) {
  return createPortal(
    <div
      role="status"
      className="fixed bottom-8 left-1/2 z-[95] flex -translate-x-1/2 items-center gap-4 rounded-md bg-bg-tooltip px-4 py-3 text-label-default text-text-tooltip shadow-[inset_0_0_0_1px_var(--gc-border-tooltip),0_8px_24px_0_var(--gc-effect-shadow-lifted)]"
      style={{ animation: "gc-fade-in 160ms ease-out both" }}
    >
      {text}
      {action && (
        <button type="button" onClick={onAction} className="font-bold underline underline-offset-2 cursor-pointer">
          {action}
        </button>
      )}
    </div>,
    document.body,
  );
}

// ── board ──

export function CardBoard({ page, render }: { page: PageKey; render: (id: string) => ReactNode }) {
  const screen = useScreenInit() as ScreenInit;
  const forScreen = screen.cardsPage === page;
  if (forScreen) seedLayout(page, screen.cardsJustAdded, screen.cardsAddAt);
  const { rows, memos } = usePageLayout(page);
  const { fixed } = pageCards[page];
  const [menu, setMenu] = useState<{ anchor: Anchor; at: number } | null>(null);
  const [justAdded, setJustAdded] = useState<string | null>(forScreen ? screen.cardsJustAdded ?? null : null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dropAt, setDropAt] = useState<number | null>(null);
  const [toast, setToast] = useState<{ text: string; undo?: () => void } | null>(null);
  const bottomRef = useRef<HTMLButtonElement>(null);
  const toastTimer = useRef<number>();

  // Canvas screens: open the menu straight away (from a gap or the bottom bar).
  useEffect(() => {
    if (!forScreen || !screen.cardsMenu) return;
    const at = screen.cardsMenu === "bottom" ? rows.length : screen.cardsGap ?? 1;
    const el = screen.cardsMenu === "bottom" ? bottomRef.current : document.querySelector<HTMLElement>(`[data-gap-plus="${at}-end"]`);
    if (el) setMenu({ anchor: { rect: el.getBoundingClientRect(), align: screen.cardsMenu === "bottom" ? "start" : "end" }, at });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToast = (text: string, undo?: () => void) => {
    window.clearTimeout(toastTimer.current);
    setToast({ text, undo });
    toastTimer.current = window.setTimeout(() => setToast(null), 3200);
  };
  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const pick = (id: string) => {
    if (!menu) return;
    layoutActions.insert(page, id, menu.at);
    setMenu(null);
    setJustAdded(id);
    window.setTimeout(() => document.querySelector(`[data-row="${CSS.escape(id)}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 30);
  };
  useEffect(() => {
    if (!justAdded || (forScreen && screen.cardsJustAdded === justAdded)) return;
    const t = window.setTimeout(() => setJustAdded(null), HIGHLIGHT_MS);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [justAdded]);

  const openAt = (at: number) => (el: HTMLElement, align: "start" | "end") => setMenu({ anchor: { rect: el.getBoundingClientRect(), align }, at });

  const dragOverRow = (i: number) => (e: React.DragEvent) => {
    if (!dragging) return;
    e.preventDefault();
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDropAt(e.clientY < r.top + r.height / 2 ? i : i + 1);
  };
  const dragOverGap = (i: number) => (e: React.DragEvent) => {
    if (!dragging) return;
    e.preventDefault();
    setDropAt(i);
  };
  const drop = (e: React.DragEvent) => {
    e.preventDefault();
    if (dragging && dropAt !== null) layoutActions.move(page, dragging, dropAt);
    setDragging(null);
    setDropAt(null);
  };

  const present = [...fixed, ...rows];
  const hoverGap = forScreen ? screen.cardsHoverGap ?? (screen.cardsMenu === "gap" ? screen.cardsGap ?? 1 : undefined) : undefined;

  return (
    <div className="-mt-12 flex w-full flex-col">
      {rows.map((id, i) => (
        <React.Fragment key={id}>
          <Gap index={i} forced={hoverGap === i} dropActive={dragging !== null && dropAt === i} onAdd={openAt(i)} onDragOver={dragOverGap(i)} onDrop={drop} />
          <div data-row={id} className={`group/row relative w-full ${dragging === id ? "opacity-40" : ""}`} onDragOver={dragOverRow(i)} onDrop={drop}>
            <div
              className={`rounded-lg transition-shadow duration-700 ${
                justAdded === id ? "shadow-[0_0_0_2px_var(--gc-border-accent),0_0_0_8px_var(--gc-effect-selected-ring)]" : "shadow-[0_0_0_0_transparent]"
              }`}
            >
              {id.startsWith("memo:") ? <MemoCard page={page} id={id} text={memos[id] ?? ""} /> : render(id)}
            </div>
            <div className="absolute -right-11 top-0 opacity-0 transition-opacity group-hover/row:opacity-100 focus-within:opacity-100">
              <RowHandle
                canUp={i > 0}
                canDown={i < rows.length - 1}
                onTop={() => layoutActions.move(page, id, 0)}
                onBottom={() => layoutActions.move(page, id, rows.length)}
                onSend={() => showToast(C.sendSoon)}
                onHide={() => {
                  layoutActions.hide(page, id);
                  showToast(C.hidden, () => {
                    layoutActions.restore(page, id, i);
                    setToast(null);
                  });
                }}
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = "move";
                  e.dataTransfer.setData("text/plain", id);
                  const rowEl = (e.currentTarget as HTMLElement).closest("[data-row]");
                  if (rowEl) e.dataTransfer.setDragImage(rowEl, 32, 32);
                  setDragging(id);
                }}
                onDragEnd={() => {
                  setDragging(null);
                  setDropAt(null);
                }}
              />
            </div>
          </div>
        </React.Fragment>
      ))}
      <Gap
        index={rows.length}
        forced={hoverGap === rows.length}
        dropActive={dragging !== null && dropAt === rows.length}
        onAdd={openAt(rows.length)}
        onDragOver={dragOverGap(rows.length)}
        onDrop={drop}
      />
      <button
        ref={bottomRef}
        type="button"
        onClick={(e) => setMenu({ anchor: { rect: e.currentTarget.getBoundingClientRect(), align: "start" }, at: rows.length })}
        className={`flex h-16 w-full items-center gap-2 rounded-lg px-6 text-body-default text-text-accent ring-1 ring-inset cursor-pointer hover:bg-bg-hover ${
          menu && menu.at === rows.length && screen.cardsMenu !== "gap" ? "bg-bg-hover ring-border-accent" : "bg-bg-ai-subtle ring-border-default"
        }`}
      >
        {C.addBar}
      </button>

      {menu && <AddCardMenu page={page} anchor={menu.anchor} present={present} onPick={pick} onClose={() => setMenu(null)} />}
      {toast && <Toast text={toast.text} action={toast.undo ? C.undo : undefined} onAction={toast.undo} />}
    </div>
  );
}

/** Page ⋯ menu item "Reset to default layout" + its confirm modal. */
export function useResetLayout(page: PageKey): { item: MenuItem; modal: ReactNode } {
  const [open, setOpen] = useState(false);
  const item: MenuItem = { label: C.reset, onSelect: () => setOpen(true) };
  const modal = (
    <Modal open={open} contained labelledBy={`reset-${page}`} onEscape={() => setOpen(false)}>
      <div className="flex w-[440px] flex-col gap-6 rounded-lg bg-bg-surface p-8 shadow-[inset_0_0_0_1px_var(--gc-border-default),0_8px_24px_0_var(--gc-effect-shadow-lifted)]">
        <div className="flex flex-col gap-2">
          <h2 id={`reset-${page}`} className="text-title-card font-bold text-text-primary">
            {C.resetTitle}
          </h2>
          <p className="text-body-default text-text-secondary">{C.resetBody}</p>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            {C.cancel}
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              layoutActions.reset(page);
              setOpen(false);
            }}
          >
            {C.confirm}
          </Button>
        </div>
      </div>
    </Modal>
  );
  return { item, modal };
}
