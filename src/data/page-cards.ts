import { LOCALE } from "../i18n/locale";

// "카드 추가" on Overview / Retention: each page has its own catalog of cards GameCove already built.
// Adding = putting one of these on the page (no new report). Copy is EN / KO (?lang=ko).
// Numbers for the two new cards come from the v8 dataset (data/dashboard/bounce-bounce.json; queries.ts getProgressionCohorts).

const L = (en: string, ko: string) => (LOCALE === "ko" ? ko : en);

export type PageKey = "overview" | "retention";
export type CardIcon = "funnel" | "people" | "bars" | "stars" | "list" | "table" | "alert" | "trend" | "heatmap" | "device" | "tiles" | "memo";
export type CardDef = { id: string; title: string; desc: string; icon: CardIcon; tone: string; recommended?: boolean };

const tone = {
  red: "--gc-chart-series-exit",
  orange: "--gc-status-pending",
  blue: "--gc-chart-series-primary",
  green: "--gc-text-positive",
  sky: "--gc-icon-ai",
  muted: "--gc-text-secondary",
  critical: "--gc-status-critical",
};

export const pageCards: Record<PageKey, { fixed: string[]; defaults: string[]; catalog: CardDef[] }> = {
  overview: {
    fixed: ["kpi"],
    defaults: ["engagementTop", "engagementBottom", "newReturning"],
    catalog: [
      { id: "firstSessionFunnel", title: L("How far do new players get in their first session?", "신규 플레이어는 첫 세션에서 어디까지 갈까요?"), desc: L("First-session funnel", "첫 세션 퍼널"), icon: "funnel", tone: tone.red, recommended: true },
      { id: "lobbyLeavers", title: L("Who are the players who left from the lobby?", "로비에서 나간 플레이어는 어떤 사람들일까요?"), desc: L("Time, device and return summary", "체류 시간·기기·복귀 요약"), icon: "people", tone: tone.orange },
      { id: "stageBlock", title: L("Which stage blocks players?", "어느 스테이지가 플레이어를 막을까요?"), desc: L("Clear rate and fails by stage", "스테이지별 클리어율·실패 횟수"), icon: "bars", tone: tone.blue, recommended: true },
      { id: "stars", title: L("Where inside a stage do players give up?", "스테이지 안 어디에서 포기할까요?"), desc: L("Stops by stars collected", "모은 별 개수별 멈춤"), icon: "stars", tone: tone.green },
      { id: "sessions", title: L("What did sessions that ended at the problem spot look like?", "문제 지점에서 끝난 세션은 어땠을까요?"), desc: L("Recent sessions", "최근 세션 목록"), icon: "list", tone: tone.sky },
      { id: "stageTable", title: L("See the full stage funnel", "스테이지 퍼널 전체 보기"), desc: L("Entered, clear rate and first-clear time table", "진입·클리어율·첫 클리어 시간 표"), icon: "table", tone: tone.muted },
      { id: "attention", title: L("Needs attention", "확인이 필요해요"), desc: L("This week's biggest problems, most important first", "이번 주 가장 큰 문제 순서대로"), icon: "alert", tone: tone.critical },
      // Default Overview cards — listed so a hidden one can be put back.
      { id: "engagementTop", title: L("How many play each day, and for how long?", "매일 몇 명이 얼마나 플레이할까요?"), desc: L("Daily active users · playtime", "일일 활성 사용자·플레이 시간"), icon: "trend", tone: tone.blue },
      { id: "engagementBottom", title: L("How often and how long are sessions?", "세션은 얼마나 자주, 얼마나 길까요?"), desc: L("Sessions · average session time", "세션 수·평균 세션 시간"), icon: "tiles", tone: tone.sky },
      { id: "newReturning", title: L("How many players are new or returning?", "신규와 재방문 플레이어는 얼마나 될까요?"), desc: L("New and returning users · traffic sources", "신규·재방문 사용자·유입 경로"), icon: "people", tone: tone.green },
    ],
  },
  retention: {
    // The D1 · D7 row is the GameCove default card (always first).
    fixed: ["d1", "d7"],
    defaults: ["dateCohort"],
    catalog: [
      { id: "progress", title: L("Do players who get further on day 1 come back?", "첫날 더 멀리 간 플레이어가 다시 올까요?"), desc: L("Next-day return by day-1 progress", "첫날 진행도별 다음 날 복귀"), icon: "bars", tone: tone.blue, recommended: true },
      { id: "d1", title: L("How is day-1 retention changing?", "1일 유지율은 어떻게 변하고 있을까요?"), desc: L("D1 trend", "D1 추이"), icon: "trend", tone: tone.blue },
      { id: "d7", title: L("How is day-7 retention changing?", "7일 유지율은 어떻게 변하고 있을까요?"), desc: L("D7 trend", "D7 추이"), icon: "trend", tone: tone.sky },
      { id: "dateCohort", title: L("Which start dates keep players longer?", "언제 들어온 플레이어가 더 오래 남을까요?"), desc: L("Date cohort heatmap", "날짜별 코호트 히트맵"), icon: "heatmap", tone: tone.blue },
      { id: "stageCohort", title: L("Do players who reach further stages stay longer?", "어느 스테이지까지 간 플레이어가 더 오래 남을까요?"), desc: L("Cohort heatmap by stage", "스테이지별 코호트 히트맵"), icon: "heatmap", tone: tone.orange },
      { id: "device", title: L("Does retention differ by device?", "기기별로 유지율이 다를까요?"), desc: L("PC · mobile · tablet · console", "PC·모바일·태블릿·콘솔 비교"), icon: "device", tone: tone.green },
    ],
  },
};

export const memoDef: CardDef = { id: "memo", title: L("Note", "메모"), desc: L("Leave a text note", "텍스트로 기록 남기기"), icon: "memo", tone: "--gc-icon-primary" };

export const boardCopy = {
  search: L("Search cards", "카드 검색"),
  empty: L("No cards match", "찾는 카드가 없어요"),
  recommended: L("Suggested", "추천"),
  added: L("Already on this page", "이미 있어요"),
  addHere: L("Add a card here", "여기에 카드 추가"),
  addBar: L("+ Add card", "+ 카드 추가"),
  handle: L("Row menu", "행 메뉴"),
  moveTop: L("Move to top", "맨 위로 이동"),
  moveBottom: L("Move to bottom", "맨 아래로 이동"),
  sendToBoard: L("Send to a new board", "새 보드로 보내기"),
  hide: L("Hide from this page", "이 페이지에서 숨기기"),
  hidden: L("Card hidden", "카드를 숨겼어요"),
  undo: L("Undo", "되돌리기"),
  sendSoon: L("Sending to a new board comes in a later step", "새 보드로 보내기는 다음 단계에서 연결돼요"),
  fixedTip: L("GameCove default cards always stay at the top", "GameCove 기본 카드는 항상 맨 위에 있어요"),
  reset: L("Reset to default layout", "기본 구성으로 되돌리기"),
  resetTitle: L("Reset to the default layout?", "기본 구성으로 되돌릴까요?"),
  resetBody: L("Cards you added or moved go back to how they started. Hidden cards show again.", "추가하거나 옮긴 카드가 처음 상태로 돌아가요. 숨긴 카드도 다시 보여요."),
  cancel: L("Cancel", "취소"),
  confirm: L("Reset", "되돌리기"),
  memoTitle: L("Note", "메모"),
  memoPlaceholder: L("Write a note for your team", "팀에게 남길 메모를 적어 보세요"),
};

// ── Lobby leavers (Overview) — first sessions of new players, Sep 16–22, that never started a stage (276 of 641) ──
export const lobbyLeavers = {
  title: L("New players who left from the lobby", "로비에서 나간 신규 플레이어"),
  info: L(
    "First sessions of new players (Last 7 days) that ended without entering any stage. Time = the whole session, all of it in the lobby.",
    "최근 7일 신규 플레이어의 첫 세션 중 스테이지에 한 번도 들어가지 않고 끝난 세션이에요. 체류 시간 = 세션 전체(모두 로비).",
  ),
  subtitle: L("276 of 641 new players · first session · Last 7 days (Sep 16–22)", "신규 플레이어 641명 중 276명 · 첫 세션 · 최근 7일 (9월 16–22일)"),
  facts: [
    { value: L("1m 22s", "1분 22초"), text: L("Average time in the lobby before leaving (median 1m 14s). 88 left within a minute.", "나가기 전 로비 평균 체류 시간 (중앙값 1분 14초). 88명은 1분 안에 나갔어요.") },
    { value: "6.0%", text: L("Came back the next day (15 of 249). New players who started a stage: 18.3% (62 of 339).", "다음 날 복귀 (249명 중 15명). 스테이지를 시작한 신규 플레이어는 18.3% (339명 중 62명).") },
    { value: "19.9%", text: L("Played again later in the week (55 of 276).", "이번 주 안에 다시 플레이 (276명 중 55명).") },
  ],
  deviceTitle: L("Device", "기기"),
  devices: [
    { label: L("Mobile", "모바일"), n: 158, share: 57.2, compare: 59.2 },
    { label: "PC", n: 71, share: 25.7, compare: 19.7 },
    { label: L("Console", "콘솔"), n: 26, share: 9.4, compare: 11.8 },
    { label: L("Tablet", "태블릿"), n: 21, share: 7.6, compare: 9.3 },
  ],
  playersLabel: (n: number) => (LOCALE === "ko" ? `${n}명` : `${n} players`),
  compareLabel: (v: number) => (LOCALE === "ko" ? `스테이지 시작한 신규 ${v.toFixed(1)}%` : `Started a stage: ${v.toFixed(1)}%`),
  note: L(
    "A pattern, not proof: device mix is close to new players who started a stage — the bigger gap is how often they come back.",
    "경향일 뿐 원인은 아니에요: 기기 구성은 스테이지를 시작한 신규 플레이어와 비슷하고, 큰 차이는 복귀율이에요.",
  ),
};

// ── Stage block (Overview) — uses the same stageRows as the stage table ──
export const stageBlock = {
  title: L("Clear rate and fails by stage", "스테이지별 클리어율·실패 횟수"),
  info: L("Clear rate = players who cleared ÷ players who entered. Fails = average fails before the first clear.", "클리어율 = 클리어한 플레이어 ÷ 진입한 플레이어. 실패 = 첫 클리어 전 평균 실패 횟수."),
  subtitle: L("Players who entered each stage · Last 7 days · lowest clear rate in red", "각 스테이지에 들어온 플레이어 · 최근 7일 · 클리어율이 가장 낮은 곳은 빨강"),
  clearLabel: L("Clear rate", "클리어율"),
  failsLabel: L("Avg. fails to clear", "클리어 전 평균 실패"),
  fails: (v: string) => (LOCALE === "ko" ? `${v}회` : `${v} fails`),
};

// ── Stage cohort heatmap (Retention) — new players Sep 16–21 by furthest place on day 1; day N pools the cohorts that can be measured ──
// cells = [returned, measurable players] · null = no cohort can be measured yet (N/A, never 0)
export const stageCohort = {
  title: L("Retention by furthest stage on day 1", "첫날 도달 스테이지별 리텐션"),
  info: L(
    "New players from Sep 16–21, grouped by the furthest place reached on their first day. Day N counts only players whose day N has already happened.",
    "9월 16–21일 신규 플레이어를 첫날 가장 멀리 간 곳으로 묶었어요. N일째 값은 N일째가 이미 지난 플레이어만 솅니다.",
  ),
  subtitle: L(
    "588 new players (Sep 16–21) · % who played again on day N · N/A = not measurable yet",
    "9월 16–21일 신규 플레이어 588명 · N일째 다시 플레이한 비율 · N/A = 아직 측정 불가",
  ),
  groupLabel: L("Furthest on day 1", "첫날 도달"),
  usersLabel: L("Players", "플레이어"),
  days: ["D1", "D2", "D3", "D4", "D5", "D6", "D7"],
  rows: [
    { label: L("Lobby only", "로비만"), users: 210, cells: [[8, 210], [9, 173], [3, 137], [2, 103], [1, 68], [0, 41], null] },
    { label: L("Stage 1", "스테이지 1"), users: 241, cells: [[32, 241], [22, 209], [18, 186], [11, 142], [7, 107], [4, 58], null] },
    { label: L("Stage 2", "스테이지 2"), users: 74, cells: [[21, 74], [11, 68], [8, 60], [6, 48], [6, 37], [0, 14], null] },
    { label: L("Stage 3", "스테이지 3"), users: 42, cells: [[15, 42], [7, 36], [9, 31], [4, 25], [2, 16], [1, 9], null] },
    { label: L("Stage 4", "스테이지 4"), users: 21, cells: [[1, 21], [0, 18], [0, 16], [0, 13], [0, 7], [0, 2], null] },
  ] as { label: string; users: number; cells: ([number, number] | null)[] }[],
  ofPlayers: (r: number, n: number) => (LOCALE === "ko" ? `${n}명 중 ${r}명` : `${r} of ${n} players`),
  notAvailable: L("Not measurable yet", "아직 측정할 수 없음"),
};
