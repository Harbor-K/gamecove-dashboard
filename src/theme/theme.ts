import { useSyncExternalStore } from "react";

// Same model as the GameCove repo (lib/theme.ts): <html data-theme="light | dark | system">,
// System follows the OS. The prototype always opens on System (nothing is remembered).
export type ThemePreference = "light" | "dark" | "system";
export type Theme = "light" | "dark";

const LIGHT_QUERY = "(prefers-color-scheme: light)";

export function initTheme() {
  document.documentElement.dataset.theme = "system";
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  const media = matchMedia(LIGHT_QUERY);
  media.addEventListener("change", onChange);
  return () => {
    observer.disconnect();
    media.removeEventListener("change", onChange);
  };
}

const getPreference = (): ThemePreference => {
  const v = document.documentElement.dataset.theme;
  return v === "light" || v === "dark" ? v : "system";
};

/** The theme actually on screen (System → OS setting). */
const getTheme = (): Theme => {
  const p = getPreference();
  if (p === "system") return matchMedia(LIGHT_QUERY).matches ? "light" : "dark";
  return p;
};

export function setThemePreference(preference: ThemePreference) {
  document.documentElement.dataset.theme = preference;
}

export function useTheme() {
  const preference = useSyncExternalStore(subscribe, getPreference, () => "system" as const);
  const theme = useSyncExternalStore(subscribe, getTheme, () => "dark" as const);
  return { preference, theme, setPreference: setThemePreference };
}
