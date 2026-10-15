import React from "react";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";

const copy = {
  mapping: { title: "Leave mapping setup?", description: "Your progress is saved. You can continue mapping anytime from Tracking." },
  logging: { title: "Leave logging setup?", description: "Your progress is saved. You can resume setup anytime from Tracking." },
};

export function LeaveSetupModal({
  kind,
  onLeave,
  onContinue,
}: {
  kind: "mapping" | "logging" | null;
  onLeave: () => void;
  onContinue: () => void;
}) {
  const c = copy[kind ?? "mapping"];
  return (
    <Modal contained open={kind !== null} onEscape={onContinue} labelledBy="leave-setup-title">
      <div className="flex w-[520px] flex-col gap-8 rounded-lg bg-bg-surface p-8 ring-1 ring-inset ring-border-default">
        <div className="flex flex-col gap-4">
          <h2 id="leave-setup-title" className="text-[20px] font-bold leading-[1.3] text-text-primary">
            {c.title}
          </h2>
          <p className="text-body-default text-text-secondary">{c.description}</p>
        </div>
        <div className="flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={onLeave}>
            Leave
          </Button>
          <Button variant="primary" onClick={onContinue}>
            Continue
          </Button>
        </div>
      </div>
    </Modal>
  );
}
