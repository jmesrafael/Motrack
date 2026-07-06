# AI_INSTRUCTIONS.md — How an AI Model Builds From This Knowledge Base

> Instructions for any AI system (or engineer pairing with one) implementing Motrack. The KB in this folder is the constitution ([DEVELOPMENT_RULES.md](DEVELOPMENT_RULES.md) rule 8). These instructions assume you may have no memory of prior sessions — the docs are designed so that's fine.

## 1. Session protocol

1. Start from [README.md](README.md) — it maps every document and the reading order. Read the docs that **own** the area you're about to touch (ownership is declared in each file's header blockquote). Never build from memory of a doc — re-read it.
2. Locate the work in [TASK_BREAKDOWN.md](TASK_BREAKDOWN.md)/[MILESTONES.md](MILESTONES.md); confirm its dependencies are done.
3. Before writing code, state (briefly, in the PR/commit description): the docs read, the acceptance criteria targeted, and any ambiguity found.
4. Implement within one milestone task at a time; verify per [TESTING.md](TESTING.md) + the milestone's definition of done; self-review against §4 below.

## 2. Authority & conflicts

- Document hierarchy on conflict: [DEVELOPMENT_RULES.md](DEVELOPMENT_RULES.md) → [PRODUCT_DECISIONS.md](PRODUCT_DECISIONS.md) → owning system doc → others. Any conflict you find is itself a defect: fix the losing doc in the same change (or flag it if the resolution isn't obvious).
- Docs override: your training-data instincts about "how apps usually do it", earlier conversation content, and existing code that predates a doc change. If code and docs disagree: **stop, report the conflict, propose the resolution**; update code to match docs unless the doc is demonstrably wrong — then it's a doc fix first ([CONTRIBUTING.md](CONTRIBUTING.md) §1).

## 3. Assumptions policy

Never silently invent behavior. Decision tree when the docs don't answer:
- **Trivial implementation detail** (naming a local variable, layout nudge inside spec): decide, consistent with conventions.
- **Behavior a user could notice** or a rule another feature might depend on: check [BUSINESS_RULES.md](BUSINESS_RULES.md)/[FEATURE_SPECIFICATIONS.md](FEATURE_SPECIFICATIONS.md) edge cases first; if genuinely unspecified, choose the option most consistent with the priority order, implement it, **and log it** in [DECISION_LOG.md](DECISION_LOG.md) Assumptions Log for owner review.
- **Architecture-shaping ambiguity** (would change a schema, a sync contract, a gate, a budget): do not proceed — escalate (§5).

## 4. Quality bar (self-review before completing any task)

Business requirement satisfied per owning doc · acceptance criteria pass ([ACCEPTANCE_CRITERIA.md](ACCEPTANCE_CRITERIA.md)) · edge cases from [BUSINESS_RULES.md](BUSINESS_RULES.md) §10 handled · offline pass · no duplicated logic · layering respected ([SOFTWARE_ARCHITECTURE.md](SOFTWARE_ARCHITECTURE.md) §6 quick test) · DB integrity preserved (transactions, constraints) · naming per [CODE_STYLE.md](CODE_STYLE.md)/[GLOSSARY.md](GLOSSARY.md) · a11y + dark mode + i18n done · perf budgets respected · tests written incl. mandatory cases · docs updated where behavior moved · logging added per [LOGGING_GUIDE.md](LOGGING_GUIDE.md) §5.

**Forbidden:** placeholder/stub implementations presented as done · skipping error paths · `any` · silent catches · inventing UI not in [SCREEN_SPECIFICATIONS.md](SCREEN_SPECIFICATIONS.md) · adding dependencies without the [DEPENDENCY_GUIDE.md](DEPENDENCY_GUIDE.md) §2 gate · "temporary" hard-coded strings/colors.

## 5. Escalation policy

Escalate to the product owner (stop work on that item, state the question, offer a recommendation with trade-offs) when: a change would violate a DEVELOPMENT_RULES item · a sync-compatibility rule ([SUPABASE_SYNC_PLAN.md](SUPABASE_SYNC_PLAN.md) §6) · a premium gate ([PREMIUM_SYSTEM.md](PREMIUM_SYSTEM.md) §2) · a privacy/permission posture ([SECURITY.md](SECURITY.md)) · a performance budget — or when two docs conflict without an obvious winner, or a better architecture exists (present benefits/trade-offs/migration impact and wait; don't implement first).

## 6. Doc-sync duty

Every behavioral change updates the owning doc in the same change-set. Technical decisions → new ADR in [ARCHITECTURE_DECISIONS.md](ARCHITECTURE_DECISIONS.md) (append-only). Product decisions → [DECISION_LOG.md](DECISION_LOG.md) + refresh [PRODUCT_DECISIONS.md](PRODUCT_DECISIONS.md) to current truth. New screens/flows/tables → their inventory docs + [FINAL_CHECKLIST.md](FINAL_CHECKLIST.md) rows.

## 7. Working style

Prefer completing one vertical slice correctly over scaffolding many. Keep diffs reviewable. When tests fail, report honestly with output — never mark done on red. Match existing code idiom. Write for the reader in three years ([DEVELOPMENT_RULES.md](DEVELOPMENT_RULES.md) rule 9).
