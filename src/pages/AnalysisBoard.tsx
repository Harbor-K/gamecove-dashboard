import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { EllipsisVertical, Plus, Sparkle } from "lucide-react";
import { Composer } from "../components/agent/AgentPanel";
import { CardHeader, CardShell } from "../components/dashboard/CardHeader";
import { EditIcon, NoDataIcon, ShareLinkIcon } from "../components/icons/AgentIcons";
import { useAgent } from "../contexts/AgentContext";
import {
  analysisSuggestions,
  boardBuildMs,
  boardVariants,
  chartInfo,
  chartTitles,
  sessionFlowHeight,
  variantFor,
  type BoardCard,
  type ChartId,
} from "../data/analysisSetup";
import { LOCALE } from "../i18n/locale";
import { tr } from "../i18n/translate";
import { createBoard, seedFromScreen, updateBoard, useBoards, type AnalysisBoard, type SetupScreen } from "../state/store";
import { useScreenInit } from "../useScreenInit.js";

// + New board → straight to "What would you like to analyze?" (no name / access modal first).
// Sending a question creates the board: COVY builds it on the right (charts, events, properties),
// and once built it joins the nav under Analysis Board with a name from the analysis (click to rename).
// Sharing is the Share button on the board. Boards are predefined variants (repo data/analysis-board.ts).
export function AnalysisBoardPage() {
  const agent = useAgent();
  const navigate = useNavigate();
  const { projectId = "bouncebounce" } = useParams();
  const [params] = useSearchParams();
  const screenInit = useScreenInit() as { setup?: SetupScreen };
  const boards = useBoards();

  const [seed] = useState(() => {
    seedFromScreen(screenInit);
    return screenInit.setup;
  });
  const boardId = params.get("board");
  const fresh = params.get("new") !== null;
  const board: AnalysisBoard | null = boardId ? boards.find((b) => b.id === boardId) ?? null : !fresh && seed && seed !== "building" ? boards[0] ?? null : null;

  const start = (question: string) => {
    const b = createBoard(question, variantFor(question));
    agent.startAnalysis(b);
    navigate(`/projects/${projectId}/analysis-board?board=${b.id}`, { replace: fresh || !boardId });
  };

  // Canvas screen "building": open as if the first suggestion was just sent.
  const startedRef = useRef(false);
  useEffect(() => {
    if (seed === "building" && !boardId && !fresh && !startedRef.current) {
      startedRef.current = true;
      start(analysisSuggestions[0]);
    }
  });

  if (!board) return <NewBoard key={params.toString()} onSubmit={start} />;
  return <BoardView key={board.id} board={board} />;
}

// ── Before the question ──
/** Hint under the send button ("Just 3 steps!" bubble style): what to do first on an empty board. */
const HINT_DELAY_MS = 300;
const HINT_GAP_PX = 12.8;
const BUBBLE_FILL = "linear-gradient(var(--gc-bg-accent-strong), var(--gc-bg-accent-strong)), var(--gc-bg-surface)";
const HINT_TEXT = LOCALE === "ko" ? "직접 입력하거나 위 추천 질문을 눌러보세요" : "Type your own, or tap a suggestion above";

function NewBoard({ onSubmit }: { onSubmit: (question: string) => void }) {
  const [draft, setDraft] = useState("");
  const [showHint, setShowHint] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setShowHint(true), HINT_DELAY_MS);
    return () => window.clearTimeout(id);
  }, []);
  const submit = (text: string) => {
    if (text.trim()) onSubmit(text.trim());
  };

  return (
    <div className="flex w-full flex-col gap-12 p-12">
      <span className="truncate text-label-default text-text-secondary">New analysis board</span>

      <div className="mx-auto flex w-[760px] max-w-full flex-col items-center gap-8 pt-12">
        <h1 className="text-[24px] font-bold leading-[1.5] text-text-primary">What would you like to analyze?</h1>

        {/* Title → (suggestions + composer): 190 (gap 32 + 158) */}
        <div className="mt-[158px] flex w-full flex-col gap-6">
          {/* `AI Agent / Suggestion`: right-aligned, no border, h36 pl12 pr16, 14 Regular, gap 12 */}
          <div className="flex w-full flex-col items-end gap-3">
            {analysisSuggestions.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => submit(q)}
                className="flex h-9 items-center gap-2 rounded-full pl-3 pr-4 text-label-default text-text-primary cursor-pointer hover:bg-bg-hover"
              >
                <Sparkle size={16} strokeWidth={1.5} className="shrink-0 fill-current text-icon-ai" />
                {q}
              </button>
            ))}
          </div>
          <div className="relative w-full">
            <Composer className="w-full" value={draft} onChange={setDraft} onSend={() => submit(draft)} placeholder="Describe what you want to understand..." />
            {showHint && !draft && (
              // Under the send button (right-aligned); the tail points at the button centre (26px from the right edge). Hidden once typing starts.
              <div
                data-no-translate
                className="pointer-events-none absolute right-0 top-full z-10 flex flex-col items-end"
                style={{ marginTop: HINT_GAP_PX, animation: "gc-hint-in 420ms cubic-bezier(0.2,0.8,0.2,1) both", transformOrigin: "calc(100% - 26px) 0" }}
              >
                <div className="relative mt-2">
                  {/* Opaque: accent-strong layered on surface, so nothing shows through. */}
                  <span
                    className="block shrink-0 whitespace-nowrap rounded-md border border-border-accent px-[15px] py-[11px] text-body-default text-text-on-accent"
                    style={{ background: BUBBLE_FILL }}
                  >
                    {HINT_TEXT}
                  </span>
                  {/* Tail drawn after the body so it covers the body's top border inside the tail. */}
                  <span
                    aria-hidden
                    className="absolute -top-[5.65px] right-[20.35px] block size-[11.3px] rotate-45 border-l border-t border-border-accent"
                    style={{ background: BUBBLE_FILL }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex w-full items-center gap-3">
          <span aria-hidden className="h-px flex-1 bg-border-default" />
          <span className="text-caption-default text-text-secondary">Or start with</span>
          <span aria-hidden className="h-px flex-1 bg-border-default" />
        </div>

        <button type="button" className="flex h-control-40 items-center gap-2 rounded-md bg-bg-surface pl-3 pr-4 ring-1 ring-inset ring-border-default cursor-pointer hover:bg-bg-hover">
          <Plus size={16} strokeWidth={1.5} className="text-icon-primary" />
          <span className="text-label-default text-text-primary">Add chart</span>
        </button>
      </div>
    </div>
  );
}

// ── After the question: the board ──
function BoardView({ board }: { board: AnalysisBoard }) {
  const cards = boardVariants[board.variant];
  // Grey loading for boardBuildMs after the question (the progress line is in COVY on the right).
  const [built, setBuilt] = useState(() => board.askedAt + boardBuildMs <= Date.now());
  useEffect(() => {
    if (built) {
      // Built: the board shows under Analysis Board in the nav (COVY marks it too when its first answer lands).
      if (!board.ready) updateBoard(board.id, { ready: true });
      return;
    }
    const id = window.setTimeout(() => setBuilt(true), Math.max(0, board.askedAt + boardBuildMs - Date.now()));
    return () => window.clearTimeout(id);
  }, [built, board.askedAt, board.ready, board.id]);

  return (
    <div className="flex w-full flex-col gap-12 p-12">
      {/* Page header like other data pages: title 40 Bold + description · ⋮ (no "Data through" until data shows) */}
      <div className="flex w-full items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-2">
          <h1 className="text-display-page text-text-primary">
            <InlineText value={board.name} label="Board name" onSave={(v) => v && updateBoard(board.id, { name: v })} />
          </h1>
          <p className="text-body-default text-text-secondary">
            <InlineText
              value={board.description}
              label="Board description"
              placeholder={tr("Describe this analysis board. It helps others use it.")}
              onSave={(v) => updateBoard(board.id, { description: v })}
            />
          </p>
        </div>
        <button type="button" aria-label="More actions" className="mt-[23px] flex size-8 shrink-0 items-center justify-center rounded-md text-icon-primary cursor-pointer hover:bg-bg-hover">
          <EllipsisVertical size={22} strokeWidth={2} />
        </button>
      </div>

      <BoardActions />

      {built ? <NoDataCards cards={cards} /> : <BoardSkeleton cards={cards} />}
    </div>
  );
}

/** Click to edit in place: click elsewhere / Enter = save, Esc = cancel. Empty description shows the placeholder. */
function InlineText({ value, label, placeholder, onSave }: { value: string; label: string; placeholder?: string; onSave: (value: string) => void }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [editing, setEditing] = useState(false);
  useEffect(() => {
    if (!editing && ref.current) ref.current.textContent = value;
  }, [value, editing]);
  return (
    <span
      ref={ref}
      role="textbox"
      aria-label={label}
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder}
      onFocus={() => setEditing(true)}
      onBlur={(e) => {
        setEditing(false);
        const next = (e.currentTarget.textContent ?? "").trim();
        if (!next && !placeholder) {
          e.currentTarget.textContent = value;
          return;
        }
        e.currentTarget.textContent = next;
        onSave(next);
      }}
      onKeyDown={(e) => {
        if (e.nativeEvent.isComposing) return;
        if (e.key === "Enter") {
          e.preventDefault();
          e.currentTarget.blur();
        } else if (e.key === "Escape") {
          e.currentTarget.textContent = value;
          e.currentTarget.blur();
        }
      }}
      className="inline-block min-w-[1ch] cursor-text outline-none empty:before:content-[attr(data-placeholder)]"
    />
  );
}

/** Where other data pages have the filter row: Edit · Share on the right (hover only), sticky under the top bar. */
function BoardActions() {
  const button =
    "group flex h-control-48 shrink-0 items-center gap-2 rounded-md bg-bg-surface px-4 text-fs-16 leading-[1.6] text-text-primary ring-1 ring-inset ring-border-default cursor-pointer hover:bg-bg-hover";
  const icon = "flex size-4 shrink-0 items-center justify-center text-icon-secondary group-hover:text-icon-primary";
  return (
    <div className="sticky top-14 z-[15] -mx-12 -my-4 flex items-end justify-end gap-4 bg-bg-canvas px-12 py-4">
      <button type="button" className={button}>
        <span className={icon}>
          <EditIcon />
        </span>
        Edit
      </button>
      <button type="button" className={button}>
        <span className={icon}>
          <ShareLinkIcon />
        </span>
        Share
      </button>
    </div>
  );
}

/** While the board is being built: grey card slots (Session exit rate includes the Session flow slot). */
function BoardSkeleton({ cards }: { cards: BoardCard[] }) {
  const block = (height: number) => <div aria-hidden className="w-full animate-pulse rounded-lg bg-bg-subtle" style={{ height }} />;
  return (
    <>
      {cards.map((c) => (
        <div key={c.metric} className="flex w-full flex-col gap-6">
          {block(c.height)}
          {c.withFlow && block(sessionFlowHeight)}
        </div>
      ))}
    </>
  );
}

/** Before logging is set up: card frame (title · ⓘ · period · Filter by · Explore · ⋮), empty inside, "Not tracked yet". */
function NoDataCards({ cards }: { cards: BoardCard[] }) {
  const empty = (id: ChartId, height: number) => (
    <div className="flex w-full" style={{ height, animation: "gc-fade-in 300ms ease-out both" }}>
      <CardShell className="h-full gap-10 p-8">
        <CardHeader title={chartTitles[id]} info={chartInfo[id]} cardFilters={id !== "sessionFlow"} />
        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          <NoDataIcon className="text-icon-secondary" />
          <span className="text-label-default text-text-secondary">Not tracked yet</span>
        </div>
      </CardShell>
    </div>
  );
  return (
    <>
      {cards.map((card) => (
        // Session flow sits under Session exit rate like the accordion (24 apart)
        <div key={card.metric} className="flex w-full flex-col gap-6">
          {empty(card.metric, card.height)}
          {card.withFlow && empty("sessionFlow", sessionFlowHeight)}
        </div>
      ))}
    </>
  );
}
