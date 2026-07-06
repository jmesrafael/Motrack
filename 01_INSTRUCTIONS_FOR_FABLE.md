# Instructions for Fable 5

Read `00_PROJECT_BRIEF.md` in full before doing anything else — it's your only source of truth on what the product is. This file describes the **outcome** you're building toward, not a script to execute line by line. Plan your own path to it.

## Your Role

You are acting as lead architect for this project — covering product management, mobile architecture, database design, UX, QA, and technical writing at once. You are not writing application code in this task. You are producing a documentation knowledge base that a development team (human or AI) will build the app from, continuously, over the life of the project.

## The Outcome

Produce a complete, internally consistent, cross-referenced documentation knowledge base in this folder — one file per concern, no duplicated content between files, referencing each other by name where relevant. These files aren't a one-time report. They'll be opened and relied on repeatedly while the app is actually built, months from now, possibly by people who weren't part of this conversation. Optimize for that.

**You'll know you're done when:**
- Every feature, screen, database table, and business rule in the brief is documented exactly once, with no contradictions between files
- Someone with no access to this conversation could make every major product and architecture decision the same way you did, just from reading these files
- Nothing in the app depends on a decision you didn't actually write down somewhere
- You'd trust these docs to still make sense if you returned to this project in six months with no memory of writing them

Work until that's true. Don't stop at a first pass through the list below and call it done if the result doesn't actually meet the bar above.

## Suggested Structure — a strong starting point, not a mandate

Below is a suggested file breakdown. If you find a better way to organize it — split something further, merge two files that logically belong together, add something the brief implies but this list misses — do that. Deciding the right documentation structure is exactly the kind of ambiguous problem you should use your own judgment on, not follow mechanically.

| File | Scope — this file contains ONLY this |
|---|---|
| `README.md` | What this project is, how to read the docs, reading order, documentation standards |
| `PROJECT_MISSION.md` | Mission, success metrics, business philosophy |
| `AI_INSTRUCTIONS.md` | How any AI model should think/behave when building from this knowledge base — assumptions policy, quality bar, escalation policy |
| `PRODUCT_VISION.md` | Target users, competitor positioning (post-research), business philosophy in depth |
| `PRODUCT_REQUIREMENTS.md` | MVP vs Phase 2 boundary, what's explicitly out of scope for v1 |
| `FEATURE_SPECIFICATIONS.md` | Every feature, every button, every workflow — functional detail only |
| `USER_PERSONAS.md` | 3–4 concrete personas |
| `USER_FLOWS.md` | Step-by-step flows for core tasks |
| `SCREEN_SPECIFICATIONS.md` | Every screen: purpose, layout, components, navigation, validation, empty/loading/error states, accessibility |
| `UI_UX_GUIDELINES.md` | Visual/interaction principles, dark mode, localization |
| `COMPONENT_LIBRARY.md` | Reusable UI components and their props/variants |
| `DESIGN_SYSTEM.md` | Color, type, spacing tokens |
| `DATABASE_DESIGN.md` | Tables, relationships, indexes, migrations, naming conventions |
| `BUSINESS_RULES.md` | Interval logic, health-score formula, reminder logic, edge cases |
| `TECH_STACK.md` | Chosen stack and justification |
| `SOFTWARE_ARCHITECTURE.md` | Layers, repositories, state management, services, hooks |
| `OFFLINE_ARCHITECTURE.md` | Offline-first sync strategy, conflict resolution |
| `SECURITY.md` | Data storage, auth, document/photo handling |
| `PREMIUM_SYSTEM.md` | Free vs premium gating, Phase 2 feature access |
| `EXPORT_IMPORT.md` | Data export/import, backup |
| `NOTIFICATION_ENGINE.md` | Reminder scheduling logic and copy guidelines |
| `HEALTH_SCORE.md` | Exact calculation spec with worked examples |
| `TESTING.md` | Test strategy per layer |
| `PERFORMANCE.md` | Performance budgets and constraints |
| `CODING_STANDARDS.md` | Language/style rules, folder structure, error handling, logging |
| `FUTURE_ROADMAP.md` | Beyond Phase 2 |
| `ACCEPTANCE_CRITERIA.md` | Definition of done, per feature area |
| `DECISION_LOG.md` | Every non-obvious decision made while writing these docs, with rationale |
| `GLOSSARY.md` | Domain terms (CVT, OR/CR, etc.) |
| `DEVELOPMENT_RULES.md` | The non-negotiable project "constitution" — offline-first, no shortcuts, etc. |
| `FINAL_CHECKLIST.md` | Self-audit checklist — every screen/feature/table/rule accounted for |

## Along the Way

- Before drafting, independently verify and deepen the competitor research in the brief (real app landscape, pricing, review complaints). Correct the brief's competitor table if your research disagrees, and note what changed and why.
- If something is genuinely ambiguous in a way that would change the architecture, ask up to 3 questions before proceeding. Otherwise, make the call yourself.
- Don't silently invent business rules and present them as given — log assumptions instead of hiding them.
- No placeholder content, no marketing language. This is engineering documentation, not a pitch.

## When You Believe You're Done

Audit your own output against the "you'll know you're done when" list above and the `FINAL_CHECKLIST.md` you produce. Report any gaps you find and how you resolved them — don't fix and hide them silently. Then produce a final **Assumptions Log**: every place you inferred something the brief didn't state outright, so a human can approve or override each one.

## Output Format

Write real, separate files to this folder as you go — don't paste the whole knowledge base into one chat message.
