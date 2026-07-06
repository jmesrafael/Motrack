# DATABASE_DESIGN.md — Schema, Relationships, Indexes, Migrations

> **Owns:** the local SQLite schema — the implementation writes `src/db/schema.ts` (Drizzle) from this spec; any divergence is a doc bug to fix first ([DEVELOPMENT_RULES.md](DEVELOPMENT_RULES.md)). Operational SQLite practices: [SQLITE_GUIDE.md](SQLITE_GUIDE.md). Domain meaning of fields: [BUSINESS_RULES.md](BUSINESS_RULES.md) / [FEATURE_SPECIFICATIONS.md](FEATURE_SPECIFICATIONS.md). Server mirror: [SUPABASE_SYNC_PLAN.md](SUPABASE_SYNC_PLAN.md) §3.

## 1. Principles

Normalized to 3NF except three documented denormalizations (each cache has one writer, maintained transactionally): `motorcycles.current_odometer_km`, `motorcycles.odometer_offset_km` (ADR-009), schedule anchor columns (§5.2). Data integrity is priority #1: FKs ON, transactions for multi-table writes, CHECK constraints where SQLite allows.

## 2. Entity relationships

```
motorcycles 1─* maintenance_schedules 1─* maintenance_records
motorcycles 1─* repairs / expenses / fuel_logs / odometer_logs / documents(motorcycle_id nullable)
scheduled_notifications *─1 (polymorphic source: schedule | document | system)
app_settings (key-value, no FKs)
```

## 3. Conventions (sync-ready, ADR-006)

Every **user-data** table (all except `app_settings`, `scheduled_notifications`) carries:

| Column | Type | Rule |
|---|---|---|
| `id` | TEXT PK | UUIDv4, generated on device (`src/lib/uuid.ts`) |
| `created_at` | INTEGER NOT NULL | ms epoch UTC, set once |
| `updated_at` | INTEGER NOT NULL | ms epoch UTC, set on every write (repository-enforced) |
| `deleted_at` | INTEGER NULL | soft delete; queries filter `IS NULL` by default (§7) |

Types: money `INTEGER` centavos (ADR-008) · calendar dates `TEXT 'YYYY-MM-DD'` · timestamps `INTEGER` ms epoch · booleans `INTEGER 0/1` · enums `TEXT` with CHECK. No AUTOINCREMENT anywhere.

## 4. Naming

Tables: plural `snake_case`. Columns: `snake_case`; FKs `<entity>_id`; money `*_centavos`; km `*_km`; dates `*_date`; timestamps `*_at`. Indexes: `idx_<table>_<cols>`. Drizzle maps to camelCase TS properties automatically.

## 5. Tables

### 5.1 `motorcycles`
| Column | Type | Constraints |
|---|---|---|
| nickname | TEXT NOT NULL | 1–30 chars (app-validated); unique among non-deleted (partial unique index, case-insensitive via COLLATE NOCASE) |
| brand | TEXT NOT NULL | |
| model | TEXT NOT NULL | |
| year | INTEGER NULL | CHECK 1980–2100 |
| drivetrain_type | TEXT NOT NULL | CHECK in ('cvt','chain','other') |
| photo_path | TEXT NULL | relative path in app storage ([SECURITY.md](SECURITY.md) §4) |
| plate_number | TEXT NULL | |
| vin | TEXT NULL · engine_number | TEXT NULL | |
| purchase_date | TEXT NULL · purchase_price_centavos | INTEGER NULL | |
| current_odometer_km | INTEGER NOT NULL DEFAULT 0 | cache = max effective ([BUSINESS_RULES.md](BUSINESS_RULES.md) §6.1) |
| odometer_offset_km | INTEGER NOT NULL DEFAULT 0 | ADR-009 |
| is_archived | INTEGER NOT NULL DEFAULT 0 | |
| sort_order | INTEGER NOT NULL DEFAULT 0 | garage ordering |

### 5.2 `maintenance_schedules`
| Column | Type | Constraints |
|---|---|---|
| motorcycle_id | TEXT NOT NULL | FK → motorcycles ON DELETE RESTRICT (deletes are soft; hard cascade only at purge) |
| component_type | TEXT NOT NULL | CHECK in the 22-value enum ([BUSINESS_RULES.md](BUSINESS_RULES.md) §2) |
| custom_name | TEXT NULL | required iff component_type='custom' |
| interval_km | INTEGER NULL | CHECK 100–100000 |
| interval_months | INTEGER NULL | CHECK 1–120; **CHECK (interval_km IS NOT NULL OR interval_months IS NOT NULL)** |
| is_enabled | INTEGER NOT NULL DEFAULT 1 | |
| is_muted | INTEGER NOT NULL DEFAULT 0 | notifications only |
| snoozed_until | TEXT NULL | date; [NOTIFICATION_ENGINE.md](NOTIFICATION_ENGINE.md) §6 |
| anchor_odometer_km | INTEGER NULL | effective km; denormalized from latest record/baseline |
| anchor_date | TEXT NULL | |
| anchor_source | TEXT NULL | CHECK in ('record','baseline') |

Unique: `(motorcycle_id, component_type)` for non-custom, non-deleted rows (partial index); custom rows unlimited.

### 5.3 `maintenance_records`
| Column | Type | Constraints |
|---|---|---|
| motorcycle_id | TEXT NOT NULL FK · schedule_id | TEXT NOT NULL FK | both kept: schedule may be soft-deleted later; bike scoping must survive |
| performed_date | TEXT NOT NULL | ≤ today |
| odometer_km | INTEGER NULL | raw reading; effective computed to `odometer_logs` |
| service_type | TEXT NOT NULL | CHECK in ('replace','clean','adjust') |
| cost_centavos | INTEGER NULL | ≥ 0 |
| brand | TEXT NULL · quantity | TEXT NULL | free-form quantity+unit display |
| details | TEXT NULL | JSON, Zod-validated per component (ADR-007, [BUSINESS_RULES.md](BUSINESS_RULES.md) §5) |
| notes | TEXT NULL | ≤ 500 |
| photo_path | TEXT NULL | receipt |
| source | TEXT NOT NULL DEFAULT 'user' | CHECK in ('user','import','workshop') — future-proofing (R-50) |

### 5.4 `repairs`
motorcycle_id FK · title TEXT NOT NULL · repair_date TEXT NOT NULL · odometer_km INTEGER NULL · problem/diagnosis/solution TEXT NULL · shop_name TEXT NULL · cost_centavos INTEGER NULL · photo_paths TEXT NULL (JSON array ≤ 3) · notes TEXT NULL.

### 5.5 `expenses`
motorcycle_id FK · category TEXT NOT NULL CHECK (11-value enum, [BUSINESS_RULES.md](BUSINESS_RULES.md) §9.1) · amount_centavos INTEGER NOT NULL ≥ 0 · expense_date TEXT NOT NULL · notes TEXT NULL · photo_path TEXT NULL. (Standalone entries only — union view ADR-021.)

### 5.6 `fuel_logs`
motorcycle_id FK · fuel_date TEXT NOT NULL · liters REAL NOT NULL CHECK 0.1–99.99 · total_cost_centavos INTEGER NOT NULL · odometer_km INTEGER NOT NULL · station TEXT NULL · is_full_tank INTEGER NOT NULL DEFAULT 1 · notes TEXT NULL.

### 5.7 `odometer_logs`
motorcycle_id FK · reading_km INTEGER NOT NULL CHECK 0–999999 · effective_km INTEGER NOT NULL (ADR-009) · recorded_date TEXT NOT NULL · source TEXT NOT NULL CHECK in ('initial','manual','fuel','maintenance','repair') · source_id TEXT NULL (originating row for cascade edits).

### 5.8 `documents`
motorcycle_id TEXT NULL FK (null = rider-level license) · doc_type TEXT NOT NULL CHECK in ('orcr','insurance','license','warranty','receipt','invoice','other') · title TEXT NOT NULL · file_path TEXT NOT NULL (relative) · mime_type TEXT NOT NULL · file_size INTEGER NOT NULL · expiry_date TEXT NULL · notes TEXT NULL.

### 5.9 `scheduled_notifications` (operational, not user data — no soft delete, excluded from backup)
id TEXT PK · notification_id TEXT NOT NULL (OS handle) · source_type TEXT NOT NULL CHECK in ('schedule','document','system') · source_id TEXT NULL · fire_at INTEGER NOT NULL · created_at INTEGER NOT NULL.

### 5.10 `app_settings` (key-value; operational)
key TEXT PK · value TEXT NOT NULL (JSON) · updated_at INTEGER NOT NULL. Known keys: `theme`, `language`, `active_bike_id`, `notification_prefs`, `quiet_hours`, `fire_time`, `last_backup_at`, `onboarding_state`, `entitlement_pro`, `entitlement_checked_at`, `dismissed_nudges`, `schema_seed_version`, `crash_reports_enabled`. **Included** in backup (user preferences), except entitlement keys ([BACKUP_RECOVERY.md](BACKUP_RECOVERY.md) §3).

## 6. Indexes

FYI every FK column is indexed. Beyond those:
`idx_records_bike_date (motorcycle_id, performed_date DESC)` — history timeline · `idx_records_schedule_date (schedule_id, performed_date DESC)` — anchors/component history · `idx_odo_bike_date (motorcycle_id, recorded_date DESC)` — projections, monotonicity checks · `idx_fuel_bike_date`, `idx_expenses_bike_date`, `idx_repairs_bike_date` — lists/unions · `idx_docs_expiry (expiry_date) WHERE expiry_date IS NOT NULL` — reminder planning · `idx_sched_notif_fire (fire_at)` — pruning · partial uniques from §5.1/5.2. Query plans verified against these in [SQLITE_GUIDE.md](SQLITE_GUIDE.md) §6.

## 7. Soft delete & purge

Repositories filter `deleted_at IS NULL` by default (explicit `withDeleted` escape for restore/undo). `CleanupService` (startup, deferred) hard-deletes rows with `deleted_at < now−30d` — children before parents (records/logs → schedules → motorcycles) — and removes their files. Undo window in UI = 5 s snackbar; recovery window = 30 days via support/restore paths.

## 8. Migrations (constitutional: zero data loss — ADR-022)

1. Generated by drizzle-kit, numbered, committed, bundled with the app; applied sequentially at startup inside a transaction before any query ([DATA_FLOW.md](DATA_FLOW.md) §1).
2. **Forward-only.** No down-migrations; recovery is restore-from-backup.
3. **Expand–migrate–contract** for any narrowing change: add new column/table → backfill in-migration → switch code → drop old thing **at least one release later**.
4. Never: DROP TABLE/COLUMN with data, type changes in place, constraint tightening without a verified backfill.
5. Every migration ships with a test that applies it to a populated fixture DB of the previous version and asserts row counts + spot values survive ([TESTING.md](TESTING.md) §4).
6. `PRAGMA user_version` mirrors the migration number for fast checks + backup manifest ([BACKUP_RECOVERY.md](BACKUP_RECOVERY.md) §3).

## 9. Seed data

Default intervals + Health-Score weights ship as versioned seed config (`src/db/seed/`), applied/upgraded via `schema_seed_version` — **user-edited schedule rows are never overwritten by seed upgrades**; only the defaults used for *new* bikes update ([BUSINESS_RULES.md](BUSINESS_RULES.md) §3).

## 10. Evolution

- **MVP:** the 10 tables above.
- **Phase 2 (sync):** additive only — `sync_outbox` table + `last_synced_at` metadata; server mirror per [SUPABASE_SYNC_PLAN.md](SUPABASE_SYNC_PLAN.md) §3. No existing column changes (that's the point of §3 conventions).
- **Phase 3:** `maintenance_records.source='workshop'` becomes active; fleet grouping lives server-side, not in local schema.
- **Long-term:** if per-model schedule templates arrive (R-33), they land as a new `schedule_templates` reference table feeding §9 seeding — user schedules untouched.
