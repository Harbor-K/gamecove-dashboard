import { LOCALE } from "../i18n/locale";
import type { Related } from "./ut-overviews";

// Retention page copy + the values written in Figma Page 18 "GameCove · Retention" (2093:3051).
// Cohort numbers come from data/dashboard.ts (dateCohorts / d1Retention) and data/analytics.ts (retentionKpis,
// progressRetention); this file only holds what that frame adds on top (titles, subtitles, facts, next links).
const L = (en: string, ko: string) => (LOCALE === "ko" ? ko : en);

export const retentionPage = {
  title: L("Retention", "리텐션"),
  description: L(
    "Do players come back? · new player cohorts by first-play date · Data through Sep 22, 21:45 (UTC)",
    "플레이어가 다시 오나요? · 첫 플레이 날짜별 신규 플레이어 코호트 · 데이터 기준 9월 22일 21:45 (UTC)",
  ),
  d1: {
    title: L("D1 retention", "D1 리텐션"),
    info: L("Share of new players who return the next calendar day", "다음 날 다시 플레이한 신규 플레이어 비율"),
    subtitle: L(
      "Share of each day's new players who played again the next day · Sep 22 cohort can't be measured yet",
      "날짜별 신규 플레이어 중 다음 날 다시 플레이한 비율 · 9월 22일 코호트는 아직 측정할 수 없어요",
    ),
    /** Figma y axis 0–25% */
    axisMax: 25,
    na: "N/A",
  },
  cohort: {
    title: L("Date cohort retention", "날짜 코호트 리텐션"),
    info: L("Retention of new players by first-play date", "첫 플레이 날짜별 신규 플레이어 리텐션"),
    subtitle: L(
      "New players grouped by first-play date · % who played again on day N · N/A = not measurable yet",
      "첫 플레이 날짜로 묶은 신규 플레이어 · N일째 다시 플레이한 비율 · N/A = 아직 측정 불가",
    ),
    dateLabel: L("First play date", "첫 플레이 날짜"),
    usersLabel: L("Players", "플레이어"),
    /** Figma shows D1–D8 */
    days: 8,
  },
  progress: {
    subtitle: L(
      "Retention · new players from Sep 16–21 (D1 can be measured) · grouped by the furthest place reached on day 1 · 588 players · 13.1% returned",
      "리텐션 · 9월 16–21일 신규 플레이어(D1 측정 가능) · 첫날 가장 멀리 간 곳으로 묶음 · 588명 · 13.1% 복귀",
    ),
    facts: [
      { value: "134 = 53 + 81", text: L("Today's active players: new + returning (Lifecycle).", "오늘 활성 플레이어: 신규 + 재방문 (Lifecycle).") },
      { value: "6.0%", text: L("Yesterday's new players who played again today (D1).", "어제 신규 플레이어 중 오늘 다시 플레이한 비율 (D1).") },
      { value: "2.5%", text: L("New players from Sep 15 who played today (D7).", "9월 15일 신규 플레이어 중 오늘 플레이한 비율 (D7).") },
    ],
    next: L("Next:", "다음:"),
    related: [
      { label: L("New vs returning players", "신규 vs 재방문 플레이어"), to: { kind: "explore", query: "metric=newAndReturning" } },
      { label: L("Explore by stage", "스테이지별로 살펴보기"), to: { kind: "explore", query: "metric=exitRate" } },
    ] as Related[],
  },
};
