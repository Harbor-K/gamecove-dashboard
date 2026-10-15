import React, { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// Figma `Tooltip` (repo components/ui/info-tooltip.tsx): 14 Regular 1.6, bg/tooltip, border/tooltip, radius 8, p12, max w306.
// Portaled to body so drawers and cards never clip it; kept inside the window, above the icon (below when there's no room).
const EDGE = 8;
const GAP = 8;
const zoom = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--gc-zoom")) || 1;

/** Icon / info (Figma asset). Stroke follows the displayed size (card title 24·1.5, KPI 16·1.2). */
export function InfoIcon({ size = 16, strokeWidth = 1.5 }: { size?: number; strokeWidth?: number }) {
  const sw = (strokeWidth * 16) / size;
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M7.75 2C4.57469 2 2 4.57469 2 7.75C2 10.9253 4.57469 13.5 7.75 13.5C10.9253 13.5 13.5 10.9253 13.5 7.75C13.5 4.57469 10.9253 2 7.75 2Z" stroke="currentColor" strokeWidth={sw} strokeMiterlimit="10" />
      <path d="M6.875 6.875H7.875V10.5" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.5 10.625H9.25" stroke="currentColor" strokeWidth={sw} strokeMiterlimit="10" strokeLinecap="round" />
      <path d="M7.75 4.0625C7.5893 4.0625 7.43221 4.11015 7.2986 4.19943C7.16498 4.28871 7.06084 4.4156 6.99935 4.56407C6.93785 4.71253 6.92176 4.8759 6.95311 5.03351C6.98446 5.19112 7.06185 5.33589 7.17548 5.44952C7.28911 5.56315 7.43388 5.64054 7.59149 5.67189C7.7491 5.70324 7.91247 5.68715 8.06093 5.62565C8.2094 5.56416 8.33629 5.46002 8.42557 5.3264C8.51485 5.19279 8.5625 5.0357 8.5625 4.875C8.5625 4.65951 8.4769 4.45285 8.32452 4.30048C8.17215 4.1481 7.96549 4.0625 7.75 4.0625Z" fill="currentColor" />
    </svg>
  );
}

/** ⓘ + tooltip. `\n` in the text stays a line break. */
export function InfoTooltip({
  text,
  size = 16,
  strokeWidth,
  tone = "secondary",
}: {
  text: string;
  size?: number;
  strokeWidth?: number;
  tone?: "primary" | "secondary";
}) {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const tipRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);

  useLayoutEffect(() => {
    if (!open || !anchorRef.current || !tipRef.current) return;
    const z = zoom();
    const ar = anchorRef.current.getBoundingClientRect();
    const tr = tipRef.current.getBoundingClientRect();
    const a = { left: ar.left / z, top: ar.top / z, bottom: ar.bottom / z, width: ar.width / z };
    const tip = { width: tr.width / z, height: tr.height / z };
    const left = Math.min(Math.max(EDGE, a.left + a.width / 2 - tip.width / 2), window.innerWidth / z - tip.width - EDGE);
    const above = a.top - GAP - tip.height;
    setPos({ left, top: above >= EDGE ? above : a.bottom + GAP });
  }, [open, text]);

  const show = () => setOpen(true);
  const hide = () => {
    setOpen(false);
    setPos(null);
  };

  return (
    <span ref={anchorRef} className="relative inline-flex" onPointerEnter={show} onPointerLeave={hide} onFocus={show} onBlur={hide}>
      <button
        type="button"
        aria-label={text}
        className={`flex items-center justify-center ${tone === "primary" ? "text-icon-primary" : "text-icon-secondary"}`}
      >
        <InfoIcon size={size} strokeWidth={strokeWidth ?? (size >= 20 ? 1.5 : 1.2)} />
      </button>
      {open &&
        createPortal(
          <span
            ref={tipRef}
            role="tooltip"
            className="pointer-events-none fixed z-[100] w-max max-w-[306px] select-none whitespace-pre-line rounded-md bg-bg-tooltip p-3 text-left text-fs-14 font-normal leading-[1.6] text-text-tooltip"
            style={{
              left: pos?.left ?? 0,
              top: pos?.top ?? 0,
              visibility: pos ? "visible" : "hidden",
              boxShadow: "inset 0 0 0 1px var(--gc-border-tooltip), 0 4px 12px 0 var(--gc-effect-shadow)",
            }}
          >
            {text}
          </span>,
          document.body,
        )}
    </span>
  );
}
