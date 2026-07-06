# PRODUCT_REQUIREMENTS.md — Scope Boundaries (MVP / Phase 2 / Phase 3 / Out of Scope)

> The authoritative statement of **what is in which phase**. Functional detail of each feature lives in [FEATURE_SPECIFICATIONS.md](FEATURE_SPECIFICATIONS.md); this file only draws boundaries. Current standing policies: [PRODUCT_DECISIONS.md](PRODUCT_DECISIONS.md). Long-term direction: [FUTURE_ROADMAP.md](FUTURE_ROADMAP.md).

## 1. Phase definitions

| Phase | Definition | Backend? | Gate to next phase |
|---|---|---|---|
| **MVP (Phase 1)** | Fully offline, no accounts, complete single-user maintenance tracker | None | Launched on Play Store + App Store; success metrics trending ([PROJECT_MISSION.md](PROJECT_MISSION.md) §2) |
| **Phase 2** | Cloud sync + intelligence features; accounts optional | Supabase | MVP validated by retention; Pro conversion supports costs |
| **Phase 3** | Ecosystem: workshops, community, fleet admin | Supabase + services | Phase 2 sync proven stable at scale |
| **Long-term** | Multi-region platform, web, B2B | Expanded | — |

## 2. Requirement IDs

Every requirement has a stable ID (`R-xx`) used by [FEATURE_SPECIFICATIONS.md](FEATURE_SPECIFICATIONS.md), [ACCEPTANCE_CRITERIA.md](ACCEPTANCE_CRITERIA.md), and [TASK_BREAKDOWN.md](TASK_BREAKDOWN.md). IDs are never reused or renumbered.

## 3. MVP (Phase 1) — required for launch

| ID | Requirement | Spec |
|---|---|---|
| R-01 | Motorcycle profiles (photo, nickname, brand/model/year, plate, VIN/engine no. optional, purchase date/price, drivetrain type, current odometer) | [FEATURE_SPECIFICATIONS.md](FEATURE_SPECIFICATIONS.md) §2 |
| R-02 | Multi-motorcycle garage (free: 2 bikes; Pro: unlimited) | §3 |
| R-03 | Per-bike dashboard: odometer, Health Score, next-maintenance list w/ status colors, month expenses | §4 |
| R-04 | Component maintenance tracking for the full canonical component set (engine oil, gear oil, filters, spark plug, CVT set, chain set, brakes, coolant, battery, tires, custom) with per-component interval logic | §5 |
| R-05 | Maintenance logging incl. Quick Log ≤ 10 s fast path | §6 |
| R-06 | Maintenance history timeline per bike with costs | §7 |
| R-07 | Local maintenance reminders (km-projected + time-based + overdue + document expiry) | §8, [NOTIFICATION_ENGINE.md](NOTIFICATION_ENGINE.md) |
| R-08 | Expense tracker: 11 categories, monthly totals, simple trend graph | §9 |
| R-09 | Fuel tracker: liters/cost/odometer/station; cost-per-km, consumption, monthly fuel cost | §10 |
| R-10 | Document vault: photo/PDF storage for OR/CR, insurance, license, warranty, receipts, invoices, with expiry dates | §11 |
| R-11 | Repair log (problem/diagnosis/solution/cost), distinct from maintenance | §12 |
| R-12 | Mileage log: manual odometer updates recalculating all dependent schedules | §6.4 |
| R-13 | Statistics: totals (km, maintenance cost, fuel cost), monthly average, cost/km, per-bike and all-bikes | §13 |
| R-14 | Health Score per bike | [HEALTH_SCORE.md](HEALTH_SCORE.md) |
| R-15 | Backup + restore via local archive file | [BACKUP_RECOVERY.md](BACKUP_RECOVERY.md) |
| R-16 | CSV export (maintenance, fuel, expenses, repairs) + PDF service-history report | [EXPORT_IMPORT.md](EXPORT_IMPORT.md) |
| R-17 | Pro one-time purchase & entitlement gating (bike limit) | [PREMIUM_SYSTEM.md](PREMIUM_SYSTEM.md) |
| R-18 | English + Filipino localization; ₱; km; dark mode; system/light/dark setting | [LOCALIZATION.md](LOCALIZATION.md), [THEME_GUIDE.md](THEME_GUIDE.md) |
| R-19 | Onboarding: first-run flow to first bike + schedules in < 3 minutes | [USER_FLOWS.md](USER_FLOWS.md) F-1 |
| R-20 | Settings: language, theme, notification preferences, backup, about/legal, privacy controls | [SCREEN_SPECIFICATIONS.md](SCREEN_SPECIFICATIONS.md) S-30–S-33 |

**MVP quality bar (cross-cutting, also required):** offline completeness, migration safety, accessibility baseline, performance budgets, crash reporting — defined respectively in [OFFLINE_ARCHITECTURE.md](OFFLINE_ARCHITECTURE.md), [DATABASE_DESIGN.md](DATABASE_DESIGN.md) §8, [UI_UX_GUIDELINES.md](UI_UX_GUIDELINES.md) §8, [PERFORMANCE.md](PERFORMANCE.md), [LOGGING_GUIDE.md](LOGGING_GUIDE.md).

## 4. Phase 2 — premium/cloud (build only after MVP validation)

| ID | Requirement | Notes |
|---|---|---|
| R-30 | Supabase accounts (optional) + cross-device sync | [SUPABASE_SYNC_PLAN.md](SUPABASE_SYNC_PLAN.md) |
| R-31 | Cloud backup (automatic, encrypted) | Extends R-15 |
| R-32 | Receipt scanner (AI extracts cost/shop/date/parts) | Pro |
| R-33 | VIN scanner + model database (auto specs, oil capacity, recommended schedule) | Pro; model DB also improves default intervals |
| R-34 | AI Mechanic (symptom → likely causes, safety-framed) | Pro |
| R-35 | QR-code shareable read-only service history | Pro; needs backend-hosted share page |
| R-36 | Voice logging | Pro |
| R-37 | Smart notifications (context-aware phrasing) | Extends [NOTIFICATION_ENGINE.md](NOTIFICATION_ENGINE.md) |
| R-38 | Parts-life prediction | Pro |

## 5. Phase 3 — ecosystem

| ID | Requirement |
|---|---|
| R-50 | Workshop integration (mechanics update service records, upload invoices) |
| R-51 | Community (mechanic recommendations, DIY guides, tips) |
| R-52 | Fleet/business admin: dashboard across many bikes, employee assignment, fleet health/cost |

## 6. Explicitly OUT of scope

| Item | Status | Rationale |
|---|---|---|
| Ride/GPS tracking, routes | Permanently out unless strategy changes | Different product; big battery/permission cost ([PROJECT_MISSION.md](PROJECT_MISSION.md) §4) |
| Modification/parts-upgrade tracking, lap timing | Permanently out | Anti-persona feature ([USER_PERSONAS.md](USER_PERSONAS.md)) |
| Cars / trucks / e-bikes | Out through Phase 3 | Schema is motorcycle-shaped on purpose; revisit long-term only |
| Social login-gated MVP | Out — MVP has **no accounts** | Offline-first, PH data-privacy exposure minimization |
| Server push notifications in MVP | Out — local only | [PRODUCT_DECISIONS.md](PRODUCT_DECISIONS.md) §7 |
| In-app mechanic marketplace/payments | Out through Phase 3 | Regulatory + scope risk |
| Tablet-optimized / web UI | Out for MVP | Phone-first; web dashboard is long-term ([FUTURE_ROADMAP.md](FUTURE_ROADMAP.md)) |
| iPad-specific layouts | Out for MVP | Runs in phone-size compatibility mode |
| Multiple currencies / imperial units | Out for MVP | Config-layer ready, content later ([LOCALIZATION.md](LOCALIZATION.md) §7) |

## 7. Change control

Moving a requirement between phases is a product decision: record it in [DECISION_LOG.md](DECISION_LOG.md), update this file and [PRODUCT_DECISIONS.md](PRODUCT_DECISIONS.md) §14, and check [PREMIUM_SYSTEM.md](PREMIUM_SYSTEM.md) if gating changes.
