import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { startDomTranslation } from "./i18n/translate";
import { initTheme } from "./theme/theme";

// Theme: opens on System every time (top bar menu switches Light / Dark / System).
initTheme();

// Korean (?lang=ko or Setting > Language): translate rendered text before the first paint.
startDomTranslation();

const rootEl = document.getElementById("root");
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(<App />);
}
