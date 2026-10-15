import React, { useState, type ReactNode } from "react";
import { Maximize, Minus, Plus, Redo2, Undo2 } from "lucide-react";
import type { catalog } from "../../data/analysisSetup";
import { DrawerClose } from "../setup/DrawerFrame";

// Repo `CountChip`: h40 px16 gap8 radius 8, grey dot when nothing is tracked.
export function EventsChip({ events, right, inline = false }: { events: (typeof catalog)[number][]; right: number; inline?: boolean }) {
  const [open, setOpen] = useState(false);
  const count = events.length;
  return (
    <div className={`absolute ${inline ? "top-0" : "top-6"} z-30 flex flex-col items-end gap-2 transition-[right] duration-300`} style={{ right }}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`flex h-10 items-center gap-2 rounded-md px-4 text-label-default ring-1 ring-inset ring-border-default cursor-pointer transition-colors duration-150 ${
          open ? "bg-bg-selected" : "bg-bg-surface hover:bg-bg-hover"
        }`}
      >
        <span aria-hidden className={`size-2 shrink-0 rounded-full ${count > 0 ? "bg-status-positive" : "bg-icon-secondary"}`} />
        <span className="text-text-secondary">Events</span>
        <span className="font-bold text-text-primary">{count}</span>
      </button>
      {open && (
        <div
          className="flex w-[280px] flex-col rounded-md bg-bg-surface ring-1 ring-inset ring-border-default shadow-[0_12px_32px_0_var(--gc-effect-shadow)]"
          style={{ animation: "gc-fade-in 160ms ease-out both" }}
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3 shadow-[inset_0_-1px_0_var(--gc-border-default)]">
            <span className="text-fs-16 font-bold leading-[1.6] text-text-primary">Events</span>
            <DrawerClose label="Close" onClick={() => setOpen(false)} />
          </div>
          {count === 0 ? (
            <p className="px-4 py-4 text-label-default text-text-secondary">No events are tracked yet.</p>
          ) : (
            <ul className="flex flex-col gap-1 p-2">
              {events.map((e) => (
                <li key={e.id} className="flex h-10 items-center gap-2 rounded-md px-2">
                  <span aria-hidden className="size-2 shrink-0 rounded-full bg-status-positive" />
                  <span data-no-translate className="min-w-0 flex-1 truncate text-label-default text-text-primary">{e.id}</span>
                  <span className="text-caption-default text-text-positive">Active</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function ControlButton({ label, onClick, children }: { label: string; onClick?: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex size-10 items-center justify-center text-icon-secondary cursor-pointer transition-colors duration-150 hover:bg-bg-hover hover:text-icon-primary"
    >
      {children}
    </button>
  );
}

/** Bottom-left canvas controls. Zoom works; undo/redo are hover-only (nothing to edit after mapping). */
export function CanvasControls({ onZoomIn, onZoomOut, onFit }: { onZoomIn: () => void; onZoomOut: () => void; onFit: () => void }) {
  const group = "flex items-center overflow-hidden rounded-md bg-bg-surface ring-1 ring-inset ring-border-default";
  return (
    <div className="absolute bottom-6 left-6 z-30 flex items-center gap-2">
      <div className={group}>
        <ControlButton label="Zoom out" onClick={onZoomOut}>
          <Minus size={16} strokeWidth={1.5} />
        </ControlButton>
        <ControlButton label="Zoom in" onClick={onZoomIn}>
          <Plus size={16} strokeWidth={1.5} />
        </ControlButton>
        <ControlButton label="Fit to nodes" onClick={onFit}>
          <Maximize size={16} strokeWidth={1.5} />
        </ControlButton>
      </div>
      <div className={group}>
        <ControlButton label="Undo">
          <Undo2 size={16} strokeWidth={1.5} />
        </ControlButton>
        <ControlButton label="Redo">
          <Redo2 size={16} strokeWidth={1.5} />
        </ControlButton>
      </div>
    </div>
  );
}
