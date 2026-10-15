// Values shown on the live dashboard (Bounce Bounce, v8 dataset, data through Sep 22, 21:45 UTC).
// Computed with the repo's lib/dashboard/queries.ts on the default filters (Last 7 days = Sep 16–22, no filters).
// null = can't be calculated yet (shown as N/A, never as 0).
export const dataThrough = "Data through Sep 22, 21:45";

/** Chart colours as theme tokens (CSS variables), so charts follow Light / Dark / System. */
export const chartColors = {
  series: "var(--gc-chart-series-primary)",
  area0: "var(--gc-chart-area-primary-0)",
  area2: "var(--gc-chart-area-primary-2)",
  grid: "var(--gc-chart-grid)",
  label: "var(--gc-chart-label)",
  axis: "var(--gc-chart-bar-default)",
};

export const chartDays = ["Sep 16", "Sep 17", "Sep 18", "Sep 19", "Sep 20", "Sep 21", "Sep 22"];

export type Delta = { direction: "up" | "down"; label: string } | null;

/** Overview KPI row — Today so far vs same time last week (Sep 22 vs Sep 15, 00:00–21:45). */
export const overviewKpis: { id: string; label: string; info: string; value: string; delta: Delta; target: "newAndReturning" | "retention" }[] = [
  { id: "newActiveUsers", label: "New active users", info: "Unique players who played for the first time today", value: "53", delta: { direction: "down", label: "61.3%" }, target: "newAndReturning" },
  { id: "returningActiveUsers", label: "Returning active users", info: "Unique players who played today and had already played before today", value: "81", delta: { direction: "down", label: "37.7%" }, target: "newAndReturning" },
  { id: "d1Retention", label: "D1 retention", info: "Share of yesterday’s new players who returned today", value: "6.0%", delta: { direction: "down", label: "6.3pp" }, target: "retention" },
  { id: "d7Retention", label: "D7 retention", info: "Share of new players from 7 days ago who returned today", value: "2.5%", delta: null, target: "retention" },
];

// ── Engagement series (Sep 16 → Sep 22, Today = Sep 22 is a partial day) ──
export const dailyActiveUsers = [277, 276, 254, 236, 227, 203, 134];
/** minutes per active player */
export const averagePlaytime = [15.628, 16.873, 13.75, 16.732, 16.698, 15.775, 16.94];
/** hours */
export const totalPlaytimeHours = [72.151, 77.614, 58.208, 65.812, 63.172, 53.372, 37.832];
export const sessionsPerUser = [1.256, 1.286, 1.228, 1.305, 1.317, 1.271, 1.306];
export const totalSessions = [348, 355, 312, 308, 299, 258, 175];
/** minutes per session */
export const averageSessionTime = [12.44, 13.118, 11.194, 12.82, 12.677, 12.412, 12.971];

export const newUsers = [124, 111, 96, 99, 74, 84, 53];
export const returningUsers = [153, 165, 158, 137, 153, 119, 81];

export type TrafficSourceId = "homeRecommendations" | "search" | "youtube" | "instagram" | "unattributed";
export const trafficSourceLabels: Record<TrafficSourceId, string> = {
  homeRecommendations: "Home recommendations",
  search: "Search",
  youtube: "YouTube",
  instagram: "Instagram",
  unattributed: "Unattributed",
};
/** Share of players (%) by acquisition source over the selected period, per New / Returning toggle. */
export const trafficSources: Record<"new" | "returning", { id: TrafficSourceId; share: number }[]> = {
  new: [
    { id: "homeRecommendations", share: 63.03 },
    { id: "search", share: 11.08 },
    { id: "youtube", share: 3.28 },
    { id: "instagram", share: 2.81 },
    { id: "unattributed", share: 19.81 },
  ],
  returning: [
    { id: "homeRecommendations", share: 73.32 },
    { id: "search", share: 10.21 },
    { id: "youtube", share: 2.78 },
    { id: "instagram", share: 1.62 },
    { id: "unattributed", share: 12.06 },
  ],
};

// ── Retention ──
/** D1 by cohort date; Sep 22 can't be observed yet (null → line ends, ⓘ at that point). */
export const d1Retention: (number | null)[] = [17.742, 21.622, 11.458, 9.091, 8.108, 5.952, null];
/** D7: no cohort in Sep 16–22 has had 7 days yet. */
export const d7Retention: (number | null)[] = [null, null, null, null, null, null, null];

export const cohortDays = ["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10"];
/** Date cohort table, newest cohort first (same order as the live site). */
export const dateCohorts: { date: string; users: number; retention: (number | null)[] }[] = [
  { date: "Sep 22", users: 53, retention: [null, null, null, null, null, null, null, null, null, null] },
  { date: "Sep 21", users: 84, retention: [5.95, null, null, null, null, null, null, null, null, null] },
  { date: "Sep 20", users: 74, retention: [8.11, 6.76, null, null, null, null, null, null, null, null] },
  { date: "Sep 19", users: 99, retention: [9.09, 4.04, 3.03, null, null, null, null, null, null, null] },
  { date: "Sep 18", users: 96, retention: [11.46, 13.54, 9.38, 3.12, null, null, null, null, null, null] },
  { date: "Sep 17", users: 111, retention: [21.62, 9.01, 8.11, 9.01, 6.31, null, null, null, null, null] },
  { date: "Sep 16", users: 124, retention: [17.74, 13.71, 13.71, 8.06, 7.26, 4.03, null, null, null, null] },
];

// ── Experience (analysis boards) ──
export const exitRates = [
  { area: "Lobby", rate: 38.8 },
  { area: "Stage 1", rate: 55.9 },
  { area: "Stage 2", rate: 44.3 },
  { area: "Stage 3", rate: 52.8 },
  { area: "Stage 4", rate: 82.2 },
];

export const funnelStepLabels = ["Stage entered", "Star 1 earned", "Star 2 earned", "Star 3 earned", "Stage cleared"];

export const stageProgression: {
  stage: number;
  clearRate: string;
  firstClearTime: string;
  failuresToClear: string;
  users: number[];
}[] = [
  { stage: 1, clearRate: "86.6%", firstClearTime: "6m 12s", failuresToClear: "3.1", users: [209, 199, 190, 184, 181] },
  { stage: 2, clearRate: "79.2%", firstClearTime: "7m 55s", failuresToClear: "5.5", users: [120, 113, 101, 97, 95] },
  { stage: 3, clearRate: "61.1%", firstClearTime: "9m 8s", failuresToClear: "7.2", users: [95, 84, 71, 64, 58] },
  { stage: 4, clearRate: "50.0%", firstClearTime: "11m 31s", failuresToClear: "9.4", users: [58, 49, 40, 33, 29] },
];

export const briefingText = "Biggest drop-off is between Lobby and Stage 1 — 133 new players (38.9%) never enter Stage 1.";
export const briefingQuestion = "Why do players drop at Stage 1 entered?";

export const analysisSuggestions = [
  "I want to understand which stages players struggle with and where they drop off.",
  "I want to see how far new players progress during their first session.",
  "I want to understand how player engagement and return behavior have changed recently.",
];
