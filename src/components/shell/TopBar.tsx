import React from "react";
import { ChevronIcon, HelpIcon, NavClosedIcon, NotificationIcon, SparkIcon } from "../icons/GameCoveIcons";
import { LogoMark } from "./Logo";
import { ThemeMenu } from "./ThemeMenu";

export type TopBarSelect = {
  name: string;
  thumbnail: string;
  thumbnailBackdrop: boolean;
  ariaLabel: string;
};

// Figma top bar: h56, border-bottom, px16, gap16.
export function TopBar({
  select,
  navCollapsed,
  onExpandNav,
  onAiAgent,
  agentOpen = false,
}: {
  select: TopBarSelect;
  navCollapsed: boolean;
  onExpandNav: () => void;
  onAiAgent?: () => void;
  agentOpen?: boolean;
}) {
  return (
    <header className="sticky top-0 z-20 flex h-14 w-full shrink-0 items-center gap-4 bg-bg-canvas px-4 shadow-[inset_0_-1px_0_var(--gc-border-default)]">
      {navCollapsed && (
        <button
          type="button"
          aria-label="Open navigation"
          onClick={onExpandNav}
          className="group flex size-10 shrink-0 items-center justify-center text-icon-primary cursor-pointer"
        >
          <span className="group-hover:hidden">
            <LogoMark />
          </span>
          <NavClosedIcon className="hidden group-hover:block" />
        </button>
      )}

      {/* Top bar / Select: w236 h40 px12 radius 8. hover = color/bg/hover */}
      <button
        type="button"
        aria-label={select.ariaLabel}
        className="group flex h-control-40 w-[236px] shrink-0 items-center justify-between rounded-md bg-bg-surface px-3 ring-1 ring-inset ring-border-default cursor-pointer hover:bg-bg-hover"
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className={`relative size-6 shrink-0 overflow-hidden rounded-sm ${select.thumbnailBackdrop ? "bg-chart-bar-emphasis" : ""}`}>
            <img src={select.thumbnail} alt="" className="size-full object-cover" />
          </span>
          <span className="truncate text-body-default text-text-primary">{select.name}</span>
        </span>
        <span className="flex h-[5px] w-[10px] shrink-0 items-center justify-center text-icon-secondary group-hover:text-icon-primary">
          <ChevronIcon className="shrink-0" />
        </span>
      </button>

      <div className="h-px min-w-px flex-1" />

      <div className="flex shrink-0 items-center gap-6">
        {/* AI agent: hover = color/bg/hover, no selected colour */}
        <button
          type="button"
          onClick={onAiAgent}
          aria-pressed={agentOpen}
          className="flex h-control-40 items-center gap-2 rounded-full bg-bg-surface px-4 ring-1 ring-inset ring-border-accent cursor-pointer hover:bg-bg-hover"
        >
          <SparkIcon className="shrink-0 text-icon-ai" />
          <span className="whitespace-nowrap text-fs-14 leading-normal text-text-primary">AI Agent</span>
        </button>
        <div className="flex items-center gap-6">
          <button type="button" aria-label="Notifications" className="block size-6 text-icon-primary icon-hit">
            <NotificationIcon />
          </button>
          <button type="button" aria-label="Help" className="block size-6 text-icon-primary icon-hit">
            <HelpIcon />
          </button>
          <ThemeMenu />
        </div>
      </div>
    </header>
  );
}
