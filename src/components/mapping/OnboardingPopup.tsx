import React, { type ReactNode } from "react";
import { ChevronUp, Minus, X } from "lucide-react";
import { Button } from "../ui/Button";

export type OnboardingState = "expanded" | "minimised" | "loading";

function HeaderButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex size-8 shrink-0 items-center justify-center rounded-md text-icon-secondary cursor-pointer hover:bg-bg-hover hover:text-icon-primary"
    >
      {children}
    </button>
  );
}

// Figma `Popup / Onboarding` (Expanded / Minimised / Loading): w360 radius 16, shadow 0 16 40.
export function OnboardingPopup({
  state,
  step,
  title,
  description,
  progress,
  loadingText,
  onBack,
  onMinimise,
  onRestore,
  onClose,
}: {
  state: OnboardingState;
  step: number;
  title: string;
  description: string;
  progress?: { count: string; label: string };
  loadingText: { title: string; caption: string };
  onBack?: () => void;
  onMinimise: () => void;
  onRestore: () => void;
  onClose: () => void;
}) {
  const shell = "w-[360px] rounded-lg bg-bg-surface ring-1 ring-inset ring-border-default shadow-[0_16px_40px_0_var(--gc-effect-shadow)]";
  const icon = { size: 16, strokeWidth: 1.5 } as const;

  if (state === "minimised") {
    return (
      <div className={`${shell} py-2 pl-6 pr-4`}>
        <div className="flex h-8 items-center gap-1">
          <span className="min-w-0 flex-1 truncate text-fs-16 font-bold leading-[1.6] text-text-primary">{title}</span>
          <HeaderButton label="Restore" onClick={onRestore}>
            <ChevronUp {...icon} />
          </HeaderButton>
          <HeaderButton label="Close" onClick={onClose}>
            <X {...icon} />
          </HeaderButton>
        </div>
      </div>
    );
  }

  if (state === "loading") {
    return (
      <div className={`${shell} pb-6 pl-6 pr-4 pt-6`} role="status" aria-live="polite">
        <div className="flex h-[242px] flex-col items-center justify-center gap-3 text-center">
          <span aria-hidden className="size-8 rounded-full border-[3px] border-border-default border-t-text-primary" style={{ animation: "gc-spin 900ms linear infinite" }} />
          <div className="flex flex-col gap-1">
            <span className="text-fs-16 font-bold leading-[1.6] text-text-primary">{loadingText.title}</span>
            <span className="text-label-default text-text-secondary">{loadingText.caption}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${shell} flex flex-col gap-2 pb-6 pl-6 pr-4 pt-4`}>
      <div className="flex h-8 items-center gap-1">
        <span className="min-w-0 flex-1 text-caption-default text-text-secondary">Step {step} of 3</span>
        <HeaderButton label="Minimise" onClick={onMinimise}>
          <Minus {...icon} />
        </HeaderButton>
        <HeaderButton label="Close" onClick={onClose}>
          <X {...icon} />
        </HeaderButton>
      </div>

      <div className="pb-2">
        <div className="relative flex h-[180px] w-full items-center justify-center overflow-hidden rounded-md bg-bg-selected">
          <span className="text-fs-14 leading-normal text-text-secondary">GIF 320 × 180</span>
        </div>
      </div>

      <div className="flex flex-col gap-2 pr-2">
        <h2 className="text-[20px] font-bold leading-[1.3] tracking-[-0.2px] text-text-primary">{title}</h2>
        <p className="text-body-default text-text-secondary">{description}</p>
      </div>

      {progress && (
        <div className="flex items-center gap-2 pt-2">
          <span className="text-fs-16 font-bold leading-[1.6] text-text-primary">{progress.count}</span>
          <span className="text-body-default text-text-secondary">{progress.label}</span>
        </div>
      )}

      {onBack && (
        <div className="flex items-center justify-end pt-2">
          <Button variant="secondary" onClick={onBack}>
            Back
          </Button>
        </div>
      )}
    </div>
  );
}
