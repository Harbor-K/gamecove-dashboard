import type { AnalysisOption, LoggingNodeId, TrackingEventId, TrackingItem } from "../types/setup";

export const mappingNodes: { id: LoggingNodeId; canvasId: string; label: string }[] = [
  { id: "lobby", canvasId: "lobby", label: "Lobby" },
  { id: "stage_1", canvasId: "stage-1", label: "Stage 1" },
  { id: "stage_2", canvasId: "stage-2", label: "Stage 2" },
  { id: "stage_3", canvasId: "stage-3", label: "Stage 3" },
  { id: "stage_4", canvasId: "stage-4", label: "Stage 4" },
];

const lobby: LoggingNodeId[] = ["lobby"];
const stages: LoggingNodeId[] = ["stage_1", "stage_2", "stage_3", "stage_4"];
const allAreas: LoggingNodeId[] = [...lobby, ...stages];

export const analysisOptions: AnalysisOption[] = [
  {
    id: "gameProgression",
    label: "Game progression",
    description: "See how far players progress through the game.",
    targetNodeIds: allAreas,
    ready: ["lobby_entered", "stage_entered"],
    requiresSetup: ["stage_completed"],
  },
  {
    id: "sessionExitLocations",
    label: "Session exit locations",
    description: "See where player sessions end.",
    targetNodeIds: allAreas,
    ready: ["lobby_entered", "stage_entered", "session_ended"],
    requiresSetup: ["stage_exited"],
  },
  {
    id: "failuresByStage",
    label: "Failures by stage",
    description: "See where players fail most often.",
    targetNodeIds: stages,
    ready: ["stage_entered"],
    requiresSetup: ["attempt_failed"],
  },
  {
    id: "timeSpentByLocation",
    label: "Time spent by location",
    description: "See how long players spend in each location.",
    targetNodeIds: allAreas,
    ready: ["lobby_entered", "stage_entered", "session_ended"],
    requiresSetup: ["stage_exited"],
  },
  {
    id: "withinStageProgress",
    label: "Within-stage progress",
    description: "See how far players progress within each stage.",
    targetNodeIds: stages,
    ready: ["stage_entered"],
    requiresSetup: ["star_collected"],
  },
  {
    id: "sessionFlow",
    label: "Session flow",
    description: "See where players move next from each location.",
    targetNodeIds: allAreas,
    ready: ["session_started", "lobby_entered", "stage_entered", "session_ended"],
    requiresSetup: ["stage_exited"],
  },
];

export const trackingItems: TrackingItem[] = [
  { id: "session_started", label: "Session started", status: "ready", properties: [], appliesTo: null },
  { id: "lobby_entered", label: "Lobby entered", status: "ready", properties: [], appliesTo: lobby },
  { id: "stage_entered", label: "Stage entered", status: "ready", properties: ["stage_id"], appliesTo: stages },
  { id: "session_ended", label: "Session ended", status: "ready", properties: [], appliesTo: null },
  { id: "stage_completed", label: "Stage completed", status: "requires_setup", properties: ["stage_id"], appliesTo: stages },
  { id: "stage_exited", label: "Stage exited", status: "requires_setup", properties: ["stage_id", "destination", "exit_type"], appliesTo: stages },
  { id: "attempt_failed", label: "Attempt failed", status: "requires_setup", properties: ["stage_id", "fail_cause"], appliesTo: stages },
  { id: "star_collected", label: "Star collected", status: "requires_setup", properties: ["stage_id", "star_index"], appliesTo: stages },
];

export const commonProperties = ["player_id", "session_id", "timestamp"];

export const observationScript = {
  name: "GameCoveLogger",
  location: "ServerScriptService > GameCoveLogger",
  header: `-- GameCoveLogger
-- Observation events selected during logging setup
local Players = game:GetService("Players")
local GameCove = require(script.Parent.GameCove)`,
};

export const observationScriptBlocks: Partial<Record<TrackingEventId, string>> = {
  session_started: `Players.PlayerAdded:Connect(function(player)
    GameCove:Log("session_started", { player = player })
end)`,
  lobby_entered: `GameCove.LobbyEntered:Connect(function(player)
    GameCove:Log("lobby_entered", { player = player })
end)`,
  stage_entered: `GameCove.StageEntered:Connect(function(player, stageId)
    GameCove:Log("stage_entered", { player = player, stage_id = stageId })
end)`,
  session_ended: `Players.PlayerRemoving:Connect(function(player)
    GameCove:Log("session_ended", { player = player })
end)`,
};

export const loggingLoadingMs = { step1to2: 4000, step2to3: 2500, apply: 5000, applyUnlock: 3000 };
