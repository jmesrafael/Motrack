# Motrack

Philippines-first motorcycle maintenance tracker. **"Never forget motorcycle maintenance again."**

The complete technical foundation lives in [`docs/`](docs/README.md) — the knowledge base is the constitution: implementation follows it, and docs change *before* behavior does.

## Current state — UI validation phase

Only the **Home Dashboard (S-04)** is implemented, over realistic fixture data, so the design language can be evaluated before the rest of the UI is approved. No database, no business logic, no notifications yet. Taps whose target screens don't exist yet open an honest "coming up next" surface.

Fully implemented and real:

- The **theme engine** ([docs/THEME_GUIDE.md](docs/THEME_GUIDE.md)): complete `ThemeTokens` contract, one token file per theme, registry, `ThemeProvider`, `makeStyles`, live System/Light/Dark switching with a cross-dissolve transition (the sun/moon button in the dashboard header cycles it).
- The **design tokens** ([docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md)) — no raw colors exist outside `src/theme/themes/`.
- The **shared component layer** the dashboard consumes (`src/components/`).

## Run it

```bash
npm install
```

Browser (React Native running on Expo Web — not a separate web build):

```bash
npx expo start --web
```

Android / iOS (Expo Go or a dev build):

```bash
npx expo start
```

Checks:

```bash
npm run typecheck   # TypeScript strict + noUncheckedIndexedAccess + exactOptionalPropertyTypes
npm run lint
npx expo export --platform web   # static web build (also exercises every route)
```

## Where things live

See [docs/FOLDER_STRUCTURE.md](docs/FOLDER_STRUCTURE.md). In short: `src/app` (thin Expo Router routes) → `src/features/home/ui` (dashboard) → `src/components` (shared presentation) → `src/theme` (the theme engine). Fixture data: `src/testing/fixtures/dashboard.ts`.
