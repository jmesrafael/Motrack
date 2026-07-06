# ACCEPTANCE_CRITERIA.md — Definition of Done Per Feature Area

> **Owns:** the verifiable acceptance criteria gating each requirement (R-xx from [PRODUCT_REQUIREMENTS.md](PRODUCT_REQUIREMENTS.md)). The universal bar (§2) applies to everything; per-area criteria add to it. Verification method abbreviations: **U** unit test ([TESTING.md](TESTING.md) §4), **C** component/flow test (§5–6), **M** manual device checklist (§7).

## 1. How to use

A task ([TASK_BREAKDOWN.md](TASK_BREAKDOWN.md)) is accepted when its area's criteria pass at the stated verification level. Criteria are written to be falsifiable — "works" is never a criterion.

## 2. Universal bar (every feature, every screen)

- Functions per its owning spec doc; zero deviations without doc update. (C/M)
- Full airplane-mode operation. (M + flow tests with no network fakes)
- Both themes render correctly; a11y: labels, 44 pt targets, 130% type, reduced motion. (C/M)
- en + fil complete (CI parity check); formatted units per [LOCALIZATION.md](LOCALIZATION.md) §5. (C)
- Empty/loading/error states implemented per [SCREEN_SPECIFICATIONS.md](SCREEN_SPECIFICATIONS.md). (C)
- Perf budgets met on reference device ([PERFORMANCE.md](PERFORMANCE.md)). (M)
- No data loss in any exercised path; destructive actions confirmed/undoable. (U/C/M)

## 3. Per-area criteria (selected must-pass observables)

### Garage & profiles (R-01/02)
Create bike → default schedules exist per drivetrain matrix ([BUSINESS_RULES.md](BUSINESS_RULES.md) §2) (U) · nickname uniqueness enforced case-insensitively (U) · drivetrain change re-gates without deleting history (U) · 3rd bike on free tier → paywall, and after purchase → proceeds (C/M) · delete bike requires typed nickname, cascades soft-deletes, cancels its notifications (U/C).

### Dashboard & Health Score (R-03/14)
Score matches [HEALTH_SCORE.md](HEALTH_SCORE.md) §7 vectors exactly (U) · un-anchored → "—" + Finish setup (C) · next-maintenance list ordered by due ratio desc, top 5, correct colors at 0.79/0.80/0.99/1.00 boundaries (U/C) · explanation sheet lists every scored item with its contribution (C).

### Maintenance tracking & logging (R-04/05/06/12)
Quick Log completes in ≤ 3 taps from Log tab with pre-fills (odometer projection, last cost/brand) (C/M, timed ≤ 10 s median in hallway test) · save updates anchor + status + score + plan atomically — kill the app mid-save leaves no partial state (U on transaction; M kill-test) · odometer-lower entry offers exactly the three correction options ([BUSINESS_RULES.md](BUSINESS_RULES.md) §6.3) (U/C) · meter replacement preserves interval math via effective km (U: ADR-009 cases) · history paginates smoothly on large fixture (M) · editing/deleting recascades correctly (U).

### Reminders (R-07)
Planner output matches spec matrix (U) · notification arrives at approximately the fire time on device and deep-links to pre-filled Quick Log (M) · **recovery paths per [NOTIFICATION_ENGINE.md](NOTIFICATION_ENGINE.md) §9a**: after reboot + app open the plan is fully restored (Android), after a timezone change + app open times are corrected (M) · iOS: pending notifications persist across reboot (M) · quiet hours shift correctly across midnight (U) · overdue nags stop after 3 (U) · document expiry 30/7/1 (U/M) · disabling schedule/archiving bike cancels its pending notifications (U).

### Money: expenses & fuel (R-08/09)
Unified view = exact union mapping, no double counting when a maintenance record has cost (U) · liters/cost/price trio computes the third (U) · consumption only across full-tank spans incl. partial-fill summation (U: §7.2 cases) · month totals match SQL aggregate on large fixture (U) · charts follow slot assignments and show value labels (C).

### Documents (R-10)
Import strips EXIF/GPS (U on adapter fake contract + M spot-check) · files in app-private dir with UUID names; DB stores relative path (U) · expiry badges at ≤30 d and expired (C) · license attaches rider-level (U) · viewer zooms images and opens PDFs (M).

### Repairs (R-11)
Saves with minimal fields; appears in timeline distinct from maintenance; never re-anchors schedules unless follow-up log chosen (U/C).

### Statistics (R-13)
Every stat matches [BUSINESS_RULES.md](BUSINESS_RULES.md) §9 definitions computed independently on the large fixture (U) · "—" shown when window lacks ≥2 odometer readings (U/C).

### Backup/restore & export (R-15/16)
Round-trip restore = byte-equal user data (row-wise) incl. photos + settings minus excluded keys (U) · every failure case in [BACKUP_RECOVERY.md](BACKUP_RECOVERY.md) §5 shows its message and rolls back fully (U) · restore over data demands typed RESTORE and creates safety snapshot (C/M) · CSVs open clean in Excel/Sheets with BOM, correct columns, injection-guarded (U + M once) · PDF renders 500-record fixture paginated ≤ 5 s (M).

### Pro (R-17)
Gate exclusively via EntitlementService (code audit) · purchase/restore sandbox flows on both stores (M) · offline Pro stays Pro (M airplane) · refund edge → read-only extra bikes, zero data loss (U).

### Onboarding & settings (R-19/20)
New user → dashboard < 3 min with schedules anchored if wizard completed (M timed) · resume after kill mid-onboarding (C) · every setting applies immediately and persists (C) · delete-all wipes DB + files + notifications, verified empty relaunch (M).

## 4. Release-level acceptance

MVP ships when: all §3 areas pass · [FINAL_CHECKLIST.md](FINAL_CHECKLIST.md) inventory rows all green · release checklist done ([RELEASE_PROCESS.md](RELEASE_PROCESS.md) §3) · crash-free ≥ 99.5% through staged rollout.

## 5. Evolution

Phase-2 features add their sections here **before** implementation starts (spec-first, [CONTRIBUTING.md](CONTRIBUTING.md) §1).
