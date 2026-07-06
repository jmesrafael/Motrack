# MILESTONES.md — Milestone 1 Through Release

> **Owns:** milestone deliverables, Definition of Done per milestone, and required testing. Strategy/rationale: [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md); task detail: [TASK_BREAKDOWN.md](TASK_BREAKDOWN.md).

## 1. Universal milestone gate (applies to every milestone)

A milestone is done when: all its tasks meet [ACCEPTANCE_CRITERIA.md](ACCEPTANCE_CRITERIA.md) (universal bar + its areas) · CI fully green incl. coverage floors ([TESTING.md](TESTING.md) §2) · airplane-mode pass of everything shipped so far · all registered themes + fil spot-pass · a working preview build installs and runs on the reference device ([PERFORMANCE.md](PERFORMANCE.md)) · docs synced (any divergence fixed per [CONTRIBUTING.md](CONTRIBUTING.md) §1) · the self-review checklist ([AI_INSTRUCTIONS.md](AI_INSTRUCTIONS.md) §4) passes · milestone demo note written (what to try, known follow-ups).

## M0 — Foundation

**Deliverables:** Expo project scaffolded per [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)/[FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md); TS strict + ESLint boundaries + Prettier + CI pipeline ([CONTRIBUTING.md](CONTRIBUTING.md) §4); theme engine (token contract, light/dark theme files, registry, ThemeProvider, live switch — [THEME_GUIDE.md](THEME_GUIDE.md)); i18n initialized with en/fil skeletons; Expo Router shell with 5-tab skeleton; dev builds on both platforms; store/RevenueCat/Sentry accounts opened (config stubs).
**DoD extras:** `npm ci && npm start` works per [DEVELOPER_SETUP.md](DEVELOPER_SETUP.md) on a clean machine; lint catches a planted boundary violation and a planted hex literal.
**Testing:** token snapshot tests; CI proves itself by failing a planted error.

## M1 — Data core

**Deliverables:** full Drizzle schema per [DATABASE_DESIGN.md](DATABASE_DESIGN.md) §5–6; MigrationRunner + migration #1; repositories with base helpers (updated_at, soft-delete filters); seed system ([BUSINESS_RULES.md](BUSINESS_RULES.md) §3 + [HEALTH_SCORE.md](HEALTH_SCORE.md) §4 weights); `lib/` (uuid, result, log, format, dates, csv); test fixtures (small/large/hostile); zip benchmark spike (ADR-018).
**DoD extras:** migration test rig proves a populated v0 DB upgrades losslessly; EXPLAIN checks pass on large fixture ([SQLITE_GUIDE.md](SQLITE_GUIDE.md) §6).
**Testing:** repository CRUD + soft-delete + purge; formatter table tests; CSV hostile fixtures.

## M2 — Garage & onboarding

**Deliverables:** MotorcycleService (create w/ default schedules per drivetrain, edit, archive, delete cascade); garage/profile/add-edit screens (S-01/02/03); onboarding S-00a–e incl. baseline wizard + notification permission ask (permission only — planner comes in M4); active-bike store + switcher; nickname uniqueness; photo capture/import.
**Testing:** flow test F-1, F-11, F-12; drivetrain matrix unit tests; component tests for S-01/02.

## M3 — Maintenance core (the product's heart)

**Deliverables:** OdometerService (validation, corrections, meter offset ADR-009) + S-25/S-25b; ScheduleService (intervals, baselines, custom components) + S-13; StatusService + due ratios; MaintenanceService with transactional cascade ([DATA_FLOW.md](DATA_FLOW.md) §3–4); full log form S-12 + **Quick Log S-12q**; component detail S-11; maintenance overview S-10; history S-14 (paged); HealthScoreService + HealthRing + Dashboard S-04 (minus reminder bell content).
**DoD extras:** Quick Log hallway-timed ≤ 10 s median; kill-test mid-save leaves no partial state; [HEALTH_SCORE.md](HEALTH_SCORE.md) §7 vectors green.
**Testing:** the largest unit surface ([TESTING.md](TESTING.md) §4 business-rule + score lists); flow tests F-2, F-5.

## M4 — Reminders

**Deliverables:** ReminderPlanner (full spec matrix) + NotificationScheduler adapter + `scheduled_notifications`; re-plan wiring into the cascade; Reminders list S-05 + bell; notification settings S-31; deep links to Quick Log; dev "fire in 2 min" override.
**DoD extras:** device-real: fires at (approximately) the set time, deep-links correctly, respects quiet hours, and recovery paths verified per [NOTIFICATION_ENGINE.md](NOTIFICATION_ENGINE.md) §9a (Android reboot → app open restores plan; iOS persists across reboot) — on stock Android, one OEM-skinned Android, iOS.
**Testing:** planner matrix units; flow test F-3; manual device protocol recorded.

## M5 — Money

**Deliverables:** FuelService + S-21 + fuel segment; ExpenseRepository union (ADR-021) + S-23 + expenses segment; MonthBarChart (chart standards per [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) §3); StatisticsService + S-28; dashboard month card.
**Testing:** fuel-span/statistics unit lists; flow F-4; chart component tests incl. slot stability + labels.

## M6 — Documents

**Deliverables:** DocumentService (EXIF strip, compression, private storage) + S-26/S-27 (camera/library/PDF, viewer); expiry fields + badges; planner extension for document expiry + dashboard warnings; plate-month hint (config).
**Testing:** flow F-7; adapter-contract tests (EXIF/compression); expiry planner units.

## M7 — Repairs & experience polish

**Deliverables:** RepairService + S-15/S-16 + timeline integration + follow-up prompt (F-6); empty states everywhere per [SCREEN_SPECIFICATIONS.md](SCREEN_SPECIFICATIONS.md); a11y sweep (labels, targets, 130%, reduced motion); animation inventory ([ANIMATION_GUIDE.md](ANIMATION_GUIDE.md)); nudge cards; fil string completion pass.
**Testing:** flow F-6; a11y checklist per screen recorded; both-themes screenshot review.

## M8 — Data safety

**Deliverables:** BackupService/RestoreService exactly per [BACKUP_RECOVERY.md](BACKUP_RECOVERY.md) §3–4 + S-32; backup reminder type; ExportService (4 CSVs + PDF report) + S-35; delete-all-data (S-33); CleanupService purge job; **string freeze** at exit.
**DoD extras:** round-trip equality on large fixture incl. photos; all §5 failure cases produce their messages and roll back; PDF on 500-record fixture ≤ 5 s.
**Testing:** flows F-9, F-10; hostile-archive suite; export golden files.

## M9 — Pro, hardening, release

**Deliverables:** EntitlementService + RevenueCat + paywall S-34 + restore + read-only-extra-bikes edge; Sentry wiring per [LOGGING_GUIDE.md](LOGGING_GUIDE.md); privacy screen S-33 complete; perf hardening to budgets; store listings (en/fil), data-safety forms; fil native review; full release checklist ([RELEASE_PROCESS.md](RELEASE_PROCESS.md) §3) → **1.0.0 staged rollout**.
**DoD extras:** sandbox purchase/restore both stores; airplane-Pro pass; crash-free monitoring live.
**Testing:** flow F-8; entitlement edge units; complete manual E2E checklist ([TESTING.md](TESTING.md) §7).

## Post-release R — stabilization (not a feature milestone)

Rollout watching, crash triage, review-response loop, Maestro E2E automation bring-up, backlog grooming for Phase-2 gate ([PRODUCT_REQUIREMENTS.md](PRODUCT_REQUIREMENTS.md) §1).
