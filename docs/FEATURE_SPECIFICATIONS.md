# FEATURE_SPECIFICATIONS.md — Functional Specification of Every Feature

> **Owns:** what each feature does, its fields, and validation rules. **Does not own:** screen layout/states ([SCREEN_SPECIFICATIONS.md](SCREEN_SPECIFICATIONS.md)), formulas and interval math ([BUSINESS_RULES.md](BUSINESS_RULES.md), [HEALTH_SCORE.md](HEALTH_SCORE.md)), notification timing ([NOTIFICATION_ENGINE.md](NOTIFICATION_ENGINE.md)), storage schema ([DATABASE_DESIGN.md](DATABASE_DESIGN.md)). Requirement IDs (R-xx) map to [PRODUCT_REQUIREMENTS.md](PRODUCT_REQUIREMENTS.md).

## 1. Conventions used below

- **Required fields** are marked ●; all others optional. Optional means the record saves without it — never block a save on nice-to-have data ([UI_UX_GUIDELINES.md](UI_UX_GUIDELINES.md) §3).
- Money fields accept `0.00`–`9,999,999.99` pesos, stored as integer centavos.
- Odometer fields accept integers `0`–`999,999` km and are validated against the bike's odometer rules ([BUSINESS_RULES.md](BUSINESS_RULES.md) §6).
- Dates: no future dates for completed events (maintenance/fuel/repair/expense); future dates allowed only for expiry fields.
- Every create/edit/delete is instant and local (no network); deletes are soft deletes with a 5-second undo snackbar ([UI_UX_GUIDELINES.md](UI_UX_GUIDELINES.md) §5).

---

## 2. Motorcycle Profile (R-01)

**Purpose:** the identity record everything else hangs on.

**Fields:**
| Field | Rules |
|---|---|
| Nickname ● | 1–30 chars; unique per garage (case-insensitive); default suggestion "brand model" |
| Brand ● | Picker from common PH brands (Honda, Yamaha, Suzuki, Kawasaki, Kymco, SYM, Rusi, TVS, Other) + free text when Other; 1–30 chars |
| Model ● | Free text 1–40 chars (Phase 2 replaces with model DB picker, R-33) |
| Year | 1980–current year+1 |
| Drivetrain type ● | `cvt` / `chain` / `other`; drives component set ([BUSINESS_RULES.md](BUSINESS_RULES.md) §2); pre-selected `cvt` (most common PH case); changing later re-gates components but never deletes history (§5.5) |
| Photo | Camera or library; stored per [SECURITY.md](SECURITY.md) §4; placeholder illustration otherwise |
| Plate number | ≤ 8 chars, uppercased; used for registration-month hint ([BUSINESS_RULES.md](BUSINESS_RULES.md) §8) |
| VIN, Engine number | Free text ≤ 20 chars each |
| Purchase date | ≤ today |
| Purchase price | Money |
| Current odometer ● | Integer km; becomes the first `odometer_logs` entry |

**Behavior:** creating a bike auto-creates its default maintenance schedules per drivetrain ([BUSINESS_RULES.md](BUSINESS_RULES.md) §3). Deleting a bike requires typed confirmation of the nickname, soft-deletes the bike and cascades soft-delete to all child rows, and cancels its notifications.

## 3. Garage — Multi-Motorcycle (R-02)

- Garage list shows every non-deleted bike: photo, nickname, plate, current odometer, Health Score chip.
- One bike is always the **active bike** (persisted in `app_settings`); all tab content is scoped to it. Switcher in the Home header and Garage screen.
- Free tier: max 2 bikes; adding a 3rd opens the Pro paywall ([PREMIUM_SYSTEM.md](PREMIUM_SYSTEM.md) §3). Archiving does not free a slot (count = non-deleted bikes) — prevents limit gaming.
- Bikes can be archived (hidden from switcher, excluded from reminders/notifications, visible under "Archived" in Garage; reversible).

## 4. Dashboard (R-03)

Per active bike, in order: Health Score hero (score, band label, color ring — display spec [SCREEN_SPECIFICATIONS.md](SCREEN_SPECIFICATIONS.md) S-04); current odometer with "Update" affordance (§6.4); **Next maintenance** list — top 5 schedules sorted by urgency (due ratio desc), each with status color, remaining km *and* days; **This month** expense summary (total + top 2 categories, from the unified expense view §9); overdue document warnings (registration/insurance within 30 days of expiry or expired). Empty states per S-04.

## 5. Component Maintenance Tracking (R-04)

**Purpose:** each component has its own interval logic and status.

- 5.1 **Component set:** the canonical 22-value enum and per-drivetrain applicability matrix live in [BUSINESS_RULES.md](BUSINESS_RULES.md) §2. UI shows localized display names ([LOCALIZATION.md](LOCALIZATION.md)).
- 5.2 **Schedules:** each applicable component gets a `maintenance_schedules` row on bike creation with default `interval_km`/`interval_months` ([BUSINESS_RULES.md](BUSINESS_RULES.md) §3). Users can edit intervals (km 100–100,000; months 1–120; at least one required), disable a schedule (no reminders, excluded from Health Score), or add **custom** components (name ≤ 30 chars, own intervals; unlimited, free).
- 5.3 **Status:** every enabled schedule shows green/yellow/red from the due ratio ([BUSINESS_RULES.md](BUSINESS_RULES.md) §4) plus "in X km / in Y days" remaining text (whichever dimension is nearer governs).
- 5.4 **Baseline:** a schedule with no history shows "Not set up — when was this last done?" and offers: enter last-done odometer+date, "just serviced today", or "skip" (excluded from score until set; [HEALTH_SCORE.md](HEALTH_SCORE.md) §5).
- 5.5 **Drivetrain change:** newly inapplicable components' schedules are disabled (not deleted); history remains; newly applicable ones are created with defaults.
- 5.6 **Component detail** view: current status, interval config, full history of that component's records, per-component stats (total spent, average interval actually achieved).

## 6. Maintenance Logging (R-05, R-12)

- 6.1 **Full log form:** component ● (pre-selected when entered from a component), date ● (default today), odometer ● (default current), cost, brand/product, quantity, service type where applicable (`replace`/`clean`/`adjust` — see [BUSINESS_RULES.md](BUSINESS_RULES.md) §2 for which components support which), notes ≤ 500 chars, photo (receipt). Component-specific detail fields (oil viscosity, tire tread %, battery voltage…) are defined in [BUSINESS_RULES.md](BUSINESS_RULES.md) §5 and appear only for that component, below a "Details" divider.
- 6.2 **Quick Log (the ≤ 10 s promise):** from the Log tab or a reminder notification: component pre-selected (or top urgency), date = today, odometer pre-filled with the projected current reading ([NOTIFICATION_ENGINE.md](NOTIFICATION_ENGINE.md) §4, rounded to 10 km) **shown with an "estimated" badge until the user edits it** — saving with the badge visible is still a deliberate confirmation (the value is user-asserted, and monotonicity validation §[BUSINESS_RULES.md](BUSINESS_RULES.md) 6.2 guards gross errors; the badge exists so the projection is never mistaken for a meter read-out). Cost keypad with last-used cost pre-filled, brand defaulted to last-used for that component. One tap on "Save" completes. Everything else editable later.
- 6.3 **Effects of saving:** inserts `maintenance_records`; inserts an `odometer_logs` entry (source `maintenance`); updates the schedule anchor; recalculates status + Health Score; re-plans notifications ([NOTIFICATION_ENGINE.md](NOTIFICATION_ENGINE.md) §5); appears in unified expenses if cost > 0. Multi-component service visits: user can chain "Log another for this visit" which keeps date/odometer.
- 6.4 **Mileage log / odometer update (R-12):** single-field modal, big keypad. Validations and correction flow (typo fixes, meter replacement) per [BUSINESS_RULES.md](BUSINESS_RULES.md) §6. Saving inserts `odometer_logs` (source `manual`), updates the cached current odometer, recalculates every schedule status, and re-plans notifications.
- 6.5 Records are editable and soft-deletable; both trigger the same recalculation cascade. Editing an odometer-bearing record re-validates odometer monotonicity ([BUSINESS_RULES.md](BUSINESS_RULES.md) §6.3).

## 7. Maintenance History (R-06)

Per bike: reverse-chronological timeline of maintenance records **and** repairs (visually distinct), grouped by month, each entry showing component/title, date, odometer, cost. Filter by component and by year. Infinite scroll with paging ([PERFORMANCE.md](PERFORMANCE.md) §5). Tapping opens detail with edit/delete. The PDF export of this timeline is specified in [EXPORT_IMPORT.md](EXPORT_IMPORT.md) §4.

## 8. Maintenance Reminders (R-07)

Functional surface only — timing/scheduling logic lives in [NOTIFICATION_ENGINE.md](NOTIFICATION_ENGINE.md):
- Reminders exist for: schedule due (km-projected and time-based), overdue nags, and document expiry (registration/insurance).
- Notification tap deep-links to Quick Log pre-filled for that component (or Documents for expiry).
- A **Reminders list** (Home header bell) shows every upcoming/overdue item across all non-archived bikes with per-item snooze (1 week) and "mark done" (opens Quick Log).
- Per-schedule mute, global quiet hours, and fire-time setting in Settings (S-31).

## 9. Expense Tracker (R-08)

- **Unified expense view:** all money events across sources — fuel logs, maintenance records, repairs, and standalone expenses — in one list/report. Derived category mapping (fuel→`fuel`; maintenance by component: engine/gear oil→`oil`, tires→`tires`, else→`service`; repairs→`repair`) is specified in [BUSINESS_RULES.md](BUSINESS_RULES.md) §9 and computed at read time (never duplicated rows — single source of truth).
- **Standalone expenses:** category ● (`registration`, `insurance`, `parking`, `accessories`, `washing`, `other` — plus `fuel`/`oil`/`tires`/`service`/`repair` allowed manually with a gentle "usually logged in its own tab" hint), amount ●, date ●, notes, photo.
- **Views:** current month total (dashboard), monthly list, 6-month bar graph by category (chart spec [SCREEN_SPECIFICATIONS.md](SCREEN_SPECIFICATIONS.md) S-22), per-bike and all-bikes toggle.

## 10. Fuel Tracker (R-09)

- **Log fuel:** liters ● (0.1–99.99), total cost ● (or price/L with auto-compute of the other), odometer ● , date ● (default today), station (last-used pre-fill + common PH chains picker: Petron, Shell, Caltex, Phoenix, Seaoil, Cleanfuel, Unioil, Other), full-tank flag (default on), notes.
- **Computed:** price/L; per full-to-full span: km driven, L/100km and km/L; rolling averages; cost/km; monthly fuel spend. All formulas in [BUSINESS_RULES.md](BUSINESS_RULES.md) §7.
- Saving inserts an `odometer_logs` entry (source `fuel`) and triggers the same recalculation cascade as §6.3.

## 11. Documents (R-10)

- Types: `orcr`, `insurance`, `license`, `warranty`, `receipt`, `invoice`, `other`. License attaches to the garage (rider-level, `motorcycle_id` null); others attach to a bike.
- Add via camera, photo library, or file picker (PDF). Fields: type ●, title ● (defaulted from type), file ●, expiry date (enabled for `orcr`, `insurance`, `license`; drives reminders per [BUSINESS_RULES.md](BUSINESS_RULES.md) §8), notes.
- Viewer: full-screen image (pinch-zoom) or PDF; share/export via system sheet; storage/privacy rules in [SECURITY.md](SECURITY.md) §4.
- List grouped by bike then type, expiring-soon badge (≤ 30 days), expired badge.

## 12. Service History / Repair Log (R-11)

Unplanned fixes, separate from scheduled maintenance: title ● (≤ 60 chars), date ●, odometer, problem description, diagnosis, solution, shop name, cost, photos (≤ 3), notes. Appears in the history timeline (§7) and unified expenses (§9). Does **not** touch schedule anchors (a brake repair is not a brake-pad interval reset — unless the user also logs the component, which Quick Log offers as a follow-up prompt: "Did this replace a tracked component?").

## 13. Statistics (R-13)

Per bike and all-bikes aggregate; all definitions in [BUSINESS_RULES.md](BUSINESS_RULES.md) §9:
- Totals: km tracked, maintenance spend, fuel spend, repair spend, overall spend, record counts (e.g., number of oil changes).
- Averages: monthly spend (trailing 12 months), cost/km (spend ÷ km in same window), fuel consumption.
- Cost-of-ownership: lifetime spend (+ purchase price toggle).
- Time-series: 12-month stacked bar of spend by category. Chart standards: [SCREEN_SPECIFICATIONS.md](SCREEN_SPECIFICATIONS.md) S-28.

## 14. Health Score (R-14)

Displayed on Dashboard (hero), Garage cards (chip), and component detail (per-item contribution). Tapping the score opens an explanation sheet listing each scored item, its status, and its effect — transparency is required, the score must never feel arbitrary. Formula, weights, bands, and worked examples live **only** in [HEALTH_SCORE.md](HEALTH_SCORE.md).

## 15. Backup, Restore, Export (R-15, R-16)

User-facing entry points in More → Backup and More → Export. Complete specs: [BACKUP_RECOVERY.md](BACKUP_RECOVERY.md) (archive format, restore safety) and [EXPORT_IMPORT.md](EXPORT_IMPORT.md) (CSV columns, PDF report layout). Monthly backup reminder notification per [NOTIFICATION_ENGINE.md](NOTIFICATION_ENGINE.md) §7.

## 16. Motrack Pro (R-17)

Purchase surface (paywall), restore purchases, and gate behavior: [PREMIUM_SYSTEM.md](PREMIUM_SYSTEM.md). The only MVP gate is the 2-bike limit (§3 above).

## 17. Onboarding (R-19)

First run: language select (device-guessed) → one-screen value promise → add first bike (§2 short form: nickname/brand/model/drivetrain/odometer only) → baseline wizard for the top-weight applicable components (engine oil, brake pads front/rear, tires front/rear — "when was your last oil change?" etc., skippable; [USER_FLOWS.md](USER_FLOWS.md) F-1) → notification permission request **with context** ("so we can remind you before things are due") → land on Dashboard. Under 3 minutes; skippable at every step except bike creation. Flow detail: [USER_FLOWS.md](USER_FLOWS.md) F-1.

## 18. Settings (R-20)

Language (en/fil), theme (system/light/dark), notification preferences (global toggle, fire time, quiet hours, per-type toggles), backup & restore entry, export entry, Pro status/purchase/restore, data & privacy (crash-report opt-out, delete-all-data with typed confirmation), about (version, licenses, privacy policy, terms). Screen spec: [SCREEN_SPECIFICATIONS.md](SCREEN_SPECIFICATIONS.md) S-30–S-33.
