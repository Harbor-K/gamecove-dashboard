# GameCove Dashboard

https://harbor-k.github.io/gamecove-dashboard/

GameCove prototype (Workspace → Game Setup mapping → Overview / Retention / Explore / Analysis board / Tracking).
The app code in `src/` is the Magic Patterns design `57eslvjkvsv9dsajjqgzdc` (active version as of 2026-10-16), copied as-is.

- Stack: React 18 + react-router 6 + Tailwind CSS v3 (GameCove semantic tokens in `src/index.css` / `tailwind.config.js`) + Vite.
- Language: `?lang=en` (default) / `?lang=ko`.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The project deploys automatically to GitHub Pages whenever `main` is updated.
On GitHub Actions the build uses the `/gamecove-dashboard/` base path and writes `404.html` so deep links (e.g. `/projects/bouncebounce/overview`) open the app.

## Differences from the Magic Patterns code

- `src/App.tsx`: `BrowserRouter` gets `basename={import.meta.env.BASE_URL}` so routes work under the GitHub Pages sub-path.
- `tailwind.config.js`: `content` points at `src/**`.
- Build files added: `vite.config.mjs`, `postcss.config.js`, `tsconfig.json`.
