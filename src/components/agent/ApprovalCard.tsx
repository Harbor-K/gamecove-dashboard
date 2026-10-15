import React, { type ReactNode } from "react";
import { Sparkle } from "lucide-react";
import type { ApprovalStatus } from "../../contexts/AgentContext";
import { gameCoveLogger } from "../../data/analysisSetup";
import { Button } from "../ui/Button";

// Repo `ApprovalCard`: an action the Agent may only run after a person approves it.
// pending: action · script name · location + View script + [Reject][Approve]
// running: progress line instead of buttons · approved / rejected: one result line (the card stays).
export function ApprovalCard({
  status,
  onApprove,
  onReject,
  onViewScript,
}: {
  status: ApprovalStatus;
  onApprove: () => void;
  onReject: () => void;
  onViewScript: () => void;
}) {
  return (
    <div className="mt-12 flex flex-col gap-6 rounded-lg bg-bg-canvas p-6 ring-1 ring-inset ring-border-default" style={{ animation: "gc-fade-in 300ms ease-out both" }}>
      <div className="flex items-center gap-2">
        <Sparkle size={16} strokeWidth={1.5} className="shrink-0 fill-current text-icon-ai" />
        <span className="text-label-default text-text-primary">GameCove wants to perform the following action.</span>
      </div>

      <dl className="flex flex-col gap-4">
        <Row label="Action">
          <span className="text-fs-16 font-bold leading-[1.6] text-text-primary">Add {gameCoveLogger.name}</span>
        </Row>
        <Row label="Script name">
          <span className="text-fs-16 leading-[1.6] text-text-primary">{gameCoveLogger.name}</span>
        </Row>
        <Row label="Location">
          <DataChip>{gameCoveLogger.location}</DataChip>
        </Row>
      </dl>

      <button type="button" onClick={onViewScript} className="w-fit text-fs-14 leading-[1.5] text-text-secondary underline cursor-pointer hover:text-text-primary">
        View script
      </button>

      {status === "pending" ? (
        <div className="flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={onReject}>
            Reject
          </Button>
          <Button variant="primary" onClick={onApprove}>
            Approve
          </Button>
        </div>
      ) : status === "running" ? (
        <p className="gc-shimmer-text w-fit text-label-default">Adding {gameCoveLogger.name}…</p>
      ) : (
        <p className={`text-label-default ${status === "approved" ? "text-status-positive" : "text-text-secondary"}`}>{status === "approved" ? "Approved" : "Rejected"}</p>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <dt className="text-label-default text-text-secondary">{label}</dt>
      <dd className="flex">{children}</dd>
    </div>
  );
}

/** Value chip (script location etc.): h32 px16, 14, pill. */
export function DataChip({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-8 shrink-0 items-center whitespace-nowrap rounded-full bg-bg-surface px-4 text-label-default text-text-primary ring-1 ring-inset ring-border-default">
      {children}
    </span>
  );
}
