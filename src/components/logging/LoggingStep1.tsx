import React from "react";
import { Plus, Sparkle, X } from "lucide-react";
import { analysisOptions } from "../../data/logging";
import type { AnalysisId } from "../../types/setup";
import { AutoTextarea } from "../ui/AutoTextarea";
import { InfoTooltip } from "../ui/InfoTooltip";
import { LoggingIntro } from "./LoggingDrawer";

// Step 1 — Choose what to analyze (analysis purpose)
export function LoggingStep1({
  selected,
  onToggle,
  prompt,
  onPromptChange,
}: {
  selected: AnalysisId[];
  onToggle: (id: AnalysisId) => void;
  prompt: string;
  onPromptChange: (v: string) => void;
}) {
  const recommended = analysisOptions.filter((a) => !selected.includes(a.id));
  const chosen = selected.map((id) => analysisOptions.find((a) => a.id === id)!);

  return (
    <>
      <LoggingIntro title="Choose what to analyze" description="Pick from the suggestions below, or add your own question." />
      <div aria-hidden className="min-h-0 flex-1" />

      {recommended.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Sparkle size={16} strokeWidth={1.5} className="fill-current text-icon-ai" />
            <span className="text-label-default text-text-secondary">Recommended analyses</span>
            <InfoTooltip text="Suggested from your mapped game structure. Pick one or more, and GameCove will work out which events each one needs." />
          </div>
          <div className="flex flex-wrap gap-2">
            {recommended.map((a) => (
              <button
                key={a.id}
                type="button"
                title={a.description}
                onClick={() => onToggle(a.id)}
                className="group flex h-8 select-none items-center gap-1 rounded-full bg-bg-surface pl-2 pr-3 text-label-default text-text-secondary ring-1 ring-inset ring-border-default cursor-pointer transition-colors duration-150 hover:bg-bg-hover hover:text-text-primary"
              >
                <Plus size={12} strokeWidth={2} className="text-icon-secondary group-hover:text-icon-primary" />
                {a.label}
              </button>
            ))}
          </div>
        </section>
      )}

      {chosen.length > 0 && (
        <section className="flex flex-col gap-3">
          <span className="text-label-default text-text-secondary">Selected</span>
          <div className="flex flex-wrap gap-2">
            {chosen.map((a) => (
              <span
                key={a.id}
                className="flex h-8 select-none items-center gap-1 rounded-full bg-bg-surface pl-3 pr-2 text-label-default text-text-primary ring-1 ring-inset ring-icon-primary"
                style={{ animation: "gc-fade-in 150ms ease-out both" }}
              >
                {a.label}
                <button
                  type="button"
                  aria-label={`Remove ${a.label}`}
                  onClick={() => onToggle(a.id)}
                  className="flex size-[14px] items-center justify-center text-icon-secondary icon-hit hover:text-icon-primary"
                >
                  <X size={14} strokeWidth={1.5} />
                </button>
              </span>
            ))}
          </div>
        </section>
      )}

      <div className="min-h-24 shrink-0 rounded-md bg-bg-canvas p-3 ring-1 ring-inset ring-border-default">
        <AutoTextarea value={prompt} onChange={onPromptChange} placeholder="What do you want to understand about your players?" />
      </div>
    </>
  );
}
