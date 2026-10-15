import React, { useEffect, useRef } from "react";
import { Check, ChevronDown } from "lucide-react";

/** Workspace filter dropdown: h48 px12 radius 8, 16 secondary label + chevron. */
export function FilterSelect<T extends string>({
  label,
  ariaLabel,
  options,
  value,
  onChange,
  open,
  onOpenChange,
}: {
  label: string;
  ariaLabel: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) onOpenChange(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open, onOpenChange]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
        className={`flex h-control-48 items-center gap-2 rounded-lg px-3 text-fs-16 leading-[1.6] text-text-secondary ring-1 ring-inset ring-border-default cursor-pointer transition-colors duration-150 hover:bg-bg-hover hover:text-text-primary ${open ? "bg-bg-selected" : "bg-bg-surface"}`}
      >
        <span className="whitespace-nowrap">{label}</span>
        <ChevronDown size={16} strokeWidth={1.5} className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-30 mt-1 flex w-48 flex-col gap-1 rounded-md bg-bg-surface p-2 ring-1 ring-inset ring-border-default shadow-[0_8px_24px_0_var(--gc-effect-shadow-lifted)]"
          style={{ animation: "gc-fade-in 150ms ease-out both" }}
        >
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              role="menuitemradio"
              aria-checked={o.value === value}
              onClick={() => {
                onChange(o.value);
                onOpenChange(false);
              }}
              className={`flex h-10 items-center justify-between rounded-sm px-3 text-label-default cursor-pointer hover:bg-bg-hover ${o.value === value ? "bg-bg-selected text-text-primary" : "text-text-secondary hover:text-text-primary"}`}
            >
              {o.label}
              {o.value === value && <Check size={16} strokeWidth={1.5} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
