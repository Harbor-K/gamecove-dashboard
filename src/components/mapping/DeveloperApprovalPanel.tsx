import React from "react";
import { Check, ChevronLeft, ClipboardCheck, Clock, FileCode2, ShieldCheck } from "lucide-react";
import { Button } from "../ui/Button";

export type ApprovalItem = {
  id: string;
  label: string;
  detail: string;
  tone?: "standard" | "pending";
};

/**
 * Human-in-the-loop gate for proposed AI changes.
 * - "checklist": every item must be ticked before applying (used for logging, which adds code to the game).
 * - "summary": read-only list of what was already confirmed during review, saved with one click (used for mapping).
 * Rendered as a flex-centered modal over a scrim so the pop-in animation cannot break positioning.
 */
export function DeveloperApprovalPanel({
  kind,
  mode = "checklist",
  items,
  approvedIds = [],
  onToggle,
  onBack,
  onApprove,
  applying = false,
}: {
  kind: "mapping" | "logging";
  mode?: "checklist" | "summary";
  items: ApprovalItem[];
  approvedIds?: string[];
  onToggle?: (id: string) => void;
  onBack: () => void;
  onApprove: () => void;
  applying?: boolean;
}) {
  const summary = mode === "summary";
  const allApproved = summary || (items.length > 0 && items.every((item) => approvedIds.includes(item.id)));
  const reviewedCount = approvedIds.filter((id) => items.some((item) => item.id === id)).length;
  const pendingCount = items.filter((item) => item.tone === "pending").length;
  const label = kind === "mapping" ? "mapping changes" : "logging changes";

  const eyebrow = summary ? "Confirmed during review" : "Developer approval required";
  const title = summary ? "Changes to save" : kind === "mapping" ? "Approve mapping changes" : "Approve logging changes";
  const description = summary
    ? "You already confirmed each node while reviewing. This is what GameCove will save as your game context — your game script stays unchanged."
    : kind === "mapping"
      ? "Review the game context GameCove will save. Your game script is unchanged until you approve these updates."
      : "Review the events and logger GameCove will add. Nothing is applied to your game until you approve every change.";
  const primary = applying ? (summary ? "Saving…" : "Applying approved changes") : summary ? "Save map" : `Approve ${label}`;

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-10" style={{ background: "rgba(0, 0, 0, 0.55)" }}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="flex max-h-full w-[640px] max-w-full flex-col overflow-hidden rounded-lg bg-bg-surface ring-1 ring-inset ring-border-default shadow-[0_16px_40px_0_var(--gc-effect-shadow-lifted)]"
        style={{ animation: "gc-pop-in 260ms cubic-bezier(0.23,1,0.32,1) both" }}
      >
        <header className="flex shrink-0 items-start gap-4 p-8 pb-6 shadow-[inset_0_-1px_0_var(--gc-border-default)]">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-bg-ai-subtle text-icon-ai ring-1 ring-inset ring-border-accent">
            {kind === "mapping" ? <ClipboardCheck size={20} strokeWidth={1.5} /> : <FileCode2 size={20} strokeWidth={1.5} />}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <span className="text-label-default text-text-accent">{eyebrow}</span>
            <h2 className="text-[24px] font-bold leading-[1.3] text-text-primary">{title}</h2>
            <p className="text-body-default text-text-secondary">{description}</p>
          </div>
        </header>

        <div className="scrollbar-none flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <span className="text-label-default text-text-secondary">{summary ? `${items.length - pendingCount} confirmed${pendingCount ? ` · ${pendingCount} kept pending` : ""}` : `Proposed ${label}`}</span>
            {!summary && (
              <span className="text-label-default text-text-secondary">
                {reviewedCount} / {items.length} reviewed
              </span>
            )}
          </div>

          {items.map((item) => {
            const pending = item.tone === "pending";
            if (summary) {
              return (
                <div key={item.id} className="flex w-full shrink-0 items-start gap-4 rounded-lg bg-bg-canvas p-4 ring-1 ring-inset ring-border-default">
                  <span className={`mt-0.5 flex size-5 shrink-0 items-center justify-center ${pending ? "text-status-pending" : "text-status-positive"}`}>
                    {pending ? <Clock size={16} strokeWidth={1.8} /> : <Check size={16} strokeWidth={2.2} />}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="text-fs-16 font-bold leading-[1.5] text-text-primary">{item.label}</span>
                    <span className="text-label-default text-text-secondary">{item.detail}</span>
                  </span>
                  {pending && <span className="shrink-0 text-caption-default text-status-pending">Pending</span>}
                </div>
              );
            }
            const approved = approvedIds.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                role="checkbox"
                aria-checked={approved}
                onClick={() => onToggle?.(item.id)}
                className={`flex w-full shrink-0 items-start gap-4 rounded-lg p-4 text-left ring-1 ring-inset cursor-pointer transition-colors duration-150 ${
                  approved
                    ? "bg-bg-positive-subtle ring-border-positive-subtle"
                    : pending
                      ? "bg-bg-pending-subtle ring-border-pending-subtle hover:bg-bg-hover"
                      : "bg-bg-canvas ring-border-default hover:bg-bg-hover"
                }`}
              >
                <span
                  className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-sm ${
                    approved ? "bg-icon-primary text-icon-inverse" : "ring-1 ring-inset ring-icon-secondary"
                  }`}
                >
                  {approved && <Check size={14} strokeWidth={2.5} />}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-fs-16 font-bold leading-[1.5] text-text-primary">{item.label}</span>
                  <span className="text-label-default text-text-secondary">{item.detail}</span>
                </span>
                {pending && <span className="shrink-0 text-caption-default text-status-pending">Pending</span>}
              </button>
            );
          })}
        </div>

        <footer className="flex shrink-0 items-center justify-between gap-4 p-6 shadow-[inset_0_1px_0_var(--gc-border-default)]">
          <Button variant="secondary" icon={<ChevronLeft size={16} strokeWidth={1.8} />} onClick={onBack} disabled={applying}>
            Back
          </Button>
          <Button variant="primary" icon={<ShieldCheck size={16} strokeWidth={1.8} />} onClick={onApprove} disabled={!allApproved || applying}>
            {primary}
          </Button>
        </footer>
      </aside>
    </div>
  );
}
