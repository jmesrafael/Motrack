# DECISION_LOG.md — Product Decision History + Assumptions Log

> **Owns:** the append-only history of **product/scope** decisions (D-xx) and the **Assumptions Log** (A-xx) — every place the KB inferred something the brief didn't state, awaiting owner approval or override. Technical decisions: [ARCHITECTURE_DECISIONS.md](ARCHITECTURE_DECISIONS.md). *Current* policy (the result of all this): [PRODUCT_DECISIONS.md](PRODUCT_DECISIONS.md) — when a D-entry changes policy, that file is refreshed in the same change.

## Part 1 — Decisions (D-xx, append-only)

| ID | Date | Decision | Rationale / source |
|---|---|---|---|
| D-001 | 2026-07-06 | Phase-2 backend target = **Supabase** | Owner-confirmed in planning Q&A; technical rationale ADR-020 |
| D-002 | 2026-07-06 | Monetization = **one-time lifetime purchase**, overriding the brief's RevenueCat-subscription assumption | **Owner-decided** in planning Q&A; RevenueCat retained for entitlement plumbing (ADR-013) |
| D-003 | 2026-07-06 | Working title **"Motrack"**, branding deferred | Owner: "focus on branding later"; token names kept brand-neutral ([DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)) |
| D-004 | 2026-07-06 | KB lives in `docs/`; docs are the constitution; doc-sync duty on every change | Owner-approved plan; process in [CONTRIBUTING.md](CONTRIBUTING.md) §1 |
| D-005 | 2026-07-06 | Navigation = 5 tabs with center Log action; single **active bike** context scoping tab content | Optimizes P1/P2 speed-to-log ([USER_PERSONAS.md](USER_PERSONAS.md)); alternatives (per-bike tabs, drawer) worse for one-handed quick logging |
| D-006 | 2026-07-06 | Free tier = full MVP with **2-motorcycle limit**; Pro = unlimited + Phase-2 features | Free tier must fully serve P1/P2 (1 bike) to build trust; P3 (3+ bikes) is the natural payer. Limit value is A-02 |
| D-007 | 2026-07-06 | Unified expense view is read-time union; manual expenses may use derived categories with a UI hint | No double-entry, no double-count (ADR-021); flexibility for cases like buying oil without logging service |
| D-008 | 2026-07-06 | Purchase price excluded from cost/km and monthly stats; shown via separate cost-of-ownership toggle | Mixing capex into running costs misleads P1's per-km business math |
| D-009 | 2026-07-06 | Crash reporting (Sentry) default-ON, anonymized, opt-out; **no product analytics in MVP** | Crash-free rate is a launch gate; analytics deferred to keep RA-10173 surface minimal (ADR-014) |
| D-010 | 2026-07-06 | No custom at-rest encryption in MVP (OS sandbox suffices); backup archives unencrypted with share-sheet warning | Honest threat-model call ([SECURITY.md](SECURITY.md) §3); revisit with privacy-lock feature (Phase-2 candidate) |
| D-011 | 2026-07-06 | Store-only distribution at launch (no direct APK) | Update path + integrity; revisit post-launch if PH demand shows |
| D-012 | 2026-07-06 | Phase-2 launch gate: formal RA-10173 legal review (DPO, NPC registration assessment, processor agreements) before any server-held personal data | MVP is low-exposure by design; server changes that ([SECURITY.md](SECURITY.md) §7) |
| D-013 | 2026-07-06 | Free-vs-Pro split for Phase-2 sync/cloud backup: **deliberately undecided** until real cost data exists | Placeholder noted in [PREMIUM_SYSTEM.md](PREMIUM_SYSTEM.md) §2; deciding now would be invented economics |
| D-014 | 2026-07-06 | No CSV *import* in MVP; imports = Motrack backup archives only; exports designed human-readable | Arbitrary-spreadsheet mapping is a support tarpit; own-format re-import path preserved ([EXPORT_IMPORT.md](EXPORT_IMPORT.md) §5) |
| D-015 | 2026-07-06 | Health Score excluded from the resale PDF | Point-in-time score without context misleads buyers; history speaks for itself |
| D-016 | 2026-07-06 | CODING_STANDARDS.md merged into [CODE_STYLE.md](CODE_STYLE.md) (one style authority) | Two style docs would drift; suggested structure explicitly allowed merging |
| D-017 | 2026-07-06 | Brief's competitor table corrected: Riderr/Revvo unverifiable; MotorManage/BikerGarage/MotoLogger confirmed; new entrants noted | Lightweight scan July 2026 ([PRODUCT_VISION.md](PRODUCT_VISION.md) §2) — per owner instruction, research kept minimal and decision-focused |
| D-018 | 2026-07-06 | Theme system expanded from binary light/dark to a **multi-theme engine**: complete per-theme token files + registry (unlimited future themes, zero component edits); token vocabulary extended (5-level status ramp, notification/premium/accent/secondary families); Health Score display bands refined from 4 to **5** (0–49 Critical split into 25–49 Poor + 0–24 Critical — display-only, formula unchanged) | **Owner-directed** "complete theme engine" requirement; architecture ADR-028; tokens [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md), bands [HEALTH_SCORE.md](HEALTH_SCORE.md) §6 |

## Part 2 — Assumptions Log (A-xx — **each needs owner approve/override**)

| ID | Assumption | Where used | Risk if wrong |
|---|---|---|---|
| A-01 | Min OS: Android 8.0 (API 26), iOS 15.1; reference device = 2 GB-RAM Android | [PRODUCT_DECISIONS.md](PRODUCT_DECISIONS.md) §2, [PERFORMANCE.md](PERFORMANCE.md) | Low — raise/lower floors pre-launch cheaply |
| A-02 | Free-tier bike limit = **2** | [PREMIUM_SYSTEM.md](PREMIUM_SYSTEM.md) §3 | Conversion economics; config-level change |
| A-03 | Daily-km fallback default 25 km/day, clamp [5, 300], 30→90-day windows | [BUSINESS_RULES.md](BUSINESS_RULES.md) §7.5 | Reminder timing accuracy; constants in config |
| A-04 | All default maintenance intervals ([BUSINESS_RULES.md](BUSINESS_RULES.md) §3) beyond the brief's oil 1,500 km/3 mo | Schedules seed | Medium — bad defaults erode trust; per-bike editable + Phase-2 model DB fixes properly |
| A-05 | Health Score weights (3/2/1 tiering per component) | [HEALTH_SCORE.md](HEALTH_SCORE.md) §4 | Score credibility; seed config |
| A-06 | "Partial score" indicator threshold = anchored < 60% of enabled | [HEALTH_SCORE.md](HEALTH_SCORE.md) §5 | Cosmetic |
| A-07 | Fuel span plausibility bounds: exclude km ≤ 0 or > 2,000 | [BUSINESS_RULES.md](BUSINESS_RULES.md) §7.2 | Stats accuracy edge |
| A-08 | PH plate-last-digit → renewal-month hint (1→Jan … 0→Oct), hint-only | [BUSINESS_RULES.md](BUSINESS_RULES.md) §8.2 | Hint mislabeled — verify current LTO rule before launch |
| A-09 | Pro launch price placeholder ₱499 (~$8.99) | [PREMIUM_SYSTEM.md](PREMIUM_SYSTEM.md) §1 | Pricing decision — store-console config, zero code impact |
| A-10 | iOS Family Sharing left enabled for the non-consumable | [PREMIUM_SYSTEM.md](PREMIUM_SYSTEM.md) §6 | Minor revenue |
| A-11 | Status thresholds (green <0.80, red ≥1.00) and item-score ramp constants (100→70→0, floor r=2) | [BUSINESS_RULES.md](BUSINESS_RULES.md) §4, [HEALTH_SCORE.md](HEALTH_SCORE.md) §3 | UX tuning; constants in one service |
| A-12 | Notification cadence: 7d/on-due (time), 3d/on-due (km-projected), overdue weekly ×3, quiet hours 21:00–07:00, fire 08:00, docs 30/7/1, caps 12/bike & 48 total | [NOTIFICATION_ENGINE.md](NOTIFICATION_ENGINE.md) | Annoyance vs missed-maintenance balance; all settings/config |
| A-13 | Component defaults: coolant + (cvt) oil filter auto-created **disabled**; rest per matrix | [BUSINESS_RULES.md](BUSINESS_RULES.md) §2 | Users of liquid-cooled bikes must enable coolant once |
| A-14 | Backup: 500 MB archive cap, 30-day soft-delete purge, monthly backup reminder, 1 internal safety snapshot | [BACKUP_RECOVERY.md](BACKUP_RECOVERY.md), [DATABASE_DESIGN.md](DATABASE_DESIGN.md) §7 | Operational tuning |
| A-15 | Team size ≈ solo dev/very small team (process docs sized accordingly) | [CONTRIBUTING.md](CONTRIBUTING.md) §5 solo protocol | Process re-weighting if team grows |
| A-16 | Onboarding baseline wizard covers top-weight components only (oil, brakes, tires) | [USER_FLOWS.md](USER_FLOWS.md) F-1 | Setup completeness vs onboarding length |
| A-17 | Values of the expanded token palette (secondary, accent, premium, 5-level status ramp, health/notification sets, dark-variant status colors) are provisional pre-branding choices, contrast-checked per [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) §6 | [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) §1–2 | Low — token re-value only (D-003 branding pass); names are the stable contract |

## Part 3 — Process

New D/A entries are appended with date + rationale; entries are never edited (corrections = new entries referencing old). When the owner approves/overrides an A-entry, record the verdict as a new D-entry and update the affected docs + [PRODUCT_DECISIONS.md](PRODUCT_DECISIONS.md).
