import React from "react";
import { assets, currentUser } from "../../data/workspace";
import { DirectionIcon } from "../icons/GameCoveIcons";

// Figma `프로필카드`: h71, border-top, px8, gap12. Avatar stays circular.
export function ProfileCard() {
  return (
    <button
      type="button"
      aria-label="Account menu"
      className="flex h-[71px] w-full shrink-0 items-center gap-3 px-2 text-left shadow-[inset_0_1px_0_var(--gc-border-default)] cursor-pointer hover:bg-bg-hover"
    >
      <span className="relative size-8 shrink-0 overflow-hidden rounded-full bg-avatar-violet">
        <img src={assets.avatar} alt="" className="size-full object-cover" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-label-default font-bold text-text-primary">{currentUser.name}</span>
        <span className="truncate text-caption-default text-text-secondary">{currentUser.role}</span>
      </span>
      <DirectionIcon className="shrink-0 text-icon-primary" />
    </button>
  );
}
