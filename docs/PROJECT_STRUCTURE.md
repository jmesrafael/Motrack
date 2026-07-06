# PROJECT_STRUCTURE.md — Repository Tree & Module Responsibilities

> **Owns:** the repo-root layout and top-level module responsibilities. The `src/` interior is specified in [FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md) (single source for source-tree placement rules); this file frames everything around it.

## 1. Repository root

```
motrack/
  docs/                  # THE knowledge base (constitution) — see docs/README.md
  src/                   # application source — FOLDER_STRUCTURE.md
  assets/                # app icon, splash, onboarding/empty-state illustrations
  store/                 # store listings, screenshots, data-safety notes (RELEASE_PROCESS.md §6)
  .github/workflows/     # CI (CONTRIBUTING.md §4)
  app.json               # Expo config: name, version (VERSIONING.md §1), plugins, permissions
  eas.json               # build profiles (RELEASE_PROCESS.md §1)
  drizzle.config.ts      # migration generation (DATABASE_DESIGN.md §8)
  babel.config.js  metro.config.js  tsconfig.json
  .eslintrc.cjs  .prettierrc  .nvmrc
  package.json  package-lock.json
  CHANGELOG.md           # Keep-a-Changelog (VERSIONING.md §3)
  README.md              # repo readme: what this is + pointer to docs/README.md + DEVELOPER_SETUP.md
  00_PROJECT_BRIEF.md  01_INSTRUCTIONS_FOR_FABLE.md   # historical inputs (docs/README.md §4)
```

## 2. Module responsibility summary

| Module | Responsibility | Authority doc |
|---|---|---|
| `src/app` | Route files only (thin) | [FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md) §2.1 |
| `src/features/*` | Feature UI + hooks (+ feature service) | [SOFTWARE_ARCHITECTURE.md](SOFTWARE_ARCHITECTURE.md) §3 |
| `src/components` | Shared presentation | [COMPONENT_LIBRARY.md](COMPONENT_LIBRARY.md) |
| `src/services` | Business logic + adapters + validation | [SOFTWARE_ARCHITECTURE.md](SOFTWARE_ARCHITECTURE.md) §2 |
| `src/db` | Schema, migrations, repositories, seed | [DATABASE_DESIGN.md](DATABASE_DESIGN.md), [SQLITE_GUIDE.md](SQLITE_GUIDE.md) |
| `src/stores` | Zustand slices | [STATE_MANAGEMENT.md](STATE_MANAGEMENT.md) |
| `src/lib` | Pure utilities | [CODE_STYLE.md](CODE_STYLE.md) §6 |
| `src/theme` / `src/i18n` / `src/config` | Tokens · locales · constants/PH config | [THEME_GUIDE.md](THEME_GUIDE.md) / [LOCALIZATION.md](LOCALIZATION.md) / [BUSINESS_RULES.md](BUSINESS_RULES.md) §8.2 |
| `src/types` / `src/testing` | Shared domain types · fixtures/factories | [TESTING.md](TESTING.md) §8 |

## 3. File naming (repo level)

Docs SCREAMING_SNAKE `.md` in `docs/` only · configs at root, never nested duplicates · assets kebab-case (`empty-garage.png`) with `@2x/@3x` where needed · store assets under `store/<platform>/<locale>/`. Source naming: [CODE_STYLE.md](CODE_STYLE.md) §3.

## 4. Evolution

**Phase 2:** `supabase/` root folder (migrations, edge functions, seed) beside `src/`; `.env.local` enters gitignore ([DEVELOPER_SETUP.md](DEVELOPER_SETUP.md) §7). **Phase 3/long-term:** monorepo pivot (`apps/mobile`, `apps/web`, `packages/domain`, `packages/ui`) per [FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md) §5 — `docs/` stays at root as the constitution across apps.
