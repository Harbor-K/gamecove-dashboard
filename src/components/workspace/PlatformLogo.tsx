import React from "react";
import type { Platform } from "../../types/setup";
import { RobloxLogo, UnityLogo } from "../icons/GameCoveIcons";

/** Platform marks shown on project cards (16px), copied from the GameCove repo. */
export function PlatformLogo({ platform }: { platform: Platform }) {
  if (platform === "roblox") return <RobloxLogo className="shrink-0" />;
  if (platform === "unity") return <UnityLogo className="shrink-0" />;
  return null;
}
