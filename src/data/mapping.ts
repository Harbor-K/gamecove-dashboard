import { tr } from "../i18n/translate";
import type { MappingNode, NodeDetails, NodeFieldKey, ScriptReview } from "../types/setup";

// AI-mapped structure (canvas 1640×1024 coordinates, from the Figma base frame)
export const aiMappedNodes: MappingNode[] = [
  { id: "lobby", x: 76, y: 320, title: "Lobby", role: "Entry point", icon: "door" },
  { id: "stage-1", x: 388, y: 320, title: "Stage 1", role: "Progression", icon: "flag" },
  { id: "stage-2", x: 700, y: 320, title: "Stage 2", role: "Progression", icon: "flag" },
  { id: "stage-3", x: 1012, y: 320, title: "Stage 3", role: "Progression", icon: "flag" },
  { id: "stage-4", x: 1324, y: 320, title: "Stage 4", role: "Progression", icon: "flag" },
];

// Field values are shown in editable textareas, so they are localised here rather than on screen.
const stageDetails: NodeDetails = {
  about: { value: tr("An obstacle course where players collect all stars to clear the stage."), identified: true },
  enter: { value: tr("Entered from the Lobby when unlocked, or directly after clearing the previous stage."), identified: true },
  ends: { value: tr("The stage is cleared when all stars are collected. Dying restarts the player from the beginning."), identified: true },
  elements: { value: tr("Collectible stars and obstacle sections. No checkpoints detected."), identified: true },
};

export const aiNodeDetails: Record<string, NodeDetails> = {
  lobby: {
    about: { value: tr("A starting area where players spawn and access available stages."), identified: true },
    enter: { value: tr("Loaded when a player joins the game or returns from a stage."), identified: true },
    ends: { value: "", identified: false },
    elements: { value: tr("Player spawn and stage entrances."), identified: true },
  },
  "stage-1": stageDetails,
  "stage-2": stageDetails,
  "stage-3": stageDetails,
  "stage-4": stageDetails,
};

/** Map as it looks after Game Setup when a screen opens straight on Tracking (Lobby's end point filled in). */
export const previewMappedDetails: Record<string, NodeDetails> = {
  ...aiNodeDetails,
  lobby: {
    ...aiNodeDetails.lobby,
    ends: { value: tr("Play moves on when the player enters a stage, or ends when they leave the game."), identified: true },
  },
};

const stageIds = ["stage-1", "stage-2", "stage-3", "stage-4"];
export const defaultApplyTo: Record<string, string[]> = Object.fromEntries(
  stageIds.map((id) => [id, stageIds.filter((o) => o !== id)]),
);

export const scriptReview: Record<string, ScriptReview> = {
  "stage-3": { field: "ends", candidates: ["StarManager", "StageCompleteHandler"] },
};

export const fieldOrder: NodeFieldKey[] = ["about", "enter", "ends", "elements"];

export const fieldLabels: Record<NodeFieldKey, string> = {
  about: "About this structure",
  enter: "Ways to enter",
  ends: "How play ends",
  elements: "Key elements",
};

export const fieldPlaceholders: Record<NodeFieldKey, string> = {
  about: "Describe this structure here",
  enter: "Describe how players enter here",
  ends: "Describe how play ends here",
  elements: "Describe key elements here",
};

export const mappingLoadingMs = { step1to2: 5000, step2to3: 5000, resolveCheck: 3000, apply: 5000 };

export const onboardingSteps = {
  1: {
    title: "Build a shared game context",
    description: "Mapping turns your script into a shared view of where players start, progress, and leave. This context lets GameCove recommend the right analysis and logging — you stay in control of every saved change.",
  },
  2: {
    title: "Review node details",
    description: "Review how AI understood each node and adjust the details to match how it works in your game.",
  },
  3: {
    title: "Review the AI draft",
    description: "Resolve any uncertainty, then inspect and explicitly approve every proposed mapping change before it is saved.",
  },
} as const;
