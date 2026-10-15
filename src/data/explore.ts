// Explore page data: metric ids, labels, Breakdown categories/colours, starter + recommended questions.
// Values live in data/explore-data.ts (computed from the repo dataset). No numbers are written in the UI.

export type AreaId = "lobby" | "stage_1" | "stage_2" | "stage_3" | "stage_4";
export type BreakdownKey = "none" | "visitType" | "device";
export type Category = "new" | "returning" | "mobile" | "tablet" | "pc" | "console";

export type ExploreMetric =
  | "dailyActiveUsers"
  | "playtime"
  | "sessions"
  | "sessionTime"
  | "newAndReturning"
  | "d1Retention"
  | "d7Retention"
  | "dateCohortRetention"
  | "exitRate"
  | "sessionFlow";

type LineSeries = { category: Category | null; values: (number | null)[] }[];
export type ExploreSlice = {
  dau: LineSeries;
  playtimeAverage: LineSeries;
  playtimeTotal: LineSeries;
  sessionsPerUser: LineSeries;
  sessionsTotal: LineSeries;
  sessionTime: LineSeries;
  d1: LineSeries;
  d7: LineSeries;
  exitRate: { area: AreaId; rate: number | null; visits: number; exits: number; breakdown: { category: Category; rate: number | null }[] | null }[];
  flow: Record<
    AreaId,
    { visitSessions: number; destinations: { to: AreaId | "session_end"; sessions: number; share: number; breakdown: { category: Category; share: number | null }[] | null }[] }
  >;
};
export type ExploreData = Record<BreakdownKey, ExploreSlice>;

export const EXPLORE_METRICS: ExploreMetric[] = [
  "dailyActiveUsers",
  "playtime",
  "sessions",
  "sessionTime",
  "newAndReturning",
  "d1Retention",
  "d7Retention",
  "dateCohortRetention",
  "exitRate",
  "sessionFlow",
];
export const isExploreMetric = (v: string | null): v is ExploreMetric => !!v && (EXPLORE_METRICS as string[]).includes(v);

export const AREAS: AreaId[] = ["lobby", "stage_1", "stage_2", "stage_3", "stage_4"];
export const areaLabels: Record<AreaId | "session_end", string> = {
  lobby: "Lobby",
  stage_1: "Stage 1",
  stage_2: "Stage 2",
  stage_3: "Stage 3",
  stage_4: "Stage 4",
  session_end: "Session ended",
};
export const isArea = (v: string | null): v is AreaId => !!v && (AREAS as string[]).includes(v);

/** Breakdown by: one dimension at a time (repo rule). Categories in option order. */
export const breakdownOptions: { key: Exclude<BreakdownKey, "none">; group: string; categories: Category[] }[] = [
  { key: "visitType", group: "Visit type", categories: ["new", "returning"] },
  { key: "device", group: "Device", categories: ["mobile", "tablet", "pc", "console"] },
];
/** Legend / bar labels */
export const categoryLabels: Record<Category, string> = { new: "New", returning: "Returning", mobile: "Mobile", tablet: "Tablet", pc: "PC", console: "Console" };
/** Breakdown select / chips label (visit type reads as players) */
export const categoryChipLabels: Record<Category, string> = { new: "New players", returning: "Returning players", mobile: "Mobile", tablet: "Tablet", pc: "PC", console: "Console" };
/** Repo BREAKDOWN_SERIES_COLORS (fixed per category, any order / filter) */
export const categoryColors: Record<Category, string> = {
  new: "--gc-chart-breakdown-new",
  returning: "--gc-chart-breakdown-returning",
  mobile: "--gc-chart-breakdown-mobile",
  tablet: "--gc-chart-breakdown-tablet",
  pc: "--gc-chart-breakdown-pc",
  console: "--gc-chart-breakdown-console",
};

/** Selected place by default (highest exit rate — the place the starter answers talk about) */
export const defaultArea: AreaId = "stage_4";

// ── Explore with no metric (nav → Explore): starter questions → which card opens next to the answer ──
export const starterQuestions: { question: string; metric: ExploreMetric; selection?: AreaId }[] = [
  { question: "Where do players drop off the most?", metric: "exitRate", selection: "stage_4" },
  { question: "Which stage loses the most players?", metric: "exitRate", selection: "stage_4" },
  { question: "How is Day 1 retention trending?", metric: "d1Retention" },
  { question: "Do players who reach Stage 2 come back more?", metric: "dateCohortRetention" },
  { question: "What changed vs last week?", metric: "dailyActiveUsers" },
  { question: "Where do new players come from?", metric: "newAndReturning" },
];

// ── Recommended questions on a metric (repo: AI from the metric's data; here a fixed mock, 3 per metric) ──
export function recommendedQuestions(metric: ExploreMetric, area: AreaId): string[] {
  const a = areaLabels[area];
  switch (metric) {
    case "exitRate":
      return [`Are ${a} exits higher on some devices?`, `Are ${a} exits higher for new players?`, `Where do players go after ${a}?`];
    case "sessionFlow":
      return [`Where do players go after ${a}?`, `Are ${a} exits higher on some devices?`, "Which stage loses the most players?"];
    case "dailyActiveUsers":
      return ["Is the drop in daily players on some devices?", "Are new or returning players falling off?", "What changed vs last week?"];
    case "playtime":
      return ["Is playtime different on some devices?", "Do new players play less?", "Which day had the lowest playtime?"];
    case "sessions":
      return ["Do some devices have more sessions per player?", "Do returning players come back more often?", "What changed vs last week?"];
    case "sessionTime":
      return ["Are sessions shorter on some devices?", "Are new players' sessions shorter?", "Which day had the shortest sessions?"];
    case "newAndReturning":
      return ["Where do new players come from?", "Why are new players dropping this week?", "How is Day 1 retention trending?"];
    case "d1Retention":
      return ["Is Day 1 retention lower on some devices?", "Is Day 1 retention different for new players?", "Which cohort returns the most?"];
    case "d7Retention":
      return ["When will Day 7 retention be available?", "How is Day 1 retention trending?", "Which cohort returns the most?"];
    case "dateCohortRetention":
      return ["Which cohort returns the most?", "How is Day 1 retention trending?", "Do players who reach Stage 2 come back more?"];
  }
}

/** A recommended question that compares groups also sets that Breakdown on the card (the answer's view). */
export function breakdownFor(question: string): BreakdownKey | null {
  const q = question.toLowerCase();
  if (/device/.test(q)) return "device";
  if (/new players|new or returning|returning players|for new/.test(q)) return "visitType";
  return null;
}

/** Metrics that take the page Breakdown (repo PD-01 / PD-07: New and returning + Date cohort don't). */
export const takesBreakdown = (m: ExploreMetric) => m !== "newAndReturning" && m !== "dateCohortRetention";
