import React from "react";

export function FieldBadge({ identified, pending = false }: { identified: boolean; pending?: boolean }) {
  if (pending) {
    return (
      <span className="flex h-6 items-center rounded-full bg-bg-pending-subtle px-2 text-caption-default text-status-pending ring-1 ring-inset ring-border-pending-subtle">
        Pending
      </span>
    );
  }
  return identified ? (
    <span className="flex h-6 items-center rounded-full bg-bg-positive-subtle px-2 text-caption-default text-text-positive ring-1 ring-inset ring-border-positive-subtle">
      Identified
    </span>
  ) : (
    <span className="flex h-6 items-center rounded-full bg-bg-critical-subtle px-2 text-caption-default text-text-critical ring-1 ring-inset ring-border-critical-subtle">
      Not identified
    </span>
  );
}
