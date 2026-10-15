// GameCove semantic tokens (from app/tokens.css `@theme inline`), translated to Tailwind v3.
const tokenNames = [
  "bg-canvas", "bg-surface", "bg-subtle", "bg-selected", "bg-hover", "bg-nav", "bg-bubble", "bg-scrim",
  "bg-hover-subtle", "bg-positive-subtle", "bg-critical-subtle", "bg-pending-subtle", "bg-ai-subtle",
  "bg-accent-strong", "bg-chip", "bg-button-secondary", "bg-button-primary", "bg-tracking-canvas",
  "bg-node-inset", "bg-tooltip", "bg-critical-hover",
  "text-primary", "text-secondary", "text-accent", "text-positive", "text-critical", "text-on-accent",
  "text-button-secondary", "text-on-button-primary", "text-tooltip",
  "border-default", "border-accent", "border-positive-subtle", "border-critical-subtle",
  "border-pending-subtle", "border-button-secondary",
  "icon-primary", "icon-secondary", "icon-ai", "icon-inverse", "icon-button-secondary",
  "chart-series-primary", "chart-series-muted", "chart-series-exit", "chart-label", "chart-grid",
  "chart-bar-default", "chart-bar-track", "chart-bar-accent", "chart-bar-emphasis",
  "chart-heatmap-accent", "chart-funnel-dropped", "chart-funnel-dropped-stripe", "chart-flow-line",
  "status-positive", "status-critical", "status-pending", "avatar-violet", "data-select-row",
  "effect-shadow", "effect-selected-ring",
];

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      ...Object.fromEntries(tokenNames.map((n) => [n, `var(--gc-${n})`])),
    },
    borderRadius: {
      none: "0px",
      sm: "4px",
      md: "8px",
      lg: "16px",
      full: "9999px",
    },
    extend: {
      fontFamily: {
        sans: ["Lato", "sans-serif"],
      },
      spacing: {
        "control-32": "32px",
        "control-40": "40px",
        "control-48": "48px",
        "icon-sm": "16px",
        "icon-md": "24px",
        "avatar-sm": "24px",
        sidebar: "280px",
        header: "88px",
      },
      fontSize: {
        "display-page": ["40px", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" }],
        "display-metric": ["28px", { lineHeight: "1.2", letterSpacing: "-0.015em", fontWeight: "700" }],
        "title-card": ["20px", { lineHeight: "1.3", letterSpacing: "-0.01em" }],
        "body-default": ["16px", { lineHeight: "1.6" }],
        "label-default": ["14px", { lineHeight: "1.5" }],
        "caption-default": ["12px", { lineHeight: "1.4" }],
        "metric-number": ["32px", { lineHeight: "1.5", fontWeight: "700" }],
        "metric-card-title": ["24px", { lineHeight: "1.5", fontWeight: "700" }],
        "fs-16": "16px",
        "fs-14": "14px",
        "fs-12": "12px",
      },
    },
  },
};
