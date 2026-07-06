# Motrack Knowledge Base — README

**KB version: 1.2 (frozen 2026-07-06 — v1.0 baseline + independent CTO architecture review ([ARCHITECTURE_REVIEW.md](ARCHITECTURE_REVIEW.md)) + theme-engine expansion (D-018/ADR-028)).** This folder is the complete technical foundation of Motrack — a Philippines-first motorcycle maintenance tracker. It is written to be handed to a team (human or AI) that has never seen the project: every product, design, and architecture decision needed to build the app is in these files, with its reasoning. The docs are the **constitution**: implementation follows them, and they change *before* behavior does ([DEVELOPMENT_RULES.md](DEVELOPMENT_RULES.md) rule 8, [CONTRIBUTING.md](CONTRIBUTING.md) §1).

## 1. Start here

| If you are… | Read, in order |
|---|---|
| **Anyone, first session** | This file → [PRODUCT_DECISIONS.md](PRODUCT_DECISIONS.md) (current policy at a glance) → [DEVELOPMENT_RULES.md](DEVELOPMENT_RULES.md) (the constitution) → [GLOSSARY.md](GLOSSARY.md) |
| **An AI implementer** | The three above → [AI_INSTRUCTIONS.md](AI_INSTRUCTIONS.md) (your protocol) → the docs owning your task area |
| **Understanding the product** | [PROJECT_MISSION.md](PROJECT_MISSION.md) → [PRODUCT_VISION.md](PRODUCT_VISION.md) → [USER_PERSONAS.md](USER_PERSONAS.md) → [PRODUCT_REQUIREMENTS.md](PRODUCT_REQUIREMENTS.md) → [FEATURE_SPECIFICATIONS.md](FEATURE_SPECIFICATIONS.md) |
| **Building a screen** | [SCREEN_SPECIFICATIONS.md](SCREEN_SPECIFICATIONS.md) → [USER_FLOWS.md](USER_FLOWS.md) → [COMPONENT_LIBRARY.md](COMPONENT_LIBRARY.md) → [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)/[THEME_GUIDE.md](THEME_GUIDE.md)/[UI_UX_GUIDELINES.md](UI_UX_GUIDELINES.md) |
| **Building logic/data** | [BUSINESS_RULES.md](BUSINESS_RULES.md) → [DATABASE_DESIGN.md](DATABASE_DESIGN.md) → [SOFTWARE_ARCHITECTURE.md](SOFTWARE_ARCHITECTURE.md) → [DATA_FLOW.md](DATA_FLOW.md) |
| **Starting implementation** | [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) → [MILESTONES.md](MILESTONES.md) → [TASK_BREAKDOWN.md](TASK_BREAKDOWN.md) → [DEVELOPER_SETUP.md](DEVELOPER_SETUP.md) |

## 2. Document map (57 files, by concern)

**Product foundation:** [PROJECT_MISSION.md](PROJECT_MISSION.md) · [PRODUCT_VISION.md](PRODUCT_VISION.md) · [USER_PERSONAS.md](USER_PERSONAS.md) · [PRODUCT_REQUIREMENTS.md](PRODUCT_REQUIREMENTS.md) · [FUTURE_ROADMAP.md](FUTURE_ROADMAP.md) · [GLOSSARY.md](GLOSSARY.md)

**Product detail:** [FEATURE_SPECIFICATIONS.md](FEATURE_SPECIFICATIONS.md) · [USER_FLOWS.md](USER_FLOWS.md) · [SCREEN_SPECIFICATIONS.md](SCREEN_SPECIFICATIONS.md)

**Business logic:** [BUSINESS_RULES.md](BUSINESS_RULES.md) · [HEALTH_SCORE.md](HEALTH_SCORE.md) · [NOTIFICATION_ENGINE.md](NOTIFICATION_ENGINE.md)

**Design:** [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) · [THEME_GUIDE.md](THEME_GUIDE.md) · [UI_UX_GUIDELINES.md](UI_UX_GUIDELINES.md) · [COMPONENT_LIBRARY.md](COMPONENT_LIBRARY.md) · [ICON_GUIDE.md](ICON_GUIDE.md) · [ANIMATION_GUIDE.md](ANIMATION_GUIDE.md) · [LOCALIZATION.md](LOCALIZATION.md)

**Architecture:** [TECH_STACK.md](TECH_STACK.md) · [ARCHITECTURE_DECISIONS.md](ARCHITECTURE_DECISIONS.md) · [SOFTWARE_ARCHITECTURE.md](SOFTWARE_ARCHITECTURE.md) · [FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md) · [DATA_FLOW.md](DATA_FLOW.md) · [STATE_MANAGEMENT.md](STATE_MANAGEMENT.md) · [DATABASE_DESIGN.md](DATABASE_DESIGN.md) · [SQLITE_GUIDE.md](SQLITE_GUIDE.md) · [OFFLINE_ARCHITECTURE.md](OFFLINE_ARCHITECTURE.md) · [SUPABASE_SYNC_PLAN.md](SUPABASE_SYNC_PLAN.md) · [API_STRATEGY.md](API_STRATEGY.md) · [ERROR_HANDLING.md](ERROR_HANDLING.md) · [LOGGING_GUIDE.md](LOGGING_GUIDE.md) · [SECURITY.md](SECURITY.md) · [PREMIUM_SYSTEM.md](PREMIUM_SYSTEM.md) · [EXPORT_IMPORT.md](EXPORT_IMPORT.md) · [BACKUP_RECOVERY.md](BACKUP_RECOVERY.md) · [PERFORMANCE.md](PERFORMANCE.md)

**Engineering process:** [CODE_STYLE.md](CODE_STYLE.md) · [TESTING.md](TESTING.md) · [DEPENDENCY_GUIDE.md](DEPENDENCY_GUIDE.md) · [DEVELOPER_SETUP.md](DEVELOPER_SETUP.md) · [CONTRIBUTING.md](CONTRIBUTING.md) · [VERSIONING.md](VERSIONING.md) · [RELEASE_PROCESS.md](RELEASE_PROCESS.md)

**Governance:** [DEVELOPMENT_RULES.md](DEVELOPMENT_RULES.md) · [AI_INSTRUCTIONS.md](AI_INSTRUCTIONS.md) · [PRODUCT_DECISIONS.md](PRODUCT_DECISIONS.md) · [DECISION_LOG.md](DECISION_LOG.md) · [ACCEPTANCE_CRITERIA.md](ACCEPTANCE_CRITERIA.md) · [FINAL_CHECKLIST.md](FINAL_CHECKLIST.md) · [ARCHITECTURE_REVIEW.md](ARCHITECTURE_REVIEW.md)

**Implementation planning:** [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) · [TASK_BREAKDOWN.md](TASK_BREAKDOWN.md) · [MILESTONES.md](MILESTONES.md) · [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) · [IMPLEMENTATION_READINESS.md](IMPLEMENTATION_READINESS.md)

## 3. Documentation standards (how these files stay trustworthy)

1. **Single source of truth.** Every fact has exactly one owning file (declared in each file's header blockquote); everyone else links. If you find the same rule stated twice, that's a defect — fix it by referencing.
2. **Conflict hierarchy:** [DEVELOPMENT_RULES.md](DEVELOPMENT_RULES.md) → [PRODUCT_DECISIONS.md](PRODUCT_DECISIONS.md) → owning system doc → others.
3. **Doc-sync duty:** behavior changes update the owning doc in the same change-set; decisions append to [ARCHITECTURE_DECISIONS.md](ARCHITECTURE_DECISIONS.md) (technical) or [DECISION_LOG.md](DECISION_LOG.md) (product), and [PRODUCT_DECISIONS.md](PRODUCT_DECISIONS.md) is refreshed to current truth.
4. **Four-horizon rule:** every major system doc ends with MVP → Phase 2 → Phase 3 → Long-term evolution, so change arrives by plan, not rewrite.
5. **Assumptions are visible:** anything inferred beyond the brief is in the Assumptions Log ([DECISION_LOG.md](DECISION_LOG.md) Part 2) awaiting owner verdict.
6. **IDs are stable:** R-xx requirements, S-xx screens, F-xx flows, ADR-xxx, D-xx/A-xx decisions/assumptions, T-xx tasks, M-x milestones — never renumbered.

## 4. Project inputs

The original brief and instruction documents live one level up (`00_PROJECT_BRIEF.md`, `01_INSTRUCTIONS_FOR_FABLE.md`) as historical inputs. Where this KB deliberately departs from the brief (e.g., monetization, competitor table), the departure is recorded in [DECISION_LOG.md](DECISION_LOG.md).

## 5. KB versioning

This snapshot is **KB v1.2** — the audited baseline for implementation ([FINAL_CHECKLIST.md](FINAL_CHECKLIST.md) records all audit rounds; [ARCHITECTURE_REVIEW.md](ARCHITECTURE_REVIEW.md) is the independent review report; v1.2 adds the multi-theme engine, D-018/ADR-028). Doc changes after freeze follow [CONTRIBUTING.md](CONTRIBUTING.md) §1; the KB version bumps per [VERSIONING.md](VERSIONING.md) §2.
