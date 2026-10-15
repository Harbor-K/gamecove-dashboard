import React, { useState } from "react";
import { ChevronDown, RotateCcw } from "lucide-react";
import { breakdownOptions, categoryChipLabels, type BreakdownKey, type Category } from "../../data/explore";
import { LOCALE } from "../../i18n/locale";
import { MenuOption, MenuPanel, useOutsideClose, type MenuItem } from "../ui/Menu";

// Figma `Filters / Date, breakdown and interval`. Every control opens: options the dataset can answer are selectable,
// the rest are shown disabled with the reason (the dataset starts Sep 14, so there is no 14/30-day range or weekly view yet).

const L = (en: string, ko: string) => (LOCALE === "ko" ? ko : en);

export type BreakdownControl = { value: BreakdownKey; onChange: (v: BreakdownKey) => void; note?: string; disabledReason?: string };
export type FilterControl = { value: Category | null; onChange: (v: Category | null) => void; note?: string; disabledReason?: string };

const fieldButton =
  "flex h-control-48 w-full items-center justify-between gap-3 rounded-md bg-bg-surface px-3 text-fs-16 leading-[1.6] ring-1 ring-inset ring-border-default cursor-pointer hover:bg-bg-hover hover:text-text-primary";

function Dropdown({
  label,
  value,
  width,
  items,
  active = false,
  note,
}: {
  label: string;
  value: string;
  width: number;
  items: MenuItem[];
  active?: boolean;
  note?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useOutsideClose(open, () => setOpen(false));
  return (
    <div ref={ref} className="relative flex flex-col gap-2" style={{ width }}>
      <span className="text-label-default text-text-secondary">{label}</span>
      <button type="button" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((o) => !o)} className={`${fieldButton} ${active ? "text-text-primary" : "text-text-secondary"}`}>
        <span className="truncate">{value}</span>
        <ChevronDown size={16} strokeWidth={1.5} className="shrink-0 text-chart-series-muted" />
      </button>
      {open && (
        <MenuPanel width={Math.max(width, 260)}>
          {items.map((it) => (
            <MenuOption key={it.label} item={it} onDone={() => setOpen(false)} />
          ))}
          {note && <p className="px-3 pb-1 pt-2 text-caption-default text-text-secondary">{note}</p>}
        </MenuPanel>
      )}
    </div>
  );
}

const notHere = L("Not available for this view yet", "이 화면에서는 아직 사용할 수 없어요");

function BreakdownSelect({ control }: { control?: BreakdownControl }) {
  const current = control ? breakdownOptions.find((o) => o.key === control.value) : undefined;
  const label = current ? current.categories.map((c) => categoryChipLabels[c]).join(", ") : L("None", "없음");
  const reason = control ? control.disabledReason : notHere;
  const items: MenuItem[] = [
    { label: L("None", "없음"), selected: !current, onSelect: () => control?.onChange("none") },
    ...breakdownOptions.map((o) => ({
      label: o.group,
      hint: reason ?? o.categories.map((c) => categoryChipLabels[c]).join(", "),
      disabled: !!reason,
      selected: o.key === control?.value,
      onSelect: () => control?.onChange(o.key),
    })),
  ];
  return (
    <div className="flex items-end gap-2">
      {current && (
        <button
          type="button"
          aria-label="Reset breakdown"
          title="Reset breakdown"
          onClick={() => control?.onChange("none")}
          className="-mr-2 flex h-control-48 items-center px-1 text-icon-secondary cursor-pointer hover:text-icon-primary"
        >
          <RotateCcw size={14} strokeWidth={1.8} />
        </button>
      )}
      <Dropdown label="Breakdown by" value={label} width={240} items={items} active={!!current} note={control?.note} />
    </div>
  );
}

/** Filter by: one category at a time (Visit type or Device). */
function FilterButton({ control }: { control?: FilterControl }) {
  const [open, setOpen] = useState(false);
  const ref = useOutsideClose(open, () => setOpen(false));
  const reason = control ? control.disabledReason : notHere;
  const groups: { title: string; cats: Category[] }[] = breakdownOptions.map((o) => ({ title: o.group, cats: o.categories }));
  const value = control?.value ?? null;
  return (
    <div ref={ref} className="relative flex items-end gap-2">
      {value && (
        <button
          type="button"
          aria-label={L("Clear filter", "필터 지우기")}
          title={L("Clear filter", "필터 지우기")}
          onClick={() => control?.onChange(null)}
          className="-mr-2 flex h-control-48 items-center px-1 text-icon-secondary cursor-pointer hover:text-icon-primary"
        >
          <RotateCcw size={14} strokeWidth={1.8} />
        </button>
      )}
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-control-48 shrink-0 items-center gap-2 rounded-md bg-bg-surface px-4 text-fs-16 leading-[1.6] text-text-primary ring-1 ring-inset ring-border-default cursor-pointer hover:bg-bg-hover"
      >
        Filter by
        {value && <span className="rounded-sm bg-bg-selected px-2 text-label-default text-text-primary">{categoryChipLabels[value]}</span>}
      </button>
      {open && (
        <MenuPanel align="left" width={280}>
          {groups.map((g) => (
            <div key={g.title} className="flex flex-col gap-1">
              <span className="px-3 pt-1 text-caption-default font-bold text-text-secondary">{g.title}</span>
              {g.cats.map((c) => (
                <MenuOption
                  key={c}
                  item={{ label: categoryChipLabels[c], selected: value === c, disabled: !!reason, onSelect: () => control?.onChange(value === c ? null : c) }}
                  onDone={() => setOpen(false)}
                />
              ))}
            </div>
          ))}
          <p className="px-3 pb-1 pt-2 text-caption-default text-text-secondary">{reason ?? control?.note}</p>
        </MenuPanel>
      )}
    </div>
  );
}

const noRange = L("Data collection started Sep 14", "데이터 수집이 9월 14일에 시작됐어요");
const noInterval = L("Needs at least 2 full weeks of data", "최소 2주 이상의 데이터가 필요해요");

/**
 * Sticks under the top bar. `breakdown` / `filter` make those controls change the cards that can take them;
 * without them they open but explain why nothing can be picked here.
 */
export function FiltersBar({ breakdown, filter }: { breakdown?: BreakdownControl; filter?: FilterControl } = {}) {
  const [interval, setIntervalValue] = useState("Days");
  return (
    <div className="sticky top-14 z-[15] -mx-12 -my-4 flex items-end gap-4 bg-bg-canvas px-12 py-4">
      <Dropdown
        label="Date range"
        value="Last 7 days"
        width={248}
        items={[
          { label: "Last 7 days", hint: L("Sep 16–22 · today is partial", "9월 16–22일 · 오늘은 진행 중"), selected: true },
          { label: L("Last 14 days", "최근 14일"), hint: noRange, disabled: true },
          { label: L("Last 30 days", "최근 30일"), hint: noRange, disabled: true },
        ]}
      />
      <FilterButton control={filter} />
      <div className="min-w-0 flex-1" />
      <BreakdownSelect control={breakdown} />
      <Dropdown
        label="Time interval"
        value={interval}
        width={192}
        items={[
          { label: "Days", selected: interval === "Days", onSelect: () => setIntervalValue("Days") },
          { label: L("Weeks", "주"), hint: noInterval, disabled: true },
          { label: L("Months", "월"), hint: noInterval, disabled: true },
        ]}
      />
    </div>
  );
}
