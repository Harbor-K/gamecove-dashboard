import React, { createContext, useContext, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { InfoTooltip } from "../ui/InfoTooltip";
import { MenuButton, copyText } from "../ui/Menu";
import { useAgent } from "../../contexts/AgentContext";
import { LOCALE } from "../../i18n/locale";

const L = (en: string, ko: string) => (LOCALE === "ko" ? ko : en);

/** Figma card frame: bg surface, 1px border, radius 16. */
export function CardShell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`flex w-full select-none flex-col rounded-lg bg-bg-surface ring-1 ring-inset ring-border-default ${className}`}>{children}</section>;
}

/** Figma `Card / Title`: 24 Bold 1.5 + ⓘ 24 (stroke 1.5), gap 8. */
export function CardTitle({ title, info }: { title: string; info: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <h2 className="whitespace-nowrap text-[24px] font-bold leading-[1.5] text-text-primary">{title}</h2>
      <InfoTooltip text={info} tone="primary" size={24} strokeWidth={1.5} />
    </div>
  );
}

/** Icon / more-vertical (card ⋮ 16): three 3×3 dots at x7 y1/7/13. */
function MoreVerticalIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="7" y="1" width="3" height="3" rx="1.5" fill="currentColor" />
      <rect x="7" y="7" width="3" height="3" rx="1.5" fill="currentColor" />
      <rect x="7" y="13" width="3" height="3" rx="1.5" fill="currentColor" />
    </svg>
  );
}

const secondary =
  "flex h-9 items-center justify-center rounded-md border border-border-button-secondary bg-bg-button-secondary bg-clip-padding text-text-button-secondary cursor-pointer hover:bg-bg-hover hover:text-text-primary";

/** A card already on the Explore page draws no Explore button to itself (repo OnExplorePageContext). */
export const OnExplorePageContext = createContext(false);

/** Figma `Card / Actions`: Explore (small Secondary) + ⋮ (Menu / Card actions). */
export function CardActions({ title, onExplore }: { title?: string; onExplore?: () => void }) {
  const onExplorePage = useContext(OnExplorePageContext);
  const agent = useAgent();
  // Same as before: every card off the Explore page keeps its Explore button (Figma), with or without a handler.
  const showExplore = !onExplorePage;
  return (
    <div className="flex items-center gap-3">
      {showExplore && (
        <button type="button" onClick={onExplore} className={`${secondary} px-[11px] text-label-default`}>
          Explore
        </button>
      )}
      <MenuButton
        ariaLabel="More actions"
        buttonClassName={`${secondary} w-8 text-icon-button-secondary`}
        trigger={<MoreVerticalIcon />}
        width={248}
        items={[
          ...(showExplore && onExplore ? [{ label: L("Open in Explore", "Explore에서 열기"), onSelect: onExplore }] : []),
          {
            label: L("Ask COVY about this card", "이 카드에 대해 COVY에게 묻기"),
            onSelect: () => agent.ask(title ? L(`Explain the “${title}” card`, `“${title}” 카드를 설명해 줘`) : L("Explain this card", "이 카드를 설명해 줘")),
          },
          { label: L("Copy link", "링크 복사"), doneLabel: L("Link copied", "링크를 복사했어요"), onSelect: () => copyText(window.location.href) },
        ]}
      />
    </div>
  );
}

/** Figma `Segmented control`: 1px border radius 8, cells h34 px16 14 Regular, 1px dividers. Selected = bg selected + primary. */
export function SegmentedControl({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div role="radiogroup" className="flex h-9 items-stretch overflow-hidden rounded-md p-px ring-1 ring-inset ring-border-default">
      {options.map((o, i) => (
        <div key={o} className="flex items-stretch">
          {i > 0 && <span aria-hidden className="w-px bg-border-default" />}
          <button
            type="button"
            role="radio"
            aria-checked={o === value}
            onClick={() => onChange(o)}
            className={`flex items-center whitespace-nowrap px-4 text-label-default cursor-pointer ${
              o === value ? "bg-bg-selected text-text-primary" : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
            }`}
          >
            {o}
          </button>
        </div>
      ))}
    </div>
  );
}

/** Card head: title + ⓘ … [card period · Filter by] [toggle] Explore ⋮ (repo components/dashboard/cards.tsx CardHeader). */
export function CardHeader({
  title,
  info,
  segmented,
  cardFilters = false,
  onExplore,
}: {
  title: string;
  info: string;
  segmented?: { options: string[]; value: string; onChange: (v: string) => void };
  cardFilters?: boolean;
  onExplore?: () => void;
}) {
  return (
    <div className="flex min-h-9 w-full flex-wrap items-center gap-x-4 gap-y-3">
      <CardTitle title={title} info={info} />
      <div className="min-w-px flex-1" />
      <div className="flex flex-wrap items-center gap-6">
        {/* Card period · Filter by (Experience / analysis board cards) — unchanged from before */}
        {cardFilters && (
          <div className="flex items-center gap-4">
            <button type="button" className="flex items-center gap-1 text-fs-16 leading-[1.5] text-text-primary cursor-pointer hover:text-text-accent">
              Last 7 days
              <ChevronDown size={14} strokeWidth={1.8} />
            </button>
            <button type="button" className="px-2 text-fs-16 leading-[1.5] text-text-primary cursor-pointer hover:text-text-accent">
              Filter by
            </button>
            <span aria-hidden className="h-8 w-px bg-border-default" />
          </div>
        )}
        <div className="flex items-center gap-4">
          {segmented && <SegmentedControl {...segmented} />}
          <CardActions title={title} onExplore={onExplore} />
        </div>
      </div>
    </div>
  );
}
