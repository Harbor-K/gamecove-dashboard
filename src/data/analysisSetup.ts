import { LOCALE } from "../i18n/locale";

// Analysis setup (new analysis board → COVY → GameCoveLogger approval).
// Facts come from the GameCove repo: data/analysis-board.ts (board variants), data/logging-catalog.ts
// (events, requirements, logger script) and data/agent-facts.ts (what each chart shows).
// Copy is the repo's rule-based COVY mock (t.aiMock.covy), in the app language.

type L = { en: string; ko: string };
const pick = (l: L) => (LOCALE === "ko" ? l.ko : l.en);

export type BoardVariant = "stageBehavior" | "newPlayerProgression";
export type BoardMetric = "stageProgression" | "exitRate" | "averageTimeSpent" | "newUserProgression";
export type ChartId = BoardMetric | "sessionFlow";

/** Grey loading time after the question is sent (repo boardBuildMs). */
export const boardBuildMs = 1700;
/** Approve → "Adding GameCoveLogger…" (repo approvalRunMs). */
export const approvalRunMs = 1000;

export type BoardCard = { metric: BoardMetric; height: number; withFlow?: boolean };
export const boardVariants: Record<BoardVariant, BoardCard[]> = {
  stageBehavior: [
    { metric: "stageProgression", height: 883 },
    { metric: "exitRate", height: 420, withFlow: true },
    { metric: "averageTimeSpent", height: 540 },
  ],
  newPlayerProgression: [
    { metric: "newUserProgression", height: 658 },
    { metric: "stageProgression", height: 883 },
  ],
};
export const sessionFlowHeight = 564;

/** Board name given automatically from the question (no name/access modal before creating). */
export const boardTitles: Record<BoardVariant, string> = {
  stageBehavior: "Stage progression analysis",
  newPlayerProgression: "New player progression analysis",
};

/** Suggested questions on a new board (English source; the DOM translator localises them). Order → board. */
export const analysisSuggestions = [
  "I want to understand which stages players struggle with and where they drop off.",
  "I want to see how far new players progress during their first session.",
  "I want to understand how player engagement and return behavior have changed recently.",
];
const suggestionVariants: (BoardVariant | null)[] = ["stageBehavior", "newPlayerProgression", null];
export const variantFor = (question: string): BoardVariant => {
  const i = analysisSuggestions.indexOf(question);
  return (i >= 0 ? suggestionVariants[i] : null) ?? "stageBehavior";
};

export const chartTitles: Record<ChartId, string> = {
  stageProgression: "Stage progression",
  exitRate: "Session exit rate",
  sessionFlow: "Session flow",
  averageTimeSpent: "Average time spent",
  newUserProgression: "New user progression",
};
const chartTitleL: Record<ChartId, L> = {
  stageProgression: { en: "Stage progression", ko: "스테이지 진행" },
  exitRate: { en: "Session exit rate", ko: "세션 이탈률" },
  sessionFlow: { en: "Session flow", ko: "세션 흐름" },
  averageTimeSpent: { en: "Average time spent", ko: "평균 체류시간" },
  newUserProgression: { en: "New user progression", ko: "신규 플레이어 진행" },
};
export const chartInfo: Record<ChartId, string> = {
  stageProgression: "Player progression within a Stage. Reach and drop-off are based on players entering the first Step",
  exitRate: "Share of sessions that ended in this area among sessions that visited it",
  sessionFlow: "Next destination after each session’s last visit to the selected area",
  averageTimeSpent: "Average time a visiting session spent in each area. Multiple visits within a session are combined.",
  newUserProgression: "First-session progression of new players. Reach and drop-off are based on players entering the first Step",
};
const chartShows: Record<ChartId, L> = {
  stageProgression: {
    en: "Progress inside each stage (stars reached, clear) and where progress stops; also clear rate, average first-clear time and average failures before the first clear.",
    ko: "각 Stage 안에서의 진행(별 도달, 클리어)과 어디에서 진행이 멈추는지. 클리어율, 평균 첫 클리어 시간, 첫 클리어 전 평균 실패 횟수도 함께 보여 준다.",
  },
  exitRate: {
    en: "For sessions that visited each area (Lobby, Stage 1–4), the share that ended in that area.",
    ko: "각 구역(Lobby, Stage 1–4)을 방문한 세션 중 그 구역에서 세션이 끝난 비율.",
  },
  sessionFlow: {
    en: "Drill-down of Session exit rate: where sessions go right after their last visit to the selected area (next area or session end; the session-end share equals the area's exit rate).",
    ko: "Session exit rate의 하위 보기: 선택한 구역을 마지막으로 방문한 직후 세션이 어디로 이동하는지(다음 구역 또는 세션 종료, 세션 종료 비율 = 그 구역의 이탈률).",
  },
  averageTimeSpent: {
    en: "Average total time that sessions visiting each area spent in that area.",
    ko: "각 구역을 방문한 세션이 그 구역에서 보낸 평균 총 시간.",
  },
  newUserProgression: {
    en: "How far new players get in their first session: Lobby entry, then each stage reached and cleared.",
    ko: "신규 플레이어가 첫 세션에서 어디까지 진행하는지: Lobby 진입, 각 Stage 도달과 클리어.",
  },
};

// ── Logging Catalog (subset) ──
export type EventId =
  | "session_started" | "lobby_entered" | "stage_entered" | "session_ended"
  | "stage_completed" | "stage_exited" | "attempt_failed" | "star_collected";
type CatalogEvent = {
  id: EventId;
  mode: "observation_logger" | "instrumentation";
  label: string;
  properties: string[];
  /** Mapping nodes the event applies to (session events count only in the Events total). */
  scope: "session" | "lobby" | "stages";
  reason: L;
  loggerBlock?: string;
};
export const catalog: CatalogEvent[] = [
  { id: "session_started", mode: "observation_logger", label: "Session started", properties: [], scope: "session",
    reason: { en: "Marks where a session begins; sets the boundary for session-level analysis.", ko: "세션 시작점을 확인하고 session 단위 분석의 경계를 만든다." },
    loggerBlock: `Players.PlayerAdded:Connect(function(player)\n    GameCove:Log("session_started", { player = player })\nend)` },
  { id: "lobby_entered", mode: "observation_logger", label: "Lobby entered", properties: [], scope: "lobby",
    reason: { en: "Shows Lobby visits, movement flow, and time spent in the Lobby.", ko: "Lobby 방문, 이동 흐름, Lobby 체류시간을 확인한다." },
    loggerBlock: `GameCove.LobbyEntered:Connect(function(player)\n    GameCove:Log("lobby_entered", { player = player })\nend)` },
  { id: "stage_entered", mode: "observation_logger", label: "Stage entered", properties: ["stage_id"], scope: "stages",
    reason: { en: "Shows which stage was entered; base population for stage progression and start of stage time.", ko: "어떤 Stage에 진입했는지 확인하며 Stage progression의 기준 population 및 Stage 체류 시작점을 만든다." },
    loggerBlock: `GameCove.StageEntered:Connect(function(player, stageId)\n    GameCove:Log("stage_entered", { player = player, stage_id = stageId })\nend)` },
  { id: "session_ended", mode: "observation_logger", label: "Session ended", properties: [], scope: "session",
    reason: { en: "Marks where a session ends; needed for session exit and session-level time spent.", ko: "세션 종료점을 확인하여 session exit와 session 단위 체류시간을 계산한다." },
    loggerBlock: `Players.PlayerRemoving:Connect(function(player)\n    GameCove:Log("session_ended", { player = player })\nend)` },
  { id: "stage_completed", mode: "instrumentation", label: "Stage completed", properties: ["stage_id"], scope: "stages",
    reason: { en: "Needed for stage clear rate and average first-clear time.", ko: "Stage clear rate와 Avg. first-clear time을 계산하기 위해 필요하다." } },
  { id: "stage_exited", mode: "instrumentation", label: "Stage exited", properties: ["stage_id", "destination", "exit_type"], scope: "stages",
    reason: { en: "Shows when and where players leave a stage; needed for session exit rate, session flow, and average time spent.", ko: "Stage를 언제/어디로 빠져나갔는지 확인한다. Session exit rate, Session flow, Average time spent에 필요하다." } },
  { id: "attempt_failed", mode: "instrumentation", label: "Attempt failed", properties: ["stage_id", "fail_cause"], scope: "stages",
    reason: { en: "Needed for average failures to first clear and to see where players fail repeatedly.", ko: "Avg. failures to first clear와 Stage에서 반복적으로 실패하는 상황을 확인하기 위해 필요하다." } },
  { id: "star_collected", mode: "instrumentation", label: "Star collected", properties: ["stage_id", "star_index"], scope: "stages",
    reason: { en: "Needed for the within-stage progression funnel — how far players actually get inside a stage.", ko: "Stage 내부 progression funnel, 플레이어가 Stage 안에서 실제로 어디까지 진행했는지 확인하기 위해 필요하다." } },
];
export const catalogById = Object.fromEntries(catalog.map((e) => [e.id, e])) as Record<EventId, CatalogEvent>;

/** Analysis → events it needs (repo analysisRequirements). */
const chartEvents: Record<ChartId, EventId[]> = {
  stageProgression: ["stage_entered", "star_collected", "stage_completed", "attempt_failed"],
  exitRate: ["session_started", "lobby_entered", "stage_entered", "session_ended", "stage_exited"],
  sessionFlow: ["session_started", "lobby_entered", "stage_entered", "session_ended", "stage_exited"],
  averageTimeSpent: ["lobby_entered", "stage_entered", "session_ended", "stage_exited"],
  newUserProgression: ["session_started", "lobby_entered", "stage_entered", "star_collected", "stage_completed"],
};

export const boardCharts = (variant: BoardVariant): ChartId[] =>
  boardVariants[variant].flatMap((c) => (c.withFlow ? [c.metric, "sessionFlow" as const] : [c.metric]));

/** Events the board needs, in Catalog order. */
export function boardPlan(variant: BoardVariant, tracked: EventId[]) {
  const charts = boardCharts(variant);
  const need = new Set(charts.flatMap((c) => chartEvents[c]));
  const required = catalog.filter((e) => need.has(e.id));
  const missing = required.filter((e) => !tracked.includes(e.id));
  return {
    required,
    observation: missing.filter((e) => e.mode === "observation_logger"),
    instrumentation: missing.filter((e) => e.mode === "instrumentation"),
    usedBy: (id: EventId) => charts.filter((c) => chartEvents[c].includes(id)).map((c) => pick(chartTitleL[c])),
  };
}

// ── GameCoveLogger ──
export const gameCoveLogger = {
  name: "GameCoveLogger",
  location: "ServerScriptService > GameCoveLogger",
  header: `-- GameCoveLogger\n-- Observation events selected during logging setup\nlocal Players = game:GetService("Players")\nlocal GameCove = require(script.Parent.GameCove)`,
};
export const buildLoggerScript = (events: EventId[]) =>
  [gameCoveLogger.header, ...catalog.filter((e) => e.loggerBlock && events.includes(e.id)).map((e) => e.loggerBlock!)].join("\n\n");

// ── Labels inside answers ──
const L_ = {
  eventsNeeded: { en: "Events needed", ko: "필요한 이벤트" },
  properties: { en: "Properties", ko: "속성" },
  noProperties: { en: "No extra properties", ko: "추가 속성 없음" },
  commonAuto: { en: "player_id, session_id and timestamp are added to every event automatically.", ko: "player_id, session_id, timestamp는 모든 이벤트에 자동으로 붙어요." },
};

// ── COVY copy (repo t.aiMock.covy / t.agent) ──
const T = {
  analysisGoal: (g: string) => (LOCALE === "ko" ? `분석 목적: ${g}` : `Analysis goal: ${g}`),
  pending: {
    buildAnalysis: { en: "Building your analysis...", ko: "분석을 구성하고 있어요..." },
    checkTracking: { en: "Checking the current Tracking setup...", ko: "현재 트래킹 상태를 확인하고 있어요..." },
    identifyEvents: { en: "Identifying the required events...", ko: "필요한 이벤트를 판단하고 있어요..." },
    prepareLogger: { en: "Setting up the task...", ko: "작업을 설정하고 있어요..." },
    generic: { en: "Preparing a response...", ko: "답변을 준비하고 있어요..." },
  },
  boardHeading: { en: "What’s on this board", ko: "이 보드에 들어간 차트" },
  noDataHeading: { en: "Data", ko: "데이터" },
  noData: { en: "These charts don’t show data yet because the tracking they need isn’t being collected.", ko: "이 분석에 필요한 이벤트가 아직 수집되고 있지 않아서 차트에 데이터가 표시되지 않아요." },
  askSetup: { en: "Would you like help setting up the data collection?", ko: "필요한 데이터 수집 설정을 도와드릴까요?" },
  yesSetup: { en: "Yes, set it up", ko: "응, 설정해줘" },
  planIntro: (n: number) =>
    LOCALE === "ko"
      ? `이 보드에는 이벤트 **${n}개**가 필요해요. 그중 일부는 기존 게임 코드를 수정하지 않고 바로 설정할 수 있고, 나머지는 게임 로직에 로그 호출을 추가해야 해요.`
      : `This board needs **${n} events**. Some can be set up right away without changing your existing game code; the rest need a log call added to your game logic.`,
  observationHeading: (n: number) => (LOCALE === "ko" ? `기존 게임 코드 수정 없이 바로 설정 가능 (${n})` : `Ready right away, no game code changes (${n})`),
  instrumentationHeading: (n: number) => (LOCALE === "ko" ? `게임 로직에 로그 호출 추가가 필요 (${n})` : `Need a log call in your game logic (${n})`),
  nextHeading: { en: "Next", ko: "다음" },
  askLoggerFirst: { en: "Shall we start with the ones you can set up right away without changing your game code?", ko: "기존 게임 코드를 수정하지 않고 바로 설정할 수 있는 항목부터 먼저 진행할까요?" },
  yesLogger: { en: "Yes, start with those", ko: "응, 그것부터 해줘" },
  usedIn: (c: string) => (LOCALE === "ko" ? `${c}에 사용` : `used in ${c}`),
  installedHeading: { en: "Basic tracking is set up", ko: "기본 데이터 수집 설정 완료" },
  partialDone: (list: string) => (LOCALE === "ko" ? `**${list}** 설정이 완료됐어요.` : `**${list}** is set up.`),
  manageInTracking: { en: "You can check and manage the added events on the Tracking page.", ko: "추가된 이벤트는 트래킹 페이지에서 확인하고 관리할 수 있어요." },
  remainingHeading: (n: number) => (LOCALE === "ko" ? `아직 게임 코드 수정이 필요 (${n})` : `Still need a game code change (${n})`),
  askContinue: { en: "Which event should we continue the logging setup with?", ko: "어떤 이벤트부터 로깅 설정을 이어갈까요?" },
  continueFrom: (e: string) => (LOCALE === "ko" ? `${e}부터 이어서 수집 설정 해주세요` : `Continue the collection setup from ${e}`),
  goToTracking: { en: "Please go to the Tracking page", ko: "트래킹 페이지로 이동해주세요" },
  navigateTracking: { en: "Go to Tracking", ko: "트래킹으로 이동" },
  wentToTracking: { en: "Opened the Tracking page.", ko: "트래킹 페이지를 열었어요." },
  prototype: { en: "This prototype doesn’t apply actual game code changes.", ko: "현재 프로토타입에서는 실제 게임 코드 수정까지 적용하지는 않습니다." },
  rejectedReply: { en: "I haven't added it yet. Just tell me when you need it, and we can pick up where we left off.", ko: "아직 추가하지 않았어요. 필요할 때 다시 말씀해주시면 이전 작업에 이어서 진행할 수 있어요." },
  steer: { en: "I can help with this analysis board’s data collection: what to track, why, and setting up the logger.", ko: "이 분석 보드의 데이터 수집을 도와드릴 수 있어요. 무엇을 수집할지, 왜 필요한지, 로거 설정까지요." },
  outOfScopeHeading: { en: "Next step", ko: "다음 단계" },
  nothingToInstall: { en: "The events the logger can collect for this board are already tracked.", ko: "이 보드에서 로거로 수집할 수 있는 이벤트는 이미 수집 중이에요." },
};
export const copy = {
  analysisGoal: T.analysisGoal,
  pending: {
    buildAnalysis: pick(T.pending.buildAnalysis),
    checkTracking: pick(T.pending.checkTracking),
    identifyEvents: pick(T.pending.identifyEvents),
    prepareLogger: pick(T.pending.prepareLogger),
    generic: pick(T.pending.generic),
  },
  yesSetup: pick(T.yesSetup),
  yesLogger: pick(T.yesLogger),
  goToTracking: pick(T.goToTracking),
  navigateTracking: pick(T.navigateTracking),
  wentToTracking: pick(T.wentToTracking),
  rejectedReply: pick(T.rejectedReply),
  continueFrom: T.continueFrom,
};

/** A chart or an event in an answer: name, one line, chips (events a chart needs / properties an event records). */
export type SectionItem = { title: string; body: string; chipsLabel: string; chips: string[]; chipsEmpty?: string; meta?: string };
/** Sections with items fold away by default (long explanations tire the reader — open them when needed). */
export type Section = { heading: string; paragraphs?: string[]; bullets?: string[]; items?: SectionItem[]; note?: string };
export type SetupAnswer = { sections: Section[]; followUps: string[]; navigateTracking?: boolean };

const eventItem = (e: CatalogEvent, usedBy: string[]): SectionItem => ({
  title: e.id,
  body: pick(e.reason),
  chipsLabel: pick(L_.properties),
  chips: e.properties,
  chipsEmpty: pick(L_.noProperties),
  meta: usedBy.length ? T.usedIn(usedBy.join(", ")) : undefined,
});
const commonNote = () => pick(L_.commonAuto);

/** 1st answer — what's on the board + no data yet. */
export function explainBoard(variant: BoardVariant): SetupAnswer {
  return {
    sections: [
      {
        heading: pick(T.boardHeading),
        items: boardCharts(variant).map((c) => ({ title: pick(chartTitleL[c]), body: pick(chartShows[c]), chipsLabel: pick(L_.eventsNeeded), chips: chartEvents[c] })),
      },
      { heading: pick(T.noDataHeading), paragraphs: [pick(T.noData), pick(T.askSetup)] },
    ],
    followUps: [pick(T.yesSetup)],
  };
}

/** 2nd answer — the events this board needs, split by how they're collected. */
export function loggingPlan(variant: BoardVariant, tracked: EventId[]): SetupAnswer {
  const plan = boardPlan(variant, tracked);
  if (plan.observation.length === 0) {
    return { sections: [{ heading: "", paragraphs: [pick(T.nothingToInstall), pick(T.manageInTracking)] }], followUps: [pick(T.goToTracking)], navigateTracking: true };
  }
  return {
    sections: [
      { heading: "", paragraphs: [T.planIntro(plan.required.length)] },
      { heading: T.observationHeading(plan.observation.length), items: plan.observation.map((e) => eventItem(e, plan.usedBy(e.id))), note: commonNote() },
      { heading: T.instrumentationHeading(plan.instrumentation.length), items: plan.instrumentation.map((e) => eventItem(e, plan.usedBy(e.id))), note: commonNote() },
      { heading: pick(T.nextHeading), paragraphs: [pick(T.askLoggerFirst)] },
    ],
    followUps: [pick(T.yesLogger)],
  };
}

/** After Approve — what got set up and what's left (follow-ups chosen by the app, repo loggerInstalledFollowUps). */
export function loggerInstalled(variant: BoardVariant, installed: EventId[], tracked: EventId[]): SetupAnswer {
  const plan = boardPlan(variant, tracked);
  const next = plan.instrumentation[0];
  return {
    sections: [
      { heading: pick(T.installedHeading), paragraphs: [T.partialDone(installed.join(", ")), pick(T.manageInTracking)] },
      ...(plan.instrumentation.length
        ? [
            { heading: T.remainingHeading(plan.instrumentation.length), items: plan.instrumentation.map((e) => eventItem(e, plan.usedBy(e.id))), note: commonNote() },
            { heading: pick(T.nextHeading), paragraphs: [pick(T.askContinue)] },
          ]
        : []),
    ],
    followUps: next ? [T.continueFrom(next.id), pick(T.goToTracking)] : [pick(T.goToTracking)],
    navigateTracking: true,
  };
}

export const prototypeOnly = (): SetupAnswer => ({ sections: [{ heading: "", paragraphs: [pick(T.prototype)] }], followUps: [pick(T.goToTracking)] });
export const rejected = (): SetupAnswer => ({ sections: [{ heading: "", paragraphs: [pick(T.rejectedReply)] }], followUps: [pick(T.yesLogger)] });
export const steer = (): SetupAnswer => ({ sections: [{ heading: pick(T.outOfScopeHeading), paragraphs: [pick(T.steer)] }], followUps: [pick(T.yesSetup)] });

/** Rough intent of a typed message during setup (no model; same idea as the repo's mock). */
export function setupIntent(text: string): "yes" | "tracking" | "continue" | "other" {
  const t = text.toLowerCase();
  if (/tracking|트래킹/.test(t) && /어디|where|go|이동|open|관리|page|페이지/.test(t)) return "tracking";
  if (/이어서|continue|stage_completed|stage_exited|attempt_failed|star_collected|코드 수정|code change/.test(t)) return "continue";
  if (/^(응|네|예|좋아|그래|ㅇㅇ|yes|yeah|ok|okay|sure|please)|해줘|도와|설정|진행|시작|할래|할게|start|help|go ahead|set (it )?up|바로/.test(t)) return "yes";
  return "other";
}
