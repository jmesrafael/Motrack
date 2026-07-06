# FOLDER_STRUCTURE.md — Source Tree & Placement Rules

> **Owns:** the source tree shape and placement rules. The repo-root view (configs, docs, assets) is in [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md); layer semantics in [SOFTWARE_ARCHITECTURE.md](SOFTWARE_ARCHITECTURE.md); naming casing in [CODE_STYLE.md](CODE_STYLE.md) §3.

## 1. Tree

```
src/
  app/                    # Expo Router routes ONLY (thin route files → feature screens)
    (tabs)/
      index.tsx           # Home / Dashboard (S-04)
      maintenance.tsx     # S-10
      log.tsx             # Log launcher (routes to sheets)
      money.tsx           # S-22
      more.tsx            # S-30
    onboarding/…          # S-00a–e
    bike/[id]/…           # profile, edit (S-02/S-03)
    maintenance/…         # component/[type], log, history (S-11–S-14)
    repair/…              # S-15/S-16
    fuel/log.tsx          # S-21
    expense/log.tsx       # S-23
    odometer.tsx          # S-25 (modal)
    documents/…           # S-26/S-27
    stats.tsx             # S-28
    settings/…            # S-31/S-32/S-33
    paywall.tsx           # S-34 (modal)
    export.tsx            # S-35
    _layout.tsx           # root: providers (Theme, i18n, DB-ready gate, ErrorBoundary)
  features/
    garage/       { ui/, hooks/, service? }
    maintenance/  { ui/, hooks/ }
    fuel/ …  expenses/ …  documents/ …  reminders/ …
    stats/ …  settings/ …  premium/ …  backup/ …  onboarding/ …
  components/             # shared presentation (COMPONENT_LIBRARY.md) + Icon.tsx
  services/               # shared business logic (SOFTWARE_ARCHITECTURE.md §2)
    adapters/             # notifications, filesystem, purchases, crash wrappers
    validation/           # Zod schemas per domain input
  db/
    schema.ts             # Drizzle schema (DATABASE_DESIGN.md is the spec)
    migrations/           # generated, numbered, committed
    repositories/
    seed/                 # default intervals/weights seed config (BUSINESS_RULES §3)
    client.ts             # DB open/init/migration gate
  stores/                 # Zustand slices (STATE_MANAGEMENT.md)
  hooks/                  # shared cross-feature hooks only
  lib/                    # pure utilities: format.ts, dates.ts, result.ts, uuid.ts, csv.ts
  theme/                  # types, registry, themes/ (one token file per theme), ThemeProvider, useTheme (THEME_GUIDE.md)
  i18n/                   # en.json, fil.json, init.ts
  config/                 # app constants, ph.ts (registration hints), limits.ts
  types/                  # shared domain types (Motorcycle, MaintenanceRecord, …)
```

## 2. Placement rules

1. **Route files are thin**: parse params, render a feature screen component, nothing else. All real UI lives in `features/*/ui/`.
2. **Feature-first**: code used by one feature stays in that feature's folder. Promotion to `src/components`/`src/hooks`/`src/services` happens on **second use**, as a deliberate move ([COMPONENT_LIBRARY.md](COMPONENT_LIBRARY.md) composition rule 1).
3. **No `utils/` dumping ground** — `lib/` files are single-purpose modules with tests.
4. **Import boundaries** (lint-enforced, [CODE_STYLE.md](CODE_STYLE.md) §8): `features/A` never imports `features/B` (shared code moves down); `components/` never imports `features/`, `stores/`, `services/`; `services/` never imports React/`stores/`; only `db/repositories` imports `db/schema`.
5. **Tests co-located**: `Foo.test.ts` beside `Foo.ts` ([TESTING.md](TESTING.md) §2).
6. New top-level folders require updating this file + [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) first.

## 3. Naming inside the tree

Files: `PascalCase.tsx` components/screens · `camelCase.ts` everything else · route files follow Expo Router conventions (lowercase, `[param]`, `(group)`). One exported component per `.tsx` file. Full rules: [CODE_STYLE.md](CODE_STYLE.md) §3.

## 4. Route ↔ screen map (canonical)

Every S-xx in [SCREEN_SPECIFICATIONS.md](SCREEN_SPECIFICATIONS.md) maps to exactly one route above (S-12q, S-25, S-34 are modal presentations; switcher/pickers are sheets within their host screens, not routes). Deep-link paths used by notifications: `/maintenance/log?bikeId=…&component=…` (Quick Log), `/documents`, `/settings/backup` ([NOTIFICATION_ENGINE.md](NOTIFICATION_ENGINE.md) §8).

## 5. Evolution

**Phase 2:** `features/sync/`, `features/scanner/`, `services/adapters/supabase.ts` slot in without moving existing code. **Phase 3:** feature-flagged `features/workshop/`, `features/community/`. **Long-term:** monorepo split (`apps/mobile`, `apps/web`, `packages/domain`) — enabled by the import boundaries above; the `src/` tree becomes `apps/mobile/src/` unchanged.
