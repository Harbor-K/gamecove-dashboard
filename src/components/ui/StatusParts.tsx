import React, { type ReactNode } from "react";

/** Figma `Chip / Data`: h32 px16 radius 999, bg surface, 1px ring, 14 Regular */
export function DataChip({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-8 shrink-0 items-center rounded-full bg-bg-surface px-4 text-label-default whitespace-nowrap text-text-primary ring-1 ring-inset ring-border-default">
      {children}
    </span>
  );
}

export type DotTone = "positive" | "pending" | "inactive" | "critical";
const dotColor: Record<DotTone, string> = {
  positive: "bg-status-positive",
  pending: "bg-status-pending",
  inactive: "bg-text-secondary",
  critical: "bg-status-critical",
};

export function Dot({ tone, size = 8 }: { tone: DotTone; size?: 8 | 10 }) {
  return <span aria-hidden className={`shrink-0 rounded-full ${dotColor[tone]} ${size === 8 ? "size-2" : "size-2.5"}`} />;
}

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`block size-4 rounded-full border-2 border-current border-r-transparent ${className}`}
      style={{ animation: "gc-spin 800ms linear infinite" }}
    />
  );
}

export function LoadingLabel({ loading, children }: { loading: boolean; children: ReactNode }) {
  if (!loading) return <>{children}</>;
  return (
    <span className="relative inline-flex items-center justify-center">
      <span className="invisible">{children}</span>
      <span className="absolute inset-0 flex items-center justify-center">
        <Spinner />
      </span>
    </span>
  );
}
