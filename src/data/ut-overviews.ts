// User-test designs under "Test designs" in the nav (Figma Page 18):
//   Overview 1 = "GameCove Overview – v6 (design system · Amplitude references)"
//   Overview 2 = "GameCove · Explore (investigate · Heap flow)"
//   Overview 3 = "GameCove · Overview (summary)" (the existing Overview page)
// Values come from the repo v8 dataset (Last 7 days = Sep 16–22, Today = Sep 22 until 21:45 UTC). Copy per locale (EN / KO).
import { LOCALE } from "../i18n/locale";

const L = (en: string, ko: string) => (LOCALE === "ko" ? ko : en);

export type UtRoute = "overview-1" | "overview-2" | "overview-3";
export const utNav = {
  section: L("Test designs", "테스트 디자인"),
  items: [
    { route: "overview-1" as UtRoute, label: "Overview 1" },
    { route: "overview-2" as UtRoute, label: "Overview 2" },
    { route: "overview-3" as UtRoute, label: "Overview 3" },
  ],
};

export type Related = { label: string; to: { kind: "explore"; query: string } | { kind: "page"; path: string } | { kind: "ask"; question: string } };

// ── Overview 1 (v6) ──
export const ov1 = {
  title: L("Overview", "개요"),
  description: L("See how your game is performing at a glance", "게임 상태를 한눈에 확인하세요"),
  whatToCheck: L("What to check", "확인할 것"),
  next: L("Next:", "다음:"),
  sections: {
    firstSession: {
      step: "1",
      name: L("First session", "첫 세션"),
      question: L("How far do new players get in their very first session? Every later metric depends on this step.", "신규 플레이어는 첫 세션에서 어디까지 갈까요? 이후의 모든 지표가 이 단계에 달려 있어요."),
      checks: [
        L("The biggest drop between two steps", "두 단계 사이의 가장 큰 이탈"),
        L("How long players stayed before leaving", "나가기 전에 얼마나 머물렀는지"),
        L("Whether one group (device, source) drops more", "특정 그룹(기기, 유입 경로)이 더 많이 이탈하는지"),
      ],
      card: {
        title: L("New player first session", "신규 플레이어 첫 세션"),
        info: L("Did new players make it from the lobby to Stage 2 within their first session? Unique players.", "신규 플레이어가 첫 세션 안에 로비에서 스테이지 2까지 갔는지 봐요. 고유 플레이어 기준."),
        subtitle: L("641 new players · Last 7 days (Sep 16–22) · % of players who entered the lobby", "신규 플레이어 641명 · 최근 7일 (9월 16–22일) · 로비에 들어온 플레이어 대비 %"),
      },
      steps: [
        { label: L("Entered lobby", "로비 진입"), users: 641, note: null as null | { text: string; worst?: boolean } },
        { label: L("Started Stage 1", "스테이지 1 시작"), users: 365, note: { text: L("−43.1% · 276 left here (biggest drop)", "−43.1% · 276명이 여기서 나감 (가장 큰 이탈)"), worst: true } },
        { label: L("Cleared Stage 1", "스테이지 1 클리어"), users: 173, note: { text: L("−30.0% · 192 left", "−30.0% · 192명 이탈") } },
        { label: L("Reached Stage 2", "스테이지 2 도달"), users: 108, note: { text: L("−10.1% · 65 left", "−10.1% · 65명 이탈") } },
      ],
      total: 641,
      closer: L("Look closer: the 276 players who left from the lobby", "자세히 보기: 로비에서 나간 276명"),
      facts: [
        { value: L("1m 22s", "1분 22초"), text: L("Average time in the lobby before leaving (median 1m 14s). All first sessions: 6m 55s.", "나가기 전 로비에 머문 평균 시간 (중앙값 1분 14초). 전체 첫 세션: 6분 55초.") },
        { value: L("57% mobile", "모바일 57%"), text: L("Same device mix as all new players (58% mobile) — the drop is not tied to one device.", "전체 신규 플레이어와 기기 비율이 같아요 (모바일 58%). 특정 기기 문제는 아니에요.") },
        { value: L("55 of 276", "276명 중 55명"), text: L("Came back later (19.9%). The rest have not played again yet.", "나중에 다시 왔어요 (19.9%). 나머지는 아직 다시 플레이하지 않았어요.") },
      ],
      related: [
        { label: L("Session flow from Lobby", "로비 이후 세션 흐름"), to: { kind: "explore", query: "metric=sessionFlow&selection=lobby" } },
        { label: L("Break down by traffic source", "유입 경로별로 보기"), to: { kind: "explore", query: "metric=newAndReturning" } },
        { label: L("Ask AI Agent why players leave the lobby", "AI 에이전트에게 로비 이탈 이유 묻기"), to: { kind: "ask", question: L("Why do new players leave the lobby before starting a stage?", "신규 플레이어는 왜 스테이지를 시작하기 전에 로비에서 나가나요?") } },
      ] as Related[],
    },
    stages: {
      step: "2",
      name: L("Stage progression", "스테이지 진행"),
      question: L("Which stage stops players? Clear rate shows difficulty; fails and time show how hard the struggle is.", "어느 스테이지가 플레이어를 막을까요? 클리어율은 난이도를, 실패 횟수와 시간은 얼마나 힘들었는지를 보여줘요."),
      checks: [
        L("The stage with the lowest clear rate", "클리어율이 가장 낮은 스테이지"),
        L("Fails and time before the first clear", "첫 클리어 전 실패 횟수와 시간"),
        L("Where inside the stage players give up", "스테이지 안 어디에서 포기하는지"),
      ],
      card: {
        title: L("Stage progress", "스테이지 진행"),
        info: L("Clear rate = players who cleared ÷ players who entered. Session exit = sessions that ended there ÷ sessions that visited.", "클리어율 = 클리어한 플레이어 ÷ 진입한 플레이어. 세션 종료 = 그 스테이지에서 끝난 세션 ÷ 방문한 세션."),
        subtitle: L("Players who entered each stage · Last 7 days · clear rate = cleared ÷ entered", "각 스테이지에 들어온 플레이어 · 최근 7일 · 클리어율 = 클리어 ÷ 진입"),
      },
      lowest: L("Lowest", "가장 낮음"),
      cols: [
        { stage: L("Stage 1", "스테이지 1"), rate: 61.6, entered: L("508 entered", "508명 진입"), fails: L("5.5 fails · 7.7 min to first clear", "실패 5.5회 · 첫 클리어까지 7.7분"), exit: L("55.9% of visiting sessions ended here", "방문 세션의 55.9%가 여기서 끝남") },
        { stage: L("Stage 2", "스테이지 2"), rate: 79.2, entered: L("327 entered", "327명 진입"), fails: L("5.5 fails · 7.9 min to first clear", "실패 5.5회 · 첫 클리어까지 7.9분"), exit: L("44.3% of visiting sessions ended here", "방문 세션의 44.3%가 여기서 끝남") },
        { stage: L("Stage 3", "스테이지 3"), rate: 79.6, entered: L("275 entered", "275명 진입"), fails: L("6.2 fails · 8.6 min to first clear", "실패 6.2회 · 첫 클리어까지 8.6분"), exit: L("52.8% of visiting sessions ended here", "방문 세션의 52.8%가 여기서 끝남") },
        { stage: L("Stage 4", "스테이지 4"), rate: 45.4, entered: L("273 entered", "273명 진입"), fails: L("9.7 fails · 16.4 min to first clear", "실패 9.7회 · 첫 클리어까지 16.4분"), exit: L("82.2% of visiting sessions ended here", "방문 세션의 82.2%가 여기서 끝남"), low: true },
      ],
      closer: L("Look closer: where Stage 4 runs stop", "자세히 보기: 스테이지 4 플레이가 멈추는 지점"),
      starsNote: L("Unfinished Stage 4 runs by stars collected (451 runs, 8 stars needed) — 72.1% stopped at exactly 5 stars", "클리어하지 못한 스테이지 4 플레이를 모은 별 개수로 나눴어요 (451회, 필요한 별 8개) — 72.1%가 정확히 별 5개에서 멈춤"),
      facts: [
        { value: L("370 of 472", "472개 중 370개"), text: L("Sessions that ended in Stage 4 quit before clearing (78.4%). 102 ended right after clearing — Stage 4 is the last stage.", "스테이지 4에서 끝난 세션 중 클리어 전에 그만둔 세션 (78.4%). 102개는 클리어 직후 끝났어요 — 스테이지 4가 마지막 스테이지예요.") },
        { value: L("16.1 fails", "실패 16.1회"), text: L("Average fails in an unfinished Stage 4 run.", "클리어하지 못한 스테이지 4 플레이의 평균 실패 횟수.") },
      ],
      related: [
        { label: L("Stage 4 in Explore", "Explore에서 스테이지 4 보기"), to: { kind: "explore", query: "q=stage-4" } },
        { label: L("Session flow from Stage 4", "스테이지 4 이후 세션 흐름"), to: { kind: "explore", query: "metric=sessionFlow&selection=stage_4" } },
        { label: L("Ask AI Agent what happens at star 5", "AI 에이전트에게 별 5개 지점에서 무슨 일이 있는지 묻기"), to: { kind: "ask", question: L("What happens to Stage 4 players at star 5?", "스테이지 4에서 별 5개 지점에 무슨 일이 있나요?") } },
      ] as Related[],
    },
    sessions: {
      step: "3",
      name: L("Sessions to look at", "살펴볼 세션"),
      question: L("Numbers tell you where; single sessions tell you what happened. Start from real sessions that ended at the problem spot.", "숫자는 어디인지를, 개별 세션은 무슨 일이 있었는지를 알려줘요. 문제 지점에서 끝난 실제 세션부터 보세요."),
      checks: [
        L("What the player did just before leaving", "나가기 직전에 무엇을 했는지"),
        L("Fails and stars in the last stage", "마지막 스테이지의 실패와 별"),
        L("Whether it was a quit or a clear", "그만둔 건지 클리어한 건지"),
      ],
      viewAll: L("View all 472", "472개 모두 보기"),
      related: [
        { label: L("Only sessions that quit at 5 stars", "별 5개에서 그만둔 세션만"), to: { kind: "explore", query: "q=stage-4" } },
        { label: L("Player history (P0067)", "플레이어 기록 (P0067)"), to: { kind: "ask", question: L("Show me player P0067's history", "플레이어 P0067의 기록을 보여줘") } },
        { label: L("Ask AI Agent to summarize these sessions", "AI 에이전트에게 이 세션들 요약 요청"), to: { kind: "ask", question: L("Summarize the recent sessions that ended in Stage 4", "스테이지 4에서 끝난 최근 세션을 요약해 줘") } },
      ] as Related[],
    },
    comingBack: {
      step: "4",
      name: L("Coming back", "다시 돌아오기"),
      question: L("Do new players return the next day — and does it depend on how far they got on day 1?", "신규 플레이어가 다음 날 돌아올까요? 첫날 얼마나 멀리 갔는지에 따라 달라질까요?"),
      checks: [
        L("Next-day return (D1) by first-day progress", "첫날 진행도별 다음 날 복귀 (D1)"),
        L("Groups too small to trust", "믿기엔 너무 작은 그룹"),
        L("Which stage, if fixed, could bring players back", "고치면 플레이어를 다시 오게 할 수 있는 스테이지"),
      ],
      card: {
        title: L("Next-day return by first-day progress", "첫날 진행도별 다음 날 복귀"),
        subtitle: L("588 new players (cohorts Sep 16–21) · 13.1% came back the next day · grouped by the furthest place reached on day 1", "신규 플레이어 588명 (9월 16–21일 코호트) · 13.1%가 다음 날 돌아옴 · 첫날 가장 멀리 간 곳으로 나눔"),
      },
      openRetention: L("Open Retention", "리텐션 열기"),
      note: L("Bar scale 0–40%. This is a pattern, not proof: players who got further may simply have liked the game more.", "막대 기준 0–40%. 경향일 뿐 증거는 아니에요: 더 멀리 간 플레이어가 원래 게임을 더 좋아했을 수도 있어요."),
    },
    engagement: {
      step: "5",
      name: L("Engagement", "참여"),
      question: L("How many people play each day, and how much. Sharp changes here are often the first sign of a bug or a difficulty problem.", "매일 몇 명이 얼마나 플레이하는지 봐요. 여기서 갑자기 바뀌면 버그나 난이도 문제의 첫 신호인 경우가 많아요."),
      checks: [
        L("Sudden drops in daily players", "일일 플레이어의 갑작스러운 감소"),
        L("Playtime and session length moving together", "플레이 시간과 세션 길이가 함께 움직이는지"),
        L("Today is still in progress", "오늘은 아직 진행 중"),
      ],
      card: {
        title: L("Daily active players", "일일 활성 플레이어"),
        info: L("Unique players who played at least once on each day", "하루에 한 번 이상 플레이한 고유 플레이어 수"),
        subtitle: L("Last 7 days · today (Sep 22) is in progress until 21:45", "최근 7일 · 오늘(9월 22일)은 21:45까지 진행 중"),
      },
      related: [
        { label: L("New vs returning players", "신규 vs 재방문 플레이어"), to: { kind: "explore", query: "metric=newAndReturning" } },
        { label: L("Open Overview 3", "Overview 3 열기"), to: { kind: "page", path: "overview-3" } },
      ] as Related[],
    },
  },
};

// ── Overview 2 (Heap flow: find the drop → follow the paths → see the moment → write hypotheses) ──
export const ov2 = {
  title: "Explore",
  description: L("Investigate a problem: find the step in the funnel → follow the flows → look inside the stage → read real sessions", "문제를 조사해요: 퍼널에서 단계를 찾고 → 흐름을 따라가고 → 스테이지 안을 보고 → 실제 세션을 읽어요"),
  eyebrow: L("INVESTIGATION", "조사"),
  question: L("Why do so few new players clear Stage 1 in their first session?", "신규 플레이어는 왜 첫 세션에서 스테이지 1을 잘 못 깨까요?"),
  questionSub: L(
    "Only 173 of the 365 new players who started Stage 1 cleared it (47.4%) · first session · Last 7 days (Sep 16–22). Follow the 4 steps: find the drop → follow the paths → see the moment → write hypotheses.",
    "스테이지 1을 시작한 신규 플레이어 365명 중 173명만 클리어했어요 (47.4%) · 첫 세션 · 최근 7일 (9월 16–22일). 4단계로 따라가요: 이탈 찾기 → 경로 따라가기 → 순간 보기 → 가설 세우기.",
  ),
  steps: [
    { n: "1", name: L("Find the drop", "이탈 찾기"), text: L("Where do players stop? Compare completion step by step.", "어디서 멈출까요? 단계별 완료를 비교해요."), tag: L("Funnel", "퍼널") },
    { n: "2", name: L("Follow the paths", "경로 따라가기"), text: L("What did each group do next? Players who cleared vs. didn't.", "각 그룹은 다음에 무엇을 했을까요? 클리어한 그룹 vs 못한 그룹."), tag: L("Journeys", "여정") },
    { n: "3", name: L("See the moment", "순간 보기"), text: L("Real sessions around the drop: tries, stars and time.", "이탈 전후의 실제 세션: 시도, 별, 시간."), tag: L("Session timeline", "세션 타임라인") },
    { n: "4", name: L("Write hypotheses", "가설 세우기"), text: L("Turn patterns into ideas to test, with the data each needs.", "패턴을 검증할 아이디어로 바꾸고, 필요한 데이터를 정해요."), tag: L("Hypotheses", "가설") },
  ],
  stepOf: (n: string) => L(`STEP ${n} OF 4`, `4단계 중 ${n}단계`),
  labels: {
    s1: { title: L("Find the drop · Funnel", "이탈 찾기 · 퍼널"), sub: L("Stage 1 starters → clear is the step to look at: 192 of 365 (52.6%) didn't clear.", "볼 단계는 스테이지 1 시작 → 클리어: 365명 중 192명(52.6%)이 클리어하지 못했어요.") },
    s2: { title: L("Follow the paths · Journeys", "경로 따라가기 · 여정"), sub: L("Same start (Stage 1), different outcome — what did each group do before and after?", "같은 시작(스테이지 1), 다른 결과 — 각 그룹은 전후에 무엇을 했을까요?") },
    s3: { title: L("See the moment · Session timeline", "순간 보기 · 세션 타임라인"), sub: L("Look at what happened right before players stopped — stars, tries and time in real sessions.", "플레이어가 멈추기 직전에 무슨 일이 있었는지 봐요 — 실제 세션의 별, 시도, 시간.") },
    s4: { title: L("Write hypotheses", "가설 세우기"), sub: L("Ideas to test next — each with what supports it, how to check it and the data it needs.", "다음에 검증할 아이디어 — 근거, 확인 방법, 필요한 데이터를 함께 적어요.") },
  },
  compare: {
    title: L("Cleared vs. didn't clear Stage 1", "스테이지 1 클리어 vs 미클리어"),
    info: L("New players' first sessions that started Stage 1, split by whether they cleared it in that session.", "스테이지 1을 시작한 신규 플레이어의 첫 세션을, 그 세션에서 클리어했는지로 나눴어요."),
    subtitle: L("New players' first session · started Stage 1 (365) · Stage 1 runs in that session", "신규 플레이어 첫 세션 · 스테이지 1 시작 (365명) · 그 세션의 스테이지 1 플레이"),
    groups: [
      {
        name: L("Cleared Stage 1", "스테이지 1 클리어"),
        tone: "primary" as const,
        n: L("173 players · 47.4%", "173명 · 47.4%"),
        rows: [
          [L("Fails in Stage 1 (avg)", "스테이지 1 실패 (평균)"), "6.5"],
          [L("Time in Stage 1 (avg)", "스테이지 1 시간 (평균)"), L("8.2 min", "8.2분")],
          [L("Came back next day (D1)", "다음 날 복귀 (D1)"), L("20.0% · 32 of 160", "20.0% · 160명 중 32명")],
        ],
        then: L("Then: 94 started Stage 2 · 26 back to lobby · 53 ended the session", "그다음: 94명 스테이지 2 시작 · 26명 로비 복귀 · 53명 세션 종료"),
      },
      {
        name: L("Didn't clear Stage 1", "스테이지 1 미클리어"),
        tone: "critical" as const,
        n: L("192 players · 52.6%", "192명 · 52.6%"),
        rows: [
          [L("Fails in Stage 1 (avg)", "스테이지 1 실패 (평균)"), "7.5"],
          [L("Time in Stage 1 (avg)", "스테이지 1 시간 (평균)"), L("6.0 min", "6.0분")],
          [L("Came back next day (D1)", "다음 날 복귀 (D1)"), L("16.8% · 30 of 179", "16.8% · 179명 중 30명")],
        ],
        then: L("Then: 158 quit inside Stage 1 · 34 back to lobby", "그다음: 158명 스테이지 1 안에서 그만둠 · 34명 로비 복귀"),
      },
    ],
    insight: L("Both groups failed about as often (6.5 vs 7.5 fails on average). The ones who didn't clear left about 2 minutes sooner (6.0 vs 8.2 min in Stage 1).", "두 그룹의 실패 횟수는 비슷해요 (평균 6.5 vs 7.5회). 클리어하지 못한 그룹이 약 2분 더 빨리 떠났어요 (스테이지 1에서 6.0 vs 8.2분)."),
    caveat: L("A pattern, not a cause. D1 counts only first sessions from Sep 16–21, whose next day can be observed.", "경향일 뿐 원인은 아니에요. D1은 다음 날을 관측할 수 있는 9월 16–21일 첫 세션만 세었어요."),
  },
  timeline: {
    title: L("Real sessions around the drop", "이탈 전후의 실제 세션"),
    info: L("Built from the tracked session path and Stage runs. Session replay is not collected.", "수집된 세션 경로와 스테이지 플레이로 만들었어요. 세션 녹화(리플레이)는 수집하지 않아요."),
    subtitle: L("Event log from the tracked session path and Stage runs · Sep 22 · newest first · time = from session start", "수집된 세션 경로·스테이지 플레이 기반 이벤트 기록 · 9월 22일 · 최신순 · 시간 = 세션 시작부터"),
    sessionLabel: L("Session", "세션"),
    footnote: L("Single fails aren't time-stamped in this data — tries, fails and stars are totals for each Stage run.", "이 데이터에는 실패 하나하나의 시각이 없어요 — 시도·실패·별은 스테이지 플레이별 합계예요."),
    sessions: [
      {
        who: L("P1213 · Mobile", "P1213 · 모바일"),
        result: L("Didn't clear", "미클리어"),
        bad: true,
        total: 504,
        segs: [["lobby", 29], ["bad", 474], ["lobby", 1]] as [string, number][],
        events: [
          ["0:00", L("Session started", "세션 시작"), "plain"],
          ["0:29", L("Entered Stage 1", "스테이지 1 진입"), "plain"],
          [L("in Stage 1", "스테이지 1에서"), L("9 tries · 9 fails · 3 of 5 ★", "시도 9회 · 실패 9회 · 별 3 / 5"), "run"],
          ["8:23", L("Quit Stage 1", "스테이지 1 그만둠"), "bad"],
          ["8:24", L("Session ended", "세션 종료"), "plain"],
        ] as [string, string, "plain" | "run" | "bad" | "good"][],
      },
      {
        who: L("P1212 · Mobile", "P1212 · 모바일"),
        result: L("Didn't clear", "미클리어"),
        bad: true,
        total: 403,
        segs: [["lobby", 25], ["bad", 377], ["lobby", 1]] as [string, number][],
        events: [
          ["0:00", L("Session started", "세션 시작"), "plain"],
          ["0:25", L("Entered Stage 1", "스테이지 1 진입"), "plain"],
          [L("in Stage 1", "스테이지 1에서"), L("10 tries · 10 fails · 3 of 5 ★", "시도 10회 · 실패 10회 · 별 3 / 5"), "run"],
          ["6:42", L("Quit Stage 1", "스테이지 1 그만둠"), "bad"],
          ["6:43", L("Session ended", "세션 종료"), "plain"],
        ] as [string, string, "plain" | "run" | "bad" | "good"][],
      },
      {
        who: "P1228 · PC",
        result: L("Cleared", "클리어"),
        bad: false,
        total: 1209,
        segs: [["lobby", 42], ["good", 465], ["lobby", 6], ["good", 693], ["lobby", 3]] as [string, number][],
        events: [
          ["0:00", L("Session started", "세션 시작"), "plain"],
          ["0:42", L("Entered Stage 1", "스테이지 1 진입"), "plain"],
          [L("in Stage 1", "스테이지 1에서"), L("5 tries · 4 fails · 5 of 5 ★", "시도 5회 · 실패 4회 · 별 5 / 5"), "run"],
          ["8:27", L("Cleared Stage 1", "스테이지 1 클리어"), "good"],
          ["8:33", L("Entered Stage 2", "스테이지 2 진입"), "plain"],
          ["20:06", L("Quit Stage 2 (5 of 6 ★)", "스테이지 2 그만둠 (별 5 / 6)"), "bad"],
          ["20:09", L("Session ended", "세션 종료"), "plain"],
        ] as [string, string, "plain" | "run" | "bad" | "good"][],
      },
    ],
  },
  gaps: {
    title: L("What this data can't show yet", "이 데이터로 아직 볼 수 없는 것"),
    info: L("Fields that would show the exact moment of failure. Names come from the GameCove tracking plan.", "실패한 정확한 순간을 보여줄 항목이에요. 이름은 GameCove 수집 계획에서 가져왔어요."),
    subtitle: L("Needed to see the exact moment of failure — like a session replay, but built from game events", "실패한 순간을 정확히 보려면 필요해요 — 세션 리플레이처럼, 하지만 게임 이벤트로"),
    items: [
      { what: L("Why the attempt failed", "왜 실패했는지"), data: "attempt_failed · fail_cause", status: L("In the tracking plan · not collected yet", "수집 계획에 있음 · 아직 수집 안 함"), pending: true },
      { what: L("Which star they were going for", "어느 별을 향해 가고 있었는지"), data: "star_collected · star_index", status: L("In the tracking plan · not collected yet", "수집 계획에 있음 · 아직 수집 안 함"), pending: true },
      { what: L("Where in the level they failed", "레벨 안 어디에서 실패했는지"), data: L("position (x, y) on attempt_failed", "attempt_failed의 위치 (x, y)"), status: L("Not in the tracking plan · needs a new property", "수집 계획에 없음 · 새 속성 필요"), pending: false },
      { what: L("Play recording", "플레이 녹화"), data: L("Video or replay log", "영상 또는 리플레이 기록"), status: L("GameCove doesn't record gameplay · connect separately", "GameCove는 게임 플레이를 녹화하지 않아요 · 따로 연결 필요"), pending: false },
    ],
  },
  hypotheses: {
    title: L("Hypotheses to check", "확인할 가설"),
    info: L("Patterns, not conclusions. Each one says what supports it and how to test it.", "결론이 아니라 패턴이에요. 각각 근거와 검증 방법을 적었어요."),
    subtitle: L("Not conclusions — each one is a pattern in the numbers above that a developer can test.", "결론이 아니에요 — 위 숫자에서 보인 패턴을 개발자가 검증할 수 있게 정리했어요."),
    why: L("Why we think so", "그렇게 보는 이유"),
    how: L("How to check", "확인 방법"),
    data: L("Data", "데이터"),
    items: [
      {
        n: "1",
        title: L("Something between the 2nd and 4th star stops new players.", "별 2개와 4개 사이의 무언가가 신규 플레이어를 막아요."),
        why: L("116 of the 192 who didn't clear stopped with 2–3 of 5 stars (60.4%).", "클리어하지 못한 192명 중 116명이 별 5개 중 2–3개에서 멈췄어요 (60.4%)."),
        how: L("Record fail_cause and star_index, then compare fails by section of the level.", "fail_cause와 star_index를 수집한 뒤, 레벨 구간별 실패를 비교해요."),
        status: L("Needs new data", "새 데이터 필요"),
        ready: false,
        data: ["attempt_failed · fail_cause", "star_collected · star_index"],
      },
      {
        n: "2",
        title: L("Players give up on time, not on the number of fails.", "플레이어는 실패 횟수보다 시간 때문에 포기해요."),
        why: L("Fails are similar (6.5 vs 7.5 avg), but those who didn't clear left about 2 minutes sooner (6.0 vs 8.2 min).", "실패 횟수는 비슷하지만 (평균 6.5 vs 7.5회), 클리어하지 못한 그룹이 약 2분 더 빨리 떠났어요 (6.0 vs 8.2분)."),
        how: L("Compare tries per minute and time to quit for both groups using Stage runs.", "스테이지 플레이 기록으로 두 그룹의 분당 시도 수와 그만두기까지의 시간을 비교해요."),
        status: L("Can check now", "지금 확인 가능"),
        ready: true,
        data: [L("Stage runs · tries, time", "스테이지 플레이 · 시도, 시간")],
      },
      {
        n: "3",
        title: L("After clearing Stage 1, the next step isn't obvious.", "스테이지 1을 클리어한 뒤 다음에 할 일이 분명하지 않아요."),
        why: L("Only 94 of 173 clearers went straight to Stage 2 (54.3%); 53 ended the session.", "클리어한 173명 중 94명만 바로 스테이지 2로 갔어요 (54.3%). 53명은 세션을 끝냈어요."),
        how: L("Look at what players did right after the clear, and how long they waited before leaving.", "클리어 직후 무엇을 했는지, 나가기 전에 얼마나 기다렸는지 봐요."),
        status: L("Can check now", "지금 확인 가능"),
        ready: true,
        data: [L("Session path", "세션 경로")],
      },
    ],
  },
};
