import React, { useEffect, useRef, useState, type ReactNode } from "react";
import { useTheme, type ThemePreference } from "../../theme/theme";
import { DarkModeIcon } from "../icons/GameCoveIcons";
import { DarkModeSmIcon, LightModeIcon, LightModeSmIcon, MenuCheckIcon, SystemIcon } from "../icons/ThemeIcons";

const options: { value: ThemePreference; label: string; icon: ReactNode }[] = [
  { value: "light", label: "Light", icon: <LightModeSmIcon className="shrink-0" /> },
  { value: "dark", label: "Dark", icon: <DarkModeSmIcon className="shrink-0" /> },
  { value: "system", label: "System", icon: <SystemIcon className="shrink-0" /> },
];

// Repo `ThemeMenu`: top bar moon/sun → Figma `Theme menu` (Light / Dark / System).
// The icon follows the theme on screen (Dark = moon, Light = sun). Menu: 8px under the top bar,
// right-aligned to the icon. Clicking the icon again, outside, or Escape closes it.
export function ThemeMenu() {
  const { preference, theme, setPreference } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative size-6">
      <button
        type="button"
        aria-label="Theme"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="block size-6 text-icon-primary icon-hit"
      >
        {theme === "dark" ? <DarkModeIcon /> : <LightModeIcon />}
      </button>
      {open && (
        // Icon sits 16px above the top bar's bottom edge → +8px gap.
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+24px)] z-40 flex flex-col gap-1 rounded-md bg-bg-surface p-2 ring-1 ring-inset ring-border-default shadow-[0_8px_24px_0_var(--gc-effect-shadow)]"
        >
          {options.map((option) => {
            const selected = preference === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                onClick={() => setPreference(option.value)}
                className={`flex h-9 w-[200px] shrink-0 items-center gap-2 rounded-md px-2 text-left text-[15px] leading-normal cursor-pointer hover:bg-bg-hover hover:text-text-primary ${
                  selected ? "text-text-primary" : "text-text-secondary"
                }`}
              >
                {option.icon}
                <span className="flex-1 whitespace-nowrap">{option.label}</span>
                {selected && <MenuCheckIcon className="shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
