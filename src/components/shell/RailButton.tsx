import React, { useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/** Screen px → CSS px (the whole app is scaled by --gc-zoom). */
const toCssPx = (px: number) => px / (parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--gc-zoom")) || 1);

/**
 * Icon-only nav button for the minimal rail (Game Setup): 40×40, radius 8, 16px icon.
 * Default secondary · hover bg/hover + primary · selected bg/selected + primary.
 * Hover / focus shows the item name in a small chip 8px to the right (reference: Railway sidebar).
 */
export function RailButton({
  icon,
  label,
  onClick,
  selected = false,
  ariaExpanded,
}: {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  selected?: boolean;
  ariaExpanded?: boolean;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [tip, setTip] = useState<{ x: number; y: number } | null>(null);
  const show = () => {
    const r = ref.current?.getBoundingClientRect();
    if (r) setTip({ x: toCssPx(r.right) + 8, y: toCssPx(r.top + r.height / 2) });
  };
  const hide = () => setTip(null);
  return (
    <>
      <button
        ref={ref}
        type="button"
        aria-label={label}
        aria-current={selected ? "page" : undefined}
        aria-expanded={ariaExpanded}
        onClick={() => {
          hide();
          onClick?.();
        }}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        className={`group flex size-10 shrink-0 items-center justify-center rounded-md cursor-pointer ${
          selected ? "bg-bg-selected text-icon-primary" : "text-icon-secondary hover:bg-bg-hover hover:text-icon-primary"
        }`}
      >
        <span className="flex size-icon-sm items-center justify-center">{icon}</span>
      </button>
      {tip &&
        createPortal(
          // Vertically centred on the button with a zero-height box + flex (no translate, borders stay on whole pixels).
          <div role="tooltip" className="pointer-events-none fixed z-[60] flex h-0 items-center" style={{ left: tip.x, top: tip.y, animation: "gc-fade-in 120ms ease-out both" }}>
            <span className="whitespace-nowrap rounded-md bg-bg-subtle px-3 py-1.5 text-label-default text-text-primary shadow-[0_4px_12px_0_var(--gc-effect-shadow)]">
              {label}
            </span>
          </div>,
          document.body,
        )}
    </>
  );
}
