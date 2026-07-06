# VERSIONING.md — Versions of App, Schema, Formats, Docs

> **Owns:** every versioned surface and its rules. Release mechanics: [RELEASE_PROCESS.md](RELEASE_PROCESS.md).

## 1. App version — SemVer `MAJOR.MINOR.PATCH`

- **MAJOR:** reserved for true platform shifts (rare by design).
- **MINOR:** features (each shipped milestone/feature release).
- **PATCH:** fixes only.
- Launch = `1.0.0`. Pre-launch milestones use `0.x.y`.
- Android `versionCode` / iOS build number: monotonically incremented by EAS (`autoIncrement`), never hand-set.
- `version` in `app.json` is the single source; the About screen (S-33) reads it at runtime.

## 2. Other versioned surfaces (each owns its rules)

| Surface | Scheme | Rules live in |
|---|---|---|
| DB schema | integer `PRAGMA user_version` = migration count; forward-only | [DATABASE_DESIGN.md](DATABASE_DESIGN.md) §8 |
| Seed config (intervals/weights) | integer `schema_seed_version` | [DATABASE_DESIGN.md](DATABASE_DESIGN.md) §9 |
| Backup format | `formatVersion` integer; readers kept forever | [BACKUP_RECOVERY.md](BACKUP_RECOVERY.md) §3/§7 |
| CSV export | `# motrack-csv v1` header | [EXPORT_IMPORT.md](EXPORT_IMPORT.md) §5 |
| Health Score formula | `healthScoreVersion` (bump on any formula change) | [HEALTH_SCORE.md](HEALTH_SCORE.md) §9 |
| Per-component `details` schemas | versioned Zod schemas in code | ADR-007 |
| Edge-function API (Phase 2) | URL `/v1/` | [API_STRATEGY.md](API_STRATEGY.md) §2 |
| **Knowledge base (docs/)** | `KB vX.Y` stamped in [README.md](README.md); this snapshot = **KB v1.2** (v1.0 baseline + CTO review + theme-engine expansion, D-018) | [README.md](README.md) §5 |

## 3. Changelog

`CHANGELOG.md` at repo root (Keep-a-Changelog format), generated from Conventional Commits and human-edited for release notes; store listings take the user-facing subset ([RELEASE_PROCESS.md](RELEASE_PROCESS.md) §4). User-visible changes only — refactors stay out.

## 4. Compatibility promises

An app update must always: migrate any older DB (skipping versions allowed — sequential migrations), read any older backup archive, honor cached entitlements. Breaking any of these is a MAJOR event that requires an explicit DECISION_LOG entry and a migration path — the default answer is "don't".

## 5. Evolution

**Phase 2:** app+server compatibility matrix (min supported app version enforced politely server-side, with local features never disabled). **Long-term:** KB major bumps (v2.0) only on architecture-level rewrites of the docs — history preserved via git.
