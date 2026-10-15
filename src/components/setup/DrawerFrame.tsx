import React, { type ReactNode, type Ref } from "react";
import { X } from "lucide-react";

export const DRAWER_W = 480;

/** Drawer shell: fixed header/footer, scrolling body. w480, surface, left hairline. */
export function DrawerFrame({
  header,
  footer,
  children,
  bodyRef,
  onBodyScroll,
  overlay,
  animate = true,
}: {
  header: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  bodyRef?: Ref<HTMLDivElement>;
  onBodyScroll?: () => void;
  overlay?: ReactNode;
  animate?: boolean;
}) {
  return (
    <aside
      className="absolute bottom-0 right-0 top-0 z-40 flex flex-col bg-bg-surface shadow-[inset_1px_0_0_var(--gc-border-default),-8px_0_24px_0_var(--gc-effect-shadow)]"
      style={{ width: DRAWER_W, animation: animate ? "gc-drawer-in 280ms cubic-bezier(0.2,0.8,0.2,1) both" : undefined }}
    >
      {header}
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div ref={bodyRef} onScroll={onBodyScroll} className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {children}
        </div>
        {overlay}
      </div>
      {footer && <footer className="flex shrink-0 items-center justify-end gap-3 p-6 shadow-[inset_0_1px_0_var(--gc-border-default)]">{footer}</footer>}
    </aside>
  );
}

export function DrawerClose({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-5 shrink-0 items-center justify-center text-icon-secondary icon-hit hover:text-icon-primary"
    >
      <X size={20} strokeWidth={2} />
    </button>
  );
}

/** Node drawers: header h80 with icon tile + title. */
export function NodeDrawerHeader({ icon, title, onClose }: { icon: ReactNode; title: string; onClose: () => void }) {
  return (
    <header className="flex h-20 shrink-0 items-center gap-4 p-6 shadow-[inset_0_-1px_0_var(--gc-border-default)]">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-bg-canvas text-icon-secondary ring-1 ring-inset ring-border-default">{icon}</span>
        <h2 className="truncate text-[20px] font-bold leading-[1.3] text-text-primary">{title}</h2>
      </div>
      <DrawerClose label="Close" onClick={onClose} />
    </header>
  );
}
