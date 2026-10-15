import React, { type ReactNode } from "react";
import { dataThrough } from "../../data/dashboard";
import { useAgent } from "../../contexts/AgentContext";
import { LOCALE } from "../../i18n/locale";
import { MenuButton, copyText, type MenuItem } from "../ui/Menu";

const L = (en: string, ko: string) => (LOCALE === "ko" ? ko : en);

export function DashboardPageLayout({ children }: { children: ReactNode }) {
  return <div className="flex w-full flex-col gap-12 p-12">{children}</div>;
}

/** Icon / option (⋮, filled) — page header 32 (repo components/icons-dashboard.tsx OptionIcon). */
function OptionIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M13.8672 5.589C13.8673 5.83428 13.819 6.07718 13.7252 6.30382C13.6315 6.53047 13.4939 6.73641 13.3205 6.90991C13.1472 7.08341 12.9413 7.22106 12.7147 7.31499C12.4881 7.40893 12.2453 7.45732 12 7.4574C11.7547 7.45748 11.5118 7.40925 11.2852 7.31545C11.0585 7.22166 10.8526 7.08415 10.6791 6.91076C10.5056 6.73737 10.3679 6.53151 10.274 6.30493C10.1801 6.07835 10.1317 5.83549 10.1316 5.5902C10.1314 5.09483 10.3281 4.61969 10.6782 4.26929C11.0284 3.9189 11.5034 3.72196 11.9988 3.7218C12.4942 3.72164 12.9693 3.91828 13.3197 4.26844C13.6701 4.61861 13.867 5.09363 13.8672 5.589Z" fill="currentColor" />
      <path d="M12 13.8666C13.0312 13.8666 13.8672 13.0306 13.8672 11.9994C13.8672 10.9682 13.0312 10.1322 12 10.1322C10.9688 10.1322 10.1328 10.9682 10.1328 11.9994C10.1328 13.0306 10.9688 13.8666 12 13.8666Z" fill="currentColor" />
      <path d="M12 20.2782C13.0312 20.2782 13.8672 19.4422 13.8672 18.411C13.8672 17.3798 13.0312 16.5438 12 16.5438C10.9688 16.5438 10.1328 17.3798 10.1328 18.411C10.1328 19.4422 10.9688 20.2782 12 20.2782Z" fill="currentColor" />
    </svg>
  );
}

/** Title 40 Bold 1.1 −0.02em + description 16 · "Data through …" (14 secondary) + ⋮ (Menu / Page actions) */
export function PageHeader({ title, description, actions = true, extraItems = [] }: { title: string; description?: string; actions?: boolean; extraItems?: MenuItem[] }) {
  const agent = useAgent();
  return (
    <div className="flex w-full items-start justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-2">
        <h1 className="text-display-page text-text-primary">{title}</h1>
        {description && <p className="text-body-default text-text-secondary">{description}</p>}
      </div>
      {actions && (
        <div className="mt-[23px] flex shrink-0 items-center gap-4">
          <span className="whitespace-nowrap text-label-default text-text-secondary">{dataThrough}</span>
          <MenuButton
            ariaLabel="More actions"
            buttonClassName="flex size-8 items-center justify-center rounded-md text-icon-primary cursor-pointer hover:bg-bg-hover"
            trigger={<OptionIcon />}
            width={256}
            items={[
              { label: L("Ask COVY to summarize this page", "COVY에게 이 페이지 요약 요청"), onSelect: () => agent.ask(L(`Summarize the ${title} page`, `${title} 페이지를 요약해 줘`)) },
              { label: L("Copy page link", "페이지 링크 복사"), doneLabel: L("Link copied", "링크를 복사했어요"), onSelect: () => copyText(window.location.href) },
              ...extraItems,
            ]}
          />
        </div>
      )}
    </div>
  );
}
