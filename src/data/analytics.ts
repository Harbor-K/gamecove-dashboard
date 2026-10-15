// Analytics pages (Figma Page 18: Overview (summary) · Retention · Explore (investigate)).
// Values come from the repo v8 dataset (lib/dashboard/queries.ts + raw players/sessions/stageRuns), Last 7 days = Sep 16–22,
// Today = Sep 22 until 21:45 UTC. Copy is picked per locale here (EN / KO) so the page translator never has to guess sentences.
import { LOCALE } from "../i18n/locale";

const L = (en: string, ko: string) => (LOCALE === "ko" ? ko : en);
export type Delta = { direction: "up" | "down"; label: string } | null;
export type Kpi = { id: string; label: string; info: string; value: string; delta: Delta };

// ── Overview ──
/** Today so far vs same time last week (Sep 22 vs Sep 15, 00:00–21:45). */
export const overviewKpis: Kpi[] = [
  { id: "dau", label: L("Daily active players", "일일 활성 플레이어"), info: L("Unique players who played at least once today", "오늘 한 번 이상 플레이한 고유 플레이어 수"), value: "134", delta: { direction: "down", label: "49.8%" } },
  { id: "new", label: L("New players", "신규 플레이어"), info: L("Unique players who played for the first time today", "오늘 처음 플레이한 고유 플레이어 수"), value: "53", delta: { direction: "down", label: "61.3%" } },
  { id: "d1", label: L("D1 retention", "1일 유지율"), info: L("Share of yesterday’s new players who played again today", "어제 신규 플레이어 중 오늘 다시 플레이한 비율"), value: "6.0%", delta: { direction: "down", label: L("6.3pp", "6.3%p") } },
  { id: "playtime", label: L("Avg. playtime", "평균 플레이 시간"), info: L("Average playtime per active player today", "오늘 활성 플레이어 1인당 평균 플레이 시간"), value: L("16.9 min", "16.9분"), delta: { direction: "up", label: "5.5%" } },
];

/** Where a Needs attention item leads: an Explore investigation, or the Retention page. */
export type AttentionTarget = "first-session" | "stage-4" | "retention";
/** The 3 biggest problems this week, most important first. Each has its own call to action. */
export const attention = {
  title: L("Needs attention", "확인이 필요해요"),
  subtitle: L("The biggest problems this week, most important first", "이번 주 가장 큰 문제, 중요한 순서대로"),
  items: [
    { value: "43.1%", tag: L("First session", "첫 세션"), text: L("of new players left from the lobby before starting Stage 1 (276 of 641) — the biggest drop in the first session.", "의 신규 플레이어가 스테이지 1을 시작하기 전에 로비에서 나갔어요 (641명 중 276명). 첫 세션에서 가장 큰 이탈이에요."), cta: L("Investigate first session", "첫 세션 조사하기"), target: "first-session" as AttentionTarget },
    { value: "45.4%", tag: L("Stage 4", "스테이지 4"), text: L("clear rate, the lowest of all stages (Stage 2–3 ≈ 79%).", "클리어율로 모든 스테이지 중 가장 낮아요 (스테이지 2–3은 약 79%)."), cta: L("Investigate Stage 4", "스테이지 4 조사하기"), target: "stage-4" as AttentionTarget },
    { value: "6.0%", tag: L("Retention", "유지율"), text: L("of yesterday’s new players came back today (D1) — 6.3pp lower than the same time last week.", "의 어제 신규 플레이어가 오늘 돌아왔어요 (1일 유지율). 지난주 같은 시각보다 6.3%p 낮아요."), cta: L("Open Retention", "리텐션 보기"), target: "retention" as AttentionTarget },
  ],
};

export const engagementTiles = [
  { label: L("Avg. playtime per player", "플레이어당 평균 플레이 시간"), value: L("16.9 min", "16.9분"), sub: L("Today · ▲ 5.5% vs same time last week", "오늘 · 지난주 같은 시각 대비 ▲ 5.5%") },
  { label: L("Sessions per player", "플레이어당 세션 수"), value: "1.3", sub: L("Today · last 7 days ranged 1.23–1.32", "오늘 · 최근 7일 범위 1.23–1.32") },
  { label: L("Avg. session time", "평균 세션 시간"), value: L("13.0 min", "13.0분"), sub: L("Today · last 7 days ranged 11.2–13.1 min", "오늘 · 최근 7일 범위 11.2–13.1분") },
];

export type StageRow = { stage: string; entered: number; clearRate: number; fails: string; firstClear: string; exit: number; low?: boolean };
export const stageRows: StageRow[] = [
  { stage: L("Stage 1", "스테이지 1"), entered: 508, clearRate: 61.6, fails: "5.5", firstClear: L("7.7 min", "7.7분"), exit: 55.9 },
  { stage: L("Stage 2", "스테이지 2"), entered: 327, clearRate: 79.2, fails: "5.5", firstClear: L("7.9 min", "7.9분"), exit: 44.3 },
  { stage: L("Stage 3", "스테이지 3"), entered: 275, clearRate: 79.6, fails: "6.2", firstClear: L("8.6 min", "8.6분"), exit: 52.8 },
  { stage: L("Stage 4", "스테이지 4"), entered: 273, clearRate: 45.4, fails: "9.7", firstClear: L("16.4 min", "16.4분"), exit: 82.2, low: true },
];
export const stageTableCopy = {
  title: L("Stage funnel · all players", "스테이지 퍼널 · 전체 플레이어"),
  info: L("Clear rate = players who cleared ÷ players who entered. Session exit = sessions that ended there ÷ sessions that visited.", "클리어율 = 클리어한 플레이어 ÷ 진입한 플레이어. 세션 종료 = 그 스테이지에서 끝난 세션 ÷ 방문한 세션."),
  subtitle: L("Players who entered each stage · Last 7 days", "각 스테이지에 들어온 플레이어 · 최근 7일"),
  cols: [L("Stage", "스테이지"), L("Players entered", "진입 플레이어"), L("Clear rate", "클리어율"), L("Avg. fails to clear", "클리어 전 평균 실패"), L("First-clear time", "첫 클리어 시간"), L("Session exit", "세션 종료")],
};

/** What the page Filter / Breakdown change (only the trend card can take them — the rest stay all players). */
export const scopeNotes = {
  overview: L("Applies to Daily active users. KPI cards, Needs attention, tiles and the stage table show all players.", "일일 활성 사용자 카드에만 적용돼요. KPI 카드·확인이 필요해요·타일·스테이지 표는 전체 플레이어 기준이에요."),
  retention: L("Applies to Day 1 retention. KPI cards and the cohort tables show all players.", "1일 유지율 카드에만 적용돼요. KPI 카드와 코호트 표는 전체 플레이어 기준이에요."),
  explore: L("Applies to this card.", "이 카드에 적용돼요."),
  exploreNoFilter: L("This card can’t be filtered yet — use Breakdown to compare groups.", "이 카드는 아직 필터를 쓸 수 없어요. 그룹 비교는 Breakdown을 쓰세요."),
  noBreakdown: L("This card doesn’t take Breakdown (cohort and New/Returning cards show all players).", "이 카드는 Breakdown을 쓰지 않아요 (코호트·신규/재방문 카드는 전체 플레이어 기준)."),
  clearFilter: L("Clear the filter to use Breakdown", "Breakdown을 쓰려면 필터를 지우세요"),
  clearBreakdown: L("Clear Breakdown to use a filter", "필터를 쓰려면 Breakdown을 지우세요"),
  investigation: L("This investigation covers all new players / all Stage 4 sessions — filters aren’t available here yet.", "이 조사는 전체 신규 플레이어 / 전체 스테이지 4 세션 기준이라 아직 필터를 쓸 수 없어요."),
};

// ── Retention ──
export const retentionKpis: Kpi[] = [
  { id: "new", label: L("New players", "신규 플레이어"), info: L("Unique players who played for the first time today", "오늘 처음 플레이한 고유 플레이어 수"), value: "53", delta: { direction: "down", label: "61.3%" } },
  { id: "returning", label: L("Returning players", "재방문 플레이어"), info: L("Players who played today and had played before", "오늘 플레이했고 이전에도 플레이한 적 있는 플레이어"), value: "81", delta: { direction: "down", label: "37.7%" } },
  { id: "d1", label: L("D1 retention", "1일 유지율"), info: L("Share of yesterday’s new players who played again today", "어제 신규 플레이어 중 오늘 다시 플레이한 비율"), value: "6.0%", delta: { direction: "down", label: L("6.3pp", "6.3%p") } },
  { id: "d7", label: L("D7 retention", "7일 유지율"), info: L("Share of new players from 7 days ago who played again today", "7일 전 신규 플레이어 중 오늘 다시 플레이한 비율"), value: "2.5%", delta: null },
];

/** New players Sep 16–21 (D1 measurable), grouped by the furthest place reached on day 1. D1 = % who came back the next day. */
export const progressRetention = {
  title: L("Do players who get further come back?", "더 멀리 간 플레이어가 다시 올까요?"),
  info: L("New players grouped by the furthest place they reached on their first day, and the share who played again the next day.", "첫날 가장 멀리 간 곳으로 신규 플레이어를 나누고, 다음 날 다시 플레이한 비율을 보여줘요."),
  subtitle: L("New players from Sep 16–21 · 588 players · 13.1% came back the next day", "9월 16–21일 신규 플레이어 · 588명 · 13.1%가 다음 날 돌아옴"),
  rows: [
    { label: L("Lobby only", "로비만"), players: 210, d1: 3.8 },
    { label: L("Stage 1", "스테이지 1"), players: 241, d1: 13.3 },
    { label: L("Stage 2", "스테이지 2"), players: 74, d1: 28.4 },
    { label: L("Stage 3", "스테이지 3"), players: 42, d1: 35.7 },
    { label: L("Stage 4", "스테이지 4"), players: 21, d1: 4.8, small: true },
  ],
  players: (n: number, small?: boolean) => (LOCALE === "ko" ? `${n}명${small ? " · 표본 적음" : ""}` : `${n} players${small ? " · small sample" : ""}`),
  scaleMax: 40,
  note: L("Bar scale 0–40%. A pattern, not proof: new players who got to Stage 2–3 on day 1 came back more often (28–36%) than those who stayed in the lobby (3.8%).", "막대 기준 0–40%. 경향일 뿐 원인은 아니에요: 첫날 스테이지 2–3까지 간 신규 플레이어가 로비에만 있던 플레이어(3.8%)보다 더 자주 돌아왔어요(28–36%)."),
};

// ── Explore (shown after a question) ──
export type InvestigationId = "first-session" | "stage-4";
export const investigationQuestions: { id: InvestigationId; question: string }[] = [
  { id: "first-session", question: L("Where do new players drop off in their first session?", "신규 플레이어는 첫 세션에서 어디서 이탈하나요?") },
  { id: "stage-4", question: L("Why do players quit Stage 4?", "플레이어는 왜 스테이지 4에서 그만두나요?") },
];
export const exploreCopy = {
  investigating: L("Investigating", "조사 중"),
  alsoAsk: L("Also ask", "다른 질문"),
  description: L("Find the step in the funnel → follow the flows → look inside the stage → read real sessions", "퍼널에서 단계를 찾고 → 흐름을 따라가고 → 스테이지 안을 보고 → 실제 세션을 읽어요"),
};

export const funnel = {
  title: L("New player first session funnel", "신규 플레이어 첫 세션 퍼널"),
  info: L("Did new players make it from the lobby to Stage 2 within their first session? Unique players.", "신규 플레이어가 첫 세션 안에 로비에서 스테이지 2까지 갔는지 봐요. 고유 플레이어 기준."),
  subtitle: L("641 new players · Last 7 days (Sep 16–22) · first session · unique players", "신규 플레이어 641명 · 최근 7일 (9월 16–22일) · 첫 세션 · 고유 플레이어"),
  overallLabel: L("Overall conversion", "전체 전환율"),
  overall: "16.8%",
  overallSub: L("108 of 641 reached Stage 2", "641명 중 108명이 스테이지 2 도달"),
  biggestLabel: L("Biggest drop", "가장 큰 이탈"),
  biggest: L("Lobby → Stage 1", "로비 → 스테이지 1"),
  biggestSub: L("276 players (43.1%) left without starting a stage", "276명(43.1%)이 스테이지를 시작하지 않고 나감"),
  start: L("Start of the funnel", "퍼널 시작"),
  insteadSelected: L("Showing in Flows below", "아래 흐름에서 보는 중"),
  instead: L("See what they did instead", "대신 무엇을 했는지 보기"),
  total: 641,
  /** Drop selected when the page opens (the biggest one). */
  defaultDrop: 1,
  steps: [
    { label: L("Entered lobby", "로비 진입"), users: 641, drop: null as null | { users: number; pct: number } },
    { label: L("Started Stage 1", "스테이지 1 시작"), users: 365, drop: { users: 276, pct: 43.1 } },
    { label: L("Cleared Stage 1", "스테이지 1 클리어"), users: 173, drop: { users: 192, pct: 52.6 } },
    { label: L("Started Stage 2", "스테이지 2 시작"), users: 108, drop: { users: 65, pct: 37.6 } },
  ],
  playersLabel: (n: number) => (LOCALE === "ko" ? `${n}명` : `${n} players`),
  dropLabel: (n: number, pct: number) => (LOCALE === "ko" ? `▼ ${n}명 이탈 · 이전 단계의 ${pct}%` : `▼ ${n} dropped · ${pct}% of previous step`),
};

/** First-session flow after the lobby (sankey). Columns = steps; links carry players. */
export const flows = {
  title: L("What happened after the lobby", "로비 이후 무슨 일이 있었나"),
  info: L("Flows: each band is players moving to their next step in the first session.", "흐름: 띠 하나는 첫 세션에서 다음 단계로 이동한 플레이어예요."),
  subtitle: L("Flows · first session of new players · 641 players", "흐름 · 신규 플레이어 첫 세션 · 641명"),
  steps: [L("Step 0", "0단계"), L("Step 1", "1단계"), L("Step 2", "2단계"), L("Step 3", "3단계")],
  legend: [
    { kind: "forward" as const, label: L("Moved forward", "앞으로 진행") },
    { kind: "left" as const, label: L("Left the game", "게임 종료") },
    { kind: "other" as const, label: L("Other / back to lobby", "기타 / 로비로 복귀") },
  ],
  nodes: [
    { id: "lobby", col: 0, n: 641, kind: "forward" as const, title: L("Entered lobby", "로비 진입"), sub: L("641 players · 100%", "641명 · 100%") },
    { id: "s1", col: 1, n: 365, kind: "forward" as const, title: L("Started Stage 1", "스테이지 1 시작"), sub: "365 · 56.9%" },
    { id: "leftLobby", col: 1, n: 276, kind: "left" as const, title: L("Left the game from the lobby", "로비에서 게임 종료"), sub: L("276 · 43.1% · after 1m 22s on average", "276 · 43.1% · 평균 1분 22초 후") },
    { id: "cleared", col: 2, n: 173, kind: "forward" as const, title: L("Cleared Stage 1", "스테이지 1 클리어"), sub: L("173 · 47.4% of starters", "173 · 시작한 플레이어의 47.4%") },
    { id: "quit1", col: 2, n: 158, kind: "left" as const, title: L("Quit inside Stage 1", "스테이지 1 안에서 그만둠"), sub: L("158 · 43.3% · 7.5 fails, ~6 min", "158 · 43.3% · 실패 7.5회, 약 6분") },
    { id: "back1", col: 2, n: 34, kind: "other" as const, title: L("Back to the lobby", "로비로 복귀"), sub: "34 · 9.3%" },
    { id: "s2", col: 3, n: 94, kind: "forward" as const, title: L("Started Stage 2", "스테이지 2 시작"), sub: L("94 · 54.3% of clearers", "94 · 클리어한 플레이어의 54.3%") },
    { id: "back2", col: 3, n: 26, kind: "other" as const, title: L("Back to the lobby", "로비로 복귀"), sub: "26 · 15.0%" },
    { id: "end2", col: 3, n: 53, kind: "other" as const, title: L("Session ended", "세션 종료"), sub: "53 · 30.6%" },
  ],
  /** What each funnel drop looks like in the flow (node ids + one honest line). Index = funnel step. */
  dropView: {
    1: { nodes: ["leftLobby"], note: L("276 players left the game from the lobby before starting a stage.", "276명이 스테이지를 시작하기 전에 로비에서 게임을 종료했어요.") },
    2: { nodes: ["quit1", "back1"], note: L("192 didn’t clear Stage 1: 158 quit inside the stage, 34 went back to the lobby.", "192명이 스테이지 1을 클리어하지 못했어요: 158명은 스테이지 안에서 그만뒀고, 34명은 로비로 돌아갔어요.") },
    3: { nodes: ["back2", "end2"], note: L("79 clearers didn’t go straight to Stage 2 (26 back to the lobby · 53 ended the session). Some of those who went back started Stage 2 later, so the funnel drop is 65.", "클리어한 플레이어 중 79명이 바로 스테이지 2로 가지 않았어요 (26명 로비 복귀 · 53명 세션 종료). 로비로 돌아간 일부가 나중에 스테이지 2를 시작해서 퍼널 이탈은 65명이에요.") },
  } as Record<number, { nodes: string[]; note: string }>,
  links: [
    ["lobby", "s1", 365, "forward"],
    ["lobby", "leftLobby", 276, "left"],
    ["s1", "cleared", 173, "forward"],
    ["s1", "quit1", 158, "left"],
    ["s1", "back1", 34, "other"],
    ["cleared", "s2", 94, "forward"],
    ["cleared", "back2", 26, "other"],
    ["cleared", "end2", 53, "other"],
  ] as [string, string, number, "forward" | "left" | "other"][],
};

export const insideStage1 = {
  title: L("Inside Stage 1: where the 192 who didn’t clear stopped", "스테이지 1 안: 클리어하지 못한 192명이 멈춘 지점"),
  info: L("First session of new players who started Stage 1 but did not clear it, by stars collected (5 needed).", "스테이지 1을 시작했지만 클리어하지 못한 신규 플레이어의 첫 세션을 모은 별 개수로 나눴어요 (필요한 별 5개)."),
  subtitle: L("First session · stars collected out of 5", "첫 세션 · 별 5개 중 모은 개수"),
  bars: [6, 14, 49, 67, 36, 20],
  labels: ["0 ★", "1 ★", "2 ★", "3 ★", "4 ★", L("5 ★ (not finished)", "5 ★ (미완료)")],
  highlight: [2, 3],
  headline: L("60.4% stopped at 2–3 stars (116 of 192).", "60.4%가 별 2–3개에서 멈췄어요 (192명 중 116명)."),
  facts: [
    { value: L("7.5 fails", "실패 7.5회"), text: L("Average fails before stopping (median 7).", "멈추기 전 평균 실패 횟수 (중앙값 7회).") },
    { value: L("~6 min", "약 6분"), text: L("Average time in Stage 1 before stopping (median 5m 39s).", "멈추기 전 스테이지 1에 머문 평균 시간 (중앙값 5분 39초).") },
    { value: "158 · 34", text: L("Quit the game · went back to the lobby.", "게임 종료 · 로비로 복귀.") },
  ],
};

export const stage4 = {
  flowTitle: L("Flows · what happened after Stage 4 (574 visiting sessions)", "흐름 · 스테이지 4 이후 (방문 세션 574개)"),
  split: [
    { n: 370, kind: "left" as const, label: L("Quit before clearing → session ended · 370 (64.5%)", "클리어 전 그만둠 → 세션 종료 · 370 (64.5%)") },
    { n: 102, kind: "muted" as const, label: L("Cleared → session ended · 102 (17.8%)", "클리어 → 세션 종료 · 102 (17.8%)") },
    { n: 102, kind: "forward" as const, label: L("Back to the lobby · 102 (17.8%)", "로비로 복귀 · 102 (17.8%)") },
  ],
  splitTotal: 574,
  splitNote: L("Stage 4 is the last stage, so some sessions end after a clear. The quit share (64.5% of visits) is the part to investigate.", "스테이지 4가 마지막 스테이지라 클리어 후 끝나는 세션도 있어요. 조사할 부분은 그만둔 몫(방문의 64.5%)이에요."),
  starsTitle: L("Where unfinished Stage 4 runs stop", "클리어하지 못한 스테이지 4 플레이가 멈추는 지점"),
  starsSub: L("451 runs, 8 stars needed — 72.1% stopped at exactly 5 stars", "451회, 필요한 별 8개 — 72.1%가 정확히 별 5개에서 멈춤"),
  stars: [2, 0, 3, 4, 12, 325, 66, 39],
  starLabels: ["0 ★", "1 ★", "2 ★", "3 ★", "4 ★", "5 ★", "6 ★", "7 ★"],
  starHighlight: [5],
};

export const sessions = {
  title: L("Recent sessions that ended in Stage 4", "스테이지 4에서 끝난 최근 세션"),
  info: L("Real sessions from the tracked session path and Stage runs. Session replay is not collected.", "수집된 세션 경로와 스테이지 플레이 기록이에요. 세션 녹화(리플레이)는 수집하지 않아요."),
  subtitle: L("472 sessions · Last 7 days · newest first", "세션 472개 · 최근 7일 · 최신순"),
  cols: [L("Time (UTC)", "시간 (UTC)"), L("Player", "플레이어"), L("Device", "기기"), L("Path", "경로"), L("Session", "세션 길이"), L("Stage 4 result", "스테이지 4 결과")],
  quit: L("Quit", "그만둠"),
  cleared: L("Cleared", "클리어"),
  rows: [
    { time: L("Sep 22, 21:25", "9월 22일 21:25"), player: "P0204", device: L("Mobile", "모바일"), path: L("Lobby → Stage 4", "로비 → 스테이지 4"), length: L("10m 29s", "10분 29초"), result: "quit" as const, detail: L("5 / 8 stars · 11 fails", "별 5 / 8 · 실패 11회") },
    { time: L("Sep 22, 20:55", "9월 22일 20:55"), player: "P0067", device: L("Mobile", "모바일"), path: L("Lobby → Stage 4", "로비 → 스테이지 4"), length: L("33m 21s", "33분 21초"), result: "quit" as const, detail: L("5 / 8 stars · 31 fails", "별 5 / 8 · 실패 31회") },
    { time: L("Sep 22, 20:55", "9월 22일 20:55"), player: "P0083", device: L("Tablet", "태블릿"), path: L("Lobby → Stage 4", "로비 → 스테이지 4"), length: L("12m 26s", "12분 26초"), result: "cleared" as const, detail: L("8 / 8 stars · 7 fails", "별 8 / 8 · 실패 7회") },
    { time: L("Sep 22, 20:54", "9월 22일 20:54"), player: "P0200", device: L("Mobile", "모바일"), path: L("Lobby → Stage 4", "로비 → 스테이지 4"), length: L("8m 19s", "8분 19초"), result: "cleared" as const, detail: L("8 / 8 stars · 1 fail", "별 8 / 8 · 실패 1회") },
    { time: L("Sep 22, 19:19", "9월 22일 19:19"), player: "P0177", device: "PC", path: L("Lobby → Stage 4", "로비 → 스테이지 4"), length: L("4m 24s", "4분 24초"), result: "quit" as const, detail: L("4 / 8 stars · 3 fails", "별 4 / 8 · 실패 3회") },
  ],
};
