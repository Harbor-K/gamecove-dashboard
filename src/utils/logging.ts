import { analysisOptions, mappingNodes, observationScript, observationScriptBlocks, trackingItems } from "../data/logging";
import type { AnalysisId, AnalysisOption, LoggingNodeId, TrackingEventId, TrackingItem } from "../types/setup";

export const analysisById = Object.fromEntries(analysisOptions.map((a) => [a.id, a])) as Record<AnalysisId, AnalysisOption>;
export const trackingItemById = Object.fromEntries(trackingItems.map((i) => [i.id, i])) as Record<TrackingEventId, TrackingItem>;

export function deriveTracking(analyses: AnalysisId[]) {
  const ready = new Set<TrackingEventId>();
  const req = new Set<TrackingEventId>();
  analyses.forEach((id) => {
    analysisById[id].ready.forEach((e) => ready.add(e));
    analysisById[id].requiresSetup.forEach((e) => req.add(e));
  });
  return {
    ready: trackingItems.filter((i) => i.status === "ready" && ready.has(i.id)),
    requiresSetup: trackingItems.filter((i) => i.status === "requires_setup" && req.has(i.id)),
  };
}

export function analysesUsing(id: TrackingEventId, analyses: AnalysisId[]) {
  return analyses.filter((a) => analysisById[a].ready.includes(id) || analysisById[a].requiresSetup.includes(id));
}

export function scopeOf(id: TrackingEventId, analyses: AnalysisId[]): LoggingNodeId[] {
  const used = new Set<LoggingNodeId>();
  analysesUsing(id, analyses).forEach((a) => analysisById[a].targetNodeIds.forEach((n) => used.add(n)));
  const item = trackingItemById[id];
  const base = item.appliesTo ?? mappingNodes.map((n) => n.id);
  return base.filter((n) => used.has(n));
}

export function nodeLabels(ids: LoggingNodeId[]) {
  return mappingNodes.filter((n) => ids.includes(n.id)).map((n) => n.label);
}

export function observationScriptFor(ready: TrackingEventId[]) {
  const blocks = trackingItems
    .filter((i) => ready.includes(i.id))
    .map((i) => observationScriptBlocks[i.id])
    .filter(Boolean);
  return [observationScript.header, ...blocks].join("\n\n");
}
