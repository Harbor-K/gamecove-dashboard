import { LOCALE } from "../i18n/locale";

// Game Setup · mapping workspace: section cards on the left, game-structure flow on the right.
// Copy is EN / KO (?lang=ko). Section ids match data/mapping.ts nodes so the saved statuses feed the Tracking canvas.
// Script / handler names (LobbyManager > OnStageSelect …) are example names, not read from a real game.

const L = (en: string, ko: string) => (LOCALE === "ko" ? ko : en);

export type SectionStatus = "confirmed" | "needsReview";

export type MapSection = {
  id: string;
  name: string;
  status: SectionStatus;
  /** script > handler where the section starts */
  start: string;
  /** script > handler that marks a clear ("" = not found yet) */
  clear: string;
  fail: { source: string; text: string };
  /** extra conditions added with "+ Add condition" */
  extra: string[];
  /** evidence the AI found in the script (one line) */
  evidence: string;
  /** the AI's question when the section needs review */
  question?: string;
  /** quick answers for the question (fill the clear / fail condition) */
  candidates?: string[];
};

export const scriptOptions = [
  "PlayerAdded > SpawnInLobby",
  "LobbyManager > OnStageSelect",
  "StageLoader > OnStageEnter",
  "StarManager > OnAllStarsCollected",
  "StarManager > StageCompleteHandler",
  "StageCompleteHandler > OnFinish",
  "Humanoid > Died",
  "TimerManager > OnTimeUp",
  "Players > PlayerRemoving",
];

const stageName = (n: number) => L(`Stage ${n}`, `스테이지 ${n}`);

const stage = (n: number, extra: Partial<MapSection> = {}): MapSection => ({
  id: `stage-${n}`,
  name: stageName(n),
  status: "confirmed",
  start: n === 1 ? "LobbyManager > OnStageSelect" : "StageLoader > OnStageEnter",
  clear: "StarManager > StageCompleteHandler",
  fail: { source: "Humanoid > Died", text: L("HP reaches 0", "HP가 0이 됨") },
  extra: [],
  evidence: L(
    `In Stage${n}.lua, StarManager calls StageCompleteHandler once every star is collected.`,
    `Stage${n}.lua에서 별을 모두 모으면 StarManager가 StageCompleteHandler를 불러요.`,
  ),
  ...extra,
});

export const initialSections: MapSection[] = [
  {
    id: "lobby",
    name: L("Lobby", "로비"),
    status: "confirmed",
    start: "PlayerAdded > SpawnInLobby",
    clear: "LobbyManager > OnStageSelect",
    fail: { source: "Players > PlayerRemoving", text: L("Leaves the game", "게임을 나감") },
    extra: [],
    evidence: L(
      "In LobbyManager.lua, OnStageSelect runs when a player picks a stage door.",
      "LobbyManager.lua에서 플레이어가 스테이지 문을 고르면 OnStageSelect가 실행돼요.",
    ),
  },
  stage(1),
  stage(2),
  stage(3, {
    status: "needsReview",
    clear: "",
    evidence: L(
      "Found an end signal in two places, StarManager and StageCompleteHandler. Not sure which one is the clear.",
      "끝나는 신호를 StarManager와 StageCompleteHandler 두 곳에서 찾았어요. 어느 쪽이 클리어인지 확실하지 않아요.",
    ),
    question: L("Where does Stage 3 end? Tell us how a player finishes it.", "스테이지 3은 어디서 끝나나요? 플레이어가 어떻게 끝났는지 알려주세요."),
    candidates: ["StarManager > OnAllStarsCollected", "StageCompleteHandler > OnFinish"],
  }),
  stage(4, {
    status: "needsReview",
    fail: { source: "", text: "" },
    evidence: L(
      "Found the clear signal in Stage4.lua, but no code that reports a fail.",
      "Stage4.lua에서 클리어 신호는 찾았지만, 실패를 알리는 코드는 찾지 못했어요.",
    ),
    question: L("How do players fail Stage 4? Tell us the fail condition.", "스테이지 4에서는 플레이어가 어떻게 실패하나요? 실패 조건을 알려주세요."),
    candidates: ["Humanoid > Died", "TimerManager > OnTimeUp"],
  }),
];

export type ComparisonMetric = {
  id: string;
  label: string;
  definition: string;
  direction: "higherIsBetter" | "lowerIsBetter";
  ours: { value: number; label: string };
  cohort: { value: number; label: string };
  delta: string;
};

export const comparisonInsights: {
  context: { label: string; value: string }[];
  contextNote: string;
  cohortNote: string;
  metrics: ComparisonMetric[];
  observations: { id: string; text: string; tone: "attention" | "neutral"; sectionId?: string; sectionName: string }[];
} = {
  context: [
    { label: L("Genre", "장르"), value: L("Obstacle platformer", "장애물 플랫폼 게임") },
    { label: L("Platform", "플랫폼"), value: "Roblox" },
    { label: L("Game structure", "게임 구조"), value: L("1 lobby · 4 stages", "로비 1개 · 스테이지 4개") },
    { label: L("Match", "매칭"), value: L("Sample structure match", "예시 구조 매칭") },
  ],
  contextNote: L(
    "Sample comparison context only. Similar-game matching is not connected and no market cohort is available yet.",
    "비교 맥락은 예시예요. 유사 게임 매칭은 아직 연결되지 않았고 시장 코호트도 아직 없어요.",
  ),
  cohortNote: L(
    "Sample period: 14 days · Sample cohort size: unavailable until similar-game data is connected.",
    "예시 기간: 14일 · 예시 코호트 크기: 유사 게임 데이터를 연결하기 전까지 사용할 수 없어요.",
  ),
  metrics: [
    {
      id: "completion",
      label: L("Stage completion rate", "스테이지 클리어율"),
      definition: L("Share of players who enter a stage and reach its recorded clear condition.", "스테이지에 들어온 플레이어 중 기록된 클리어 조건에 도달한 비율이에요."),
      direction: "higherIsBetter",
      ours: { value: 64, label: "64%" },
      cohort: { value: 71, label: "71%" },
      delta: L("−7.0pp", "−7.0%p"),
    },
    {
      id: "early-exit",
      label: L("Early-stage exit rate", "초반 스테이지 이탈률"),
      definition: L("Share of players who leave during the lobby-to-Stage-1 portion of a session.", "세션에서 로비부터 스테이지 1까지의 구간에서 나간 플레이어 비율이에요."),
      direction: "lowerIsBetter",
      ours: { value: 28, label: "28%" },
      cohort: { value: 21, label: "21%" },
      delta: L("+7.0pp", "+7.0%p"),
    },
    {
      id: "session-length",
      label: L("Session length", "세션 길이"),
      definition: L("Median active playtime per session, excluding idle time when available.", "가능한 경우 유휴 시간을 제외한 세션당 중앙 활성 플레이 시간이에요."),
      direction: "higherIsBetter",
      ours: { value: 500, label: L("8m 20s", "8분 20초") },
      cohort: { value: 610, label: L("10m 10s", "10분 10초") },
      delta: L("−1m 50s", "−1분 50초"),
    },
  ],
  observations: [
    {
      id: "stage-3",
      text: L(
        "In this sample, stage completion is 7 percentage points below the sample cohort. Stage-level results are unavailable. Review the unresolved Stage 3 clear condition to check measurement readiness.",
        "예시 스테이지 클리어율은 예시 코호트보다 7%p 낮아요. 구간별 결과는 아직 없어요. 측정 준비 상태를 점검하려면 확인이 필요한 스테이지 3의 클리어 조건을 살펴보세요.",
      ),
      tone: "attention",
      sectionId: "stage-3",
      sectionName: stageName(3),
    },
    {
      id: "entry",
      text: L(
        "Early exits are higher in the sample comparison. The lobby-to-Stage-1 handoff is a useful area to narrow down with your own event data once tracking is live.",
        "예시 비교에서 초반 이탈이 더 높아요. 추적이 시작되면 로비에서 스테이지 1로 넘어가는 구간을 자체 이벤트 데이터로 좁혀 보기 좋아요.",
      ),
      tone: "attention",
      sectionId: "lobby",
      sectionName: L("Lobby", "로비"),
    },
    {
      id: "structure",
      text: L(
        "The sample cohort uses the same one-lobby, four-stage shape. Structure is a matching cue, not proof that players or outcomes are comparable.",
        "예시 코호트는 로비 1개와 스테이지 4개라는 같은 구조를 사용해요. 구조는 매칭 기준일 뿐, 플레이어나 결과가 같다는 증거는 아니에요.",
      ),
      tone: "neutral",
      sectionName: "",
    },
  ],
};

export const ws = {
  game: "Bounce Bounce",
  statusBadge: (done: number, total: number) => (LOCALE === "ko" ? `맵핑 중 · ${total}개 구간 중 ${done}개 확인됨` : `Mapping · ${done} of ${total} sections confirmed`),
  testPlay: L("Check with a test play", "테스트 플레이로 확인"),
  testPlayNote: L("Test play is available after you connect Roblox Studio.", "테스트 플레이는 Roblox Studio를 연결한 뒤 쓸 수 있어요."),
  save: L("Save map", "지도 저장"),
  saving: L("Saving…", "저장 중…"),
  savingTitle: L("Saving your map", "지도를 저장하고 있어요"),
  savingCaption: L("Saving the sections you confirmed. Your game script stays unchanged.", "확인한 구간을 저장하는 중이에요. 게임 스크립트는 바뀌지 않아요."),
  panelTitle: L("Sections", "구간"),
  insightsTab: L("Insights", "인사이트"),
  panelHint: L("AI read your script and split it into sections. Open each one and check it's right.", "AI가 스크립트를 읽고 구간을 나눴어요. 하나씩 펼쳐서 맞는지 확인해 주세요."),
  insightsTitle: L("Similar-game comparison", "유사 게임 비교"),
  insightsHint: L("Use sample context to decide where to inspect your map and tracking next.", "예시 맥락을 바탕으로 지도와 추적에서 다음으로 살펴볼 곳을 정해 보세요."),
  sampleDataNotice: L("Sample data · Similar-game data not connected", "예시 데이터 · 실제 유사 게임 데이터 연결 전"),
  comparisonContext: L("Comparison context", "비교 맥락"),
  matchCriteriaTip: L("Matching is illustrated using genre, platform, and one-lobby / four-stage structure. It does not indicate access to competitor data.", "장르, 플랫폼, 로비 1개 / 스테이지 4개 구조로 매칭을 예시로 보여드려요. 경쟁 게임 데이터에 접근한다는 뜻은 아니에요."),
  benchmarkComparison: L("Sample comparison", "예시 비교"),
  benchmarkTip: L("All values are simulated for this prototype. Percentage-point differences compare rates; no verified peer telemetry is connected.", "모든 수치는 이 프로토타입을 위한 시뮬레이션이에요. %p 차이는 비율을 비교하며, 검증된 유사 게임 원격 측정 데이터는 연결되지 않았어요."),
  ourGame: L("Bounce Bounce", "Bounce Bounce"),
  similarCohort: L("Sample cohort", "예시 코호트"),
  observations: L("What to inspect", "살펴볼 점"),
  viewSection: (name: string) => (LOCALE === "ko" ? `${name} 구간 보기` : `View ${name}`),
  confirmed: L("Confirmed", "확인됨"),
  needsReview: L("Needs review", "확인 필요"),
  start: L("Start point", "시작 지점"),
  clear: L("Clear condition", "클리어 조건"),
  fail: L("Fail condition", "실패 조건"),
  failPlaceholder: L("Describe what happens (e.g. HP reaches 0)", "어떤 상황인지 적어 주세요 (예: HP가 0이 됨)"),
  extra: (n: number) => (LOCALE === "ko" ? `추가 조건 ${n}` : `Extra condition ${n}`),
  choose: L("Choose script · node", "스크립트 · 노드 선택"),
  aiRead: L("How AI read this", "AI가 이렇게 읽었어요"),
  yes: L("Looks right", "맞아요"),
  edit: L("I'll fix it", "수정할게요"),
  editing: L('Fix the fields above, then press "Looks right".', '위 항목을 고친 뒤 "맞아요"를 눌러 주세요.'),
  needClear: L("Choose a clear condition to confirm.", "클리어 조건을 고르면 확인할 수 있어요."),
  needFail: L("Choose a fail condition to confirm.", "실패 조건을 고르면 확인할 수 있어요."),
  aiAsks: L("AI's question", "AI의 질문"),
  answerPlaceholder: L("Describe it yourself (e.g. it ends when the player touches the flag)", "직접 설명해 주세요 (예: 깃발에 닿으면 끝나요)"),
  addCondition: L("+ Add condition", "+ 조건 추가"),
  addSection: L("+ Add section", "+ 구간 추가"),
  newSection: stageName,
  newSectionQuestion: L("Where does this section start and end?", "이 구간은 어디서 시작하고 어디서 끝나나요?"),
  menu: { reread: L("Let AI read it again", "AI가 다시 읽기"), remove: L("Delete section", "구간 삭제"), label: L("Section menu", "구간 메뉴") },
  enter: L("Enter", "입장"),
  cleared: L("Clear", "클리어"),
  failBack: L("Fail · leave", "실패 · 나감"),
  complete: L("Game complete", "게임 완료"),
  legend: { clear: L("Clear and move on", "클리어하고 다음으로"), fail: L("Fail or back to the lobby", "실패하거나 로비로"), review: L("Needs review", "확인 필요") },
  zoomIn: L("Zoom in", "확대"),
  zoomOut: L("Zoom out", "축소"),
  fit: L("Fit to screen", "화면 맞춤"),
};
