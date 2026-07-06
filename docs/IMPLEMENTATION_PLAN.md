# IMPLEMENTATION_PLAN.md — Strategy, Build Order, Risks

> **Owns:** the overall implementation strategy and rationale for the build order. Milestone gates: [MILESTONES.md](MILESTONES.md); task-level detail: [TASK_BREAKDOWN.md](TASK_BREAKDOWN.md); repo shape: [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md); go/no-go assessment: [IMPLEMENTATION_READINESS.md](IMPLEMENTATION_READINESS.md).

## 1. Strategy

**Foundation-first, then vertical slices, riskiest-integration early.**

1. **Foundation before features** (M0–M1): tooling, tokens, i18n, and the complete data core (schema/migrations/repositories) land first — every later slice depends on them, and the data core carries the constitution's hardest guarantee (zero-loss migrations).
2. **Vertical slices after that** (M2–M8): each milestone ships user-visible, fully *done* capability (spec + tests + offline + themes + i18n + a11y) rather than horizontal layers — per [DEVELOPMENT_RULES.md](DEVELOPMENT_RULES.md) rule 7 there are no "UI now, logic later" passes.
3. **The core loop gets priority:** bike → odometer → schedules → log → status/score → reminder is the product ([PRODUCT_VISION.md](PRODUCT_VISION.md) §4); it is complete by M4. Everything after (money, documents, repairs, safety, Pro) hangs off a working loop.
4. **Riskiest platform integrations early inside their milestone:** notifications (OEM Android quirks) are M4, not last; backup/restore (data safety) is M8 but its archive format is exercised by fixtures from M1.
5. **One milestone at a time; sequential by default.** Milestones end with the self-review gate in [MILESTONES.md](MILESTONES.md) §1 and a working build.

## 2. Build order & dependency graph

```
M0 Foundation ─→ M1 Data core ─→ M2 Garage & onboarding ─→ M3 Maintenance core ─→ M4 Reminders
                                                            │
                                                            ├─→ M5 Money (fuel/expenses/stats)
                                                            ├─→ M6 Documents
                                                            └─→ M7 Repairs & UX polish
M5–M7 (any order, parallelizable) ─→ M8 Data safety (backup/export) ─→ M9 Pro & release
```

M5/M6/M7 depend only on M3 (M6's expiry reminders also touch M4's planner — planned as an M6 task extending the planner). M8 last among features because it must round-trip **every** table. M9 wraps monetization + hardening + store submission.

## 3. Estimated complexity (relative, not calendar)

| Milestone | Size | Dominant cost |
|---|---|---|
| M0 Foundation | M | CI + dev-build plumbing |
| M1 Data core | **L** | schema fidelity, migration test rig, fixtures |
| M2 Garage & onboarding | M | onboarding UX quality |
| M3 Maintenance core | **XL** | odometer rules, cascade, Quick Log polish, Health Score |
| M4 Reminders | **L** | planner matrix + device-real verification |
| M5 Money | L | fuel math, union view, chart |
| M6 Documents | M | file handling, EXIF/compression |
| M7 Repairs & polish | M | a11y/empty-state sweep |
| M8 Data safety | **L** | restore algorithm safety |
| M9 Pro & release | M | store/IAP logistics |

## 4. Risk analysis & mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| OEM Android notification throttling (battery managers killing scheduled alarms) | Core promise fails silently | Device-real tests on common PH OEM (M4 gate); in-app Reminders list is the always-correct fallback surface; foreground re-plan self-heals ([NOTIFICATION_ENGINE.md](NOTIFICATION_ENGINE.md) §5) |
| Restore bug destroys data | Constitutional violation | M8 algorithm implemented exactly per [BACKUP_RECOVERY.md](BACKUP_RECOVERY.md) §4 (staging + snapshot + atomic swap), hostile-fixture tests before any UI |
| Quick-Log ≤ 10 s promise misses in practice | Differentiator lost | Hallway-timed at M3 gate; pre-fill quality (projection) tested with sparse-data fixtures |
| Interval defaults wrong for popular PH models (A-04) | Trust erosion | Ship editable defaults + "reset to default" visibility; collect feedback; Phase-2 model DB is the real fix |
| RevenueCat/store account setup lead time | M9 slip | Open store + RC accounts during M0; sandbox products created by M2 |
| Zip library choice fails 30 s budget (ADR-018 note) | Backup UX | Benchmark spike task in M1 (T-114) |
| fil translation quality | Localization credibility | Native-speaker review gate in M9 + string freeze at M8 ([RELEASE_PROCESS.md](RELEASE_PROCESS.md) §3.6) |
| Solo-dev review blind spots (A-15) | Quality | Cold self-review protocol ([CONTRIBUTING.md](CONTRIBUTING.md) §5) + CI gates + acceptance criteria as the objective bar |

## 5. What is explicitly not in this plan

Phase-2+ work (sync, scanners, AI, QR, workshops, fleet) — designed in the system docs' evolution sections, scheduled only after MVP validation ([PRODUCT_REQUIREMENTS.md](PRODUCT_REQUIREMENTS.md) §1 gates). No implementation code exists yet; this plan awaits the owner's go-ahead ([IMPLEMENTATION_READINESS.md](IMPLEMENTATION_READINESS.md)).
