# SCREEN_SPECIFICATIONS.md — Every Screen

> **Owns:** per-screen purpose, layout, components used, navigation, per-screen validation surfacing, and empty/loading/error states. **Does not own:** field lists & validation rules ([FEATURE_SPECIFICATIONS.md](FEATURE_SPECIFICATIONS.md)), component internals ([COMPONENT_LIBRARY.md](COMPONENT_LIBRARY.md)), visual tokens ([DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)), interaction principles ([UI_UX_GUIDELINES.md](UI_UX_GUIDELINES.md)), route file mapping ([FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md) §4).

## 0. Navigation shell

**Tab bar (5):** `Home` (S-04) · `Maintenance` (S-10) · `Log` (center, raised accent button → Log launcher sheet) · `Money` (S-22) · `More` (S-30). Tabs preserve their stack state. All content is scoped to the **active bike** except Garage, Reminders list, Documents (grouped), Statistics (toggle), and More.

**Global patterns (apply to every screen unless overridden):**
- **Loading:** skeleton placeholders (`SkeletonBlock`) matching final layout; never spinners-over-blank for local reads (< 100 ms budget, [PERFORMANCE.md](PERFORMANCE.md) §3 — skeletons realistically appear only on cold start).
- **Error:** local DB errors show `ErrorState` with retry + "report" ([ERROR_HANDLING.md](ERROR_HANDLING.md) §6); forms show inline field errors + a summarizing banner on submit attempt.
- **Empty:** every list screen defines an `EmptyState` (illustration + one-line explanation + primary CTA).
- **Offline:** no screen has an offline state in MVP — everything works; screens that touch network (paywall, crash-report toggle) show inline "requires internet" messaging only there.
- **Accessibility:** all interactive elements ≥ 44×44 pt, labeled for screen readers; dynamic type up to 130% without truncating critical data; contrast per [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) §6; full checklist [UI_UX_GUIDELINES.md](UI_UX_GUIDELINES.md) §8.
- **Back behavior:** Android hardware back = header back; unsaved form changes prompt a discard dialog ([UI_UX_GUIDELINES.md](UI_UX_GUIDELINES.md) §5).

Template per screen: **Purpose · Layout · Components · Navigation · Validation · States · A11y notes** (omitted rows = global patterns suffice).

---

## Onboarding

### S-00a Language
- **Purpose:** first-run language choice. **Layout:** logo, title, two large option cards (English / Filipino, device language pre-selected), Continue.
- **Navigation:** → S-00b. Re-entrant from Settings later (S-30).
- **A11y:** cards are radio-group semantics.

### S-00b Value promise
- **Layout:** illustration, one-sentence promise, "Add my motorcycle" primary button, footer link "I have a backup" → S-32 restore flow (F-9).

### S-00c Add first bike (short form)
- **Purpose:** minimum viable bike ([USER_FLOWS.md](USER_FLOWS.md) F-1). **Layout:** nickname, brand picker, model, drivetrain segmented control (`cvt` pre-selected, with plain-language captions "Automatic/scooter · Manual/chain"), odometer (`OdoInput`).
- **Validation:** per [FEATURE_SPECIFICATIONS.md](FEATURE_SPECIFICATIONS.md) §2; inline on blur, block on submit.
- **States:** cannot be skipped (the app is useless without a bike).

### S-00d Baseline wizard
- **Purpose:** anchor top-weight schedules ([USER_FLOWS.md](USER_FLOWS.md) F-1 step 4). **Layout:** one component per step — icon, "When was the last \[oil change\]?", choices: "About X km ago" (opens `OdoInput` delta), "On a date" (date picker), "Just done", "Don't know". Progress dots; "Skip all" in header.
- **Navigation:** → S-00e after last step or skip.

### S-00e Notifications permission
- **Layout:** illustration, "We'll remind you *before* things are due", benefits bullets, "Enable reminders" → OS prompt, "Maybe later" link. Either path → S-04.

---

## Garage & profile

### S-01 Garage
- **Purpose:** all bikes overview; switch/add/archive (R-02).
- **Layout:** list of `BikeCard` (photo, nickname, plate, odometer, `HealthChip`); active bike marked; "Archived" collapsed section; "+ Add motorcycle" bottom button (slot count shown on free tier: "2 of 2 used").
- **Navigation:** card tap → set active + go Home; card long-press/⋯ → S-03; add → S-02 (or S-34 paywall per F-8).
- **Empty:** unreachable (onboarding guarantees a bike) — still defined: CTA to S-02.

### S-02 Add/Edit motorcycle (full form)
- **Layout:** photo picker header, then fields per [FEATURE_SPECIFICATIONS.md](FEATURE_SPECIFICATIONS.md) §2 in two sections: "Basics" (nickname/brand/model/year/drivetrain/odometer) and "More details" (collapsed: plate, VIN, engine no., purchase date/price).
- **Validation:** inline; drivetrain change on edit shows info sheet (§5.5 consequences).
- **States:** edit mode shows Delete (typed-confirmation dialog) and Archive actions.

### S-03 Motorcycle profile
- **Purpose:** read view of profile + entry to edit; per-bike utilities (export PDF, archive).
- **Layout:** hero photo, identity block, purchase info, quick stats (age, total records, lifetime spend link → S-28), actions row.

---

## Home

### S-04 Dashboard (Home tab root)
- **Purpose:** per-bike snapshot (R-03).
- **Layout (scroll):** header (bike chip → switcher sheet, bell → S-05 with badge) · `HealthRing` hero (score, band label; tap → score explanation sheet, [FEATURE_SPECIFICATIONS.md](FEATURE_SPECIFICATIONS.md) §14) · odometer card (value, "as of date", Update → S-25) · document warnings banner (conditional) · "Next maintenance" top-5 `ScheduleRow`s (status color, remaining km/days; tap → S-11; swipe → Quick Log) · "This month" `StatCard` (expense total, top categories; tap → S-22) · setup nudge cards (un-anchored schedules, notifications disabled) when applicable.
- **Empty:** new bike, nothing anchored → Health ring shows "—" with "Finish setup" CTA → S-00d re-entry.
- **A11y:** Health ring has text alternative "Health score 82, Good".

### S-05 Reminders list
- **Purpose:** every upcoming/overdue item across non-archived bikes ([FEATURE_SPECIFICATIONS.md](FEATURE_SPECIFICATIONS.md) §8).
- **Layout:** sections Overdue / This week / Later; rows: bike badge + component + due text; actions: Log (→ S-12q), Snooze 1 week.
- **Empty:** "All caught up 🎉" illustration.

---

## Maintenance

### S-10 Maintenance overview (tab root)
- **Purpose:** all components' status for active bike (R-04).
- **Layout:** status summary strip (n overdue / n due soon) · `ScheduleRow` list sorted by urgency, disabled schedules grouped at bottom · "+ custom component" · header link → S-14 History.
- **Navigation:** row → S-11; row swipe → Quick Log.
- **Empty:** only if all disabled — CTA re-enable.

### S-11 Component detail
- **Layout:** status header (color, remaining km/days, last done) · interval config summary (Edit → S-13) · baseline prompt if un-anchored · per-component stats (total spent, real average interval) · history list of this component's records (tap → record detail/edit S-12).
- **States:** un-anchored → prominent baseline card ([FEATURE_SPECIFICATIONS.md](FEATURE_SPECIFICATIONS.md) §5.4).

### S-12 Log maintenance (full form) / record detail
- **Layout:** component picker (locked when contextual) · date · `OdoInput` · cost `MoneyInput` · service type segmented (where applicable) · "Details" divider → brand, quantity, component-specific fields ([BUSINESS_RULES.md](BUSINESS_RULES.md) §5) · notes · receipt photo.
- **Validation:** [FEATURE_SPECIFICATIONS.md](FEATURE_SPECIFICATIONS.md) §6.1 + odometer rules ([BUSINESS_RULES.md](BUSINESS_RULES.md) §6.3) surfaced inline with fix-it options.
- **States:** edit mode = same screen, delete in header (undo snackbar).

### S-12q Quick Log sheet
- **Purpose:** the ≤ 10 s path ([USER_FLOWS.md](USER_FLOWS.md) F-2). **Layout (bottom sheet):** component chip row (most-urgent pre-selected, horizontally scrollable) · odometer field (pre-filled projection with "estimated" badge that clears on edit — [FEATURE_SPECIFICATIONS.md](FEATURE_SPECIFICATIONS.md) §6.2, auto-focus) · cost field (last-used) · Save (full-width) · links: "Add details" → S-12, "Log another for this visit".
- **A11y:** sheet fully screen-reader navigable; keypad buttons labeled.

### S-13 Edit schedule
- **Layout:** interval km stepper+field, interval months stepper+field (≥ 1 required), enable toggle, "reset to default" (shows default value), for custom components: name + delete.
- **Validation:** ranges per [FEATURE_SPECIFICATIONS.md](FEATURE_SPECIFICATIONS.md) §5.2; warning sheet when setting far above defaults ("Manufacturer-typical is 1,500 km").

### S-14 Maintenance history
- **Layout:** filter chips (component, year) · month-grouped `TimelineItem`s (maintenance + repairs visually distinct) · export icon → S-35.
- **Empty:** "No history yet" + Log CTA. Paged loading ([PERFORMANCE.md](PERFORMANCE.md) §5).

### S-15 Log repair / S-16 Repair detail
- **Layout (S-15):** title, date, `OdoInput` (optional), problem, diagnosis, solution, shop, cost, photos (≤ 3), notes. Save → follow-up prompt (F-6).
- **S-16:** read view + edit/delete.

---

## Money

### S-22 Money (tab root)
- **Layout:** segmented `Expenses | Fuel` ·
  **Expenses segment:** month selector · total + `MonthBarChart` (6-month by category, dataviz per S-28 note) · unified expense list (derived + standalone rows, source icon; derived rows deep-link to their origin record) · "+ expense" → S-23.
  **Fuel segment:** consumption `StatCard`s (km/L, cost/km, month spend) · fuel log list · "+ fuel" → S-21.
- **Empty (per segment):** explainer + CTA.

### S-21 Log fuel
- **Layout:** liters / total cost / price-per-L trio (any two editable, third computed, [FEATURE_SPECIFICATIONS.md](FEATURE_SPECIFICATIONS.md) §10) · `OdoInput` · date · station picker · full-tank toggle (default on, help tooltip explains consumption math) · notes.
- **States:** after save, toast may show span consumption (F-4).

### S-23 Add/Edit expense
- **Layout:** category grid (`CategoryIcon`s, 11 categories) · amount `MoneyInput` (auto-focus) · date · notes · photo. Derived-category hint per [FEATURE_SPECIFICATIONS.md](FEATURE_SPECIFICATIONS.md) §9.

### S-25 Odometer update (modal) / S-25b Odometer log
- **S-25:** current reading + date caption · `OdoInput` big keypad · Save → recalculation summary sheet if items crossed thresholds (F-5).
- **Validation:** monotonicity rules with correction options ([BUSINESS_RULES.md](BUSINESS_RULES.md) §6.3–6.4).
- **S-25b:** chronological odometer entries with source icons; edit/delete entries (re-validation cascade).

---

## Documents

### S-26 Documents list (More → Documents)
- **Layout:** grouped by bike (+ "Rider" group for license) then type; `DocumentCard` (thumbnail, title, expiry badge: countdown ≤ 30 d amber, expired red) · "+" → add flow (F-7).
- **Empty:** explainer ("Keep OR/CR, insurance, receipts safe") + CTA.

### S-27 Document add/view
- **Add:** type picker → source (camera/library/file) → crop (images) → title/expiry/notes → Save.
- **View:** full-screen zoomable image or PDF viewer · share/export · edit metadata · delete (confirm).
- **A11y:** viewer supports screen-reader description via title/notes.

---

## Statistics

### S-28 Statistics (More → Statistics)
- **Layout:** bike scope toggle (active bike / all bikes) · totals `StatCard` grid (km, maintenance, fuel, repairs, overall, oil-change count) · averages row (monthly spend, cost/km, km/L) · 12-month stacked bar chart (spend by category) · cost-of-ownership card (purchase-price toggle).
- **Note:** all chart implementations must load the project chart standards before coding (see [COMPONENT_LIBRARY.md](COMPONENT_LIBRARY.md) `MonthBarChart` and the dataviz guidance referenced there).
- **Empty:** cards show "—" with "log data to see stats" caption.

---

## More & settings

### S-30 More (tab root)
- **Layout:** list: Garage · Documents · Statistics · Reminders · Export · Backup & Restore · **Motrack Pro** (status row: "Free — 2/2 bikes" or "Pro ✓") · Settings (language, theme, notifications) · Data & privacy · About.
- **Theme setting:** picker listing **System default** + every registered theme from the theme registry ([THEME_GUIDE.md](THEME_GUIDE.md) §5) — applies instantly on selection, persisted.

### S-31 Notification settings
- **Layout:** master toggle · fire time picker (default 08:00) · quiet hours range (default 21:00–07:00) · per-type toggles (maintenance due / overdue nags / document expiry / backup reminder) · per-schedule mutes live on S-13.
- **States:** OS permission denied → banner with "Open system settings" deep link.

### S-32 Backup & Restore
- **Layout:** last-backup card (date, size, "overdue" tint > 30 d) · Create backup (progress → share sheet) · Restore from file (validation → preview → typed `RESTORE` confirm) · auto-reminder toggle. Full behavior: [BACKUP_RECOVERY.md](BACKUP_RECOVERY.md), flow F-9.
- **Error states:** invalid/corrupt/newer-version archive messages per [BACKUP_RECOVERY.md](BACKUP_RECOVERY.md) §5.

### S-33 Data & privacy / About
- **Layout:** crash-report toggle ([PRODUCT_DECISIONS.md](PRODUCT_DECISIONS.md) §11) · privacy policy · terms · licenses · app version/build · **Delete all data** (typed `DELETE` confirm; wipes DB + files; cancels notifications; [SECURITY.md](SECURITY.md) §6).

### S-34 Pro paywall
- **Layout:** benefit list (unlimited bikes now; Phase-2 features "coming — included"), one-time price (from RevenueCat offering), Buy button, Restore purchases, legal links. Triggered contextually (F-8) or from S-30.
- **States:** offline → "requires internet" inline; purchase pending → loading; owned → success state. Full logic: [PREMIUM_SYSTEM.md](PREMIUM_SYSTEM.md) §5.

### S-35 Export
- **Layout:** "Service history PDF" (bike picker → preview → share) · CSV rows (Maintenance / Fuel / Expenses / Repairs; bike scope toggle) → share sheet. Spec: [EXPORT_IMPORT.md](EXPORT_IMPORT.md).

---

## Screen inventory checklist (for FINAL_CHECKLIST.md)

S-00a–e, S-01, S-02, S-03, S-04, S-05, S-10, S-11, S-12, S-12q, S-13, S-14, S-15, S-16, S-21, S-22, S-23, S-25, S-25b, S-26, S-27, S-28, S-30, S-31, S-32, S-33, S-34, S-35 — 28 screens/surfaces. Route mapping: [FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md) §4.
