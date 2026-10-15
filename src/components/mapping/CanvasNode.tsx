import React from "react";
import type { NodeIconKey, NodeRowStatus } from "../../types/setup";
import { CheckSmIcon, ClockSmIcon, DoorIcon, FlagIcon, WarningSmIcon } from "../icons/GameCoveIcons";

export const NODE_W = 240;
export const NODE_H = 97;
export const STATUS_ROW_H = 40;

export type NodeVisualState = "default" | "selected" | "reviewed" | "highlighted";

const statusStyle: Record<NodeRowStatus, { bg: string | null; divider: string; glow: string | null; color: string; label: string }> = {
  requiresReview: { bg: "--gc-bg-node-status-critical", divider: "--gc-border-node-divider-critical", glow: "--gc-effect-node-glow-critical", color: "text-status-critical", label: "1 item requires review" },
  pending: { bg: "--gc-bg-node-status-pending", divider: "--gc-border-node-divider-pending", glow: "--gc-effect-node-glow-pending", color: "text-status-pending", label: "1 item pending" },
  ready: { bg: "--gc-bg-node-status-tracked", divider: "--gc-border-node-divider-positive", glow: "--gc-effect-node-glow", color: "text-status-positive", label: "Ready for approval" },
  fullyMapped: { bg: "--gc-bg-node-status-tracked", divider: "--gc-border-node-divider-positive", glow: "--gc-effect-node-glow", color: "text-status-positive", label: "Fully mapped" },
  checking: { bg: null, divider: "--gc-border-default", glow: null, color: "text-text-secondary", label: "Checking…" },
  idle: { bg: null, divider: "--gc-border-default", glow: null, color: "text-text-secondary", label: "0 tracked" },
  // Tracking after mapping, once events apply to the node ("N tracked")
  tracked: { bg: "--gc-bg-node-status-tracked", divider: "--gc-border-node-divider-tracked", glow: "--gc-effect-node-glow", color: "text-status-positive", label: "Tracked" },
};

function StatusRow({ status, label }: { status: NodeRowStatus; label?: string }) {
  const s = statusStyle[status];
  const icon =
    status === "idle" ? (
      <span aria-hidden className="size-2 shrink-0 rounded-full bg-icon-secondary" />
    ) : status === "tracked" ? (
      <span aria-hidden className="size-2 shrink-0 rounded-full bg-status-positive" />
    ) : status === "requiresReview" ? (
      <WarningSmIcon className="shrink-0" />
    ) : status === "pending" ? (
      <ClockSmIcon className="shrink-0" />
    ) : status === "checking" ? (
      <span aria-hidden className="size-4 shrink-0 rounded-full border-2 border-border-default border-t-text-primary" style={{ animation: "gc-spin 900ms linear infinite" }} />
    ) : (
      <CheckSmIcon className="shrink-0" />
    );
  return (
    <div
      key={status}
      className={`flex h-[39px] shrink-0 items-center gap-2 rounded-b-[7px] px-[15px] ${s.color}`}
      style={{
        background: status === "idle" ? "var(--gc-bg-node-status-idle)" : `${s.bg ? `linear-gradient(var(${s.bg}), var(${s.bg})), ` : ""}var(--gc-bg-node-inset)`,
        boxShadow: `inset 0 1px 0 var(${s.divider})${s.glow ? `, inset 0 0 16px var(${s.glow})` : ""}`,
        animation: status === "checking" || status === "idle" ? undefined : "gc-light-up 600ms ease-out",
      }}
    >
      {icon}
      <span className="truncate text-label-default">{label ?? s.label}</span>
    </div>
  );
}

// Figma `Node / Structure`: sheen + surface + gradient border.
const SURFACE_SHEEN = "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)";
const BORDER_GRADIENT = "linear-gradient(180deg, var(--gc-border-node-0) 0%, var(--gc-border-node-1) 50%, var(--gc-border-node-2) 100%)";
const NODE_SHADOW = "inset 0 0 8px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 12px 0 var(--gc-effect-shadow)";

export function CanvasNode({
  x,
  y,
  title,
  role,
  icon,
  state,
  status,
  statusLabel,
  enterDelay,
  onClick,
}: {
  x: number;
  y: number;
  title: string;
  role: string;
  icon: NodeIconKey;
  state: NodeVisualState;
  status?: NodeRowStatus;
  statusLabel?: string;
  enterDelay?: number;
  onClick?: () => void;
}) {
  const Icon = icon === "door" ? DoorIcon : FlagIcon;
  const ring = state === "selected" || state === "highlighted" ? "var(--gc-border-accent)" : state === "reviewed" ? "var(--gc-status-positive)" : null;
  const clickable = Boolean(onClick);

  return (
    <div
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      aria-label={clickable ? `${title}, ${role}` : undefined}
      onClick={onClick}
      onKeyDown={(e) => clickable && (e.key === "Enter" || e.key === " ") && onClick?.()}
      className={`group absolute flex select-none flex-col rounded-[8px] border border-transparent ${clickable ? "cursor-pointer" : ""}`}
      style={{
        left: x,
        top: y,
        width: NODE_W,
        height: NODE_H + (status ? STATUS_ROW_H : 0),
        background: `${SURFACE_SHEEN} padding-box, linear-gradient(var(--gc-bg-surface), var(--gc-bg-surface)) padding-box, ${BORDER_GRADIENT} border-box`,
        // Active (selected) = the 1.5px accent line only — no halo ring or lifted glow behind the node.
        boxShadow: NODE_SHADOW,
        animation: enterDelay !== undefined ? `gc-rise-in 420ms ${enterDelay}ms cubic-bezier(0.2,0.8,0.2,1) both` : undefined,
      }}
    >
      {clickable && <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[7px] bg-bg-hover-subtle opacity-0 transition-opacity duration-150 group-hover:opacity-100" />}
      {ring && (
        <span aria-hidden className="pointer-events-none absolute -inset-px z-10 rounded-[8px]" style={{ boxShadow: `inset 0 0 0 1.5px ${ring}` }} />
      )}
      <div className="relative flex h-[95px] shrink-0 flex-col gap-2 px-[15px] pt-[15px]">
        <div className="flex h-8 w-full items-center gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-[8px] bg-bg-node-inset text-icon-secondary ring-1 ring-inset ring-border-default">
            <Icon />
          </span>
          <span className="min-w-0 flex-1 truncate text-fs-16 font-bold leading-[1.6] text-text-primary">{title}</span>
        </div>
        <span className="truncate text-label-default text-text-secondary">{role}</span>
      </div>
      {status && <StatusRow status={status} label={statusLabel} />}
    </div>
  );
}
