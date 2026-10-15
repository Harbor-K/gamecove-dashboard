import React from "react";
import { Modal } from "../ui/Modal";

// Figma `Modal / Game mapped` (w480 p32 gap32 radius 16): title + one line + Go to Dashboard.
export function GameMappedModal({ open, onClose, onGoToDashboard }: { open: boolean; onClose: () => void; onGoToDashboard: () => void }) {
  return (
    <Modal contained open={open} onEscape={onClose} labelledBy="game-mapped-title">
      <div className="flex w-[480px] flex-col gap-8 rounded-lg bg-bg-surface p-8 ring-1 ring-inset ring-border-default shadow-[0_16px_40px_0_var(--gc-effect-shadow)]">
        <div className="flex flex-col gap-4">
          <h2 id="game-mapped-title" className="text-[20px] font-bold leading-[1.3] text-text-primary">
            Your game is mapped!
          </h2>
          <p className="text-body-default text-text-secondary">GameCove can now better support how you explore and analyze your game.</p>
        </div>
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onGoToDashboard}
            className="flex h-control-48 items-center rounded-md border border-border-default bg-bg-button-primary bg-clip-padding px-[15px] text-fs-16 font-semibold leading-[1.6] text-text-on-button-primary hover-layer"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </Modal>
  );
}
