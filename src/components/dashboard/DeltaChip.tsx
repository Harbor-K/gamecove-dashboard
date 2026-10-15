import React from "react";

/** Icon / triangle (delta chip 14, filled). Down is rotated. */
function TriangleIcon({ direction }: { direction: "up" | "down" }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0" style={direction === "down" ? { transform: "rotate(180deg)" } : undefined}>
      <path d="M6 16C5.81429 16 5.63225 15.9483 5.47427 15.8507C5.31629 15.753 5.18863 15.6133 5.10557 15.4472C5.02252 15.2811 4.98736 15.0952 5.00404 14.9102C5.02072 14.7252 5.08857 14.5486 5.2 14.4L11.2 6.4C11.2931 6.2758 11.4139 6.175 11.5528 6.10557C11.6916 6.03614 11.8448 6 12 6C12.1552 6 12.3084 6.03614 12.4472 6.10557C12.5861 6.175 12.7069 6.2758 12.8 6.4L18.8 14.4C18.9114 14.5486 18.9793 14.7252 18.996 14.9102C19.0126 15.0952 18.9775 15.2811 18.8944 15.4472C18.8114 15.6133 18.6837 15.753 18.5257 15.8507C18.3678 15.9483 18.1857 16 18 16H6Z" fill="currentColor" />
    </svg>
  );
}

/** Figma `Delta chip`: h24 pl8 pr12 gap4, 14 Regular. Down = critical tone, up = positive tone. */
export function DeltaChip({ direction, label }: { direction: "up" | "down"; label: string }) {
  const down = direction === "down";
  return (
    <span
      aria-label={`${down ? "Decreased" : "Increased"} ${label}`}
      className={`flex h-6 items-center gap-1 whitespace-nowrap rounded-full pl-2 pr-3 text-label-default ${
        down ? "bg-bg-critical-subtle text-text-critical" : "bg-bg-positive-subtle text-text-positive"
      }`}
    >
      <TriangleIcon direction={direction} />
      {label}
    </span>
  );
}
