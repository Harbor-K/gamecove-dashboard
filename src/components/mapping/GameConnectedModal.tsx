import React, { useEffect, useState } from "react";
import { ArrowLeft, ArrowUpRight, BrainCircuit, CheckCircle2, MapPinned, Sparkles } from "lucide-react";
import { Modal } from "../ui/Modal";

/** "Just 3 steps!" shows shortly after the popup lands (repo: 500ms; faster here on request). */
const HINT_DELAY_MS = 300;
/** Button bottom → bubble top (Figma: button bottom 205.2 → bubble y218). */
const HINT_GAP_PX = 12.8;
const BUBBLE_FILL = "linear-gradient(var(--gc-bg-accent-strong), var(--gc-bg-accent-strong)), var(--gc-bg-surface)";

// Figma `Modal / Game connected` (w520 p32 gap32 radius 16) + "Just 3 steps!" bubble under Go to Mapping
// (same as the repo's game-connected-modal). "Why do I need mapping?" opens the short explainer.
export function GameConnectedModal({
  open,
  onGoToMapping,
  onExploreDashboard,
}: {
  open: boolean;
  onGoToMapping: () => void;
  onExploreDashboard: () => void;
}) {
  const [showHint, setShowHint] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (!open) return;
    setShowGuide(false);
    const timer = setTimeout(() => setShowHint(true), HINT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [open]);

  return (
    <Modal contained open={open} labelledBy="game-connected-title">
      {showGuide ? (
        <div className="flex w-[640px] flex-col gap-8 rounded-lg bg-bg-surface p-8 ring-1 ring-inset ring-border-default shadow-[0_16px_40px_0_var(--gc-effect-shadow)]">
          <div className="flex items-start gap-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-bg-ai-subtle text-icon-ai ring-1 ring-inset ring-border-accent">
              <MapPinned size={20} strokeWidth={1.5} />
            </span>
            <div className="flex flex-col gap-2">
              <span className="text-label-default text-text-accent">Why mapping matters</span>
              <h2 id="game-connected-title" className="text-[24px] font-bold leading-[1.3] text-text-primary">
                Give GameCove the context behind your game.
              </h2>
              <p className="text-body-default text-text-secondary">
                Your game script tells us what code exists. Mapping tells us how players actually move through it, so every analysis and logging recommendation starts from the right context.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: <MapPinned size={18} strokeWidth={1.5} />, title: "See the journey", body: "Confirm where players enter, progress, and leave." },
              { icon: <BrainCircuit size={18} strokeWidth={1.5} />, title: "Ground the AI", body: "Give recommendations the real structure of your game." },
              { icon: <CheckCircle2 size={18} strokeWidth={1.5} />, title: "Keep control", body: "Review and approve every proposed change before it is saved." },
            ].map((item) => (
              <div key={item.title} className="flex min-h-[152px] flex-col gap-3 rounded-md bg-bg-canvas p-4 ring-1 ring-inset ring-border-default">
                <span className="text-icon-ai">{item.icon}</span>
                <span className="text-fs-16 font-bold leading-[1.5] text-text-primary">{item.title}</span>
                <span className="text-label-default text-text-secondary">{item.body}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="flex h-control-48 items-center gap-2 rounded-md px-4 text-fs-16 leading-[1.6] text-text-primary ring-1 ring-inset ring-border-default cursor-pointer hover:bg-bg-hover"
            >
              <ArrowLeft size={16} strokeWidth={1.8} />
              Back
            </button>
            <button
              type="button"
              onClick={onGoToMapping}
              className="flex h-control-48 items-center gap-2 rounded-md border border-border-default bg-bg-button-primary bg-clip-padding px-[15px] text-fs-16 font-semibold leading-[1.6] text-text-on-button-primary hover-layer"
            >
              Go to Mapping
              <Sparkles size={16} strokeWidth={2} />
            </button>
          </div>
        </div>
      ) : (
        <div className="relative flex w-[520px] flex-col gap-8 rounded-lg bg-bg-surface p-8 ring-1 ring-inset ring-border-default shadow-[0_16px_40px_0_var(--gc-effect-shadow)]">
          <div className="flex flex-col gap-4">
            <h2 id="game-connected-title" className="text-[20px] font-bold leading-[1.3] text-text-primary">
              Your game is connected!
            </h2>
            <div className="flex flex-col text-body-default text-text-secondary">
              <p>Data is now being collected. Map your game to better</p>
              <p className="flex items-center gap-2">
                <span>understand your players.</span>
                <button type="button" onClick={() => setShowGuide(true)} className="flex items-center gap-1 text-fs-14 leading-[1.5] text-text-secondary hover:text-text-primary cursor-pointer">
                  <span className="underline">Why do I need mapping?</span>
                  <ArrowUpRight size={14} strokeWidth={1.2} />
                </button>
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onExploreDashboard}
              className="flex h-control-48 items-center rounded-md px-4 text-fs-16 leading-[1.6] text-text-primary ring-1 ring-inset ring-border-default cursor-pointer hover:bg-bg-hover"
            >
              Explore dashboard
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={onGoToMapping}
                className="flex h-control-48 items-center rounded-md border border-border-default bg-bg-button-primary bg-clip-padding px-[15px] text-fs-16 font-semibold leading-[1.6] text-text-on-button-primary hover-layer"
              >
                Go to Mapping
              </button>
              {showHint && (
                // Bubble centred under the button; width hugs the text (+16 each side), tail points at the button centre.
                // Centred with a zero-width box + flex (not translate -50%) so borders stay on whole pixels.
                <div
                  className="pointer-events-none absolute left-1/2 top-full flex w-0 flex-col items-center"
                  style={{ marginTop: HINT_GAP_PX, animation: "gc-hint-in 420ms cubic-bezier(0.2,0.8,0.2,1) both", transformOrigin: "50% 0" }}
                >
                  {/* Opaque: accent-strong layered on surface, so nothing shows through. */}
                  <span
                    className="relative mt-2 block shrink-0 whitespace-nowrap rounded-md border border-border-accent px-[15px] py-[11px] text-body-default text-text-on-accent"
                    style={{ background: BUBBLE_FILL }}
                  >
                    Just 3 steps!
                  </span>
                  {/* Tail drawn after the body so it covers the body's top border inside the tail. */}
                  <span aria-hidden className="absolute left-0 top-[2.5px] flex w-0 justify-center">
                    <span className="block size-[11.3px] shrink-0 rotate-45 border-l border-t border-border-accent" style={{ background: BUBBLE_FILL }} />
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
