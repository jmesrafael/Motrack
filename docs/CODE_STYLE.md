# CODE_STYLE.md — Language, Style, Naming, Enforcement

> **Owns:** all code-style and naming rules (this file absorbs the planned CODING_STANDARDS.md — one authority, D-016). Layering rules it enforces come from [SOFTWARE_ARCHITECTURE.md](SOFTWARE_ARCHITECTURE.md); folder placement from [FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md). Everything here is tool-enforced where possible; the config files are the executable form of this document.

## 1. Language & compiler

TypeScript everywhere, `strict: true` plus `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`. **`any` is banned** (lint error); escape hatch is `unknown` + narrowing. No enums (union string literals match DB CHECK values); no namespaces; no default exports **except** Expo Router route files (framework requirement).

## 2. Formatting & linting

Prettier (defaults + single quotes, 100-col) — never argued about. ESLint: `@typescript-eslint` strict, `react`, `react-hooks`, `i18next/no-literal-string` (UI files), import-boundary rules (§8), custom bans (§7/§9). CI fails on any warning ([CONTRIBUTING.md](CONTRIBUTING.md) §4).

## 3. Naming

| Thing | Convention | Example |
|---|---|---|
| Components/screens & files | PascalCase | `ScheduleRow.tsx` |
| Functions/vars/hooks files | camelCase; hooks `use*` | `useQuickLog.ts` |
| Services/repositories | PascalCase class-or-module + suffix | `MaintenanceService`, `FuelRepository` |
| Types/interfaces | PascalCase, no `I` prefix | `MaintenanceRecord` |
| Constants (true constants) | SCREAMING_SNAKE | `MAX_BIKES_FREE` |
| DB (tables/columns) | snake_case per [DATABASE_DESIGN.md](DATABASE_DESIGN.md) §4 | `maintenance_records` |
| i18n keys | dot.camel namespaces | `dashboard.nextMaintenance.title` |
| Domain vocabulary | exactly [GLOSSARY.md](GLOSSARY.md) terms | `anchor`, `schedule`, never "task"/"job" |
| Booleans | `is/has/can` prefix | `isArchived` |
| Event names | `domain:changed` | [DATA_FLOW.md](DATA_FLOW.md) §5 |

## 4. Functions & modules

Small, single-purpose; early returns over nesting; no flag parameters that fork behavior (split the function). Module = one concern; > ~300 lines is a smell prompting a split. Pure logic separated from I/O (testability, [TESTING.md](TESTING.md)).

## 5. React specifics

Function components only; props typed + exported (`<Name>Props`); no inline business logic — a conditional more complex than a ternary over view state belongs in the hook/service. Hooks follow rules-of-hooks; custom hooks return stable references (`useCallback`/`useMemo` where identity matters for lists, [PERFORMANCE.md](PERFORMANCE.md) §4). No `useEffect` for derivable values.

## 6. No-duplication rules (constitutional)

Formatting only via `src/lib/format.ts` ([LOCALIZATION.md](LOCALIZATION.md) §5) · date math only via `src/lib/dates.ts` · business rules only in services ([BUSINESS_RULES.md](BUSINESS_RULES.md) is their spec) · validation schemas only in `services/validation/`. Copy-pasting one of these into a component/second location is a review-blocker.

## 7. Token & string discipline

No hex/rgb literals outside `src/theme/` (lint) — [THEME_GUIDE.md](THEME_GUIDE.md) §3 · no user-visible string literals outside i18n resources (lint) — [LOCALIZATION.md](LOCALIZATION.md) §3 · no raw px "magic numbers" for spacing where a token exists ([DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) §5).

## 8. Import boundaries (lint-enforced, `eslint-plugin-boundaries` or equivalent)

The rules from [FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md) §2.4 and [SOFTWARE_ARCHITECTURE.md](SOFTWARE_ARCHITECTURE.md) §1: features↛features; components↛features/stores/services; services↛React/stores; SQL only in repositories; network imports only in `services/adapters/` ([OFFLINE_ARCHITECTURE.md](OFFLINE_ARCHITECTURE.md) §3); `react-native-purchases`/`@sentry/*` only in their adapters.

## 9. Errors, logging, comments

No silent `catch {}`; no `console.*` outside `src/lib/log.ts` ([LOGGING_GUIDE.md](LOGGING_GUIDE.md)); services return `Result` ([ERROR_HANDLING.md](ERROR_HANDLING.md) §3). Comments state **constraints the code can't show** ("effective km — see ADR-009", "order matters: anchors before replan") — never narrate the next line. TODOs carry an issue reference or don't merge.

## 10. Commits & PRs

Conventional Commits (`feat: … / fix: … / docs: …`) — feeds the changelog ([VERSIONING.md](VERSIONING.md) §3). PR checklist and review rules: [CONTRIBUTING.md](CONTRIBUTING.md).

## 11. Evolution

Rule changes = PR against this doc first, then config; tool configs may tighten (never loosen) without a doc change. Phase 2 additions (Supabase adapter rules, TanStack Query conventions) append here — the boundaries model already anticipates them.
