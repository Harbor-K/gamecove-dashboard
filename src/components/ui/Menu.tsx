import React, { useEffect, useRef, useState, type ReactNode } from "react";
import { Check } from "lucide-react";

// Small dropdown menu (repo Menu / Page actions · Card actions · Dropdown): radius 8, surface + 1px border + lifted shadow.
// Closes on outside click / Escape. A disabled option shows why it can't be picked (hint) instead of silently doing nothing.

export type MenuItem = {
  label: string;
  onSelect?: () => void;
  disabled?: boolean;
  /** One short line under the label (why it's disabled, or what it does). */
  hint?: string;
  selected?: boolean;
  /** Label shown for a moment after selecting (e.g. "Link copied"); the menu closes after. */
  doneLabel?: string;
};

export function useOutsideClose(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && close();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);
  return ref;
}

export function MenuPanel({ children, align = "right", width = 240 }: { children: ReactNode; align?: "left" | "right"; width?: number }) {
  return (
    <div
      role="menu"
      className={`absolute top-full z-40 mt-1 flex flex-col gap-1 rounded-md bg-bg-surface p-2 ring-1 ring-inset ring-border-default shadow-[0_8px_24px_0_var(--gc-effect-shadow-lifted)] ${
        align === "right" ? "right-0" : "left-0"
      }`}
      style={{ width, animation: "gc-fade-in 120ms ease-out both" }}
    >
      {children}
    </div>
  );
}

export function MenuOption({ item, onDone }: { item: MenuItem; onDone: () => void }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      role="menuitem"
      aria-disabled={item.disabled || undefined}
      onClick={() => {
        if (item.disabled) return;
        item.onSelect?.();
        if (item.doneLabel) {
          setDone(true);
          window.setTimeout(onDone, 900);
        } else onDone();
      }}
      className={`flex min-h-10 w-full items-center justify-between gap-3 rounded-sm px-3 py-2 text-left ${
        item.disabled ? "cursor-default" : "cursor-pointer hover:bg-bg-hover"
      }`}
    >
      <span className="flex min-w-0 flex-col">
        <span className={`text-body-default ${item.disabled ? "text-text-secondary opacity-60" : "text-text-primary"}`}>
          {done ? item.doneLabel : item.label}
        </span>
        {item.hint && <span className="text-caption-default text-text-secondary">{item.hint}</span>}
      </span>
      {(item.selected || done) && <Check size={16} strokeWidth={1.5} className="shrink-0 text-text-primary" />}
    </button>
  );
}

/** Trigger + menu. `trigger` renders the button content; the button styles come from `buttonClassName`. */
export function MenuButton({
  ariaLabel,
  buttonClassName,
  trigger,
  items,
  align = "right",
  width,
}: {
  ariaLabel: string;
  buttonClassName: string;
  trigger: ReactNode;
  items: MenuItem[];
  align?: "left" | "right";
  width?: number;
}) {
  const [open, setOpen] = useState(false);
  const ref = useOutsideClose(open, () => setOpen(false));
  return (
    <div ref={ref} className="relative">
      <button type="button" aria-label={ariaLabel} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)} className={buttonClassName}>
        {trigger}
      </button>
      {open && (
        <MenuPanel align={align} width={width}>
          {items.map((it) => (
            <MenuOption key={it.label} item={it} onDone={() => setOpen(false)} />
          ))}
        </MenuPanel>
      )}
    </div>
  );
}

/** Copy text (works in the preview iframe too; falls back to a hidden textarea). */
export function copyText(text: string) {
  try {
    if (navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
      return;
    }
  } catch {
    /* fall through */
  }
  fallbackCopy(text);
}
function fallbackCopy(text: string) {
  try {
    const el = document.createElement("textarea");
    el.value = text;
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    el.remove();
  } catch {
    /* clipboard blocked — nothing else to do */
  }
}
