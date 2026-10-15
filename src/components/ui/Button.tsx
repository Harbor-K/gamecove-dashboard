import React, { type ButtonHTMLAttributes, type ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant: "primary" | "secondary";
  icon?: ReactNode;
};

// Figma `Button` (Primary / Secondary): h48, px16, gap8, radius 16, 1px border.
// Only the Primary label is SemiBold; Secondary labels are Regular.
const variants = {
  primary: "bg-bg-button-primary border-border-default text-text-on-button-primary hover-layer",
  secondary: "bg-bg-button-secondary border-border-button-secondary text-text-button-secondary hover:text-text-primary cursor-pointer",
};

export function Button({ variant, icon, children, className = "", ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={`flex h-control-48 shrink-0 items-center gap-2 rounded-lg border bg-clip-padding px-[15px] transition-colors duration-150 disabled:cursor-default disabled:opacity-40 ${variants[variant]} ${className}`}
      {...props}
    >
      {icon && (
        <span className={`flex size-icon-sm items-center justify-center ${variant === "primary" ? "text-icon-inverse" : "text-icon-button-secondary"}`}>
          {icon}
        </span>
      )}
      <span className={`whitespace-nowrap text-fs-16 leading-[1.5] ${variant === "primary" ? "font-semibold" : ""}`}>{children}</span>
    </button>
  );
}

/** Figma `Button / Small`: h32 px12 radius 8, 1px ring, 14 Regular */
export function SmallButton({ children, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`flex h-8 shrink-0 items-center rounded-md px-3 text-label-default whitespace-nowrap text-text-primary ring-1 ring-inset ring-border-default cursor-pointer transition-colors duration-150 hover:bg-bg-hover ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
