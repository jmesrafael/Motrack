# USER_FLOWS.md — Step-by-Step Flows for Core Tasks

> Ordered flows for the tasks that define the product. Screen references (S-xx) map to [SCREEN_SPECIFICATIONS.md](SCREEN_SPECIFICATIONS.md); feature behavior to [FEATURE_SPECIFICATIONS.md](FEATURE_SPECIFICATIONS.md). Each flow lists its happy path, then variants/edge paths. Flows are the basis for E2E tests ([TESTING.md](TESTING.md) §6).

## F-1 · First run → first bike (target < 3 min)

1. Launch → S-00a Language (device-language pre-selected; en/fil) → Continue.
2. S-00b Value screen (one sentence + illustration) → "Add my motorcycle".
3. S-00c Add bike (short form): nickname, brand, model, drivetrain (default `cvt`), current odometer → Save. Default schedules auto-created ([BUSINESS_RULES.md](BUSINESS_RULES.md) §3).
4. S-00d Baseline wizard: for the top-weight applicable components (engine oil, brake pads F/R, tires F/R — per [HEALTH_SCORE.md](HEALTH_SCORE.md) weights), ask "When was this last done?" → \[X km ago / date / Just done / Don't know\]. "Don't know" leaves the schedule un-anchored ([FEATURE_SPECIFICATIONS.md](FEATURE_SPECIFICATIONS.md) §5.4). Skippable as a whole.
5. S-00e Notification permission with context → OS prompt → (either answer) → Dashboard S-04.

**Variants:** decline notifications → app fully works; Settings shows a "reminders off" nudge card on Dashboard. Kill app mid-onboarding → resumes at last completed step (state in `app_settings`).

## F-2 · Quick Log an oil change (target ≤ 10 s, the core promise)

Entry: Log tab (center tab) → Quick Log sheet S-12q. Alternative entries: reminder notification tap (component pre-selected), component row swipe action "Log".

1. Sheet opens with: component = most-urgent schedule (or notification's component); date = today; odometer = projected current ([NOTIFICATION_ENGINE.md](NOTIFICATION_ENGINE.md) §4 projection), focused numeric field; cost = last-used for component.
2. User corrects odometer if needed (big keypad) → taps **Save**.
3. Confirmation toast with undo; schedule anchor + Health Score + notifications update instantly ([FEATURE_SPECIFICATIONS.md](FEATURE_SPECIFICATIONS.md) §6.3); sheet offers "Log another for this visit" (keeps date/odometer) and "Add details" (opens full form S-12 for the saved record).

**Variants:** entered odometer < last known → inline validation with correction options ([BUSINESS_RULES.md](BUSINESS_RULES.md) §6.3). No schedules set up → component picker opens first.

## F-3 · Respond to a maintenance reminder

1. Notification fires ("Oil change due in ~3 days — Click 125i, ~4,350 km") → tap.
2. App opens (cold-start budget: [PERFORMANCE.md](PERFORMANCE.md) §2) → Quick Log sheet pre-filled for that component (F-2 step 1).
3. Save → reminder cycle for that schedule resets.

**Variants:** "Not yet" (sheet dismiss) → item stays in Reminders list S-05; snooze 1 week from there. Notification arrives during quiet hours → deferred per [NOTIFICATION_ENGINE.md](NOTIFICATION_ENGINE.md) §6.

## F-4 · Log fuel

1. Log tab → "Fuel" → S-21: liters + total cost (either two of liters/cost/price-per-L; third computed), odometer pre-filled projection, station pre-filled last-used, full-tank on.
2. Save → consumption stats update ([BUSINESS_RULES.md](BUSINESS_RULES.md) §7); toast shows computed km/L for the completed span when available ("42.3 km/L since last full tank").

## F-5 · Update odometer (mileage log)

1. Dashboard odometer card → "Update" → S-25 modal, big keypad, shows last reading + date.
2. Enter reading → Save → every schedule status recalculates; if any item crossed into yellow/red, a summary sheet lists what's now due ("Heads up: CVT cleaning due in 150 km").

**Variants:** reading below current → correction flow options: "typo in a past entry" (opens odometer log list S-25b to fix), "meter was replaced" (records meter-reset event, [BUSINESS_RULES.md](BUSINESS_RULES.md) §6.4).

## F-6 · Add a repair

Log tab → "Repair" → S-15 form (problem/diagnosis/solution/cost, [FEATURE_SPECIFICATIONS.md](FEATURE_SPECIFICATIONS.md) §12) → Save → follow-up prompt: "Did this replace a tracked component?" → optional chained Quick Log(s) sharing date/odometer.

## F-7 · Store a document + expiry reminder

1. More → Documents → "+" → pick type (e.g., insurance) → camera/library/file.
2. Crop/confirm → title defaulted → set expiry date → Save.
3. Expiry reminders auto-scheduled (30/7/1 days, [NOTIFICATION_ENGINE.md](NOTIFICATION_ENGINE.md) §7); document badge shows countdown at ≤ 30 days.

## F-8 · Add a second/third motorcycle

1. Garage S-01 → "Add motorcycle" → S-02 full form.
2. If free tier and 2 bikes exist → Pro paywall S-34 (one-time purchase or back). Purchase → RevenueCat flow → entitlement cached → add proceeds ([PREMIUM_SYSTEM.md](PREMIUM_SYSTEM.md) §5).
3. New bike gets default schedules + baseline wizard prompt.

## F-9 · Back up and restore (phone change)

**Backup:** More → Backup → "Create backup" → progress → share sheet (save to Drive/send to self). Archive format: [BACKUP_RECOVERY.md](BACKUP_RECOVERY.md) §3.
**Restore (new phone):** onboarding S-00b footer "I have a backup" (or More → Backup → Restore) → file picker → validation (version, integrity) → summary preview ("2 motorcycles, 143 records, 38 photos — replaces current data") → typed `RESTORE` confirmation when data exists → pre-restore safety snapshot → import → relaunch to Dashboard. Failure paths in [BACKUP_RECOVERY.md](BACKUP_RECOVERY.md) §5.

## F-10 · Export service history for resale

More → Export → "Service history PDF" → pick bike → preview → share sheet. Contents: [EXPORT_IMPORT.md](EXPORT_IMPORT.md) §4. (QR verified history is Phase 2, R-35.)

## F-11 · Sell/retire a bike

Garage → bike → Archive (reversible; excluded from reminders) — or Delete (typed nickname confirmation; soft-delete cascade; notifications cancelled; [FEATURE_SPECIFICATIONS.md](FEATURE_SPECIFICATIONS.md) §2). Suggested pre-delete: export PDF (F-10).

## F-12 · Switch active bike

Home header bike chip → switcher sheet (all non-archived bikes, Health Score chips) → select → all tabs now scoped to it. Last active persisted.
