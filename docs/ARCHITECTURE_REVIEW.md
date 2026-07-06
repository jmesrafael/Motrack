# ARCHITECTURE_REVIEW.md — Independent Principal-Architect Review (KB v1.1)

> Conducted 2026-07-06 against the complete KB v1.0, adversarially — nothing was presumed correct for having been written. Every finding was either **fixed in the docs during this review** (logged in [FINAL_CHECKLIST.md](FINAL_CHECKLIST.md) §6, decisions in ADR-025/026/027) or is explicitly accepted below with rationale. This document reports; the corrected owning docs remain the constitution.

## 1. Executive summary

The architecture is sound and honestly the right shape for this product: a relational offline-first tracker with deterministic business rules, built by a small team, on the current mainstream Expo stack. The review found **no structural flaw requiring redesign**. It found one class of serious documentation defect — **over-promising OS behavior around notifications** — plus two implementation traps (backup memory, restore connection lifecycle) and a handful of unanswered engineer questions. All are fixed. The KB is fit to hand to an engineering team.

The two things that will actually determine success are not architectural: reminder *perceived* reliability on aggressive OEM Androids (mitigated, not solvable, without a server), and the credibility of default maintenance intervals (owner review of A-04 + Phase-2 model data).

## 2. Architecture strengths

- **Right-sized stack.** Expo managed + SQLite/Drizzle + Zustand + RHF/Zod is the boring-correct 2026 choice for this app; every rejected alternative (Watermelon/Realm, Redux, chart libs, custom fonts) was rejected for articulated, checkable reasons.
- **Determinism as a design principle.** Due ratios, Health Score, and the notification planner are pure functions with mandatory test vectors — the product's core logic is provable, not emergent.
- **The cascade** ([DATA_FLOW.md](DATA_FLOW.md) §4) gives one auditable path from any mutation to status/score/notifications; the planner's cancel-and-recompute model eliminates whole classes of drift/duplicate bugs.
- **Sync-compatibility as a contract, not a hope**: ADR-006 conventions + [SUPABASE_SYNC_PLAN.md](SUPABASE_SYNC_PLAN.md) §6's binding rules are the strongest rewrite-insurance in the KB.
- **Data-safety depth**: staged restore with safety snapshot and atomic swap; forward-only expand-migrate-contract migrations with populated-fixture tests; soft-delete + purge; effective-odometer model that survives meter replacement.
- **Honest scope control**: no accounts, no analytics, no network in MVP — the offline guarantee is true by construction, and the premium model can't strand data.

## 3. Architecture weaknesses (post-fix, residual)

1. **Local-only reminders are structurally best-effort** (ADR-025). Foreground re-plan self-heals, but a rebooted, unopened Android phone stays silent. Acceptable for MVP; R-37 push is the fix. This is the product's biggest real-world risk.
2. **Hand-rolled view-model invalidation** (events → store reloads) is more moving parts than Drizzle's `useLiveQuery` would be for simple screens. Kept deliberately: the event seam is exactly where the Phase-2 sync outbox attaches, invalidation is explicit/testable, and live queries re-run coarsely on any table change. Implementers may use `useLiveQuery` for trivially simple read-only lists, but stores remain the pattern of record ([STATE_MANAGEMENT.md](STATE_MANAGEMENT.md)).
3. **LWW conflict resolution on device clocks** (Phase 2) is crude but correctly scoped to single-owner garages, with delete-never-beats-edit and recomputed denormalizations as guards; the workshop-era upgrade path is pre-declared.
4. **JSON `details` column** (ADR-007) trades queryability for schema simplicity — verified that no specified feature queries inside it; the constraint must be re-checked whenever a feature wants to *filter* by detail fields.
5. **Solo-review process risk** (A-15): the machinery (CI gates, acceptance criteria, cold self-review) is as good as discipline makes it.

## 4. Risks

| Risk | Likelihood | Impact | Standing mitigation |
|---|---|---|---|
| OEM battery managers suppress reminders → trust loss | High on some brands | High | §9a honesty, foreground self-heal, in-app truth surfaces, M4 device matrix incl. OEM unit |
| Default intervals wrong for popular PH models (A-04) | Medium | Medium-high | Owner review now; editable per bike; Phase-2 model DB |
| Restore-path defect | Low (spec is precise) | Critical | T-802 sized XL, hostile fixtures, rollback-by-construction |
| Quick-Log promise misses in the field | Medium | Medium | M3 hallway gate; pre-fill quality tested on sparse data |
| Expo SDK churn during build | Medium | Low-medium | Pin at start, one upgrade window, E2E checklist after ([DEPENDENCY_GUIDE.md](DEPENDENCY_GUIDE.md) §3) |

## 5. Technical debt (accepted, documented)

Three denormalized caches (odometer, anchors) with single-writer discipline · derived-only Health Score (no history until snapshots, [HEALTH_SCORE.md](HEALTH_SCORE.md) §9) · in-house chart and CSV writer (~small, owned) · no automated E2E at launch (Maestro is post-release R) · quiet acceptance that `scheduled_notifications` is device-local operational state (never synced/backed up).

## 6. Recommended improvements (beyond fixes already applied)

1. **Now (M0):** pin the Expo SDK version in [DEPENDENCY_GUIDE.md](DEPENDENCY_GUIDE.md) the day the repo is created — "latest stable at project start" must become a number.
2. **M4:** include one aggressive-OEM device (e.g., low-end Xiaomi/Infinix common in PH) in the notification matrix; record per-OEM findings in the QA protocol (T-407).
3. **M8:** add a restore *duration* budget to [PERFORMANCE.md](PERFORMANCE.md) once T-114 benchmarks exist (create ≤ 30 s is specified; restore currently isn't — set it from measurement, not guesswork).
4. **Phase-2 design time:** revisit invalidation (weakness #2) with real screen count — if store boilerplate dominates, a local query layer swap is pre-authorized via the hook API seam ([STATE_MANAGEMENT.md](STATE_MANAGEMENT.md) §7).
5. **Owner action:** adjudicate the Assumptions Log (A-01…A-16) before M3 locks business-rule seeds.

## 7. Decisions changed by this review

| Change | Record |
|---|---|
| Notification guarantees corrected from "survives reboot / fires at time" to best-effort + foreground recovery, across 5 docs + new [NOTIFICATION_ENGINE.md](NOTIFICATION_ENGINE.md) §9a | **ADR-025** |
| Backup I/O must stream; restore ends in forced full JS reload | **ADR-026** |
| `SheetContainer` built on `@gorhom/bottom-sheet`; navigation peer deps + native date picker added to the register | **ADR-027** |
| Quick Log projected odometer carries an "estimated" badge until edited | [FEATURE_SPECIFICATIONS.md](FEATURE_SPECIFICATIONS.md) §6.2 |
| Odometer: per-row offset preserved on edit; created_at tie-break; dangling active-bike fallback | [BUSINESS_RULES.md](BUSINESS_RULES.md) §6/§10 |
| FlatList-first virtualization policy | [PERFORMANCE.md](PERFORMANCE.md) §4 |
| Health-Score version/history snapshot rule | [HEALTH_SCORE.md](HEALTH_SCORE.md) §9 |

Challenged and deliberately **kept**: Expo Router (ADR-002), Drizzle+SQLite over Watermelon/Realm (ADR-003 — sync must follow our protocol anyway), Zustand+events over live queries (§3.2 above), JSON backup format over raw DB copy (ADR-018 — version tolerance beats simplicity for decade-lived archives), read-time expense union (ADR-021), derived-only score (ADR-019), no chart library (ADR-024), one-time purchase architecture (ADR-013/023).

## 8. Mobile platform limitations (now documented)

Consolidated in [NOTIFICATION_ENGINE.md](NOTIFICATION_ENGINE.md) §9a: Android reboot loss + foreground recovery; Doze/OEM inexact delivery (no exact-alarm permission requested — Play-policy and genuinely unneeded); Android 13+ runtime notification permission; iOS 64-pending cap (self-capped 48); timezone/DST/manual-clock self-healing; duplicate prevention; long-absence degradation. Elsewhere: background execution is **never relied on** (no background fetch, no headless tasks — everything recomputes on foreground); all file/media work happens foregrounded; purchase flows require the store apps' own connectivity handling ([PREMIUM_SYSTEM.md](PREMIUM_SYSTEM.md) §5).

## 9. Future scalability assessment

| Future need | Verdict |
|---|---|
| Cloud sync | **Ready by contract** — UUIDs, soft deletes, updated_at, outbox seam, mirrored schema ([SUPABASE_SYNC_PLAN.md](SUPABASE_SYNC_PLAN.md)) |
| Mechanic accounts / shared garages | Pre-provisioned (`source` column, RLS grant design, per-field merge upgrade path noted) |
| Fleet management / multiple users | Server-side views over synced data; local schema needs nothing |
| Web dashboard | Enabled by React-free services + token JSON export + shared domain-package plan |
| Push notifications | Additive channel; local planner stays truth ([NOTIFICATION_ENGINE.md](NOTIFICATION_ENGINE.md) §10) |
| Analytics | Deliberately absent; facade seam + consent path defined ([LOGGING_GUIDE.md](LOGGING_GUIDE.md) §6) |
| Subscriptions (B2B) | Separate product/offering; consumer lifetime unlock grandfathered ([PREMIUM_SYSTEM.md](PREMIUM_SYSTEM.md) §8) |
| AI recommendations | Edge-function pattern with secrets server-side ([API_STRATEGY.md](API_STRATEGY.md) §2) |

No identified future feature requires breaking an existing table, gate, or layer. The one genuine future rewrite trigger would be abandoning offline-first — which is a product-identity change, not an architecture gap.

## 10. Scores

| Dimension | Score | Justification |
|---|---|---|
| **Architecture** | **9 / 10** | Right-sized, deterministic, evolution-proofed; docked for the structural best-effort nature of local-only reminders and hand-rolled invalidation — both consciously accepted, neither free |
| **Documentation** | **9.5 / 10** | Single-ownership, traceable (R/S/F/T/ADR/D/A ids), self-auditing, honest about assumptions; the residual half-point is the unavoidable gap between written spec and field behavior (OEM devices, real users) that no document can close |
| **Production readiness** | **8.5 / 10** | Everything an engineering team needs exists; not a 10 because zero code exists — readiness beyond this ceiling is earned at milestone gates (M4 device matrix, M8 restore proofs), and A-04/A-09 await owner verdicts |

## 11. Closing statement

I would hand this KB to a team of five senior React Native engineers tomorrow. The questions they would ask on day one — which SDK? which list component? what happens on reboot? how does restore not corrupt the running app? what's estimated vs real odometer data? — are now answered in the owning docs. Remaining open items are product-owner verdicts ([DECISION_LOG.md](DECISION_LOG.md) Part 2), not architectural clarifications. Review closed; KB frozen at **v1.1**.
