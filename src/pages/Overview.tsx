import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiltersBar } from "../components/dashboard/FiltersBar";
import { KpiRow } from "../components/dashboard/KpiRow";
import { LineChartCard, NewReturningCard } from "../components/dashboard/LineChartCard";
import type { HoverRow } from "../components/dashboard/LineChart";
import { DashboardPageLayout, PageHeader } from "../components/dashboard/PageHeader";
import { FunnelCard, Histogram, NeedsAttention, SessionsTable, SimpleCard, StageTableCard } from "../components/analytics/AnalyticsCards";
import { LobbyLeaversCard, StageBlockCard } from "../components/analytics/ExtraCards";
import { CardBoard, FixedCard, useResetLayout } from "../components/cards/CardBoard";
import {
  averagePlaytime,
  averageSessionTime,
  chartDays,
  dailyActiveUsers,
  newUsers,
  returningUsers,
  sessionsPerUser,
  totalPlaytimeHours,
  totalSessions,
  trafficSourceLabels,
  trafficSources,
} from "../data/dashboard";
import { attention, funnel, sessions as sessionList, stage4, stageRows, type AttentionTarget } from "../data/analytics";
import { chartHowTo, starsTip } from "../data/analytics-tips";
import { LOCALE } from "../i18n/locale";

// Overview (Figma 702:18930 / live site): header → KPI row (fixed GameCove card) → date·filter·breakdown·interval row → card board.
// Default board rows = the live-site engagement cards (DAU · Playtime / Sessions · Session time in 2 columns, then New and returning
// with Traffic sources). "+" between rows / "+ 카드 추가" add other Overview cards GameCove already built; ⋮⋮ moves or hides a row.

const L = (en: string, ko: string) => (LOCALE === "ko" ? ko : en);
const TODAY = "Today (Sep 22)";
const PRIMARY = "--gc-chart-series-primary";
const MUTED = "--gc-chart-context-secondary";
const fixed = (v: number, d = 1) => v.toFixed(d);
/** axis numbers: no trailing zeros ("2.5", "2", "0.5") */
const tick = (v: number) => String(Number(v.toFixed(2)));
const fmtInt = (v: number) => v.toLocaleString("en-US");
const hoursMinutes = (h: number) => {
  const m = Math.round(h * 60);
  return `${Math.floor(m / 60)}h ${m % 60}m`;
};
const day = (i: number) => chartDays[i];
const one = (header: string, row: HoverRow) => ({ header, rows: [row] });

function TwoColumns({ children }: { children: React.ReactNode }) {
  return <div className="grid w-full grid-cols-1 gap-12 min-[1200px]:grid-cols-2">{children}</div>;
}

function FirstSessionFunnel({ onExplore }: { onExplore: () => void }) {
  const [drop, setDrop] = useState(funnel.defaultDrop);
  return <FunnelCard selected={drop} onSelect={setDrop} onExplore={onExplore} />;
}

export function OverviewPage() {
  const navigate = useNavigate();
  const { projectId = "bouncebounce" } = useParams();
  const base = `/projects/${projectId}`;
  // Card Explore → the Explore page with that card + recommended questions
  const explore = (metric: string) => navigate(`${base}/explore?metric=${metric}`);
  const investigate = (q: "first-session" | "stage-4") => () => navigate(`${base}/explore?q=${q}`);
  const go = (target: AttentionTarget) => navigate(target === "retention" ? `${base}/retention` : `${base}/explore?q=${target}`);
  const reset = useResetLayout("overview");
  const [playtime, setPlaytime] = useState("Average");
  const [sessions, setSessions] = useState("Per user");
  const [visit, setVisit] = useState<"New" | "Returning">("New");
  const avg = playtime === "Average";
  const perUser = sessions === "Per user";
  const selected = visit === "New" ? "new" : "returning";
  const nr = { new: newUsers, returning: returningUsers };
  const other = selected === "new" ? "returning" : "new";

  const render = (id: string) => {
    switch (id) {
      case "engagementTop":
        return (
          <TwoColumns>
            <div data-metric="dailyActiveUsers" className="min-w-0">
              <LineChartCard
                title="Daily active users"
                info="Unique players who played at least once on each day"
                caption={TODAY}
                headline={`${fmtInt(dailyActiveUsers[6])} users`}
                labels={chartDays}
                series={[{ key: "value", values: dailyActiveUsers, stroke: PRIMARY, area: "primary" }]}
                axisMax={500}
                formatTick={tick}
                legend={[{ label: "Daily active users", color: PRIMARY }]}
                hover={(i) => one(day(i), { value: `${fmtInt(dailyActiveUsers[i])} users` })}
                onExplore={() => explore("dailyActiveUsers")}
              />
            </div>
            <div data-metric="playtime" className="min-w-0">
              <LineChartCard
                // Title follows the toggle (Average Playtime / Total playtime)
                title={avg ? "Average Playtime" : "Total playtime"}
                info={"Average — Average playtime per active player\nTotal — Playtime across all sessions that day"}
                caption={TODAY}
                headline={avg ? `${fixed(averagePlaytime[6])} min` : `${fixed(totalPlaytimeHours[6])} h`}
                labels={chartDays}
                series={[{ key: "value", values: avg ? averagePlaytime : totalPlaytimeHours, stroke: PRIMARY, area: "primary" }]}
                axisMax={avg ? 25 : 100}
                formatTick={tick}
                legend={[{ label: avg ? "Avg. playtime" : "Total playtime", color: PRIMARY }]}
                hover={(i) =>
                  avg
                    ? one(day(i), { value: `${fixed(averagePlaytime[i])} min`, sub: `${fmtInt(dailyActiveUsers[i])} active users` })
                    : one(day(i), { value: hoursMinutes(totalPlaytimeHours[i]) })
                }
                segmented={{ options: ["Average", "Total"], value: playtime, onChange: setPlaytime }}
                onExplore={() => explore("playtime")}
              />
            </div>
          </TwoColumns>
        );
      case "engagementBottom":
        return (
          <TwoColumns>
            <div data-metric="sessions" className="min-w-0">
              <LineChartCard
                title="Sessions"
                info={"Per user — Average sessions per active player\nTotal — All sessions that day"}
                caption={TODAY}
                headline={perUser ? `${fixed(sessionsPerUser[6])} sessions` : `${fmtInt(totalSessions[6])} sessions`}
                labels={chartDays}
                series={[{ key: "value", values: perUser ? sessionsPerUser : totalSessions, stroke: PRIMARY, area: "primary" }]}
                axisMax={perUser ? 2.5 : 500}
                formatTick={tick}
                legend={[{ label: perUser ? "Sessions per user" : "Total sessions", color: PRIMARY }]}
                hover={(i) =>
                  perUser
                    ? one(day(i), { value: `${fixed(sessionsPerUser[i])} sessions`, sub: `${fmtInt(dailyActiveUsers[i])} active users` })
                    : one(day(i), { value: `${fmtInt(totalSessions[i])} sessions` })
                }
                segmented={{ options: ["Per user", "Total"], value: sessions, onChange: setSessions }}
                onExplore={() => explore("sessions")}
              />
            </div>
            <div data-metric="sessionTime" className="min-w-0">
              <LineChartCard
                title="Average session time"
                info="Average duration of one session. Total session time is divided by the number of sessions"
                caption={TODAY}
                headline={`${fixed(averageSessionTime[6])} min`}
                labels={chartDays}
                series={[{ key: "value", values: averageSessionTime, stroke: PRIMARY, area: "primary" }]}
                axisMax={25}
                formatTick={tick}
                legend={[{ label: "Avg. session time", color: PRIMARY }]}
                hover={(i) => one(day(i), { value: `${fixed(averageSessionTime[i])} min`, sub: `${fmtInt(totalSessions[i])} sessions` })}
                onExplore={() => explore("sessionTime")}
              />
            </div>
          </TwoColumns>
        );
      case "newReturning":
        return (
          <div data-metric="newAndReturning" className="min-w-0">
            <NewReturningCard
              title="New and returning users"
              info={"New — Players playing for the first time that day\nReturning — Players who have played before"}
              caption={TODAY}
              headline={`${fmtInt(nr[selected][6])} users`}
              labels={chartDays}
              // The unselected side is drawn first (grey) so the selected (blue) line sits on top
              series={[
                { key: other, values: nr[other], stroke: MUTED, area: "muted" },
                { key: selected, values: nr[selected], stroke: PRIMARY, area: "primary" },
              ]}
              axisMax={250}
              formatTick={tick}
              legend={[
                { label: "New users", color: selected === "new" ? PRIMARY : MUTED },
                { label: "Returning users", color: selected === "returning" ? PRIMARY : MUTED },
              ]}
              curve="monotone"
              hover={(i) => ({
                header: day(i),
                rows: [
                  { label: "New", value: `${fmtInt(newUsers[i])} users` },
                  { label: "Returning", value: `${fmtInt(returningUsers[i])} users` },
                ],
              })}
              segmented={{ options: ["New", "Returning"], value: visit, onChange: (v) => setVisit(v as "New" | "Returning") }}
              onExplore={() => explore("newAndReturning")}
              trafficTitle="Traffic sources"
              trafficInfo="Share of players by acquisition source within the selected New or Returning group"
              traffic={trafficSources[selected].map((s) => ({ id: s.id, label: trafficSourceLabels[s.id], share: s.share, value: `${Math.round(s.share)}%` }))}
            />
          </div>
        );
      // ── cards that can be added from the menu ──
      case "attention":
        return <NeedsAttention title={attention.title} subtitle={attention.subtitle} items={attention.items} onCta={go} />;
      case "stageTable":
        return <StageTableCard rows={stageRows} onExplore={investigate("stage-4")} />;
      case "firstSessionFunnel":
        return <FirstSessionFunnel onExplore={investigate("first-session")} />;
      case "lobbyLeavers":
        return <LobbyLeaversCard onExplore={investigate("first-session")} />;
      case "stageBlock":
        return <StageBlockCard rows={stageRows} onExplore={investigate("stage-4")} />;
      case "stars":
        return (
          <SimpleCard
            title={stage4.starsTitle}
            info={L("Unfinished Stage 4 runs by stars collected (8 needed).", "클리어하지 못한 스테이지 4 플레이를 모은 별 개수로 나눠어요 (필요한 별 8개).")}
            subtitle={stage4.starsSub}
            onExplore={investigate("stage-4")}
          >
            <Histogram values={stage4.stars} labels={stage4.starLabels} highlight={stage4.starHighlight} howTo={chartHowTo.stars} tip={(i) => starsTip(stage4.stars, stage4.starLabels, i, "runs", 8)} />
          </SimpleCard>
        );
      case "sessions":
        return (
          <SimpleCard title={sessionList.title} info={sessionList.info} subtitle={sessionList.subtitle} onExplore={investigate("stage-4")}>
            <SessionsTable cols={sessionList.cols} rows={sessionList.rows} quit={sessionList.quit} cleared={sessionList.cleared} />
          </SimpleCard>
        );
      default:
        return null;
    }
  };

  return (
    <DashboardPageLayout>
      <PageHeader title="Overview" description="See how your game is performing at a glance" extraItems={[reset.item]} />
      <FixedCard>
        <KpiRow />
      </FixedCard>
      <FiltersBar />
      <CardBoard page="overview" render={render} />
      {reset.modal}
    </DashboardPageLayout>
  );
}
