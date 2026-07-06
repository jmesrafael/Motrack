# CONTRIBUTING.md — Workflow, Reviews, CI

> **Owns:** how changes get in — branching, PR standards, review rules, CI gates, and the documentation-sync duty. Style rules: [CODE_STYLE.md](CODE_STYLE.md); tests: [TESTING.md](TESTING.md); the constitution: [DEVELOPMENT_RULES.md](DEVELOPMENT_RULES.md).

## 1. Ground rule — docs are the constitution

Before implementing anything, read the owning doc(s) for that area (map in [README.md](README.md)). If code needs to diverge from a doc: **stop, update the doc first** (with a DECISION_LOG/ADR entry if it's a decision), then implement. PRs that change behavior without the matching doc change are rejected. If a doc conflicts with another doc, fixing that is the first commit.

## 2. Branching & commits

Trunk-based: `main` always releasable; short-lived branches `feat/<area>-<slug>`, `fix/…`, `docs/…`, `chore/…`. Conventional Commits ([CODE_STYLE.md](CODE_STYLE.md) §10). Rebase-and-merge; no merge commits from feature branches; no direct pushes to `main`.

## 3. Pull requests

Small and single-purpose (one milestone task from [TASK_BREAKDOWN.md](TASK_BREAKDOWN.md) is the right size). Template requires:
- **What/why** + link to task/requirement id (R-xx / T-xx).
- **Doc sync:** which KB docs were read; which were updated (or "none needed" — reviewer verifies).
- **Tests:** what's covered; mandatory-case lists touched ([TESTING.md](TESTING.md) §4).
- **Screens:** before/after screenshots **in every registered theme** (MVP: light + dark) for UI changes; a11y notes.
- **Data:** migration? → fixture-upgrade test included ([DATABASE_DESIGN.md](DATABASE_DESIGN.md) §8.5).
- Self-review against the milestone checklist ([MILESTONES.md](MILESTONES.md) definition of done).

## 4. CI gates (all required to merge)

typecheck → lint (zero warnings) → prettier check → unit/component/flow tests + coverage floors ([TESTING.md](TESTING.md) §2) → i18n parity ([LOCALIZATION.md](LOCALIZATION.md) §3) → `npm audit` (fail high+) → bundle-size delta report (warn > +1 MB, block > +3 MB without ADR — [PERFORMANCE.md](PERFORMANCE.md) §7).

## 5. Review rules

At least one approval (or rigorous self-review protocol for solo phases: PR sits ≥ 1 hour, reviewed cold against the checklist). Reviewers block on: layering violations ([SOFTWARE_ARCHITECTURE.md](SOFTWARE_ARCHITECTURE.md)), business logic in UI, missing doc sync, missing tests for rules, silent catches, token/i18n literals, unjustified deps ([DEPENDENCY_GUIDE.md](DEPENDENCY_GUIDE.md) §2). Review tone: critique code, not people; explain the *rule source* (link the doc) when blocking.

## 6. Issue hygiene

Work is tracked as tasks (T-xx) per [TASK_BREAKDOWN.md](TASK_BREAKDOWN.md); bugs reference the observed vs specified behavior with the owning doc. "The doc is wrong" is a valid bug — route it per §1.

## 7. Evolution

**Phase 2:** second-reviewer requirement once the team ≥ 3; CODEOWNERS for `db/`, `services/validation/`, and `docs/`. **Phase 3+:** external contributions (if open-sourced components) get a CLA decision via DECISION_LOG.
