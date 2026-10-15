import React, { useState } from "react";
import { exitRates } from "../../data/dashboard";
import { CardHeader, CardShell } from "./CardHeader";

/** Session exit rate: bar list with the highest rate in accent; selectable rows. */
export function ExitRateCard({ onExplore }: { onExplore?: () => void }) {
  const [selected, setSelected] = useState("Lobby");
  const max = Math.max(...exitRates.map((r) => r.rate));
  return (
    <CardShell className="gap-8 p-8">
      <CardHeader
        title="Session exit rate"
        info="Of the sessions that visited each place, the share that ended there. Select a place to see where sessions went next."
        cardFilters
        onExplore={onExplore}
      />
      <div className="-mx-3 flex flex-col gap-2">
        {exitRates.map((r) => {
          const isSel = selected === r.area;
          return (
            <button
              key={r.area}
              type="button"
              aria-pressed={isSel}
              onClick={() => setSelected(r.area)}
              className={`flex h-[52px] items-center gap-4 rounded-md px-3 text-left cursor-pointer transition-colors duration-150 ${isSel ? "bg-bg-selected" : "hover:bg-data-select-row"}`}
            >
              <span className={`w-16 shrink-0 text-fs-16 leading-[1.5] ${isSel ? "text-text-primary" : "text-text-secondary"}`}>{r.area}</span>
              <span className="relative h-9 min-w-0 flex-1 overflow-hidden rounded-md bg-chart-bar-track">
                <span
                  className={`absolute inset-y-0 left-0 rounded-md ${r.rate === max ? "bg-chart-bar-accent" : "bg-chart-bar-default"}`}
                  style={{ width: `${r.rate}%` }}
                />
              </span>
              <span className="w-14 shrink-0 text-right text-fs-16 leading-[1.5] text-text-primary">{r.rate.toFixed(1)}%</span>
            </button>
          );
        })}
      </div>
    </CardShell>
  );
}
