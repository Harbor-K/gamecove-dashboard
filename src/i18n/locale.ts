export type Locale = "en" | "ko";
export const LOCALES: Locale[] = ["en", "ko"];
export const LOCALE_LABELS: Record<Locale, string> = { en: "English", ko: "한국어" };

const KEY = "gc:lang";
const isLocale = (v: unknown): v is Locale => v === "en" || v === "ko";

// Language lives in the URL (?lang=en / ?lang=ko, same as the GameCove repo) and is remembered,
// so every canvas screen opens in the language last chosen.
function detect(): Locale {
  if (typeof window === "undefined") return "en";
  try {
    const q = new URLSearchParams(window.location.search).get("lang");
    if (isLocale(q)) {
      window.localStorage.setItem(KEY, q);
      return q;
    }
    const saved = window.localStorage.getItem(KEY);
    if (isLocale(saved)) return saved;
  } catch {
    /* storage can be blocked — fall back to English */
  }
  return "en";
}

/** Fixed for the lifetime of the page; switching language reloads it. */
export const LOCALE: Locale = detect();

export function setLocale(next: Locale) {
  if (next === LOCALE) return;
  try {
    window.localStorage.setItem(KEY, next);
  } catch {
    /* ignore */
  }
  const url = new URL(window.location.href);
  url.searchParams.set("lang", next);
  window.location.replace(url.toString());
}
