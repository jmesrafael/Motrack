# SQLITE_GUIDE.md — expo-sqlite + Drizzle Operational Practices

> **Owns:** how we operate SQLite correctly and fast on device. Schema: [DATABASE_DESIGN.md](DATABASE_DESIGN.md). Layer rules: [SOFTWARE_ARCHITECTURE.md](SOFTWARE_ARCHITECTURE.md) (repositories are the only SQL layer).

## 1. Connection & pragmas

One database (`motrack.db`), one long-lived connection opened by `src/db/client.ts` at startup:

```
PRAGMA journal_mode = WAL;        -- concurrent read during write; crash-safe
PRAGMA foreign_keys = ON;         -- per-connection, must be set every open
PRAGMA busy_timeout = 5000;
PRAGMA user_version = <migration number>;  -- maintained by MigrationRunner
```

WAL checkpointing left at defaults; `wal_checkpoint(TRUNCATE)` before creating a backup export to stabilize size ([BACKUP_RECOVERY.md](BACKUP_RECOVERY.md) §3).

## 2. Drizzle usage rules

- Schema defined once in `src/db/schema.ts` mirroring [DATABASE_DESIGN.md](DATABASE_DESIGN.md) §5 exactly (tables, CHECKs via SQL, indexes).
- Queries via Drizzle's typed builder; raw SQL allowed only for the expense UNION (ADR-021) and `EXPLAIN QUERY PLAN` checks — always inside repositories, always parameterized (**never string-interpolated**; injection is a real risk with imported backup data — [SECURITY.md](SECURITY.md) §5).
- Repositories set `updated_at` on every write; `id`/`created_at` at insert (helpers in `src/db/repositories/base.ts`).

## 3. Reads

- List queries: select only needed columns, `LIMIT/OFFSET` paging (page 50) for history/logs ([PERFORMANCE.md](PERFORMANCE.md) §5).
- Aggregates (statistics, month sums) computed in SQL, not JS loops over full tables.
- The unified expense view is a UNION ALL of four selects with category mapping in SQL ([BUSINESS_RULES.md](BUSINESS_RULES.md) §9.1), sorted+paged as one query.

## 4. Writes & transactions

- Any multi-row/multi-table mutation runs in a single transaction owned by the **service** (`db.transaction(...)`) — e.g., the maintenance-save sequence ([DATA_FLOW.md](DATA_FLOW.md) §3).
- Transactions are short: no file I/O, no awaiting network inside a transaction.
- Batch imports (restore) chunk inserts (500/statement batch) inside one outer transaction with progress callbacks ([BACKUP_RECOVERY.md](BACKUP_RECOVERY.md) §4).

## 5. Concurrency model

JS is single-threaded; expo-sqlite serializes statements — the risks are (a) interleaved async service calls and (b) long write transactions starving the UI. Rules: services that mutate shared aggregates (odometer cache, anchors) go through their owning service (single writer per aggregate); the notification re-plan queue serializes itself ([DATA_FLOW.md](DATA_FLOW.md) §4). No second connection except the restore path (which swaps databases atomically, [BACKUP_RECOVERY.md](BACKUP_RECOVERY.md) §4).

## 6. Performance verification

- Every repository list/aggregate query gets an `EXPLAIN QUERY PLAN` check in development against the §6 indexes ([DATABASE_DESIGN.md](DATABASE_DESIGN.md)) — no `SCAN TABLE` on paged lists.
- Perf tests run against the **large fixture** (5 bikes, 5,000 records, 3,000 fuel logs, 10,000 odometer rows) ([TESTING.md](TESTING.md) §4; budgets [PERFORMANCE.md](PERFORMANCE.md) §3).
- `ANALYZE` run after migrations that add indexes.

## 7. Corruption & integrity

- `PRAGMA quick_check` on startup (deferred); failure → guided recovery flow: attempt export of readable data + restore from last backup ([ERROR_HANDLING.md](ERROR_HANDLING.md) §7).
- The DB file lives in the OS-backed-up app data dir; documents live outside the DB as files (paths only in DB) to keep the DB small and dumps fast.

## 8. Evolution

**Phase 2:** sync outbox writes join existing transactions (same connection); consider `sqlite-vec`/FTS only if search features demand (ADR first). **Phase 3+:** no change expected; scale ceiling of this design (~100k rows/table) far exceeds single-user reality.
