import React, { type ReactNode } from "react";

// Figma `Nav item` (248×48, gap12). Top: px8 / Child: px16 / Nested (boards under Analysis Board): label lines up with the parent label (8 + 16 icon + 12 gap = pl36).
// Default secondary, hover/selected primary.
// `hoverIcon` (Notion-style): at rest the item shows its icon; on hover the icon slot shows `hoverIcon` instead (e.g. ›).
export function NavItem({
  icon,
  hoverIcon,
  label,
  onClick,
  selected = false,
  level = "top",
  trailing,
  labelTone = "secondary",
  ariaExpanded,
}: {
  icon?: ReactNode;
  hoverIcon?: ReactNode;
  label: string;
  onClick?: () => void;
  selected?: boolean;
  level?: "top" | "child" | "nested";
  trailing?: ReactNode;
  labelTone?: "primary" | "secondary";
  ariaExpanded?: boolean;
}) {
  const primary = selected || labelTone === "primary";
  const iconColor = primary ? "text-icon-primary" : "text-icon-secondary group-hover:text-icon-primary";
  const labelColor = primary ? "text-text-primary" : "text-text-secondary group-hover:text-text-primary";
  const pad = level === "nested" ? "pl-9 pr-2" : level === "child" ? "px-4" : "px-2";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={ariaExpanded}
      aria-current={selected ? "page" : undefined}
      className={`group flex h-control-48 w-full shrink-0 items-center gap-3 text-left cursor-pointer ${pad} ${
        selected ? "rounded-md bg-bg-selected" : "rounded-sm hover:rounded-md hover:bg-bg-hover"
      }`}
    >
      <span className="flex min-w-0 flex-1 items-center gap-3">
        {icon && (
          <span className={`flex size-icon-sm shrink-0 items-center justify-center ${iconColor}`}>
            {hoverIcon ? (
              <>
                <span className="flex group-hover:hidden">{icon}</span>
                <span className="hidden group-hover:flex">{hoverIcon}</span>
              </>
            ) : (
              icon
            )}
          </span>
        )}
        <span className={`min-w-0 flex-1 truncate text-body-default ${labelColor}`}>{label}</span>
      </span>
      {trailing && <span className={`flex size-icon-sm shrink-0 items-center justify-center ${iconColor}`}>{trailing}</span>}
    </button>
  );
}
