import React, { useEffect, useState, type ReactNode } from "react";
import { LogoMark } from "./Logo";
import { SideNav } from "./SideNav";
import { TopBar, type TopBarSelect } from "./TopBar";

/** Minimal rail width (repo NAV_RAIL_W). */
export const RAIL_W = 64;

// Nav: pinned by default (content pushed). Collapse → logo mark in top bar; hover left edge to peek.
// `compact` (Game Setup): only the minimal rail — logo mark + icon list, names on hover (reference: Railway sidebar).
export function AppShell({
  select,
  nav,
  rail,
  compact = false,
  onAiAgent,
  agentOpen,
  rightInset = 0,
  overlay,
  children,
}: {
  select: TopBarSelect;
  nav: ReactNode;
  /** Icon list for the minimal rail */
  rail?: ReactNode;
  compact?: boolean;
  onAiAgent?: () => void;
  agentOpen?: boolean;
  rightInset?: number;
  overlay?: ReactNode;
  children: ReactNode;
}) {
  const [pinned, setPinned] = useState(true);
  const [peek, setPeek] = useState(false);
  const useRail = compact && rail != null;
  const visible = !useRail && (pinned || peek);

  useEffect(() => {
    document.documentElement.style.setProperty("--gc-content-left", useRail ? `${RAIL_W}px` : pinned ? "280px" : "0px");
  }, [pinned, useRail]);

  return (
    <div className="flex min-h-[calc(100vh/var(--gc-zoom))] w-full bg-bg-canvas">
      <div
        aria-hidden
        className={`shrink-0 transition-[width] duration-200 ease-out ${useRail ? "" : pinned ? "w-sidebar" : "w-0"}`}
        style={useRail ? { width: RAIL_W } : undefined}
      />

      {useRail ? (
        <nav
          aria-label="Main navigation"
          className="fixed left-0 top-0 z-30 flex h-[calc(100vh/var(--gc-zoom))] flex-col items-center bg-bg-nav shadow-[inset_-1px_0_0_var(--gc-border-default)]"
          style={{ width: RAIL_W, animation: "gc-fade-in 200ms ease-out both" }}
        >
          {/* Logo row lines up with the top bar (h56) */}
          <div className="flex h-14 w-full shrink-0 items-center justify-center shadow-[inset_0_-1px_0_var(--gc-border-default)]">
            <LogoMark />
          </div>
          <div className="flex min-h-0 w-full flex-1 flex-col items-center pb-4 pt-4">{rail}</div>
        </nav>
      ) : (
        <SideNav
          visible={visible}
          pinned={pinned}
          onToggle={() => {
            setPinned(!pinned);
            setPeek(false);
          }}
          onMouseLeave={() => setPeek(false)}
        >
          {nav}
        </SideNav>
      )}

      {!useRail && !visible && (
        <div aria-hidden className="fixed left-0 top-0 z-30 h-[calc(100vh/var(--gc-zoom))] w-2" onMouseEnter={() => setPeek(true)} />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar select={select} navCollapsed={!useRail && !pinned} onExpandNav={() => setPinned(true)} onAiAgent={onAiAgent} agentOpen={agentOpen} />
        <main className="flex min-w-0 flex-1 flex-col transition-[padding] duration-200 ease-out" style={{ paddingRight: rightInset }}>
          {children}
        </main>
        {overlay}
      </div>
    </div>
  );
}
