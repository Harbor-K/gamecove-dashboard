import React, { type ReactNode, type Ref } from "react";
import { DrawerClose, DrawerFrame } from "../setup/DrawerFrame";
import { Spinner } from "../ui/StatusParts";

// Figma `Drawer / Logging setup` Steps 1–3: w480, header (title + "Step n of 3" + X), sticky footer.
export function LoggingDrawer({
  step,
  onClose,
  footer,
  bodyRef,
  onBodyScroll,
  overlay,
  children,
}: {
  step: 1 | 2 | 3;
  onClose: () => void;
  footer: ReactNode;
  bodyRef?: Ref<HTMLDivElement>;
  onBodyScroll?: () => void;
  overlay?: ReactNode;
  children: ReactNode;
}) {
  return (
    <DrawerFrame
      bodyRef={bodyRef}
      onBodyScroll={onBodyScroll}
      overlay={overlay}
      header={
        <header className="flex h-[74px] shrink-0 items-center gap-4 p-6 shadow-[inset_0_-1px_0_var(--gc-border-default)]">
          <h2 className="min-w-0 flex-1 truncate text-[20px] font-bold leading-[1.3] text-text-primary">Set up your first logging</h2>
          <span className="whitespace-nowrap text-caption-default text-text-secondary">Step {step} of 3</span>
          <DrawerClose label="Close" onClick={onClose} />
        </header>
      }
      footer={footer}
    >
      <div className="flex flex-auto flex-col gap-8 p-6">{children}</div>
    </DrawerFrame>
  );
}

export function LoggingIntro({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-fs-16 font-bold leading-[1.6] text-text-primary">{title}</h3>
      <p className="text-body-default text-text-secondary">{description}</p>
    </div>
  );
}

export function ApplyingOverlay() {
  return (
    <div
      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-bg-surface px-10 text-center"
      style={{ animation: "gc-fade-in 200ms ease-out both" }}
      role="status"
    >
      <Spinner className="size-6 text-text-primary" />
      <span className="text-fs-16 font-bold leading-[1.6] text-text-primary">Applying your logging</span>
      <span className="text-label-default text-text-secondary">Adding the logger to your game…</span>
    </div>
  );
}
