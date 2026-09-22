# PROGRESS.md — Live Implementation Tracker

> **Owns:** the actual, verified build status of the app against [MILESTONES.md](MILESTONES.md)/[TASK_BREAKDOWN.md](TASK_BREAKDOWN.md). This is the one file that says "where are we, really" — everything else in this folder describes the *intended* app, not its current state.
>
> **Update rule:** whenever a task is finished, move it from "Open" to "Done" in the milestone section below **in the same change-set**, with the date. Whenever a gap is discovered (bug, missing piece, doc/code mismatch), add it to that milestone's "Known gaps" immediately — don't let this file drift the way the git history did (4 commits for the entire tree, no per-feature record).

## Current phase

**M4 — Reminders** and **M8 — Data safety (Backup/Restore core)** both progressed 2026-09-18. M4's planner/scheduler/cascade/settings screen and M8's BackupService/RestoreService landed the same day (see task tables below); M8's S-32 UI, ExportService, and delete-all-data remain open, as does M4's deep links + device-real verification. M0–M3 and M5 are functionally complete; M6/M7 are partial; M9 is not started. See breakdown below.

## Baseline health (as of 2026-09-18, end of session)

- `npx tsc --noEmit` — clean, 0 errors.
- `npx jest` — 12 suites, 126 tests, all passing (27 `ReminderPlanner.test.ts` + 28 new backup/restore tests: `archive.test.ts`, `backupData.test.ts`, `backupSchemas.test.ts`, `RestoreService.integration.test.ts`).
- `npx expo export --platform web` — succeeds, all 37 routes (incl. the new `/settings/notifications`) statically render without error.
- An ESLint config (`eslint.config.js`, `eslint-config-expo` default) appeared mid-session (not authored by this task — see note below) and now runs. `npm run lint` reports **10 errors, 24 warnings**, including a real bug: `src/theme/ThemeProvider.tsx` reads `overlayColorRef.current` during render (`react-hooks/refs`), which is invalid and can cause the theme-switch fade to skip re-renders. Not fixed in this session (out of scope for M4, and that file was mid-edit by a concurrent session) — flagged here for whoever picks up M0/tech-debt next. No CI pipeline (T-003) exists yet.
- `node_modules` was not installed at the start of this session (fresh checkout); installed 2026-09-18.
- **Concurrent-session note:** another Claude Code session was working in this same repo during this session, editing `src/i18n/strings.ts` and a few UI files (copy/em-dash cleanup, icon/layout tweaks). Its edits plus this session's own were briefly stashed and had to be recovered mid-session — no work was lost, but it explains why several files outside this session's M4 scope (ThemeProvider.tsx, TutorialHost.tsx, TutorialTooltip.tsx, SpotlightOverlay.tsx, bike edit screen, DocumentService.ts, HealthRing.tsx, Screen.tsx) show small unrelated diffs as of 2026-09-18. If multiple agents/sessions work this repo concurrently, expect more of this — coordinate on shared files (`strings.ts` especially) before editing.

## Milestone status

| Milestone | Status | Notes |
|---|---|---|
| M0 — Foundation | **Partial** | Router/theme/i18n/base components all present and working. A generic ESLint config now exists (see below) but not the custom "boundaries" rules T-002 calls for, and there's still no CI pipeline (T-003) — the "planted violation is caught" DoD for M0 is not verifiable yet. |
| M1 — Data core | **Partial** | Schema, migrations, repositories, seed, `lib/` helpers all present; 1 migration integration test exists. T-110 (EXPLAIN QUERY PLAN) verified 2026-09-18 — see below, all clear. **Gap:** no fixture factories (T-108: small/large/hostile), no migration test rig beyond the one integration test (T-109), no zip-benchmark spike/ADR (T-114). |
| M2 — Garage & onboarding | **Done** | MotorcycleService, garage/profile/add-edit screens, onboarding wizard, active-bike store all present. |
| M3 — Maintenance core | **Partial** | All services/screens present (Odometer, Schedule, Status, Maintenance, HealthScore, Quick Log, history). **Gap:** test coverage is thin — only `HealthScoreService` and `StatusService` have tests; `MaintenanceService`, `OdometerService`, `ScheduleService`, `MotorcycleService` have none, despite this milestone being called "the largest unit surface" in TASK_BREAKDOWN. |
| M4 — Reminders | **Partial** | Planner, OS scheduler, cascade wiring, and a settings screen now exist (T-401/402/403/406 — see task table). **Missing:** deep links on notification tap (T-404), device-real verification (T-407), and the S-00e onboarding permission-ask screen (currently only reachable via Settings → Notification settings). |
| M5 — Money | **Done** | FuelService, ExpenseRepository, StatisticsService, Money tab all present. |
| M6 — Documents | **Partial** | DocumentService + list/viewer screens present. ReminderPlanner now generates document-expiry entries (T-603's planning half is done); still missing dashboard expiry-warning cards and the plate-month hint config. |
| M7 — Repairs & polish | **Partial** | RepairService + log/history screens present. **Gap:** no recorded a11y sweep, animation-inventory application, or fil completion pass. |
| M8 — Data safety | **Partial** | BackupService + RestoreService core landed 2026-09-18 (local import/export `.tolits` archive — no cloud, no accounts, per product decision). **Missing:** S-32 UI screen, ExportService (CSV/PDF), delete-all-data, backup reminder wiring (planner already supports the type, nothing calls it yet since there's no `last_backup_at` writer until now — worth re-enabling in ReminderPlanner). Untested on a real device — see task table below. |
| M9 — Pro, hardening, release | **Not started** | No RevenueCat/EntitlementService, no Sentry. Only `eas.json` build config exists (partial T-007/T-009). |

## M4 — Reminders (active milestone, task-level)

Per [TASK_BREAKDOWN.md](TASK_BREAKDOWN.md) M4 and [NOTIFICATION_ENGINE.md](NOTIFICATION_ENGINE.md):

| ID | Task | Status |
|---|---|---|
| T-401 | ReminderPlanner pure function (projection, quiet hours, caps, overdue, snooze) | **Done** (2026-09-18) — `src/services/ReminderPlanner.ts` + `ReminderPlanner.test.ts` (27 tests). Two deliberate scope cuts, documented in the file header: the "already expired at save" one-off document notification, and `backup_reminder` generation (no BackupService/`last_backup_at` exists yet — M8). |
| T-402 | NotificationScheduler adapter + `scheduled_notifications` persistence + cancel-reschedule diff | **Done** (2026-09-18) — `src/services/NotificationScheduler.ts`, `src/db/repositories/ScheduledNotificationRepository.ts`. Added `expo-notifications` dependency + Android channel config in `app.json`. No-ops on web (local scheduled notifications aren't a web concern for MVP). |
| T-403 | Cascade wiring (serialized re-plan queue) + foreground/staleness trigger | **Done** (2026-09-18) — `triggerReplan`/`wireNotificationCascade` in `NotificationScheduler.ts`, wired into `src/app/_layout.tsx` via `AppState`. Also added `ScheduleService.snooze()` so the Reminders screen's snooze action now goes through the service layer and emits `schedule:changed` (it previously called the repository directly and wouldn't have triggered a re-plan). |
| T-404 | Deep links → pre-filled Quick Log / documents / backup | Open |
| T-405 | S-05 reminders list (snooze, log) + bell badge | **Done** (in-app list already worked; bell badge still not wired to tab bar) |
| T-406 | S-31 notification settings + dev fire-override | **Mostly done** (2026-09-18) — `src/app/settings/notifications.tsx`: fire time, quiet hours, per-type toggles, permission banner with "open system settings" deep link. Missing: dev "fire in 2 min" override, and there's no S-00e onboarding step yet (permission is only requested from this settings screen). |
| T-407 | Device-real verification protocol (stock, OEM, iOS; reboot) | Open — requires physical devices, out of scope for an AI coding session |

## M8 — Data safety (task-level)

Per [TASK_BREAKDOWN.md](TASK_BREAKDOWN.md) M8 and [BACKUP_RECOVERY.md](BACKUP_RECOVERY.md). Built by Sonnet (not Fable 5, per explicit direction), local-only per current product scope (no cloud, no accounts).

| ID | Task | Status |
|---|---|---|
| T-801 | BackupService (checkpoint, export JSON, files, manifest, zip) + progress | **Done** (2026-09-18) — `src/services/BackupService.ts`. Builds the full `.tolits` archive (manifest.json + data.json + files/) in memory and shares it via `expo-sharing`; also exposes `createInternalSafetySnapshot()` for the pre-restore snapshot. **No progress callback** — archives are built as one in-memory operation, not chunked, so there's nothing to report progress on yet (see the scope note below). |
| T-802 | RestoreService exactly per BACKUP_RECOVERY.md §4 (staging, validation, snapshot, atomic swap, rollback) | **Done, unverified on-device** (2026-09-18) — `src/services/RestoreService.ts`. Implements all 9 steps: size cap, zip-slip-safe extraction, manifest/shape/count validation, missing-file detection, safety snapshot, staging DB (create-at-archive-version → insert → migrate-forward), `quick_check`/`foreign_key_check` integrity gate, atomic-ish file swap with best-effort rollback, `expo-updates` reload. This is genuinely the highest-risk code in the app — see "Known limitations" below before trusting it with real user data. |
| T-803 | S-32 backup/restore UI + onboarding restore entry + backup reminder type | Open — deliberately deferred until the in-progress UI redesign settles, so the screen isn't built twice |
| T-804 | ExportService CSVs (4 domains) + S-35 | Open |
| T-805 | PDF service-history report | Open |
| T-806 | Delete-all-data + S-33 data section | Open (`DataPrivacyService.deleteAllData()` already exists per M9/settings — check whether it already covers this before rebuilding) |

### Known limitations (read before relying on this for real backups)

1. **Not streamed to disk (ADR-026 deviation).** Archives are built as a single in-memory `Uint8Array` via `fflate`'s sync API, not streamed table-by-table/file-by-file. Fine for realistic data (thousands of records, tens of MB of photos); unverified against ADR-026's literal 300 MB-on-a-2GB-device target. Follow-up: switch to fflate's streaming `Zip`/`Unzip` classes writing through `File.writableStream()`.
2. **The atomic swap has one real risk window.** Every step up to "close the live DB connection" only touches staging paths — a failure there leaves the running app completely untouched. The instant after that, renaming the DB file and the documents directory into place is not a single OS transaction; if a rename fails mid-swap, `performRestore` attempts a best-effort rollback, and the pre-restore safety snapshot is the last-resort recovery path. Not exercised on a real device.
3. **`File.moveSync`/`Directory.moveSync` destination semantics are inferred, not confirmed.** Built to match the existing exact-target-path convention used elsewhere in this codebase (`FileAdapter`), but expo-file-system's docs don't spell out move semantics explicitly. Needs a real-device smoke test before shipping.
4. **Step 7's "recompute caches (odometer cache, anchors) via services" is simplified.** Restored rows keep their exported `current_odometer_km`/anchor values verbatim rather than being recomputed through `OdometerService`/`ScheduleService` against the staging DB (those services are hard-wired to the live `db`/`rawDb` singleton, not parameterizable to an arbitrary handle without a broader refactor). Safe as long as the source data was self-consistent when exported, which it always is for an export of a live DB.
5. **Document-expiry "already expired at save" one-off notification and `backup_reminder` planning** were scope-cut in ReminderPlanner (T-401) because BackupService didn't exist yet. `last_backup_at` is now written by `createBackup()` — worth revisiting whether `backup_reminder` generation should be turned on in the planner now.
6. **No device testing at all.** Nothing in M8 has run on an emulator or physical device — this whole milestone was built and verified via typecheck + Jest (using `better-sqlite3` as a stand-in for the same underlying SQLite engine) only, per this session's environment constraints (no Android/Java toolchain, not logged into EAS).

## T-110 — EXPLAIN QUERY PLAN audit (2026-09-18)

Verified against a synthetic "heavy 5-year user" fixture (5 bikes × 3,000 odometer logs × 1,000 records/expenses/fuel logs each — matches PERFORMANCE.md §5's 15k/5k design numbers) using better-sqlite3 against the real migration SQL. Findings: **no accidental full table scans on any growth-scale table.**

- The unified expenses/fuel/maintenance/repairs UNION query (`ExpenseRepository` — Money tab, statistics) pushes the `motorcycle_id` predicate into every branch and uses its per-table `(motorcycle_id, date)` index, both for the single-bike case and the "all non-archived bikes" `IN (subquery)` case (SQLite compiles that into a list-subquery + Bloom filter with one indexed search per bike, not a scan).
- `StatisticsService`'s all-bikes km-tracked (GROUP BY) and oil-change-count (JOIN) queries: same story, indexed throughout.
- `OdometerRepository.listByBike` and friends: clean index search; the only `TEMP B-TREE` usage is sorting an already-per-bike-filtered result, which is cheap at any realistic per-bike row count.
- `SearchService`'s `LIKE '%x%'` queries do full-scan (expected — no index can serve a leading-wildcard search), but every table they run against is small by construction (records belong to a handful of bikes per user), so this is an accepted cost, not a bug.

Conclusion: the schema/index design from M1 is sound. This was a real gap in verification, not in the design.

## Cross-cutting gaps (not owned by one milestone)

- No ESLint config / CI pipeline (M0).
- Test coverage gap across M1/M3 services (see above).
- No fixture factories for hostile/large-data testing (M1).
