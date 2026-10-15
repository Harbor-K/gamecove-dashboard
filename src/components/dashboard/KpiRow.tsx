import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { overviewKpis } from "../../data/dashboard";
import { InfoTooltip } from "../ui/InfoTooltip";
import { DeltaChip } from "./DeltaChip";

/**
 * Figma `Overview / KPI row`: 4 cells gap16. `KPI card` p24 gap16 radius 16.
 * New / Returning → scroll to New and returning users on this page; D1 / D7 → Retention.
 */
export function KpiRow() {
  const navigate = useNavigate();
  const { projectId = "bouncebounce" } = useParams();
  return (
    <div className="flex w-full gap-4">
      {overviewKpis.map((k) => {
        const go = () => {
          if (k.target === "retention") navigate(`/projects/${projectId}/retention`);
          else document.querySelector(`[data-metric="newAndReturning"]`)?.scrollIntoView({ block: "center", behavior: "smooth" });
        };
        return (
          <div
            key={k.id}
            role="link"
            tabIndex={0}
            onClick={go}
            onKeyDown={(e) => e.key === "Enter" && go()}
            className="flex min-w-0 flex-1 flex-col gap-4 rounded-lg bg-bg-surface p-6 ring-1 ring-inset ring-border-default cursor-pointer"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-label-default text-text-primary">{k.label}</span>
                <InfoTooltip text={k.info} tone="primary" size={16} strokeWidth={1.2} />
              </div>
              <span className="text-[40px] font-bold leading-[1.5] text-text-primary">{k.value}</span>
            </div>
            <div className="flex h-6 items-center gap-2">
              {k.delta ? (
                <>
                  <DeltaChip direction={k.delta.direction} label={k.delta.label} />
                  <span className="text-label-default text-text-secondary">vs last week</span>
                </>
              ) : (
                <span className="text-label-default text-text-secondary">— No comparison data</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
