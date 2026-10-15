import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CohortRetentionCard } from "../components/dashboard/CohortRetentionCard";
import { FiltersBar } from "../components/dashboard/FiltersBar";
import { LineChartCard } from "../components/dashboard/LineChartCard";
import { DashboardPageLayout, PageHeader } from "../components/dashboard/PageHeader";
import { BreakdownColorStyles, MetricCard } from "../components/explore/ExploreCards";
import { Facts } from "../components/analytics/AnalyticsCards";
import { StageCohortCard } from "../components/analytics/ExtraCards";
import { RelatedLinks, UtCard } from "../components/analytics/UtCards";
import { CardBoard, FixedCard, useResetLayout } from "../components/cards/CardBoard";
import { chartDays, d1Retention, d7Retention, dateCohorts } from "../data/dashboard";
import { progressRetention } from "../data/analytics";
import { retentionPage } from "../data/retention-page";
import type { Related } from "../data/ut-overviews";

// Retention (Figma 702:10982 / live site): D1 · D7 line cards (latest observable cohort, the fixed GameCove card) + card board
// (default: Date cohort heatmap). Other Retention cards GameCove already built are added from "+" / "+ 카드 추가".
const PRIMARY = "--gc-chart-series-primary";
const pctTick = (v: number) => `${Number(v.toFixed(2))}%`;
const pct = (v: number) => `${v.toFixed(1)}%`;
/** Cohort size for each chart day (Sep 16 → Sep 22), from the cohort table. */
const cohortUsers = chartDays.map((d) => dateCohorts.find((c) => c.date === d)?.users ?? 0);

function retentionHover(values: (number | null)[], skipLast = false) {
  return (i: number) => {
    if (skipLast && i === values.length - 1) return null;
    const v = values[i];
    if (v === null) return { header: chartDays[i], rows: [{ value: "N/A" }] };
    const users = cohortUsers[i];
    return { header: chartDays[i], rows: [{ value: `${v.toFixed(1)}%`, sub: `${Math.round((v * users) / 100)} of ${users} users` }] };
  };
}

/** Bars row: label 140 · players 200 · 12px track (fill = value ÷ scale) · value 80, 16 apart, rows 16 apart. */
function ProgressRows({ rows, playersLabel, scaleMax }: { rows: { label: string; players: number; d1: number; small?: boolean }[]; playersLabel: (n: number, small?: boolean) => string; scaleMax: number }) {
  return (
    <div className="flex flex-col gap-4">
      {rows.map((r) => (
        <div key={r.label} className="flex h-[26px] items-center gap-4">
          <span className="w-[140px] shrink-0 text-body-default font-bold text-text-primary">{r.label}</span>
          <span className="w-[200px] shrink-0 text-label-default text-text-secondary">{playersLabel(r.players, r.small)}</span>
          <span className="relative h-3 min-w-0 flex-1 overflow-hidden rounded-full bg-chart-bar-track">
            <span className={`absolute inset-y-0 left-0 rounded-full ${r.small ? "bg-chart-series-muted" : "bg-chart-series-primary"}`} style={{ width: `${Math.min(1, r.d1 / scaleMax) * 100}%` }} />
          </span>
          <span className="w-[80px] shrink-0 text-right text-body-default font-bold text-text-primary">{pct(r.d1)}</span>
        </div>
      ))}
    </div>
  );
}

export function RetentionPage() {
  const navigate = useNavigate();
  const { projectId = "bouncebounce" } = useParams();
  const base = `/projects/${projectId}`;
  // Card Explore → the Explore page with that card + recommended questions
  const explore = (metric: string) => navigate(`${base}/explore?metric=${metric}`);
  const go = (r: Related) => {
    if (r.to.kind === "explore") navigate(`${base}/explore?${r.to.query}`);
    else if (r.to.kind === "page") navigate(`${base}/${r.to.path}`);
  };
  const reset = useResetLayout("retention");
  const P = retentionPage;
  const pr = progressRetention;

  const render = (id: string) => {
    switch (id) {
      case "dateCohort":
        return (
          <div data-metric="dateCohortRetention" className="min-w-0">
            <CohortRetentionCard onExplore={() => explore("dateCohortRetention")} />
          </div>
        );
      case "progress":
        return (
          <UtCard title={pr.title} info={pr.info} subtitle={P.progress.subtitle} action={{ label: "Explore", onClick: () => navigate(`${base}/explore?q=first-session`) }}>
            <ProgressRows rows={pr.rows} playersLabel={pr.players} scaleMax={pr.scaleMax} />
            <p className="text-caption-default text-text-secondary">{pr.note}</p>
            <Facts items={P.progress.facts} />
            <RelatedLinks label={P.progress.next} items={P.progress.related} onGo={go} />
          </UtCard>
        );
      case "stageCohort":
        return <StageCohortCard onExplore={() => navigate(`${base}/explore?q=first-session`)} />;
      case "device":
        return <MetricCard metric="d1Retention" selection={null} breakdown="device" filter={null} onExplore={() => navigate(`${base}/explore?metric=d1Retention&breakdown=device`)} />;
      default:
        return null;
    }
  };

  return (
    <DashboardPageLayout>
      <BreakdownColorStyles />
      <PageHeader title="Retention" description="See how players return to your game over time" extraItems={[reset.item]} />
      <FiltersBar />
      <FixedCard>
        <div className="grid w-full grid-cols-1 gap-12 min-[1200px]:grid-cols-2">
          <div data-metric="d1Retention" className="min-w-0">
            <LineChartCard
              title="Day 1 retention"
              info="Share of new players who return the next calendar day"
              caption="Latest cohort (Sep 21)"
              headline={`${d1Retention[5]!.toFixed(1)}%`}
              labels={chartDays}
              series={[{ key: "value", values: d1Retention, stroke: PRIMARY, area: "primary" }]}
              axisMax={50}
              formatTick={pctTick}
              legend={[{ label: "Day 1 retention", color: PRIMARY }]}
              curve="monotone"
              // Sep 22's D1 can't be observed yet: the line stops and an ⓘ explains it
              endNote="Sep 22 D1 retention isn’t available yet"
              hover={retentionHover(d1Retention, true)}
              onExplore={() => explore("d1Retention")}
            />
          </div>
          <div data-metric="d7Retention" className="min-w-0">
            <LineChartCard
              title="Day 7 retention"
              info="Share of new players who return 7 calendar days after first play"
              caption="Latest cohort"
              headline="N/A"
              labels={chartDays}
              series={[{ key: "value", values: d7Retention, stroke: PRIMARY, area: "primary" }]}
              axisMax={10}
              formatTick={pctTick}
              legend={[{ label: "Day 7 retention", color: PRIMARY }]}
              curve="monotone"
              hover={retentionHover(d7Retention)}
              onExplore={() => explore("d7Retention")}
            />
          </div>
        </div>
      </FixedCard>
      <CardBoard page="retention" render={render} />
      {reset.modal}
    </DashboardPageLayout>
  );
}
