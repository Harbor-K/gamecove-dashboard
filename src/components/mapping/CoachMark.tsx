import React, { useEffect, useRef, useState, type CSSProperties } from "react";
import { X } from "lucide-react";

/** Screen-space rect of the element the coach mark points at (relative to the canvas container). */
export type CoachAnchor = { x: number; y: number; w: number; h: number };

const W = 320;
const GAP = 16;
const EDGE = 16;
const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), Math.max(min, max));

const KEYFRAMES = "@keyframes gc-coach-in{from{opacity:0;transform:translateY(var(--gc-coach-dy))}to{opacity:1;transform:none}}";

/** Same bubble as "Just 3 steps!": accent-strong fill over surface (opaque), accent border, on-accent text. */
const BUBBLE_FILL = "linear-gradient(var(--gc-bg-accent-strong), var(--gc-bg-accent-strong)), var(--gc-bg-surface)";

const smallBtn = "flex h-8 shrink-0 items-center rounded-md px-3 text-label-default whitespace-nowrap cursor-pointer transition-colors duration-150 disabled:cursor-default disabled:opacity-40";

/**
 * Product-tour style tooltip next to the node to act on.
 * The node gets a 1.5px accent line only (no glow, no pulsing hotspot). Short copy + "1 of 3" + Back / Next.
 */
export function CoachMark({
  anchor,
  container,
  step,
  total = 3,
  title,
  description,
  progress,
  link,
  nextLabel = "Next",
  onNext,
  onBack,
  onClose,
  loading = false,
}: {
  anchor: CoachAnchor;
  container: { w: number; h: number };
  step: number;
  total?: number;
  title: string;
  description: string;
  progress?: string;
  link?: { label: string; onClick: () => void };
  nextLabel?: string;
  onNext?: () => void;
  onBack?: () => void;
  onClose: () => void;
  /** kept for callers; the pulsing hotspot was removed */
  clickHint?: boolean;
  loading?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const [h, setH] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const height = h ?? 160;
  const cx = anchor.x + anchor.w / 2;
  const roomBelow = container.h - (anchor.y + anchor.h) - GAP - EDGE;
  const roomAbove = anchor.y - GAP - EDGE;
  const below = roomBelow >= height || roomBelow >= roomAbove;
  const top = below
    ? clamp(anchor.y + anchor.h + GAP, EDGE, container.h - height - EDGE)
    : clamp(anchor.y - GAP - height, EDGE, container.h - height - EDGE);
  const left = clamp(cx - W / 2, EDGE, container.w - W - EDGE);
  const arrowX = clamp(cx - left, 24, W - 24);

  const accent = "var(--gc-border-accent)";

  return (
    <>
      <style>{KEYFRAMES}</style>

      {/* Active node: line only (1.5px accent, node radius) */}
      <span
        aria-hidden
        className="pointer-events-none absolute z-20 rounded-[8px] transition-all duration-300"
        style={{ left: anchor.x, top: anchor.y, width: anchor.w, height: anchor.h, boxShadow: `inset 0 0 0 1.5px ${accent}` }}
      />

      <section
        ref={ref}
        role="dialog"
        aria-label={title}
        className="absolute z-30 rounded-lg"
        style={
          {
            left,
            top,
            width: W,
            visibility: h === null ? "hidden" : "visible",
            background: BUBBLE_FILL,
            boxShadow: `inset 0 0 0 1px ${accent}, 0 16px 40px 0 var(--gc-effect-shadow)`,
            animation: "gc-coach-in 220ms cubic-bezier(0.23,1,0.32,1) both",
            "--gc-coach-dy": below ? "-6px" : "6px",
          } as CSSProperties
        }
      >
        {/* Tail in the same fill + border */}
        <span
          aria-hidden
          className="absolute size-3 rotate-45"
          style={{
            left: arrowX - 6,
            ...(below ? { top: -6 } : { bottom: -6 }),
            background: BUBBLE_FILL,
            borderColor: accent,
            borderStyle: "solid",
            borderWidth: below ? "1px 0 0 1px" : "0 1px 1px 0",
          }}
        />

        <div className="relative flex flex-col gap-2 p-5 text-text-on-accent">
          {loading ? (
            <div className="flex items-center gap-3" role="status" aria-live="polite">
              <span aria-hidden className="size-5 shrink-0 rounded-full border-[3px] border-border-default border-t-text-primary" style={{ animation: "gc-spin 900ms linear infinite" }} />
              <div className="flex flex-col">
                <span className="text-fs-16 font-bold leading-[1.5]">{title}</span>
                <span className="text-label-default opacity-80">{description}</span>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-2">
                <h2 className="min-w-0 flex-1 text-fs-16 font-bold leading-[1.5]">{title}</h2>
                <button
                  type="button"
                  aria-label="Close setup guide"
                  onClick={onClose}
                  className="-mr-1 -mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md text-text-on-accent opacity-80 cursor-pointer hover:bg-bg-hover-subtle hover:opacity-100"
                >
                  <X size={16} strokeWidth={1.5} />
                </button>
              </div>
              <p className="text-label-default leading-[1.6] opacity-80">{description}</p>
              {progress && <span className="text-caption-default font-bold">{progress}</span>}
              {link && (
                <button type="button" onClick={link.onClick} className="self-start text-label-default underline underline-offset-2 cursor-pointer hover:opacity-80">
                  {link.label}
                </button>
              )}

              <div className="flex items-center gap-2 pt-2">
                <span className="min-w-0 flex-1 text-caption-default opacity-80">
                  {step} of {total}
                </span>
                {onBack && (
                  <button type="button" onClick={onBack} className={`${smallBtn} text-text-on-accent ring-1 ring-inset ring-border-accent hover:bg-bg-hover-subtle`}>
                    Back
                  </button>
                )}
                {onNext && (
                  <button type="button" onClick={onNext} className={`${smallBtn} bg-bg-button-primary font-semibold text-text-on-button-primary hover-layer`}>
                    {nextLabel}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
