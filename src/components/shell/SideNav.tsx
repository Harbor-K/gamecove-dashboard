import React, { type ReactNode } from "react";
import { NavOpenIcon } from "../icons/GameCoveIcons";
import { Logo } from "./Logo";
import { ProfileCard } from "./ProfileCard";

// Figma nav frame: w280, bg nav, border-right, px16, gap16.
export function SideNav({
  visible,
  pinned,
  onToggle,
  onMouseLeave,
  children,
}: {
  visible: boolean;
  pinned: boolean;
  onToggle: () => void;
  onMouseLeave: () => void;
  children: ReactNode;
}) {
  return (
    <nav
      aria-label="Main navigation"
      onMouseLeave={onMouseLeave}
      className={`fixed left-0 top-0 z-30 flex h-[calc(100vh/var(--gc-zoom))] w-sidebar flex-col gap-4 overflow-hidden bg-bg-nav px-4 shadow-[inset_-1px_0_0_var(--gc-border-default)] transition-transform duration-200 ease-out ${
        visible ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex w-full shrink-0 items-center justify-between py-2">
        <Logo />
        <button
          type="button"
          aria-label={pinned ? "Close navigation" : "Open navigation"}
          onClick={onToggle}
          className="block text-icon-primary icon-hit"
        >
          <NavOpenIcon />
        </button>
      </div>
      {children}
      <ProfileCard />
    </nav>
  );
}
