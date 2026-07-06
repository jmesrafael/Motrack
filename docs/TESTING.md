# TESTING.md — Test Strategy Per Layer

> **Owns:** what is tested, where, with what, and the required fixtures. Definition-of-done gates: [ACCEPTANCE_CRITERIA.md](ACCEPTANCE_CRITERIA.md). CI wiring: [CONTRIBUTING.md](CONTRIBUTING.md) §4.

## 1. Strategy

The money is in the **service layer** — every business rule is a deterministic pure-ish function by construction ([SOFTWARE_ARCHITECTURE.md](SOFTWARE_ARCHITECTURE.md)), so unit tests carry most of the confidence. UI tests protect wiring and states; a thin manual E2E pass protects device-real behavior (notifications, files, purchases) that emulators fake poorly.

Pyramid: **unit (services/lib/repositories) ≫ component/store ≫ manual E2E checklist**. Automated E2E (Maestro) is a fast-follow once screens stabilize (Milestone R in [MILESTONES.md](MILESTONES.md)), not an MVP gate.

## 2. Tooling & layout

Jest + jest-expo · React Native Testing Library · better-sqlite3-backed Drizzle for repository tests (same SQL dialect, no device) · tests co-located `*.test.ts(x)` ([FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md) §2.5). Coverage gate: services + lib ≥ 90% lines/branches; repositories ≥ 80%; global ≥ 70%. Coverage is a floor, not a goal — the mandatory-case lists below matter more.

## 3. Test doubles policy

Real implementations preferred: repository tests run real SQL; service tests use real repositories on an in-memory DB. **Adapters** (notifications, filesystem, purchases, crash) have hand-written fakes in `src/services/adapters/__fakes__/` — the only sanctioned mocks. No mocking of the module under test's own layer.

## 4. Unit tests — mandatory cases

- **Business rules:** every numbered rule/edge case in [BUSINESS_RULES.md](BUSINESS_RULES.md) (due ratios incl. missing-dimension; odometer monotonicity + corrections + meter-offset ADR-009; fuel spans incl. partial fills and implausible-span exclusion; expense union mapping; statistics windows).
- **Health Score:** all vectors in [HEALTH_SCORE.md](HEALTH_SCORE.md) §7 (Examples A/B and boundary table) + exclusion rules.
- **ReminderPlanner:** scenario matrix from [NOTIFICATION_ENGINE.md](NOTIFICATION_ENGINE.md) §3–7 (projection windows/fallbacks, quiet-hour shifts, overdue cycle max-3, snooze, caps/priority drop order, document 30/7/1, dedup) — pure `plan(data, settings, now)` assertions with fixed `now`.
- **Validation schemas:** accept/reject tables per field ([FEATURE_SPECIFICATIONS.md](FEATURE_SPECIFICATIONS.md)); per-component `details` schemas (ADR-007).
- **Migrations:** each migration applied to a populated previous-version fixture — zero row loss ([DATABASE_DESIGN.md](DATABASE_DESIGN.md) §8.5).
- **Backup/restore:** round-trip equality on the large fixture; every failure case in [BACKUP_RECOVERY.md](BACKUP_RECOVERY.md) §5 incl. hostile zips (traversal names) and newer-version manifests.
- **CSV writer:** RFC-4180 + formula-injection fixtures ([EXPORT_IMPORT.md](EXPORT_IMPORT.md) §3). **Formatters:** money/km/date/locale cases.

## 5. Component & store tests

Every shared component ([COMPONENT_LIBRARY.md](COMPONENT_LIBRARY.md)): renders in every registered theme (registry-driven wrapper, [THEME_GUIDE.md](THEME_GUIDE.md) §7), a11y label present, variants, interaction callbacks. Store slices: action → state transitions incl. `status` and event-driven invalidation ([STATE_MANAGEMENT.md](STATE_MANAGEMENT.md) §6). Screens: state coverage for empty/loading/error/ready per [SCREEN_SPECIFICATIONS.md](SCREEN_SPECIFICATIONS.md), via RNTL with fake adapters + in-memory DB.

## 6. Flow tests (integration, JS-level)

Scripted service-level walkthroughs of [USER_FLOWS.md](USER_FLOWS.md) F-1…F-12 (e.g., F-2: create bike → baseline → quick log → assert anchors/status/score/plan). These run in CI; they are the executable spec of the flows.

## 7. Manual E2E checklist (per release — [RELEASE_PROCESS.md](RELEASE_PROCESS.md) §3)

On a real low-end Android + one iPhone: notification fires approximately on schedule & deep-links correctly; reboot *recovery* per [NOTIFICATION_ENGINE.md](NOTIFICATION_ENGINE.md) §9a (Android: reboot → open app → plan restored; iOS: persists); airplane-mode full pass (log/backup/export offline — [OFFLINE_ARCHITECTURE.md](OFFLINE_ARCHITECTURE.md) §1); camera/photo import; share sheets; purchase + restore in sandbox; dark mode + fil + 130% font spot checks; perf checklist ([PERFORMANCE.md](PERFORMANCE.md) §8).

## 8. CI & fixtures

CI (GitHub Actions): typecheck → lint → unit/component/flow tests → i18n key-set parity check ([LOCALIZATION.md](LOCALIZATION.md) §3) → `npm audit` (fail on high) — on every PR ([CONTRIBUTING.md](CONTRIBUTING.md) §4). Shared fixtures in `src/testing/fixtures/`: **small** (1 bike, 20 records), **large** (5 bikes, 5k records, 3k fuel, 10k odometer — perf/pagination), **previous-version DBs** (migration tests), **hostile archives** (restore tests). Fixture builders are typed factories, not JSON blobs.

## 9. Evolution

**Phase 2:** sync engine gets protocol tests against a local Supabase (docker) — push/pull/conflict matrices from [SUPABASE_SYNC_PLAN.md](SUPABASE_SYNC_PLAN.md) §5; contract tests on edge-function schemas. Maestro E2E promoted into CI on emulator. **Phase 3+:** server-side test suite mirrors service specs (shared vectors, e.g. Health Score §7).
