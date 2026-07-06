# DEVELOPMENT_RULES.md — The Project Constitution

> The non-negotiables. Every other document elaborates these; none may contradict them. Conflicts between documents are resolved in this order: DEVELOPMENT_RULES → [PRODUCT_DECISIONS.md](PRODUCT_DECISIONS.md) → the owning system doc → everything else. Process for changes: a rule here changes only by explicit product-owner decision recorded in [DECISION_LOG.md](DECISION_LOG.md).

## 1. Priority order (binding on every trade-off)

**Data integrity > user safety > offline reliability > maintainability > scalability > simplicity > performance > accessibility > developer experience > implementation speed.**

When two solutions conflict, the higher priority wins and the trade-off is documented (ADR or PR description).

## 2. The rules

1. **Never lose user data.** Every migration preserves existing data ([DATABASE_DESIGN.md](DATABASE_DESIGN.md) §8); every destructive UI action is undoable or explicitly confirmed; restore never destroys silently ([BACKUP_RECOVERY.md](BACKUP_RECOVERY.md) §4); "delete the extra bikes" is never a gating mechanism ([PREMIUM_SYSTEM.md](PREMIUM_SYSTEM.md) §6).
2. **Every feature works offline.** No hidden online dependencies; additions of network calls follow [OFFLINE_ARCHITECTURE.md](OFFLINE_ARCHITECTURE.md) §3.
3. **Business logic never lives in UI components.** Services own logic; repositories own SQL; components present ([SOFTWARE_ARCHITECTURE.md](SOFTWARE_ARCHITECTURE.md) §1).
4. **No duplicate logic.** One formula, one owner file, everyone else references ([CODE_STYLE.md](CODE_STYLE.md) §6 — mirrors the docs' single-source rule).
5. **Every screen supports every registered theme — dark mode at minimum** ([THEME_GUIDE.md](THEME_GUIDE.md), extended per D-018) **and the accessibility baseline** ([UI_UX_GUIDELINES.md](UI_UX_GUIDELINES.md) §8). No hardcoded colors anywhere; no component branches on theme identity.
6. **All user-visible strings are localizable** (en + fil at minimum, [LOCALIZATION.md](LOCALIZATION.md)).
7. **Production quality only.** No placeholder implementations, no commented-out code, no "TODO: handle error", no mock data behind real UI. If a slice can't be finished properly, it isn't merged.
8. **Docs are the constitution.** Read the owning docs before building; when implementation must diverge, the doc is updated first ([CONTRIBUTING.md](CONTRIBUTING.md) §1). Documentation and code never drift.
9. **Maintainability over cleverness; readability over brevity.** Code is written for the engineer who reads it in three years.
10. **Scalability over shortcuts — via evolution, not speculation.** Follow each system's documented MVP → Phase 2 → Phase 3 → long-term path; don't build Phase-2 machinery early, don't foreclose it either ([SUPABASE_SYNC_PLAN.md](SUPABASE_SYNC_PLAN.md) §6 is the canonical example).
11. **Consistency over personal preference.** [CODE_STYLE.md](CODE_STYLE.md), [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md), and [GLOSSARY.md](GLOSSARY.md) terms are followed even where a contributor would choose otherwise.
12. **Assumptions are logged, never silently invented.** New inferred behavior goes to [DECISION_LOG.md](DECISION_LOG.md) (Assumptions Log) for owner review.
13. **Performance budgets are release blockers** ([PERFORMANCE.md](PERFORMANCE.md)).
14. **Privacy by minimization.** Collect nothing we don't need; everything exportable; delete-all really deletes ([SECURITY.md](SECURITY.md)).

## 3. Definition of "done" (summary)

A change is done when: spec'd behavior implemented per owning docs · tests per [TESTING.md](TESTING.md) incl. mandatory cases · offline pass · all registered themes + a11y pass · i18n complete · docs synced · CI green · acceptance criteria met ([ACCEPTANCE_CRITERIA.md](ACCEPTANCE_CRITERIA.md)). The per-milestone operational checklist lives in [MILESTONES.md](MILESTONES.md).
