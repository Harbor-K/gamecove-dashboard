import React, { useEffect, useRef, useState, type ReactNode } from "react";
import type { MappingNode, NodeRowStatus } from "../../types/setup";
import { CanvasNode, NODE_H, NODE_W, STATUS_ROW_H, type NodeVisualState } from "./CanvasNode";
import type { CoachAnchor } from "./CoachMark";

const MARGIN = 48;

/** Read-only canvas: nodes sit at their Figma coordinates and the group is fitted into the visible area. */
export function MappingCanvas({
  nodes,
  entering,
  statuses,
  statusLabels,
  stateOf,
  onNodeClick,
  rightInset,
  zoom = 1,
  onBackgroundClick,
  coachTargetId,
  renderCoach,
}: {
  nodes: MappingNode[];
  entering: boolean;
  statuses?: Record<string, NodeRowStatus>;
  /** Overrides the status-row text per node (e.g. "1 tracked"). */
  statusLabels?: Record<string, string>;
  stateOf: (id: string) => NodeVisualState;
  onNodeClick?: (id: string) => void;
  rightInset: number;
  /** Multiplier on the fitted scale (canvas zoom controls). */
  zoom?: number;
  onBackgroundClick?: () => void;
  /** Node the step-by-step guide should point at. */
  coachTargetId?: string | null;
  /** Renders the anchored guide in screen space (not scaled with the canvas). */
  renderCoach?: (anchor: CoachAnchor, container: { w: number; h: number }) => ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 1200, h: 800 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setSize({ w: entry.contentRect.width, h: entry.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const rowH = statuses ? STATUS_ROW_H : 0;
  const minX = Math.min(...nodes.map((n) => n.x));
  const maxX = Math.max(...nodes.map((n) => n.x + NODE_W));
  const minY = Math.min(...nodes.map((n) => n.y));
  const maxY = Math.max(...nodes.map((n) => n.y + NODE_H + rowH));
  const contentW = maxX - minX;
  const contentH = maxY - minY;
  const availW = Math.max(200, size.w - rightInset);
  const scale = Math.min(1, (availW - MARGIN * 2) / contentW, (size.h - MARGIN * 2) / contentH) * zoom;
  const tx = (availW - contentW * scale) / 2 - minX * scale;
  const ty = (size.h - contentH * scale) / 2 - minY * scale;

  const midY = (n: MappingNode) => n.y + NODE_H / 2;

  const target = coachTargetId ? nodes.find((n) => n.id === coachTargetId) : undefined;
  const anchor: CoachAnchor | null = target
    ? { x: tx + target.x * scale, y: ty + target.y * scale, w: NODE_W * scale, h: (NODE_H + rowH) * scale }
    : null;

  return (
    <div
      ref={ref}
      onClick={(e) => {
        if (onBackgroundClick && e.target === e.currentTarget) onBackgroundClick();
      }}
      className="absolute inset-0 overflow-hidden bg-bg-tracking-canvas"
      style={{ backgroundImage: "radial-gradient(var(--gc-border-default) 1px, transparent 1px)", backgroundSize: "24px 24px" }}
    >
      <div
        className="absolute left-0 top-0 origin-top-left transition-transform duration-300"
        style={{ transform: `translate(${tx}px, ${ty}px) scale(${scale})`, transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)" }}
      >
        <svg className="pointer-events-none absolute left-0 top-0 overflow-visible" width={1} height={1} aria-hidden>
          {nodes.slice(0, -1).map((n, i) => {
            const next = nodes[i + 1];
            return (
              <g
                key={n.id}
                style={{ animation: entering ? `gc-fade-in 300ms ${120 + (i + 1) * 70 + 300}ms ease-out both` : undefined }}
              >
                <line x1={n.x + NODE_W} y1={midY(n)} x2={next.x - 6} y2={midY(next)} stroke="var(--gc-chart-flow-line)" strokeWidth={1.5} />
                <path d={`M ${next.x - 10} ${midY(next) - 5} L ${next.x - 2} ${midY(next)} L ${next.x - 10} ${midY(next) + 5}`} fill="none" stroke="var(--gc-chart-flow-line)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
              </g>
            );
          })}
        </svg>
        {nodes.map((n, i) => (
          <CanvasNode
            key={n.id}
            x={n.x}
            y={n.y}
            title={n.title}
            role={n.role}
            icon={n.icon}
            state={stateOf(n.id)}
            status={statuses?.[n.id]}
            statusLabel={statusLabels?.[n.id]}
            enterDelay={entering ? 120 + i * 70 : undefined}
            onClick={onNodeClick ? () => onNodeClick(n.id) : undefined}
          />
        ))}
      </div>

      {anchor && renderCoach?.(anchor, { w: availW, h: size.h })}
    </div>
  );
}
