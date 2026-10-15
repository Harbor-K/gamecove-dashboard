import React from "react";
import { commonProperties } from "../../data/logging";
import { Dot } from "../ui/StatusParts";

/** Figma `Notice / Logging`: shared properties are recorded automatically. */
export function AutoRecordedNotice() {
  return (
    <p className="flex items-start gap-2 text-label-default text-status-positive">
      <span className="flex h-[21px] w-4 shrink-0 items-center justify-center">
        <Dot tone="positive" />
      </span>
      {commonProperties.join(", ")} are recorded automatically — nothing to add
    </p>
  );
}
