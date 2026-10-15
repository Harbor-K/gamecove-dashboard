import React from "react";
import { InfoTooltip } from "../ui/InfoTooltip";
import { CardHeader, CardShell } from "./CardHeader";
import { ChartLegend, LineChart, type ChartSeries, type HoverRow } from "./LineChart";

type Segmented = { options: string[]; value: string; onChange: (v: string) => void };
type Hover = (index: number) => { header: string; rows: HoverRow[] } | null;

export type LineCardProps = {
  title: string;
  info: string;
  /** "Today (Sep 22)" / "Latest cohort (Sep 21)" */
  caption: string;
  /** headline value; "N/A" when it can't be calculated */
  headline: string;
  labels: string[];
  series: ChartSeries[];
  axisMax: number;
  formatTick: (v: number) => string;
  legend: { label: string; color: string }[];
  curve?: "linear" | "monotone";
  endNote?: string;
  hover?: Hover;
  segmented?: Segmented;
  onExplore?: () => void;
};

/** Figma `Card / Value`: caption 14 secondary + value 32 Bold 1.5, gap 4. */
function CardValue({ caption, value }: { caption: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-label-default text-text-secondary">{caption}</span>
      <span className="text-[32px] font-bold leading-[1.5] text-text-primary">{value}</span>
    </div>
  );
}

/** Figma line chart card (repo LineMetricCard): p32 gap28 / top gap16 / chart block gap24. */
export function LineChartCard(p: LineCardProps) {
  return (
    <CardShell className="gap-7 p-8">
      <div className="flex flex-col gap-4">
        <CardHeader title={p.title} info={p.info} segmented={p.segmented} onExplore={p.onExplore} />
        <CardValue caption={p.caption} value={p.headline} />
      </div>
      <div className="flex flex-col gap-6">
        <LineChart labels={p.labels} series={p.series} axisMax={p.axisMax} formatTick={p.formatTick} curve={p.curve} endNote={p.endNote} hover={p.hover} />
        <ChartLegend items={p.legend} />
      </div>
    </CardShell>
  );
}

// ── New and returning users (+ Traffic sources) ──

/** Traffic source icons (repo components/icons-dashboard.tsx TrafficSourceIcon, 16px). */
function TrafficSourceIcon({ source }: { source: string }) {
  const box = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", "aria-hidden": true } as const;
  switch (source) {
    case "homeRecommendations":
      // Home recommendations = Roblox
      return (
        <svg {...box}>
          <path d="M13.5862 14.7562L14.2875 12.1387L19.9087 13.6462L17.7 21.8812L2.09998 17.7L3.60748 12.0825L13.5862 14.7562ZM21.8812 6.28123L20.3737 11.8987L10.395 9.22498L9.69373 11.8425L4.07248 10.3387L6.28123 2.09998L21.8812 6.28123Z" fill="currentColor" />
        </svg>
      );
    case "search":
      return (
        <svg {...box}>
          <path d="M21 21L16.514 16.506M19 10.5C19 12.7543 18.1045 14.9163 16.5104 16.5104C14.9163 18.1045 12.7543 19 10.5 19C8.24566 19 6.08365 18.1045 4.48959 16.5104C2.89553 14.9163 2 12.7543 2 10.5C2 8.24566 2.89553 6.08365 4.48959 4.48959C6.08365 2.89553 8.24566 2 10.5 2C12.7543 2 14.9163 2.89553 16.5104 4.48959C18.1045 6.08365 19 8.24566 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "youtube":
      return (
        <svg {...box}>
          <path d="M22.5 11.934C22.5 11.8824 22.5 11.8238 22.4977 11.7559C22.4953 11.566 22.4906 11.3527 22.4859 11.1254C22.4672 10.4715 22.4344 9.81992 22.3828 9.20586C22.3125 8.35977 22.2094 7.6543 22.0687 7.12461C21.9204 6.57183 21.6295 6.06769 21.2252 5.66257C20.8209 5.25745 20.3173 4.96554 19.7648 4.81602C19.1016 4.63789 17.8031 4.52773 15.975 4.45977C15.1055 4.42695 14.175 4.40586 13.2445 4.39414C12.9187 4.38945 12.6164 4.38711 12.3445 4.38477H11.6555C11.3836 4.38711 11.0813 4.38945 10.7555 4.39414C9.825 4.40586 8.89453 4.42695 8.025 4.45977C6.19687 4.53008 4.89609 4.64023 4.23516 4.81602C3.6825 4.96517 3.17876 5.25696 2.7744 5.66214C2.37004 6.06732 2.07928 6.57165 1.93125 7.12461C1.78828 7.6543 1.6875 8.35977 1.61719 9.20586C1.56562 9.81992 1.53281 10.4715 1.51406 11.1254C1.50703 11.3527 1.50469 11.566 1.50234 11.7559C1.50234 11.8238 1.5 11.8824 1.5 11.934V12.0652C1.5 12.1168 1.5 12.1754 1.50234 12.2434C1.50469 12.4332 1.50937 12.6465 1.51406 12.8738C1.53281 13.5277 1.56562 14.1793 1.61719 14.7934C1.6875 15.6395 1.79063 16.3449 1.93125 16.8746C2.23125 17.9973 3.1125 18.8832 4.23516 19.1832C4.89609 19.3613 6.19687 19.4715 8.025 19.5395C8.89453 19.5723 9.825 19.5934 10.7555 19.6051C11.0813 19.6098 11.3836 19.6121 11.6555 19.6145H12.3445C12.6164 19.6121 12.9187 19.6098 13.2445 19.6051C14.175 19.5934 15.1055 19.5723 15.975 19.5395C17.8031 19.4691 19.1039 19.359 19.7648 19.1832C20.8875 18.8832 21.7687 17.9996 22.0687 16.8746C22.2117 16.3449 22.3125 15.6395 22.3828 14.7934C22.4344 14.1793 22.4672 13.5277 22.4859 12.8738C22.493 12.6465 22.4953 12.4332 22.4977 12.2434C22.4977 12.1754 22.5 12.1168 22.5 12.0652V11.934ZM20.8125 12.0559C20.8125 12.1051 20.8125 12.159 20.8102 12.2223C20.8078 12.4051 20.8031 12.6066 20.7984 12.8246C20.782 13.448 20.7492 14.0715 20.7 14.6504C20.6367 15.4051 20.5477 16.0238 20.4375 16.4387C20.2922 16.9801 19.8656 17.409 19.3266 17.552C18.8344 17.6832 17.5945 17.7887 15.9094 17.852C15.0562 17.8848 14.1375 17.9059 13.2211 17.9176C12.9 17.9223 12.6023 17.9246 12.3352 17.9246H11.6648L10.7789 17.9176C9.8625 17.9059 8.94609 17.8848 8.09063 17.852C6.40547 17.7863 5.16328 17.6832 4.67344 17.552C4.13437 17.4066 3.70781 16.9801 3.5625 16.4387C3.45234 16.0238 3.36328 15.4051 3.3 14.6504C3.25078 14.0715 3.22031 13.448 3.20156 12.8246C3.19453 12.6066 3.19219 12.4027 3.18984 12.2223C3.18984 12.159 3.1875 12.1027 3.1875 12.0559V11.9434C3.1875 11.8941 3.1875 11.8402 3.18984 11.777C3.19219 11.5941 3.19688 11.3926 3.20156 11.1746C3.21797 10.5512 3.25078 9.92773 3.3 9.34883C3.36328 8.59414 3.45234 7.97539 3.5625 7.56055C3.70781 7.01914 4.13437 6.59023 4.67344 6.44727C5.16562 6.31602 6.40547 6.21055 8.09063 6.14727C8.94375 6.11445 9.8625 6.09336 10.7789 6.08164C11.1 6.07695 11.3977 6.07461 11.6648 6.07461H12.3352L13.2211 6.08164C14.1375 6.09336 15.0539 6.11445 15.9094 6.14727C17.5945 6.21289 18.8367 6.31602 19.3266 6.44727C19.8656 6.59258 20.2922 7.01914 20.4375 7.56055C20.5477 7.97539 20.6367 8.59414 20.7 9.34883C20.7492 9.92773 20.7797 10.5512 20.7984 11.1746C20.8055 11.3926 20.8078 11.5965 20.8102 11.777C20.8102 11.8402 20.8125 11.8965 20.8125 11.9434V12.0559ZM9.91406 15.1402L15.3516 11.9762L9.91406 8.85898V15.1402Z" fill="currentColor" />
        </svg>
      );
    case "instagram":
      return (
        <svg {...box}>
          <path fillRule="evenodd" clipRule="evenodd" d="M7.465 1.066C8.638 1.012 9.012 1 12 1C14.988 1 15.362 1.013 16.534 1.066C17.706 1.119 18.506 1.306 19.206 1.577C19.939 1.854 20.604 2.287 21.154 2.847C21.714 3.396 22.146 4.06 22.422 4.794C22.694 5.494 22.88 6.294 22.934 7.464C22.988 8.639 23 9.013 23 12C23 14.987 22.987 15.362 22.934 16.535C22.881 17.705 22.694 18.505 22.422 19.205C22.1459 19.939 21.7132 20.6041 21.154 21.154C20.604 21.714 19.939 22.146 19.206 22.422C18.506 22.694 17.706 22.88 16.536 22.934C15.362 22.988 14.988 23 12 23C9.012 23 8.638 22.987 7.465 22.934C6.295 22.881 5.495 22.694 4.795 22.422C4.06096 22.1459 3.39588 21.7132 2.846 21.154C2.28658 20.6045 1.85354 19.9398 1.577 19.206C1.306 18.506 1.12 17.706 1.066 16.536C1.012 15.361 1 14.987 1 12C1 9.013 1.013 8.638 1.066 7.466C1.119 6.294 1.306 5.494 1.577 4.794C1.85384 4.06014 2.28722 3.3954 2.847 2.846C3.3962 2.2867 4.06059 1.85367 4.794 1.577C5.494 1.306 6.295 1.12 7.465 1.066ZM16.444 3.046C15.284 2.993 14.936 2.982 11.999 2.982C9.062 2.982 8.714 2.993 7.554 3.046C6.481 3.095 5.899 3.274 5.511 3.425C4.998 3.625 4.631 3.862 4.246 4.247C3.88073 4.60179 3.59981 5.0341 3.424 5.512C3.273 5.9 3.094 6.482 3.045 7.555C2.992 8.715 2.981 9.063 2.981 12C2.981 14.937 2.992 15.285 3.045 16.445C3.094 17.518 3.273 18.1 3.424 18.488C3.6 18.965 3.881 19.398 4.246 19.753C4.601 20.118 5.034 20.399 5.511 20.575C5.899 20.726 6.481 20.905 7.554 20.954C8.714 21.007 9.061 21.018 11.999 21.018C14.937 21.018 15.284 21.007 16.444 20.954C17.517 20.905 18.099 20.726 18.487 20.575C19 20.375 19.367 20.138 19.752 19.753C20.117 19.398 20.398 18.965 20.574 18.488C20.725 18.1 20.904 17.518 20.953 16.445C21.006 15.285 21.017 14.937 21.017 12C21.017 9.063 21.006 8.715 20.953 7.555C20.904 6.482 20.725 5.9 20.574 5.512C20.374 4.999 20.137 4.632 19.752 4.247C19.3972 3.88173 18.9649 3.60081 18.487 3.425C18.099 3.274 17.517 3.095 16.444 3.046ZM10.594 15.391C11.3787 15.7176 12.2524 15.7617 13.0659 15.5157C13.8795 15.2697 14.5824 14.7489 15.0546 14.0422C15.5268 13.3356 15.7391 12.4869 15.655 11.6411C15.571 10.7953 15.196 10.005 14.594 9.405C14.2102 9.02148 13.7462 8.72781 13.2353 8.54515C12.7245 8.36248 12.1794 8.29536 11.6395 8.34862C11.0996 8.40187 10.5782 8.57418 10.1128 8.85313C9.64746 9.13208 9.24974 9.51074 8.9483 9.96185C8.64686 10.413 8.44919 10.9253 8.36952 11.462C8.28984 11.9986 8.33015 12.5463 8.48754 13.0655C8.64493 13.5847 8.91548 14.0626 9.27972 14.4647C9.64396 14.8668 10.0928 15.1832 10.594 15.391ZM8.002 8.002C8.52702 7.47697 9.15032 7.0605 9.8363 6.77636C10.5223 6.49222 11.2575 6.34597 12 6.34597C12.7425 6.34597 13.4777 6.49222 14.1637 6.77636C14.8497 7.0605 15.473 7.47697 15.998 8.002C16.523 8.52702 16.9395 9.15032 17.2236 9.8363C17.5078 10.5223 17.654 11.2575 17.654 12C17.654 12.7425 17.5078 13.4777 17.2236 14.1637C16.9395 14.8497 16.523 15.473 15.998 15.998C14.9377 17.0583 13.4995 17.654 12 17.654C10.5005 17.654 9.06234 17.0583 8.002 15.998C6.94166 14.9377 6.34597 13.4995 6.34597 12C6.34597 10.5005 6.94166 9.06234 8.002 8.002ZM18.908 7.188C19.0381 7.06527 19.1423 6.91768 19.2143 6.75397C19.2863 6.59027 19.3248 6.41377 19.3274 6.23493C19.33 6.05609 19.2967 5.87855 19.2295 5.71281C19.1622 5.54707 19.0624 5.39651 18.936 5.27004C18.8095 5.14357 18.6589 5.04376 18.4932 4.97652C18.3275 4.90928 18.1499 4.87598 17.9711 4.87858C17.7922 4.88119 17.6157 4.91965 17.452 4.9917C17.2883 5.06374 17.1407 5.1679 17.018 5.298C16.7793 5.55103 16.6486 5.88712 16.6537 6.23493C16.6588 6.58274 16.7992 6.91488 17.0452 7.16084C17.2911 7.40681 17.6233 7.54723 17.9711 7.5523C18.3189 7.55737 18.655 7.42669 18.908 7.188Z" fill="currentColor" />
        </svg>
      );
    default:
      return (
        <svg {...box}>
          <path d="M13.5 10.5L21 3M21 8V3H16M21 14V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}

/** New and returning users: line chart + Traffic sources side (Figma Side: pt8, 1px divider bg/subtle, gap48, w352). */
export function NewReturningCard({
  traffic,
  trafficTitle,
  trafficInfo,
  ...p
}: LineCardProps & {
  traffic: { id: string; label: string; share: number; value: string }[];
  trafficTitle: string;
  trafficInfo: string;
}) {
  return (
    <CardShell className="gap-7 p-8">
      <div className="flex flex-col gap-4">
        <CardHeader title={p.title} info={p.info} segmented={p.segmented} onExplore={p.onExplore} />
        <CardValue caption={p.caption} value={p.headline} />
      </div>
      <div className="flex gap-12">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <LineChart labels={p.labels} series={p.series} axisMax={p.axisMax} formatTick={p.formatTick} curve={p.curve} hover={p.hover} />
          <ChartLegend items={p.legend} />
        </div>
        <div className="flex shrink-0 gap-12 pt-2">
          <span aria-hidden className="w-px self-stretch bg-bg-subtle" />
          <div className="flex w-[352px] flex-col gap-6">
            <div className="flex items-center gap-2">
              <h3 className="text-[20px] font-bold leading-[1.5] text-text-primary">{trafficTitle}</h3>
              <InfoTooltip text={trafficInfo} tone="primary" size={14} strokeWidth={1.2} />
            </div>
            <div className="flex flex-col gap-4">
              {traffic.map((s) => (
                // Figma `Progress row`: label 16/1.6 + value 14 right, 4px bar below (chart/bar/accent)
                <div key={s.id} className="flex flex-col gap-2">
                  <div className="flex h-[26px] items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="flex shrink-0 text-icon-primary">
                        <TrafficSourceIcon source={s.id} />
                      </span>
                      <span className="truncate text-fs-16 leading-[1.6] text-text-primary">{s.label}</span>
                    </span>
                    <span className="text-label-default text-text-primary">{s.value}</span>
                  </div>
                  <div className="h-1 w-full overflow-hidden rounded-md bg-chart-bar-track">
                    <div className="h-full rounded-md bg-chart-bar-accent" style={{ width: `${s.share}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </CardShell>
  );
}
