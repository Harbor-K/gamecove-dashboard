// Hover tips for the Explore investigation charts (Figma Page 18 "GameCove · Explore (investigate)").
// Plain-language copy for first-time users: what the number is, what it is out of, and what to do next.
// Numbers come from the chart data in data/analytics.ts; only the sentences live here (EN / KO).
import { LOCALE } from "../i18n/locale";
import { flows, funnel } from "./analytics";

const L = (en: string, ko: string) => (LOCALE === "ko" ? ko : en);

/** A data hover tip: header (secondary) / divider / ● label · value / lines. */
export type Tip = {
  header: string;
  title?: { label?: string; value: string; color?: string };
  lines: { text: string; tone?: "secondary" | "positive" | "critical" | "hint" }[];
};

const pct1 = (n: number, of: number) => (of ? Number(((n / of) * 100).toFixed(1)) : 0);
const outOfTen = (n: number, of: number) => Math.round((n / of) * 10);

export const chartHowTo = {
  funnel: L("Each bar is the share of the 641 new players who reached that step. Hover a bar for details, click it to follow those players below.", "막대 하나는 641명의 신규 플레이어 중 그 단계까지 온 비율이에요. 막대에 마우스를 올리면 자세히, 누르면 아래 흐름에서 그 플레이어들을 따라가요."),
  flows: L("Each band is a group of players moving to their next step — thicker means more players. Hover to follow a path, click a red or grey box to see it in the funnel.", "띠 하나는 다음 단계로 이동한 플레이어 묶음이에요. 두꺼울수록 사람이 많아요. 마우스를 올리면 경로를 따라가고, 빨간·회색 상자를 누르면 퍼널에서 그 이탈을 선택해요."),
  stars: L("Each bar counts how many stopped with that many stars. Hover a bar to see its share.", "막대 하나는 그 별 개수에서 멈춘 수예요. 마우스를 올리면 비율을 볼 수 있어요."),
};

export function funnelTip(i: number): Tip {
  const f = funnel;
  const s = f.steps[i];
  const prev = i > 0 ? f.steps[i - 1] : null;
  const share = pct1(s.users, f.total);
  const lines: Tip["lines"] = [
    { text: L(`${share}% of the ${f.total} new players who entered the lobby`, `로비에 들어온 신규 플레이어 ${f.total}명 중 ${share}%`), tone: "secondary" },
  ];
  if (s.drop && prev) {
    lines.push({
      text: L(`▼ ${s.drop.users} didn’t make it from “${prev.label}” to here (${s.drop.pct}% of the previous step)`, `▼ “${prev.label}”에서 여기까지 오지 못한 ${s.drop.users}명 (이전 단계의 ${s.drop.pct}%)`),
      tone: "critical",
    });
  }
  lines.push({
    text: L(`In plain words: about ${outOfTen(s.users, f.total)} in 10 new players got this far.`, `쉽게 말해: 신규 플레이어 10명 중 약 ${outOfTen(s.users, f.total)}명이 여기까지 왔어요.`),
    tone: "secondary",
  });
  if (s.drop) lines.push({ text: L("Click to see where they went instead", "누르면 대신 어디로 갔는지 보여줘요"), tone: "hint" });
  return { header: L(`Step ${i + 1} of ${f.steps.length}`, `${f.steps.length}단계 중 ${i + 1}단계`), title: { label: s.label, value: f.playersLabel(s.users) }, lines };
}

/** Which funnel drop a flow box belongs to (click → select that drop). */
export const flowNodeDrop: Record<string, number> = { leftLobby: 1, quit1: 2, back1: 2, back2: 3, end2: 3 };

const flowMeaning = (kind: "forward" | "left" | "other") =>
  kind === "left"
    ? L("These players closed the game here — this is a real drop-off.", "이 플레이어들은 여기서 게임을 꺼어요. 실제 이탈이에요.")
    : kind === "other"
      ? L("These players didn’t move forward — they went back or ended the session.", "이 플레이어들은 앞으로 가지 않고 로비로 돌아가거나 세션을 끝냈어요.")
      : L("These players kept going to the next step.", "이 플레이어들은 다음 단계로 계속 갔어요.");

export function flowBandTip(fromId: string, toId: string, n: number, kind: "forward" | "left" | "other"): Tip {
  const from = flows.nodes.find((x) => x.id === fromId)!;
  const to = flows.nodes.find((x) => x.id === toId)!;
  const share = pct1(n, from.n);
  return {
    header: `${from.title} → ${to.title}`,
    title: { value: funnel.playersLabel(n) },
    lines: [
      { text: L(`${share}% of the ${from.n} players at “${from.title}”`, `“${from.title}”의 ${from.n}명 중 ${share}%`), tone: kind === "left" ? "critical" : "secondary" },
      { text: flowMeaning(kind), tone: "secondary" },
    ],
  };
}

export function flowNodeTip(id: string): Tip {
  const node = flows.nodes.find((x) => x.id === id)!;
  const share = pct1(node.n, funnel.total);
  const lines: Tip["lines"] = [
    { text: L(`${share}% of all ${funnel.total} new players`, `전체 신규 플레이어 ${funnel.total}명 중 ${share}%`), tone: node.kind === "left" ? "critical" : "secondary" },
    { text: flowMeaning(node.kind), tone: "secondary" },
  ];
  if (flowNodeDrop[id] !== undefined) lines.push({ text: L("Click to select this drop in the funnel", "누르면 퍼널에서 이 이탈을 선택해요"), tone: "hint" });
  return { header: flows.steps[node.col], title: { label: node.title, value: funnel.playersLabel(node.n) }, lines };
}

/** Star bars: what one bar means. `unit` = players (Stage 1, first session) or runs (Stage 4). */
export function starsTip(values: number[], labels: string[], i: number, unit: "players" | "runs", needed: number): Tip {
  const total = values.reduce((a, b) => a + b, 0);
  const n = values[i];
  const label = unit === "players" ? funnel.playersLabel(n) : L(`${n} runs`, `${n}회`);
  return {
    header: L(`Stopped at ${labels[i]}`, `${labels[i]}에서 멈춤`),
    title: { value: label },
    lines: [
      { text: L(`${pct1(n, total)}% of ${total} unfinished ${unit}`, `클리어하지 못한 ${total}${unit === "players" ? "명" : "회"} 중 ${pct1(n, total)}%`), tone: "secondary" },
      needed - i > 0
        ? { text: L(`${needed} stars are needed to clear — they were ${needed - i} short.`, `클리어하려면 별 ${needed}개가 필요해요. ${needed - i}개가 모자랐어요.`), tone: "secondary" }
        : { text: L(`They had all ${needed} stars, but the stage wasn’t recorded as cleared.`, `별 ${needed}개를 다 모았지만 클리어로 기록되지 않았어요.`), tone: "secondary" },
    ],
  };
}
