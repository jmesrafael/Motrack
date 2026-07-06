# RELEASE_PROCESS.md — Builds, Stores, Hotfixes

> **Owns:** how a release gets from `main` to users' phones. Versions: [VERSIONING.md](VERSIONING.md); pre-release testing: [TESTING.md](TESTING.md) §7; budgets: [PERFORMANCE.md](PERFORMANCE.md).

## 1. Channels & profiles (EAS)

| Profile | Purpose | Distribution |
|---|---|---|
| `development` | dev client ([DEVELOPER_SETUP.md](DEVELOPER_SETUP.md) §3) | internal |
| `preview` | QA builds per milestone | internal (EAS internal distribution / TestFlight internal) |
| `production` | store releases | Play (staged rollout) + App Store (phased release) |

Android ships AAB (Play handles per-ABI splits — [PERFORMANCE.md](PERFORMANCE.md) §7 budget). Credentials managed by EAS; store secrets live only in EAS/console, never the repo ([SECURITY.md](SECURITY.md) §5).

## 2. Release cadence

Post-launch: patch releases as needed; minor (feature) releases when a milestone completes — quality gates decide timing, not calendars. PH Android users update slowly: server-optional design means old versions keep working ([VERSIONING.md](VERSIONING.md) §4).

## 3. Pre-release checklist (every production release — no skips)

1. `main` green (all CI gates, [CONTRIBUTING.md](CONTRIBUTING.md) §4).
2. Manual E2E device checklist ([TESTING.md](TESTING.md) §7) on real low-end Android + one iPhone — includes airplane-mode pass, notification fire/reboot, purchase sandbox, dark/fil/130% passes.
3. Perf spot-checks vs budgets ([PERFORMANCE.md](PERFORMANCE.md) §8).
4. Migration dry-run: preview build over a device carrying the **previous release's** populated data ([DATABASE_DESIGN.md](DATABASE_DESIGN.md) §8).
5. Backup round-trip on the release candidate ([BACKUP_RECOVERY.md](BACKUP_RECOVERY.md)).
6. i18n: fil review of new strings by a native speaker ([LOCALIZATION.md](LOCALIZATION.md) §6).
7. `CHANGELOG.md` + store release notes (en; fil where store locale set).
8. Version bumped per [VERSIONING.md](VERSIONING.md); git tag `v<semver>`.

## 4. Ship

`eas build --profile production` (both platforms) → `eas submit` → **Play: staged rollout 10% → 50% → 100%** over ≥ 3 days watching Sentry crash-free rate (≥ 99.5% gate — halt rollout below it); **App Store: phased release on**. Release owner watches Sentry + store reviews for 72 h.

## 5. Hotfixes

- **JS-only fix:** EAS Update to the production channel (same runtime version) — for genuine emergencies (crash loops, data-affecting bugs), not feature sneaking; a store release with the same fix follows.
- **Native/dep fix:** expedited store release, same checklist minus unaffected steps (migration/backup checks are never skippable if `db/` or files were touched).
- Rollback: halt staged rollout + EAS Update revert to previous bundle where applicable. The DB cannot roll back (forward-only) — hence checklist step 4 is sacred.

## 6. Store presence

Listings (en + fil), screenshots per theme, privacy labels/data-safety forms consistent with [SECURITY.md](SECURITY.md) §7 (declare: crash data only, no tracking). Store assets versioned in `store/` at repo root ([PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)).

## 7. Evolution

**Phase 2:** server deploys (Supabase migrations/edge functions) get their own runbook appended here — app releases and server deploys stay independently shippable (compatibility matrix, [VERSIONING.md](VERSIONING.md) §5). **Phase 3+:** release train if team/product surface grows; not before.
