export type Platform = "roblox" | "unity" | "others";
export type ProjectRole = "owner" | "editor" | "viewer";

export type Project = {
  id: string;
  name: string;
  platform: Platform;
  memberCount: number;
  role: ProjectRole;
  activity: string;
  needsSetup: boolean;
};

export type NodeIconKey = "door" | "flag";

export type MappingNode = {
  id: string;
  x: number;
  y: number;
  title: string;
  role: string;
  icon: NodeIconKey;
};

export type NodeFieldKey = "about" | "enter" | "ends" | "elements";
export type NodeField = { value: string; identified: boolean };
export type NodeDetails = Record<NodeFieldKey, NodeField>;

export type NodeMappingStatus = "requiresReview" | "pending" | "ready" | "fullyMapped" | "checking";
/** idle = "0 tracked", tracked = "N tracked" (Tracking after mapping). */
export type NodeRowStatus = NodeMappingStatus | "idle" | "tracked";

export type ScriptReview = { field: NodeFieldKey; candidates: string[] };

export type AnalysisId =
  | "gameProgression"
  | "sessionExitLocations"
  | "failuresByStage"
  | "timeSpentByLocation"
  | "withinStageProgress"
  | "sessionFlow";

export type TrackingEventId =
  | "session_started"
  | "session_ended"
  | "lobby_entered"
  | "stage_entered"
  | "stage_completed"
  | "stage_exited"
  | "attempt_failed"
  | "star_collected";

export type LoggingNodeId = "lobby" | "stage_1" | "stage_2" | "stage_3" | "stage_4";

export type AnalysisOption = {
  id: AnalysisId;
  label: string;
  description: string;
  targetNodeIds: LoggingNodeId[];
  ready: TrackingEventId[];
  requiresSetup: TrackingEventId[];
};

export type TrackingItem = {
  id: TrackingEventId;
  label: string;
  status: "ready" | "requires_setup";
  properties: string[];
  appliesTo: LoggingNodeId[] | null;
};
