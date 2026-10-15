import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check } from "lucide-react";
import { LOCALE, LOCALE_LABELS, LOCALES, setLocale } from "../../i18n/locale";
import { SettingsIcon } from "../icons/GameCoveIcons";
import { NavItem } from "./NavItem";
import { RailButton } from "./RailButton";

/** Screen px → CSS px (the whole app is scaled by --gc-zoom). */
const toCssPx = (px: number) => px / (parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--gc-zoom")) || 1);

// Nav Setting → settings menu (same as the GameCove repo: Language > English / 한국어).
// Opens 16px right of the nav, bottom-aligned with the Setting item. `compact` = icon-only (Game Setup rail).
export function SettingsNavItem({ labelTone, compact = false }: { labelTone?: "primary" | "secondary"; compact?: boolean }) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!menuRef.current?.contains(target) && !anchorRef.current?.contains(target)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const rect = open ? anchorRef.current?.getBoundingClientRect() : undefined;
  const navRight = open ? anchorRef.current?.closest("nav")?.getBoundingClientRect().right ?? rect?.right ?? 0 : 0;

  return (
    <div ref={anchorRef} className={compact ? "flex" : "w-full"}>
      {compact ? (
        <RailButton icon={<SettingsIcon />} label="Setting" selected={open} ariaExpanded={open} onClick={() => setOpen((o) => !o)} />
      ) : (
        <NavItem icon={<SettingsIcon />} label="Setting" labelTone={labelTone} ariaExpanded={open} onClick={() => setOpen((o) => !o)} />
      )}
      {open &&
        rect &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            className="fixed z-50 flex w-[220px] flex-col gap-1 rounded-md bg-bg-surface p-2 ring-1 ring-inset ring-border-default shadow-[0_16px_40px_0_var(--gc-effect-shadow-lifted)]"
            style={{
              bottom: toCssPx(window.innerHeight - rect.bottom),
              left: toCssPx(navRight) + 16,
              animation: "gc-pop-in 200ms cubic-bezier(0.2,0.8,0.2,1) both",
            }}
          >
            <span className="px-3 pb-1 pt-2 text-label-default text-text-secondary">Language</span>
            {LOCALES.map((l) => (
              <button
                key={l}
                type="button"
                role="menuitemradio"
                aria-checked={l === LOCALE}
                onClick={() => {
                  setOpen(false);
                  setLocale(l);
                }}
                data-no-translate
                className={`flex h-10 items-center justify-between rounded-sm px-3 text-body-default cursor-pointer hover:bg-bg-hover ${
                  l === LOCALE ? "text-text-primary" : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {LOCALE_LABELS[l]}
                {l === LOCALE && <Check size={16} strokeWidth={1.5} />}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}
