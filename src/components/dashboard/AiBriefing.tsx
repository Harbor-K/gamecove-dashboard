import React from "react";
import { ArrowUpRight, Sparkle } from "lucide-react";
import { useAgent } from "../../contexts/AgentContext";
import { briefingQuestion, briefingText } from "../../data/dashboard";

/** Figma `Card / AI briefing`: h85 px24 gap16, bg ai-subtle, 2px chart/bar/emphasis ring, radius 16. */
export function AiBriefing() {
  const agent = useAgent();
  return (
    <button
      type="button"
      aria-label="Ask AI Agent about this"
      onClick={() => agent.ask(briefingQuestion)}
      className="flex h-[85px] w-full items-center gap-4 rounded-lg bg-bg-ai-subtle px-6 text-left ring-2 ring-inset ring-chart-bar-emphasis cursor-pointer transition-colors duration-150 hover:bg-bg-hover"
    >
      <Sparkle size={32} strokeWidth={1.2} className="shrink-0 fill-current text-icon-ai" />
      <span className="min-w-0 flex-1 text-[20px] leading-[1.3] tracking-[-0.01em] text-text-primary">{briefingText}</span>
      <ArrowUpRight size={24} strokeWidth={1.5} className="shrink-0 text-icon-primary" />
    </button>
  );
}
