import React, { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, ChevronRight, Copy, Eye, LayoutDashboard, Map, Maximize2, Minimize2, Plus, Search, Sparkle, ThumbsDown, ThumbsUp, X } from "lucide-react";
import { useAgent, type AgentTurn } from "../../contexts/AgentContext";
import type { Section, SectionItem, SetupAnswer } from "../../data/analysisSetup";
import { copy as setupCopy } from "../../data/analysisSetup";
import type { CovyResponse } from "../../utils/covy";
import { AutoTextarea } from "../ui/AutoTextarea";
import { NewChatIcon, PastChatsIcon } from "../icons/AgentIcons";
import { ApprovalCard } from "./ApprovalCard";
import { CovyMark } from "./CovyMark";
import { ScriptModal } from "./ScriptModal";

const GAP = 16;
const ICON = { size: 16, strokeWidth: 1.5 } as const;

const contextLabels: Record<string, string> = {
  overview: "View overview page",
  retention: "View retention page",
  "analysis-board": "View analysis board",
  tracking: "View tracking page",
};

const SHIMMER =
  "@keyframes gc-shimmer{0%{background-position:100% 0}100%{background-position:-100% 0}}" +
  ".gc-shimmer-text{background:linear-gradient(90deg,var(--gc-text-secondary) 0%,var(--gc-text-secondary) 40%,var(--gc-text-primary) 50%,var(--gc-text-secondary) 60%,var(--gc-text-secondary) 100%);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:gc-shimmer 1.7s linear infinite}" +
  "@media (prefers-reduced-motion: reduce){.gc-shimmer-text{animation:none;color:var(--gc-text-secondary);background:none}}";

// Figma `AI Agent panel` — floats 16px from the edges under the top bar (Panel 480 / Expanded).
// Header (repo): new chat on the left; chat history · expand · close on the right.
export function AgentPanel() {
  const agent = useAgent();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const page = pathname.split("/").filter(Boolean).pop() ?? "overview";
  const [draft, setDraft] = useState("");
  const threadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: "smooth" });
  }, [agent.thread]);

  const send = (text: string) => {
    agent.ask(text);
    setDraft("");
  };
  const templates = [
    { title: "Create new analysis", description: "Start a new analysis", icon: <LayoutDashboard {...ICON} />, run: () => navigate("/projects/bouncebounce/analysis-board?new=1") },
    { title: "Investigate data", description: "Understand what's happening.", icon: <Search {...ICON} />, run: () => send("Help me understand what's happening in my game.") },
    { title: "Plan your next move", description: "Decide what to do next.", icon: <Map {...ICON} />, run: () => send("What should I do next to improve my game?") },
  ];
  const empty = agent.thread.length === 0;
  const wide = agent.expanded;
  const column = wide ? "mx-auto w-[760px] max-w-full" : "w-full";
  const approvalEvents = agent.thread.find((t): t is Extract<AgentTurn, { role: "approval" }> => t.role === "approval")?.events ?? [];

  const headerButton = "flex size-8 items-center justify-center rounded-md text-icon-secondary cursor-pointer hover:bg-bg-hover hover:text-icon-primary";

  return (
    <>
      <style>{SHIMMER}</style>
      <AnimatePresence>
        {agent.open && (
          <motion.aside
            aria-label="AI Agent"
            initial={{ x: "105%" }}
            animate={{ x: 0 }}
            exit={{ x: "105%" }}
            transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
            className="fixed z-40 flex flex-col overflow-hidden rounded-lg bg-bg-surface ring-1 ring-inset ring-border-default shadow-[0_8px_24px_0_var(--gc-effect-shadow)]"
            style={{
              top: 56 + GAP,
              right: GAP,
              bottom: GAP,
              left: wide ? `calc(var(--gc-content-left, 0px) + ${GAP}px)` : undefined,
              width: wide ? undefined : agent.width,
            }}
          >
            <header className="flex h-[57px] shrink-0 items-center gap-2 px-4 shadow-[inset_0_-1px_0_var(--gc-border-default)]">
              <button type="button" aria-label="New chat" title="New chat" onClick={agent.newChat} className={headerButton}>
                <NewChatIcon />
              </button>
              <div className="flex-1" />
              <button type="button" aria-label="Chat history" title="Chat history" className={headerButton}>
                <PastChatsIcon />
              </button>
              <button type="button" aria-label={wide ? "Collapse" : "Expand"} onClick={() => agent.setExpanded(!wide)} className={headerButton}>
                {wide ? <Minimize2 {...ICON} /> : <Maximize2 {...ICON} />}
              </button>
              <button type="button" aria-label="Close" onClick={agent.close} className={headerButton}>
                <X {...ICON} />
              </button>
            </header>

            <div ref={threadRef} className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pt-6">
              {empty ? (
                <EmptyState column={column} templates={templates} />
              ) : (
                <Thread
                  column={column}
                  turns={agent.thread}
                  onPick={send}
                  onApprove={agent.approve}
                  onReject={agent.reject}
                  onViewScript={() => agent.setScriptOpen(true)}
                  onGoToTracking={() => navigate("/projects/bouncebounce/tracking")}
                />
              )}
            </div>

            <div className="shrink-0 px-6 pb-6 pt-2">
              <Composer
                className={column}
                value={draft}
                onChange={setDraft}
                onSend={() => send(draft)}
                contextLabel={empty ? null : contextLabels[page] ?? "View overview page"}
              />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
      <ScriptModal open={agent.scriptOpen} events={approvalEvents} onClose={() => agent.setScriptOpen(false)} />
    </>
  );
}

type Template = { title: string; description: string; icon: ReactNode; run: () => void };

function EmptyState({ column, templates }: { column: string; templates: Template[] }) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col items-center gap-4 pb-8 pt-[min(192px,18vh)]">
        <CovyMark />
        <p className="text-[18px] font-bold text-text-primary">What are you working on?</p>
      </div>
      <div className="flex-1" />
      <div className={`flex flex-col gap-2 ${column}`}>
        <span className="pl-3 text-caption-default leading-[1.5] text-text-secondary">Start with a task</span>
        <div className="flex flex-col gap-1">
          {templates.map((tpl) => (
            <button key={tpl.title} type="button" onClick={tpl.run} className="flex items-center gap-3 rounded-md p-2 text-left cursor-pointer hover:bg-bg-hover">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-bg-ai-subtle text-icon-ai">{tpl.icon}</span>
              <span className="flex flex-col">
                <span className="text-fs-14 font-bold leading-[1.5] text-text-primary">{tpl.title}</span>
                <span className="text-fs-12 leading-[1.5] text-text-secondary">{tpl.description}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Thread({
  column,
  turns,
  onPick,
  onApprove,
  onReject,
  onViewScript,
  onGoToTracking,
}: {
  column: string;
  turns: AgentTurn[];
  onPick: (text: string) => void;
  onApprove: () => void;
  onReject: () => void;
  onViewScript: () => void;
  onGoToTracking: () => void;
}) {
  const last = turns[turns.length - 1];
  return (
    <div className={`flex flex-1 flex-col ${column}`}>
      {turns.map((turn, i) => {
        if (turn.role === "user") {
          return (
            <div key={i} className={`flex justify-end ${i > 0 ? "mt-12" : ""}`}>
              <p className="max-w-[304px] rounded-lg bg-bg-bubble px-4 py-3 text-fs-16 leading-[1.6] text-text-primary">{turn.text}</p>
            </div>
          );
        }
        if (turn.role === "approval") {
          return <ApprovalCard key={i} status={turn.status} onApprove={onApprove} onReject={onReject} onViewScript={onViewScript} />;
        }
        if (turn.status === "pending") {
          return (
            <p key={`${i}-${turn.label}`} role="status" className="gc-shimmer-text mt-12 w-fit text-label-default" style={{ animationDelay: "0ms" }}>
              {turn.label}
            </p>
          );
        }
        return "setup" in turn ? (
          <SetupAnswerView key={i} answer={turn.setup} isLast={turn === last} onPick={onPick} onGoToTracking={onGoToTracking} />
        ) : (
          <AssistantTurn key={i} response={turn.response} isLast={turn === last} onPick={onPick} />
        );
      })}
    </div>
  );
}

/** Only **bold** is drawn; anything else stays as text (repo `Emphasis`). */
function Emphasis({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <strong key={i} className="font-bold">
            {p.slice(2, -2)}
          </strong>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  );
}

function FeedbackRow() {
  return (
    <div className="flex items-center gap-1.5">
      {[
        { label: "Copy", icon: <Copy size={14} strokeWidth={1.5} /> },
        { label: "Helpful", icon: <ThumbsUp size={14} strokeWidth={1.5} /> },
        { label: "Not helpful", icon: <ThumbsDown size={14} strokeWidth={1.5} /> },
      ].map((b) => (
        <button
          key={b.label}
          type="button"
          aria-label={b.label}
          className="flex size-[26px] items-center justify-center rounded-md text-icon-secondary cursor-pointer hover:bg-bg-hover hover:text-icon-primary"
        >
          {b.icon}
        </button>
      ))}
    </div>
  );
}

function FollowUps({ items, onPick }: { items: string[]; onPick: (text: string) => void }) {
  return (
    <>
      <div className="min-h-6 flex-1" />
      <div className="flex flex-col items-end gap-3 pb-6">
        {items.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onPick(q)}
            className="flex min-h-9 max-w-[382px] items-start gap-2 rounded-[18px] py-2 pl-3 pr-4 text-left text-label-default text-text-primary cursor-pointer hover:bg-bg-hover"
          >
            <Sparkle {...ICON} className="mt-[2px] shrink-0 fill-current text-icon-ai" />
            {q}
          </button>
        ))}
      </div>
    </>
  );
}

/** Analysis-setup answer (repo Answer UI): short headings 16 SemiBold, body 16/160%, Go to Tracking.
 *  Long explanations (chart and event lists) fold into toggles, closed by default, so the answer stays short. */
function SetupAnswerView({
  answer,
  isLast,
  onPick,
  onGoToTracking,
}: {
  answer: SetupAnswer;
  isLast: boolean;
  onPick: (text: string) => void;
  onGoToTracking: () => void;
}) {
  return (
    <>
      <div className="mt-12 flex flex-col gap-6 pr-12" style={{ animation: "gc-fade-in 600ms ease-out both" }}>
        <div className="flex flex-col gap-5">
          {answer.sections.map((s, i) =>
            s.items ? <FoldSection key={`${s.heading}-${i}`} section={s} /> : <PlainSection key={`${s.heading}-${i}`} section={s} />,
          )}
        </div>
        {answer.navigateTracking && (
          <button
            type="button"
            onClick={onGoToTracking}
            className="flex h-8 w-fit items-center rounded-md px-3 text-label-default text-text-primary ring-1 ring-inset ring-border-default cursor-pointer hover:bg-bg-hover"
          >
            {setupCopy.navigateTracking}
          </button>
        )}
        <FeedbackRow />
      </div>
      {isLast && answer.followUps.length > 0 && <FollowUps items={answer.followUps} onPick={onPick} />}
    </>
  );
}

function PlainSection({ section: s }: { section: Section }) {
  return (
    <div className="flex flex-col gap-2">
      {s.heading && <h3 className="text-fs-16 font-semibold leading-[1.6] text-text-primary">{s.heading}</h3>}
      {s.paragraphs?.map((p) => (
        <p key={p} className="text-body-default text-text-primary">
          <Emphasis text={p} />
        </p>
      ))}
      {s.bullets && (
        <ul className="flex list-disc flex-col gap-2 pl-5">
          {s.bullets.map((b) => (
            <li key={b} className="text-body-default text-text-primary">
              <Emphasis text={b} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Toggle: heading row (chevron · title · item names when closed) → the full list when open. */
function FoldSection({ section: s }: { section: Section }) {
  const [open, setOpen] = useState(false);
  const items = s.items ?? [];
  return (
    <div className="flex flex-col gap-3 rounded-md bg-bg-canvas ring-1 ring-inset ring-border-default">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="group flex w-full items-start gap-2 rounded-md px-3 pb-0 pt-3 text-left cursor-pointer"
      >
        <ChevronRight
          size={16}
          strokeWidth={1.5}
          className={`mt-[4px] shrink-0 text-icon-secondary transition-transform duration-200 group-hover:text-icon-primary ${open ? "rotate-90" : ""}`}
        />
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="text-fs-16 font-semibold leading-[1.6] text-text-primary">{s.heading}</span>
          {!open && (
            <span data-no-translate className="truncate text-label-default text-text-secondary">
              {items.map((it) => it.title).join(" · ")}
            </span>
          )}
        </span>
      </button>
      {open ? (
        <div className="flex flex-col gap-3 px-3 pb-3" style={{ animation: "gc-fade-in 200ms ease-out both" }}>
          {items.map((it) => (
            <ItemCard key={it.title} item={it} />
          ))}
          {s.note && <p className="text-caption-default text-text-secondary">{s.note}</p>}
        </div>
      ) : (
        <div className="h-0" />
      )}
    </div>
  );
}

function ItemCard({ item }: { item: SectionItem }) {
  return (
    <div className="flex flex-col gap-2 rounded-md bg-bg-surface px-3 py-2.5 ring-1 ring-inset ring-border-default">
      <span data-no-translate className="text-label-default font-bold text-text-primary">
        {item.title}
      </span>
      <span className="text-label-default text-text-secondary">{item.body}</span>
      <div className="flex flex-col gap-1.5">
        <span className="text-caption-default text-text-secondary">{item.chipsLabel}</span>
        {item.chips.length ? (
          <div data-no-translate className="flex flex-wrap gap-1.5">
            {item.chips.map((c) => (
              <span key={c} className="flex h-6 items-center rounded-full bg-bg-canvas px-2 font-mono text-caption-default text-text-primary ring-1 ring-inset ring-border-default">
                {c}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-caption-default text-text-secondary">{item.chipsEmpty}</span>
        )}
      </div>
      {item.meta && <span className="text-caption-default text-text-accent">{item.meta}</span>}
    </div>
  );
}

function AssistantTurn({ response, isLast, onPick }: { response: CovyResponse; isLast: boolean; onPick: (text: string) => void }) {
  if (response.kind === "clarify") {
    return (
      <>
        <p className="mt-12 text-label-default text-text-secondary">{response.status}</p>
        <div className="flex-1" />
        {isLast && (
          <div className="mb-6 mt-6 flex flex-col gap-4 rounded-lg bg-bg-canvas p-6 ring-1 ring-inset ring-border-default">
            <div className="flex items-center gap-2">
              <Sparkle {...ICON} className="shrink-0 fill-current text-icon-ai" />
              <span className="text-label-default text-text-primary">{response.question}</span>
            </div>
            <div className="flex flex-col gap-2">
              {response.options.map((o, i) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => onPick(o)}
                  className="group flex h-11 items-center gap-2.5 rounded-md px-2.5 text-left text-fs-16 leading-[1.6] text-text-secondary cursor-pointer hover:bg-bg-hover hover:text-text-primary"
                >
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-bg-subtle text-fs-12 leading-[1.4] text-text-secondary group-hover:bg-icon-primary group-hover:text-bg-nav">
                    {i + 1}
                  </span>
                  {o}
                </button>
              ))}
            </div>
          </div>
        )}
      </>
    );
  }
  return (
    <>
      <div className="mt-12 flex flex-col gap-6" style={{ animation: "gc-fade-in 240ms ease-out both" }}>
        <div className="flex flex-col gap-8">
          {response.sections.map((s) => (
            <div key={s.heading} className="flex flex-col gap-3">
              <span className="text-label-default text-text-secondary">{s.heading}</span>
              {s.paragraphs?.map((p) => (
                <p key={p} className="text-fs-16 leading-[1.6] text-text-primary">
                  {p}
                </p>
              ))}
              {s.bullets?.map((b) => (
                <p key={b} className="text-fs-16 leading-[1.6] text-text-primary">
                  •&nbsp; {b}
                </p>
              ))}
            </div>
          ))}
        </div>
        <FeedbackRow />
      </div>
      {isLast && response.followUps.length > 0 && <FollowUps items={response.followUps} onPick={onPick} />}
    </>
  );
}

export function Composer({
  value,
  onChange,
  onSend,
  contextLabel,
  className,
  placeholder = "Ask anything...",
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  contextLabel?: string | null;
  className: string;
  placeholder?: string;
}) {
  return (
    <div
      className={`flex flex-col gap-2 rounded-md bg-bg-canvas p-[13px] ring-1 ring-inset ring-border-default ${className}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
          e.preventDefault();
          onSend();
        }
      }}
    >
      {contextLabel && (
        <span className="flex h-8 w-fit items-center gap-2 rounded-md bg-bg-surface pl-2 pr-3 text-label-default text-text-secondary ring-1 ring-inset ring-border-default">
          <Eye {...ICON} className="shrink-0 text-icon-secondary" />
          {contextLabel}
        </span>
      )}
      <div className="px-[3px] pt-[3px]">
        <AutoTextarea value={value} onChange={onChange} placeholder={placeholder} className="leading-[1.5]" />
      </div>
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label="Attach"
          className="flex size-7 items-center justify-center rounded-md text-icon-secondary cursor-pointer hover:bg-bg-hover hover:text-icon-primary"
        >
          <Plus {...ICON} />
        </button>
        <button
          type="button"
          aria-label="Send"
          onClick={onSend}
          className="flex size-8 items-center justify-center rounded-full bg-bg-button-primary text-icon-inverse cursor-pointer hover-layer"
        >
          <ArrowUp size={16} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
