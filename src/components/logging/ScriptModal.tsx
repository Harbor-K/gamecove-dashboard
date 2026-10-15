import React, { useState } from "react";
import { Check, Copy, X } from "lucide-react";
import { observationScript } from "../../data/logging";
import { Modal } from "../ui/Modal";

export function ScriptModal({ code, open, onClose }: { code: string; open: boolean; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };
  return (
    <Modal contained open={open} onEscape={onClose} labelledBy="script-title">
      <div className="flex w-[640px] max-w-[calc(100vw-48px)] flex-col gap-6 rounded-lg bg-bg-surface p-8 ring-1 ring-inset ring-border-default shadow-[0_16px_40px_0_var(--gc-effect-shadow)]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h2 id="script-title" className="text-[20px] font-bold leading-[1.3] text-text-primary">
              {observationScript.name}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-label-default text-text-secondary">Location</span>
              <span className="flex h-6 items-center rounded-sm bg-bg-selected px-2 text-label-default text-text-primary">{observationScript.location}</span>
            </div>
          </div>
          <button type="button" aria-label="Close" onClick={onClose} className="flex size-5 items-center justify-center text-icon-secondary icon-hit hover:text-icon-primary">
            <X size={20} strokeWidth={2} />
          </button>
        </div>
        <div className="relative max-h-[420px] overflow-auto rounded-md bg-bg-canvas p-4 ring-1 ring-inset ring-border-default">
          <button
            type="button"
            onClick={copy}
            className="absolute right-3 top-3 flex h-8 items-center gap-1.5 rounded-md bg-bg-surface px-3 text-label-default text-text-primary ring-1 ring-inset ring-border-default cursor-pointer hover:bg-bg-hover"
          >
            {copied ? <Check size={14} strokeWidth={2} /> : <Copy size={14} strokeWidth={1.5} />}
            {copied ? "Copied" : "Copy"}
          </button>
          <pre className="whitespace-pre font-mono text-[13px] leading-[1.6] text-text-primary">{code}</pre>
        </div>
      </div>
    </Modal>
  );
}
