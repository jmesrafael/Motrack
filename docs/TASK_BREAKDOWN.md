# TASK_BREAKDOWN.md — Dependency-Ordered Development Tasks

> **Owns:** the task-level decomposition of every MVP feature. Numbering: `T-<milestone><seq>` (stable, never reused). Effort: **S** ≤ ½ day · **M** ≈ 1–2 days · **L** ≈ 3–5 days (single senior RN engineer). "Accept" = the governing acceptance-criteria area/doc; the universal bar ([ACCEPTANCE_CRITERIA.md](ACCEPTANCE_CRITERIA.md) §2) always applies. Within a milestone, tasks are listed in dependency order; a task depends on all listed prerequisites being merged.

## M0 — Foundation

| ID | Task | Eff | Depends | Accept |
|---|---|---|---|---|
| T-001 | Scaffold Expo+TS project per [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md); strict tsconfig; npm scripts | M | — | builds run |
| T-002 | ESLint (boundaries, i18next, custom bans) + Prettier per [CODE_STYLE.md](CODE_STYLE.md) | M | T-001 | planted violations caught |
| T-003 | CI pipeline (all [CONTRIBUTING.md](CONTRIBUTING.md) §4 gates) | M | T-002 | red/green proven |
| T-004 | Theme engine: `ThemeTokens` contract + light/dark theme files + registry + ThemeProvider + makeStyles + mode setting + switch transition ([THEME_GUIDE.md](THEME_GUIDE.md)) | M | T-001 | per-theme snapshot + contrast tests; live switch preserves state |
| T-005 | i18n init (i18next + expo-localization), en/fil skeletons, parity CI check | M | T-001 | [LOCALIZATION.md](LOCALIZATION.md) §3 |
| T-006 | Router shell: 5 tabs + modal patterns + typed routes ([FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md) §1) | M | T-004 | navigation skeleton on device |
| T-007 | EAS profiles + dev builds both platforms ([DEVELOPER_SETUP.md](DEVELOPER_SETUP.md) §3) | M | T-001 | dev build installs |
| T-008 | Base components batch 1: Screen, Card, buttons, FormField, TextField, ListSection, Snackbar, ConfirmDialog, EmptyState, ErrorState, SkeletonBlock, Icon wrapper | L | T-004 | [COMPONENT_LIBRARY.md](COMPONENT_LIBRARY.md) tests |
| T-009 | Store/RC/Sentry accounts + config stubs (keys designed-public) | S | — | config compiles |

## M1 — Data core

| ID | Task | Eff | Depends | Accept |
|---|---|---|---|---|
| T-101 | `lib/`: uuid, result, events, log facade, dates, format (money/km/date) | M | T-001 | formatter/unit tables |
| T-102 | Drizzle schema for all 10 tables + indexes exactly per [DATABASE_DESIGN.md](DATABASE_DESIGN.md) §5–6 | L | T-101 | schema review vs doc, CHECKs enforced |
| T-103 | DB client + pragmas + MigrationRunner + migration #1 (ADR-022) | M | T-102 | startup gate; failure screen path stub |
| T-104 | Repository base (timestamps, soft-delete filter, withDeleted) + Settings/Motorcycle/Schedule repositories | M | T-103 | CRUD tests |
| T-105 | Remaining repositories (Maintenance, Repair, Expense+union, Fuel, Odometer, Document, Notification) | L | T-104 | union mapping tests (ADR-021) |
| T-106 | Seed system: intervals + weights + `schema_seed_version` upgrade logic | M | T-104 | [DATABASE_DESIGN.md](DATABASE_DESIGN.md) §9 (user rows never overwritten) |
| T-107 | Zod validation schemas for all domain inputs incl. per-component `details` (ADR-007) | L | T-101 | accept/reject tables ([TESTING.md](TESTING.md) §4) |
| T-108 | Fixture factories: small / large / previous-version / hostile archives | M | T-105 | fixtures build in CI |
| T-109 | Migration test rig (populated-DB upgrade assertions) | M | T-108 | zero-loss proof |
| T-110 | EXPLAIN QUERY PLAN dev checks on list/aggregate queries | S | T-105 | no table scans |
| T-111 | CSV writer (RFC-4180 + injection guard) | S | T-101 | hostile fixtures |
| T-112 | CleanupService (30-day purge, orphan files) | M | T-105 | purge order children-first |
| T-113 | Domain event emitter + store invalidation contract | S | T-101 | event tests |
| T-114 | Zip benchmark spike: fflate vs native module on large fixture (ADR-018) | S | T-108 | ≤ 30 s budget decision recorded (ADR note) |

## M2 — Garage & onboarding

| ID | Task | Eff | Depends | Accept |
|---|---|---|---|---|
| T-201 | MotorcycleService: create (default schedules per matrix), edit, drivetrain re-gate, archive, delete cascade | L | T-106, T-107 | Garage area criteria |
| T-202 | Garage store + active-bike selection + persistence | M | T-201, T-113 | F-12 |
| T-203 | PhotoPicker + image adapter (capture/import/compress) | M | T-008 | [PERFORMANCE.md](PERFORMANCE.md) §6 sizes |
| T-204 | S-02 add/edit form (RHF+Zod) + S-01 garage + S-03 profile | L | T-201–203 | screen specs + component tests |
| T-205 | Onboarding S-00a–e (language, value, short form, baseline wizard, permission ask) | L | T-204 | F-1 < 3 min; resume-after-kill |
| T-206 | Bike switcher sheet + AppHeader | M | T-202 | S-04 header spec |

## M3 — Maintenance core

| ID | Task | Eff | Depends | Accept |
|---|---|---|---|---|
| T-301 | OdometerService: monotonic validation, neighbor checks, corrections, meter offset (ADR-009) | L | T-105, T-107 | [BUSINESS_RULES.md](BUSINESS_RULES.md) §6 unit list |
| T-302 | S-25 odometer modal + S-25b log + recalculation summary sheet | M | T-301 | F-5 |
| T-303 | StatusService: due ratios, remaining text, status colors | M | T-301 | §4 boundary tests |
| T-304 | ScheduleService: interval edit, enable/disable, baseline, custom components + S-13 | M | T-303 | §5.2/5.4 criteria |
| T-305 | MaintenanceService transactional save/edit/delete + anchor updates + cascade | L | T-301, T-303, T-113 | kill-test; cascade units |
| T-306 | S-12 full log form incl. per-component detail fields | L | T-305, T-107 | field matrix per [BUSINESS_RULES.md](BUSINESS_RULES.md) §5 |
| T-307 | **S-12q Quick Log sheet** (pre-fills, chips, chained logging) | L | T-306 | ≤ 10 s hallway test; F-2 |
| T-308 | S-10 overview + S-11 component detail (stats, baseline card, per-component history) | L | T-303, T-304 | screen specs |
| T-309 | S-14 history timeline (paged, filters) | M | T-305 | large-fixture fling (M) |
| T-310 | HealthScoreService (pure fn + config weights) | M | T-303 | §7 vectors exact |
| T-311 | HealthRing/HealthChip + Dashboard S-04 (score hero, odo card, next-5, nudges) | L | T-310, T-206 | Dashboard criteria |

## M4 — Reminders

| ID | Task | Eff | Depends | Accept |
|---|---|---|---|---|
| T-401 | ReminderPlanner pure function (full spec matrix incl. projection, quiet hours, caps, overdue, snooze) | L | T-303 | planner unit matrix |
| T-402 | NotificationScheduler adapter + `scheduled_notifications` persistence + cancel-reschedule diff | M | T-401 | plan persisted/pruned |
| T-403 | Cascade wiring (serialized re-plan queue) + foreground/staleness trigger | M | T-402, T-305 | [DATA_FLOW.md](DATA_FLOW.md) §4 |
| T-404 | Deep links → pre-filled Quick Log / documents / backup | M | T-307 | F-3 |
| T-405 | S-05 reminders list (snooze, log) + bell badge | M | T-401 | screen spec |
| T-406 | S-31 notification settings + dev fire-override | M | T-402 | settings apply immediately |
| T-407 | Device-real verification protocol (stock, OEM, iOS; reboot) | M | T-402–406 | recorded results ([TESTING.md](TESTING.md) §7) |

## M5 — Money

| ID | Task | Eff | Depends | Accept |
|---|---|---|---|---|
| T-501 | FuelService (trio compute, spans, averages, daily-km rate feed) | L | T-301 | §7 unit list |
| T-502 | S-21 log fuel + station picker + full-tank UX | M | T-501 | F-4 |
| T-503 | Expense unified view queries + S-23 add expense + category grid | M | T-105 | union criteria; no double-count |
| T-504 | MonthBarChart (SVG, tokens, labels, a11y summary) | M | T-008 | chart standards ([DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) §3) |
| T-505 | S-22 Money tab (segments, month selector, lists) | M | T-502–504 | screen spec |
| T-506 | StatisticsService + S-28 (+ dashboard month card) | L | T-503, T-501 | §9 definitions on large fixture |

## M6 — Documents

| ID | Task | Eff | Depends | Accept |
|---|---|---|---|---|
| T-601 | DocumentService (import, EXIF strip, compress, private store, delete) | L | T-203 | [SECURITY.md](SECURITY.md) §4 contract tests |
| T-602 | S-26 list (grouping, expiry badges) + S-27 add/view (camera/library/PDF, zoom viewer) | L | T-601 | F-7 |
| T-603 | Expiry reminders: planner extension (30/7/1) + dashboard warnings + plate-month hint config | M | T-401, T-601 | expiry units + hint copy |

## M7 — Repairs & polish

| ID | Task | Eff | Depends | Accept |
|---|---|---|---|---|
| T-701 | RepairService + S-15/S-16 + timeline integration + follow-up component prompt | M | T-305 | F-6; no anchor side-effects |
| T-702 | Empty-state/nudge sweep across all screens | M | M3–M6 screens | per-screen specs |
| T-703 | Accessibility sweep (labels, targets, 130%, reduced motion) + fixes | L | all screens | [UI_UX_GUIDELINES.md](UI_UX_GUIDELINES.md) §8 checklist |
| T-704 | Animation inventory application ([ANIMATION_GUIDE.md](ANIMATION_GUIDE.md)) | S | T-703 | reduced-motion pass |
| T-705 | fil completion pass + Taglish review prep | M | string-complete screens | parity + readability |

## M8 — Data safety

| ID | Task | Eff | Depends | Accept |
|---|---|---|---|---|
| T-801 | BackupService (checkpoint, export JSON, files, manifest, zip) + progress | L | T-114, T-105 | round-trip fixtures |
| T-802 | RestoreService exactly per [BACKUP_RECOVERY.md](BACKUP_RECOVERY.md) §4 (staging, validation, snapshot, atomic swap, rollback) | **XL** | T-801, T-109 | all §5 failure cases |
| T-803 | S-32 backup/restore UI + onboarding restore entry + backup reminder type | M | T-802, T-401 | F-9 |
| T-804 | ExportService CSVs (4 domains) + S-35 | M | T-111, T-506 | golden files; Excel check |
| T-805 | PDF service-history report (expo-print template) | L | T-309 | [EXPORT_IMPORT.md](EXPORT_IMPORT.md) §4; 500-record ≤ 5 s |
| T-806 | Delete-all-data + S-33 data section | M | T-112 | verified empty relaunch |

## M9 — Pro & release

| ID | Task | Eff | Depends | Accept |
|---|---|---|---|---|
| T-901 | EntitlementService + RC adapter + cached flag + bike-limit gate in service | M | T-009, T-201 | gate-by-service only (audit) |
| T-902 | S-34 paywall + restore + read-only-extra-bikes edge state | M | T-901 | F-8; refund edge units |
| T-903 | Sentry wiring (deferred init, scrubbing, ring buffer) + crash toggle | M | T-101 | [LOGGING_GUIDE.md](LOGGING_GUIDE.md) rules |
| T-904 | Perf hardening pass to budgets on reference device | L | all | [PERFORMANCE.md](PERFORMANCE.md) §2–3/§7 |
| T-905 | Store assets, listings (en/fil), data-safety forms, privacy policy | M | T-903 | [SECURITY.md](SECURITY.md) §7 consistency |
| T-906 | fil native-speaker review + fixes (string freeze holds) | S | T-705 | reviewer sign-off |
| T-907 | Full release checklist + 1.0.0 staged rollout | M | all | [RELEASE_PROCESS.md](RELEASE_PROCESS.md) §3–4 |

**Coverage note:** every MVP requirement R-01…R-20 maps to tasks above (traceability table lives in [FINAL_CHECKLIST.md](FINAL_CHECKLIST.md) §2). New tasks get the next free number in their milestone; scope changes route through [PRODUCT_REQUIREMENTS.md](PRODUCT_REQUIREMENTS.md) §7.
