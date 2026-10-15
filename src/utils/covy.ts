import { dailyActiveUsers, dateCohorts, exitRates, stageProgression } from "../data/dashboard";
import { funnelRows } from "./funnel";

export type CovyResponse =
  | { kind: "clarify"; status: string; question: string; options: string[] }
  | {
      kind: "answer";
      sections: { heading: string; paragraphs?: string[]; bullets?: string[] }[];
      followUps: string[];
    };

const thinking = "Checking a few things so I can answer…";

const steps = {
  compareSegments: "Compare new and returning players for the same period.",
  openFlow: "Open Session flow for that place to see where players go next.",
  checkLogging: "If you need more detail, add logging for the events behind this metric in Tracking.",
};

const newUserFunnel = { labels: ["Lobby entered", "Stage 1 entered", "Star 1 earned", "Star 2 earned", "Star 3 earned", "Stage 1 cleared"], users: [342, 209, 171, 150, 138, 131] };

/** Mock COVY answers (same rules as lib/ai/mock.ts). Numbers match the dashboard. */
export function askCovy(message: string): CovyResponse {
  const text = message.toLowerCase();
  const words = text.split(/\s+/).filter(Boolean).length;
  const known = /exit|leave|drop|stage|lobby|retention|return|cohort|session|playtime|star|funnel|progress|new|source|change|metric|player|logging|game/;
  if (words <= 6 && !known.test(text)) {
    return {
      kind: "clarify",
      status: thinking,
      question: "What should we look at?",
      options: ["Whether players keep arriving", "Whether new players settle in", "Whether players stay for longer", "Something else…"],
    };
  }

  const group = /exit|leave|lose|loses/.test(text)
    ? "flow"
    : /drop|funnel|star|progress|struggle/.test(text)
      ? "funnel"
      : /retention|return|cohort/.test(text)
        ? "retention"
        : "engagement";

  let shows: string;
  let next: string[];
  let followUps: string[];

  if (group === "flow") {
    const sorted = [...exitRates].sort((a, b) => b.rate - a.rate);
    shows = `${sorted[0].area} has the highest exit rate at ${sorted[0].rate.toFixed(1)}% of sessions, followed by ${sorted[1].area} at ${sorted[1].rate.toFixed(1)}%.`;
    next = [steps.openFlow, steps.compareSegments];
    followUps = ["Which stage loses the most players?", "Where do players go after Lobby?", "What changed vs last week?"];
  } else if (group === "funnel") {
    const firstSession = /first session|new player|stage 1 entered|lobby/.test(text);
    const labels = firstSession ? newUserFunnel.labels : ["Stage entered", "Star 1 earned", "Star 2 earned", "Star 3 earned", "Stage cleared"];
    const rows = funnelRows(firstSession ? newUserFunnel.users : stageProgression[1].users);
    const i = Math.max(0, rows.findIndex((r) => r.isMaxDrop));
    shows = `The biggest drop-off is at ${labels[i]}: ${(rows[i].dropOff ?? 0).toFixed(1)}% of players who reached the previous step stop here (${rows[i].users} players reach it).`;
    next = [steps.compareSegments, steps.checkLogging];
    followUps = ["Explain this metric", `Why do players drop at ${labels[i]}?`, "Split this by new vs returning?"].filter(
      (q) => q.toLowerCase() !== text,
    );
  } else if (group === "retention") {
    const best = [...dateCohorts].sort((a, b) => (b.retention[0] ?? 0) - (a.retention[0] ?? 0))[0];
    shows = `The ${best.date} cohort has the best Day 1 retention at ${(best.retention[0] ?? 0).toFixed(1)}%.`;
    next = [steps.compareSegments, steps.checkLogging];
    followUps = ["Explain this metric", "Which cohort returns the most?", "Do players who get further come back more?"];
  } else {
    const avg = Math.round(dailyActiveUsers.reduce((s, v) => s + v, 0) / dailyActiveUsers.length);
    shows = `Daily active users moved from ${dailyActiveUsers[0]} to ${dailyActiveUsers[dailyActiveUsers.length - 1]} over the period, averaging ${avg}.`;
    next = [steps.compareSegments, steps.checkLogging];
    followUps = ["Split this by new vs returning?", "What changed vs last week?", "Where should I look next?"];
  }

  return {
    kind: "answer",
    sections: [
      { heading: "What the data shows", paragraphs: [shows] },
      { heading: "Suggested next steps", bullets: next },
    ],
    followUps: followUps.slice(0, 3),
  };
}
