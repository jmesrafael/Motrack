# DATA_FLOW.md — How Data Moves at Runtime

> **Owns:** read/write paths, the recalculation cascade, and the event model. Layer definitions: [SOFTWARE_ARCHITECTURE.md](SOFTWARE_ARCHITECTURE.md); store internals: [STATE_MANAGEMENT.md](STATE_MANAGEMENT.md); SQL practices: [SQLITE_GUIDE.md](SQLITE_GUIDE.md).

## 1. Startup sequence

1. Root layout mounts providers (Theme → i18n → ErrorBoundary → DB gate).
2. `db/client.ts` opens SQLite → `MigrationRunner` applies pending migrations in a transaction (ADR-022). Failure = blocking error screen with backup guidance ([ERROR_HANDLING.md](ERROR_HANDLING.md) §7) — never a half-migrated app.
3. Seed check: default interval/weight config rows present/updated (versioned seed, [BUSINESS_RULES.md](BUSINESS_RULES.md) §1).
4. Settings load → stores hydrate (active bike, theme, language) → navigation renders (onboarding if no bike).
5. Deferred (post-first-frame): notification re-plan if stale ([NOTIFICATION_ENGINE.md](NOTIFICATION_ENGINE.md) §5), `CleanupService` purge, entitlement refresh (network, fire-and-forget), Sentry init.
Budget for 1–4: [PERFORMANCE.md](PERFORMANCE.md) §2.

## 2. Read path (screens)

`Screen → hook → store slice` — slices hold **view models** loaded via repositories. First subscription triggers load; subsequent renders read memoized state via selectors. No component ever queries the DB directly. Lists page via repository `limit/offset` queries ([PERFORMANCE.md](PERFORMANCE.md) §5).

## 3. Write path (canonical sequence)

Example — saving a maintenance record (Quick Log, F-2):

```
Screen (S-12q submit)
 → useQuickLog().save(input)
 → MaintenanceService.saveRecord(input)
     1. Zod-validate input (services/validation)
     2. Business checks (odometer monotonicity via OdometerService)
     3. TRANSACTION:
        insert maintenance_records
        insert odometer_logs (source 'maintenance')
        update motorcycles.current_odometer_km (cache)
        update schedule anchor
     4. emit DomainEvent 'maintenance:changed' { bikeId, scheduleId }
 ← Result<Record, AppError>
 → hook: toast+undo on Ok / inline errors on Err
```

The UI updates optimistically only after the transaction resolves (< 50 ms locally — perceived-instant without risking phantom rows; [UI_UX_GUIDELINES.md](UI_UX_GUIDELINES.md) §4).

## 4. The recalculation cascade (single definition)

Triggered by any mutation of: maintenance records, odometer logs, fuel logs, repairs (with odometer), schedules/baselines, documents (expiry), settings (notification prefs), bike archive/delete — and by app-foreground date rollover.

```
mutation (in transaction) 
  → DomainEvent emitted after commit
  → StatusService recomputes affected schedules' due ratios
  → HealthScoreService recomputes (derived, ADR-019)
  → affected store slices invalidate & reload their view models
  → ReminderPlanner full re-plan → NotificationScheduler diff/apply (NOTIFICATION_ENGINE §5)
```

Everything is synchronous-fast except the notification step, which is queued (serialized, latest-wins) so rapid edits don't thrash the OS scheduler.

## 5. Domain events (in-process only, MVP)

Tiny typed emitter (`src/lib/events.ts`): `maintenance:changed`, `odometer:changed`, `fuel:changed`, `repair:changed`, `schedule:changed`, `document:changed`, `bike:changed`, `settings:changed`. Rules: emitted by **services only**, after commit; payload = ids, never entities (subscribers reload what they need); stores subscribe for invalidation ([STATE_MANAGEMENT.md](STATE_MANAGEMENT.md) §4). This is the seam where the Phase-2 sync outbox attaches.

## 6. File data flow (documents/photos)

Picker/camera → `DocumentService`: EXIF-strip + compress ([PERFORMANCE.md](PERFORMANCE.md) §6) → write to app-private `documents/` dir with UUID filename → insert `documents` row (relative path only) → event → UI. Deletion: soft-delete row; file removed by `CleanupService` after the 30-day purge window (restore-friendly). Backup/export read files by joining rows→paths ([BACKUP_RECOVERY.md](BACKUP_RECOVERY.md) §3).

## 7. Evolution

- **MVP:** all local, above.
- **Phase 2 (sync):** the cascade gains one step — mutations also write an outbox row in the same transaction; `SyncEngine` drains the outbox and applies pulled changes **through the same services** (so cascades/replans fire identically for remote changes). Events gain `origin: 'local' | 'sync'`. See [SUPABASE_SYNC_PLAN.md](SUPABASE_SYNC_PLAN.md) §4.
- **Phase 3:** workshop-originated records arrive via sync with `source='workshop'` and flow through unchanged.
- **Long-term:** if event volume ever justifies it, the in-process emitter can be replaced by a persisted event log — same event names, ADR required.
