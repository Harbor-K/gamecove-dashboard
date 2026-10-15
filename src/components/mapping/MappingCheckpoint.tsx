import React, { type ReactNode } from "react";
import { ArrowLeft, CheckCircle2, ClipboardCheck, Sparkles } from "lucide-react";
import { Button } from "../ui/Button";

/**
 * Central, task-adjacent continuation point for the mapping flow.
 * It keeps navigation where the developer is inspecting the canvas rather than at the screen edge.
 */
export function MappingCheckpoint({
  icon,
  eyebrow,
  title,
  description,
  primaryLabel,
  primaryDisabled = false,
  onPrimary,
  onBack,
}: {
  icon: "context" | "review" | "approval";
  eyebrow: string;
  title: string;
  description: string;
  primaryLabel: string;
  primaryDisabled?: boolean;
  onPrimary: () => void;
  onBack?: () => void;
}) {
  const Icon = icon === "context" ? Sparkles : icon === "review" ? CheckCircle2 : ClipboardCheck;
  return (
    <section
      aria-label={title}
      className="absolute left-1/2 top-1/2 z-20 w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-bg-surface p-8 ring-1 ring-inset ring-border-default shadow-[0_16px_40px_0_var(--gc-effect-shadow)]"
      style={{ animation: "gc-pop-in 240ms cubic-bezier(0.23,1,0.32,1) both" }}
    >
      <div className="flex flex-col gap-5">
        <span className="flex size-10 items-center justify-center rounded-md bg-bg-ai-subtle text-icon-ai ring-1 ring-inset ring-border-accent">
          <Icon size={20} strokeWidth={1.5} />
        </span>
        <div className="flex flex-col gap-2">
          <span className="text-label-default text-text-accent">{eyebrow}</span>
          <h2 className="text-[24px] font-bold leading-[1.3] text-text-primary">{title}</h2>
          <p className="text-body-default text-text-secondary">{description}</p>
        </div>
        <div className="flex items-center justify-end gap-3 pt-1">
          {onBack && (
            <Button variant="secondary" icon={<ArrowLeft size={16} strokeWidth={1.8} />} onClick={onBack}>
              Back
            </Button>
          )}
          <Button variant="primary" disabled={primaryDisabled} onClick={onPrimary}>
            {primaryLabel}
          </Button>
        </div>
      </div>
    </section>
  );
}

export function MappingGuide({ children }: { children: ReactNode }) {
  return <div className="absolute left-6 top-6 z-20 w-[360px]">{children}</div>;
}
