import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Sparkle } from "lucide-react";
import { OnExplorePageContext } from "../components/dashboard/CardHeader";
import { FiltersBar } from "../components/dashboard/FiltersBar";
import { BreakdownColorStyles, MetricCard, takesFilter } from "../components/explore/ExploreCards";
import { useAgent } from "../contexts/AgentContext";
import { useScreenInit } from "../useScreenInit.js";
import {
  breakdownFor,
  breakdownOptions,
  defaultArea,
  isArea,
  isExploreMetric,
  recommendedQuestions,
  starterQuestions,
  takesBreakdown,
  type BreakdownKey,
  type Category,
} from "../data/explore";
import {
  Facts,
  FlowsCard,
  FunnelCard,
  Histogram,
  Panel,
  SessionsTable,
  SimpleCard,
  SplitBar,
  StageTableCard,
} from "../components/analytics/AnalyticsCards";
import { chartHowTo, starsTip } from "../data/analytics-tips";
import {
  exploreCopy,
  funnel as funnelData,
  insideStage1,
  investigationQuestions,
  scopeNotes,
  sessions,
  stage4,
  stageRows,
  type InvestigationId,
} from "../data/analytics";

// Explore (repo ExplorePage, Figma Page 18 "GameCove · Explore (investigate)").
// From the nav (no metric, no question): starter questions only — no metrics until a question is asked.
// A question (?q=first-session | stage-4) → only the cards that answer it (hover tips + funnel ↔ flows linking).
// From a card's Explore (?metric=…&selection=…[&breakdown=…][&filter=…]): title + 3 recommended questions, filters, then that card.

/** Recommended questions arrive like the repo's AI call (placeholder chips first). */
const RECOMMEND_MS = 600;

const isBreakdown = (v: string | null | undefined): v is BreakdownKey => v === "none" || breakdownOptions.some((o) => o.key === v);
const isCategory = (v: string | null | undefined): v is Category => breakdownOptions.some((o) => (o.categories as string[]).includes(v ?? ""));
const isInvestigation = (v: string | null | undefined): v is InvestigationId => investigationQuestions.some((q) => q.id === v);

function Chip({ text, bordered = false, onClick }: { text: string; bordered?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-control-40 max-w-[560px] items-start gap-2 rounded-[20px] px-4 py-2 text-left text-fs-16 leading-[1.5] text-text-primary cursor-pointer hover:bg-bg-hover ${
        bordered ? "ring-1 ring-inset ring-border-default" : ""
      }`}
      style={{ animation: "gc-fade-in 240ms ease-out both" }}
    >
      <Sparkle size={16} strokeWidth={1.5} className="mt-1 shrink-0 fill-current text-icon-ai" />
      <span className="min-w-0">{text}</span>
    </button>
  );
}

/** The metrics for one asked question. Cards here have no Explore button (OnExplorePageContext). */
function Investigation({ id, onAsk }: { id: InvestigationId; onAsk: (id: InvestigationId) => void }) {
  const question = investigationQuestions.find((q) => q.id === id)!.question;
  const others = investigationQuestions.filter((q) => q.id !== id);
  // Funnel drop ↔ Flows: picking a drop lights its part of the flow and scrolls there
  const [drop, setDrop] = useState(funnelData.defaultDrop);
  const pickDrop = (i: number) => {
    setDrop(i);
    window.setTimeout(() => document.querySelector('[data-card="flows"]')?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  };
  const off = { disabledReason: scopeNotes.investigation };
  return (
    <div className="flex w-full flex-col gap-12 p-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-display-page text-text-primary">Explore</h1>
        <p className="text-body-default text-text-secondary">
          {exploreCopy.investigating}: <span className="font-semibold text-text-primary">{question}</span>
        </p>
        <div className="-ml-4 flex flex-wrap items-center gap-2 pt-1">
          <span className="pl-4 text-label-default text-text-secondary">{exploreCopy.alsoAsk}</span>
          {others.map((q) => (
            <Chip key={q.id} text={q.question} onClick={() => onAsk(q.id)} />
          ))}
        </div>
      </div>
      <FiltersBar breakdown={{ value: "none", onChange: () => {}, ...off }} filter={{ value: null, onChange: () => {}, ...off }} />
      <OnExplorePageContext.Provider value>
        {id === "first-session" ? (
          <>
            <FunnelCard selected={drop} onSelect={pickDrop} />
            <div data-card="flows" className="scroll-mt-[184px]">
              <FlowsCard drop={drop} onSelectDrop={setDrop} />
            </div>
            <SimpleCard title={insideStage1.title} info={insideStage1.info} subtitle={insideStage1.subtitle}>
              <p className="text-body-default font-semibold text-text-primary">{insideStage1.headline}</p>
              <Histogram
                values={insideStage1.bars}
                labels={insideStage1.labels}
                highlight={insideStage1.highlight}
                howTo={chartHowTo.stars}
                tip={(i) => starsTip(insideStage1.bars, insideStage1.labels, i, "players", 5)}
              />
              <Facts items={insideStage1.facts} />
            </SimpleCard>
          </>
        ) : (
          <>
            <StageTableCard rows={stageRows}>
              <div className="grid grid-cols-1 gap-6 min-[1200px]:grid-cols-2">
                <Panel title={stage4.flowTitle}>
                  <SplitBar parts={stage4.split} total={stage4.splitTotal} />
                  <p className="text-label-default text-text-secondary">{stage4.splitNote}</p>
                </Panel>
                <Panel title={stage4.starsTitle}>
                  <p className="text-label-default text-text-secondary">{stage4.starsSub}</p>
                  <Histogram
                    values={stage4.stars}
                    labels={stage4.starLabels}
                    highlight={stage4.starHighlight}
                    howTo={chartHowTo.stars}
                    tip={(i) => starsTip(stage4.stars, stage4.starLabels, i, "runs", 8)}
                  />
                </Panel>
              </div>
            </StageTableCard>
            <SimpleCard title={sessions.title} info={sessions.info} subtitle={sessions.subtitle}>
              <SessionsTable cols={sessions.cols} rows={sessions.rows} quit={sessions.quit} cleared={sessions.cleared} />
            </SimpleCard>
          </>
        )}
      </OnExplorePageContext.Provider>
    </div>
  );
}

export function ExplorePage() {
  const agent = useAgent();
  const navigate = useNavigate();
  const { projectId = "bouncebounce" } = useParams();
  const [params] = useSearchParams();
  // Canvas screens (?mp_screen=) can open on a metric / question / Breakdown; the address wins when it has one
  const screenInit = useScreenInit() as { metric?: string; selection?: string; breakdown?: BreakdownKey; q?: string };
  const fromScreen = !params.has("metric") && !params.has("q");
  const qParam = params.get("q") ?? (fromScreen ? screenInit.q ?? null : null);
  const investigation = isInvestigation(qParam) ? qParam : null;
  const metricParam = params.get("metric") ?? (fromScreen ? screenInit.metric ?? null : null);
  const metric = isExploreMetric(metricParam) ? metricParam : null;
  const selectionParam = params.get("selection") ?? (fromScreen ? screenInit.selection ?? null : null);
  const selection = isArea(selectionParam) ? selectionParam : null;
  const breakdownParam = params.get("breakdown");
  const [breakdown, setBreakdown] = useState<BreakdownKey>(isBreakdown(breakdownParam) ? breakdownParam : fromScreen ? screenInit.breakdown ?? "none" : "none");
  const filterParam = params.get("filter");
  const [filter, setFilter] = useState<Category | null>(isCategory(filterParam) ? filterParam : null);

  // Recommended questions for this metric + selection (placeholder chips, then the questions)
  const key = `${metric}:${selection ?? ""}`;
  const [ready, setReady] = useState<string | null>(null);
  useEffect(() => {
    if (!metric) return;
    const id = window.setTimeout(() => setReady(key), RECOMMEND_MS);
    return () => window.clearTimeout(id);
  }, [key, metric]);

  // A question was asked → its metrics
  const askInvestigation = (id: InvestigationId) => {
    agent.ask(investigationQuestions.find((q) => q.id === id)!.question);
    navigate(`/projects/${projectId}/explore?q=${id}`);
  };
  if (investigation && !metric) return <Investigation key={investigation} id={investigation} onAsk={askInvestigation} />;

  // Explore from the nav: what do you want to explore? (no metrics yet)
  if (!metric) {
    return (
      <div className="flex min-h-[calc(100vh/var(--gc-zoom)-56px)] w-full flex-col p-12">
        <h1 className="text-display-page text-text-primary">Explore</h1>
        <div className="flex flex-1 flex-col items-center justify-center gap-6 pb-24">
          <p className="text-[20px] font-bold leading-[1.3] text-text-primary">What do you want to explore?</p>
          <div aria-label="Suggested questions" className="flex max-w-[880px] flex-wrap justify-center gap-3">
            {investigationQuestions.map((q) => (
              <Chip key={q.id} text={q.question} bordered onClick={() => askInvestigation(q.id)} />
            ))}
            {starterQuestions.map((s) => (
              <Chip
                key={s.question}
                text={s.question}
                bordered
                onClick={() => {
                  agent.ask(s.question);
                  navigate(`/projects/${projectId}/explore?metric=${s.metric}${s.selection ? `&selection=${s.selection}` : ""}`);
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const questions = ready === key ? recommendedQuestions(metric, selection ?? defaultArea) : null;
  const canFilter = takesFilter(metric);
  const activeFilter = canFilter ? filter : null;
  const ask = (q: string) => {
    const b = breakdownFor(q);
    if (b && takesBreakdown(metric)) {
      setFilter(null);
      setBreakdown(b);
    }
    agent.ask(q);
  };

  return (
    <div className="flex w-full flex-col gap-[60px] p-12">
      <BreakdownColorStyles />
      <div className="flex flex-col gap-3">
        <h1 className="text-display-page text-text-primary">Explore</h1>
        {/* Figma AI suggestions: chips h40 px16 gap8, 8 apart — text lines up with the title (−16) */}
        <div aria-label="Suggested questions" className="-ml-4 flex min-h-10 flex-wrap items-center gap-2 pt-1">
          {questions
            ? questions.map((q) => <Chip key={q} text={q} onClick={() => ask(q)} />)
            : [0, 1, 2].map((i) => <span key={i} aria-hidden className="h-control-40 w-56 animate-pulse rounded-full bg-bg-subtle" />)}
        </div>
      </div>
      <div className="flex flex-col gap-12">
        <FiltersBar
          breakdown={{
            value: breakdown,
            onChange: setBreakdown,
            disabledReason: !takesBreakdown(metric) ? scopeNotes.noBreakdown : activeFilter ? scopeNotes.clearFilter : undefined,
          }}
          filter={{
            value: activeFilter,
            onChange: setFilter,
            note: scopeNotes.explore,
            disabledReason: !canFilter ? scopeNotes.exploreNoFilter : breakdown !== "none" ? scopeNotes.clearBreakdown : undefined,
          }}
        />
        <OnExplorePageContext.Provider value>
          {/* A new target redraws the card (no stale selection) */}
          <div data-metric={metric} className="min-w-0">
            <MetricCard key={key} metric={metric} selection={selection} breakdown={breakdown} filter={activeFilter} />
          </div>
        </OnExplorePageContext.Provider>
      </div>
    </div>
  );
}
