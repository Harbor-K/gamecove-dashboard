import React, { useState } from "react";
import { X } from "lucide-react";
import { buildLoggerScript, gameCoveLogger, type EventId } from "../../data/analysisSetup";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { DataChip } from "./ApprovalCard";

// Repo `ScriptModal`: script name · location · code · Copy / Close. Code = the Catalog's GameCoveLogger
// with only the events on the approval card.
export function ScriptModal({ open, events, onClose }: { open: boolean; events: EventId[]; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const code = buildLoggerScript(events);
  const copy = () => {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Modal contained open={open} onEscape={onClose} labelledBy="script-modal-title">
      <div className="flex max-h-[calc(100vh/var(--gc-zoom)-80px)] w-[640px] flex-col gap-6 rounded-lg bg-bg-surface p-8 ring-1 ring-inset ring-border-default shadow-[0_16px_40px_0_var(--gc-effect-shadow)]">
        <div className="flex items-center gap-4">
          <h2 id="script-modal-title" className="min-w-0 flex-1 truncate text-[20px] font-bold leading-[1.3] text-text-primary">
            {gameCoveLogger.name}
          </h2>
          <button type="button" aria-label="Close" onClick={onClose} className="flex size-5 shrink-0 items-center justify-center text-icon-secondary icon-hit hover:text-icon-primary">
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-label-default text-text-secondary">Location</span>
          <div className="flex flex-wrap gap-2">
            <DataChip>{gameCoveLogger.location}</DataChip>
          </div>
        </div>

        <pre data-no-translate className="min-h-0 flex-1 overflow-auto rounded-md bg-bg-canvas p-4 font-mono text-fs-14 leading-[1.6] text-text-primary ring-1 ring-inset ring-border-default">
          <code>{code}</code>
        </pre>

        <div className="flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={copy}>
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button variant="primary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
