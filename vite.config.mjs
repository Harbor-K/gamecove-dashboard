import { copyFileSync } from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages serves the site under /gamecove-dashboard/; local dev and the Sites build run at "/".
const base = process.env.GITHUB_ACTIONS ? "/gamecove-dashboard/" : "/";
const outDir = "dist/client";

export default defineConfig({
  base,
  build: { outDir },
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"],
    warmup: {
      clientFiles: ["./src/index.tsx"],
    },
  },
  plugins: [
    react(),
    {
      // GitHub Pages has no SPA fallback: serve the app for deep links (e.g. /projects/bouncebounce/overview) via 404.html.
      name: "spa-404-fallback",
      apply: "build",
      closeBundle() {
        copyFileSync(path.resolve(outDir, "index.html"), path.resolve(outDir, "404.html"));
      },
    },
  ],
});
