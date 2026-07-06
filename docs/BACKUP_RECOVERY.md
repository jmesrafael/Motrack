# BACKUP_RECOVERY.md — Whole-Data Backup & Restore

> **Owns:** the backup archive format, creation/restore flows, and failure handling (R-15). Human-readable exports: [EXPORT_IMPORT.md](EXPORT_IMPORT.md). This feature answers the category's #1 trust killer — data loss on phone change ([PRODUCT_VISION.md](PRODUCT_VISION.md) §2).

## 1. Principles

1. Lossless: everything user-entered survives backup→restore, including photos/documents and settings.
2. Version-tolerant: an archive from app v1.0 restores into v1.6 (migrations run on import); an archive from a **newer** schema fails safely with a clear message.
3. Restore never destroys silently: preview + typed confirmation + pre-restore safety snapshot.
4. The archive is a user-held file; we never see it (MVP has no server).

## 2. Surfaces & flows

More → Backup & Restore (S-32); flows F-9; monthly reminder ([NOTIFICATION_ENGINE.md](NOTIFICATION_ENGINE.md) §7); onboarding footer "I have a backup" (S-00b).

## 3. Archive format (ADR-018)

Single file `motrack-backup-<yyyyMMdd-HHmm>.motrack` — a zip:

```
manifest.json   { formatVersion: 1, appVersion, schemaVersion (PRAGMA user_version),
                  createdAt, counts per table, fileCount, totalFileBytes }
data.json       { table → rows[] } — all user-data tables (DATABASE_DESIGN §3 set),
                including soft-deleted rows (restore keeps the 30-day undo window honest);
                app_settings included EXCEPT entitlement_* keys (store owns purchase truth,
                PREMIUM_SYSTEM §6) and device-operational keys (onboarding_state kept;
                scheduled_notifications never included — replanned after restore)
files/<uuid>.*  documents & photos, names = stored relative filenames
```

JSON (not raw SQLite) per ADR-018: schema-version tolerant, partially recoverable, inspectable. `wal_checkpoint(TRUNCATE)` before export ([SQLITE_GUIDE.md](SQLITE_GUIDE.md) §1). No encryption on the archive in MVP — it lives wherever the user puts it; the share sheet warns "contains your documents — store it somewhere private" (D-010 context; Phase 2 cloud backup is encrypted).

**Memory rule (ADR-026):** archive creation and extraction **stream to/from disk** — table exports are written in chunks and files are added to the zip one at a time; the archive is never held fully in RAM (a 300 MB archive would OOM the 2 GB reference device, [PERFORMANCE.md](PERFORMANCE.md) §7). This constrains the zip-library choice in T-114.

## 4. Restore algorithm (safety-critical — implement exactly)

1. Pick file → size cap check (500 MB) → unzip to a **staging dir** with sanitized entry names (no traversal; files only; [SECURITY.md](SECURITY.md) §5).
2. Validate manifest: `formatVersion` supported; `schemaVersion ≤ current` (else "backup from a newer version — update the app first").
3. Zod-validate `data.json` shape per table; verify counts vs manifest; verify referenced files exist (missing files → listed, restore continues with warnings — rows keep paths, viewer shows placeholder).
4. Show preview (bikes/records/photos counts + backup date). If current DB has any user data → typed `RESTORE` confirmation ("replaces current data").
5. **Safety snapshot:** current DB + files exported to an internal auto-backup (same format) in app storage (kept: last 1).
6. Import into a **fresh staging database**: create schema at archive's `schemaVersion` → insert rows (chunked transaction, [SQLITE_GUIDE.md](SQLITE_GUIDE.md) §4) → run migrations up to current (ADR-022).
7. Integrity: `quick_check` + FK check + recompute caches (odometer cache, anchors) via services.
8. **Atomic swap:** close connection → rename current DB aside → move staging DB in → move files dir → delete aside copy on success (or roll back on any failure).
9. Post-restore: **force a full JS reload** (the running app holds the old DB connection and hydrated stores — re-initialization must go through the normal startup sequence, [DATA_FLOW.md](DATA_FLOW.md) §1, ADR-026), which re-opens the swapped DB, re-hydrates stores, and triggers the notification full re-plan; `last_backup_at` untouched; success screen → Dashboard.

Failure at any step = automatic rollback to the pre-restore state + specific error message ([ERROR_HANDLING.md](ERROR_HANDLING.md) §2 `FileError`/`BusinessRuleError`) + log ([LOGGING_GUIDE.md](LOGGING_GUIDE.md) §5).

## 5. Failure messages (canonical cases)

| Case | Message behavior |
|---|---|
| Not a motrack file / corrupt zip | "This file isn't a Motrack backup." |
| Newer schemaVersion | "Backup was made with a newer version — update Motrack first." |
| Partial file loss (missing photos) | Restore completes; warning lists count; documents show placeholder |
| Disk full mid-restore | Rollback + "Free up about {size} and try again." |
| Validation failure | Rollback + "Backup appears damaged. Try another copy." + report option |

## 6. Backup creation

S-32 → progress (tables → files → zip) → share sheet. Sets `last_backup_at`. Internal safety snapshots (§4.5) are invisible to the user except on the recovery screen ([ERROR_HANDLING.md](ERROR_HANDLING.md) §7 offers them).

## 7. Evolution

- **Phase 2 (R-31):** encrypted automatic cloud backup to Supabase Storage (same archive format inside), retention 3 rolling copies; local file backup **remains forever** (cloud is additive, [PRODUCT_DECISIONS.md](PRODUCT_DECISIONS.md) §10). Sync (R-30) reduces backup's criticality but never replaces it.
- **Phase 3:** fleet-level scheduled exports (server-side).
- **Long-term:** format v2 (if ever) must ship a v1 reader permanently — user archives are decade-lived.
