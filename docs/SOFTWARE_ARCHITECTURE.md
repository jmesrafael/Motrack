# SOFTWARE_ARCHITECTURE.md — Layers, Services, Repositories, Hooks

> **Owns:** the layering model and module responsibilities. **Does not own:** folder paths ([FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md)), state store design ([STATE_MANAGEMENT.md](STATE_MANAGEMENT.md)), runtime data movement ([DATA_FLOW.md](DATA_FLOW.md)), schema ([DATABASE_DESIGN.md](DATABASE_DESIGN.md)). Enforced by import-boundary lint rules ([CODE_STYLE.md](CODE_STYLE.md) §8).

## 1. The layers (one-way dependencies, top → bottom)

```
┌ Routes/Screens (Expo Router)   – composition only
├ Components (src/components, feature ui/) – presentation only
├ Hooks (feature hooks)          – bind screens to stores/services
├ Stores (Zustand)               – UI/session state, view caches
├ Services (src/services, feature logic) – ALL business logic; React-free
├ Repositories (src/db/repositories)      – ALL SQL; Drizzle only here
└ Database (expo-sqlite via Drizzle)      + Platform adapters (notifications, files, IAP, crash)
```

**Rules:**
1. A layer imports only from layers below it (components may import hooks' *types*, not hooks).
2. **Services never import React, React Native UI, or stores.** They take inputs, return `Result`s, and emit domain events ([DATA_FLOW.md](DATA_FLOW.md) §5). This keeps them unit-testable and reusable server/web-side long-term.
3. **Repositories are the only files containing Drizzle/SQL.** One repository per aggregate. No cross-repository imports — cross-aggregate operations are orchestrated by services within a transaction ([SQLITE_GUIDE.md](SQLITE_GUIDE.md) §4).
4. **Components/screens never touch repositories or the DB.** Screens call hooks; hooks call stores/services.
5. Platform APIs (expo-notifications, file system, RevenueCat, Sentry) are wrapped in **adapters** (`src/services/adapters/`) so services depend on interfaces — swap/mocked in tests ([TESTING.md](TESTING.md) §3).

## 2. Module inventory (MVP)

### Repositories (src/db/repositories)
`MotorcycleRepository` · `ScheduleRepository` · `MaintenanceRepository` · `RepairRepository` · `ExpenseRepository` (incl. the union read, ADR-021) · `FuelRepository` · `OdometerRepository` · `DocumentRepository` · `NotificationRepository` (scheduled_notifications) · `SettingsRepository`. All expose typed CRUD + purpose-built queries; all filter `deleted_at IS NULL` by default.

### Services (src/services + feature services)
| Service | Responsibility (spec) |
|---|---|
| `MotorcycleService` | Bike CRUD orchestration: default-schedule creation, drivetrain re-gating, archive/delete cascades ([FEATURE_SPECIFICATIONS.md](FEATURE_SPECIFICATIONS.md) §2, §5.5) |
| `MaintenanceService` | Record save/edit/delete + anchor updates + cascade trigger ([FEATURE_SPECIFICATIONS.md](FEATURE_SPECIFICATIONS.md) §6.3) |
| `ScheduleService` | Interval edits, enable/disable, baselines, custom components |
| `OdometerService` | Reading validation, corrections, meter-replacement offsets ([BUSINESS_RULES.md](BUSINESS_RULES.md) §6) |
| `StatusService` | Due ratios/status per schedule ([BUSINESS_RULES.md](BUSINESS_RULES.md) §4) |
| `HealthScoreService` | Pure score function ([HEALTH_SCORE.md](HEALTH_SCORE.md)) |
| `FuelService` | Fuel math ([BUSINESS_RULES.md](BUSINESS_RULES.md) §7) |
| `StatisticsService` | Aggregations ([BUSINESS_RULES.md](BUSINESS_RULES.md) §9) |
| `ReminderPlanner` + `NotificationScheduler` | Plan/schedule split (ADR-015, [NOTIFICATION_ENGINE.md](NOTIFICATION_ENGINE.md) §5) |
| `DocumentService` | Import/compress/store/delete files + metadata ([SECURITY.md](SECURITY.md) §4) |
| `BackupService` / `RestoreService` | Archive create/validate/import ([BACKUP_RECOVERY.md](BACKUP_RECOVERY.md)) |
| `ExportService` | CSV/PDF generation ([EXPORT_IMPORT.md](EXPORT_IMPORT.md)) |
| `EntitlementService` | Pro gating (ADR-023, [PREMIUM_SYSTEM.md](PREMIUM_SYSTEM.md)) |
| `MigrationRunner` | Startup migrations (ADR-022) |
| `CleanupService` | 30-day purge of soft deletes + orphan files ([DATABASE_DESIGN.md](DATABASE_DESIGN.md) §7) |

### Hooks (feature-level)
Thin bindings, e.g. `useDashboard(bikeId)`, `useSchedules(bikeId)`, `useQuickLog()`, `useFuelStats(bikeId)` — subscribe to store slices, expose service actions, own no logic beyond wiring. Naming/patterns: [CODE_STYLE.md](CODE_STYLE.md) §5.

## 3. Feature-module organization

Code is grouped by feature (garage, maintenance, fuel, expenses, documents, reminders, stats, settings, premium, backup) — each with `ui/`, `hooks/`, and optional feature service; shared kernel in `src/{components,services,db,stores,lib,theme,i18n,config}`. Exact tree: [FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md).

## 4. Error, logging, transactions (cross-cutting)

- Services return `Result<T, AppError>`; repositories throw typed `DbError` which services catch/wrap ([ERROR_HANDLING.md](ERROR_HANDLING.md) §3–4).
- Multi-table mutations run in one SQLite transaction owned by the service ([DATA_FLOW.md](DATA_FLOW.md) §4; [SQLITE_GUIDE.md](SQLITE_GUIDE.md) §4).
- Logging via the `log` facade only ([LOGGING_GUIDE.md](LOGGING_GUIDE.md)).

## 5. Validation strategy (single source)

Zod schemas per domain input (e.g. `maintenanceRecordInput`) live beside domain types (`src/services/validation/`). React Hook Form uses them via resolver (UI) **and** services re-validate at the boundary (defense in depth — services can't trust callers; [SECURITY.md](SECURITY.md) §5). Field rules trace to [FEATURE_SPECIFICATIONS.md](FEATURE_SPECIFICATIONS.md) / [BUSINESS_RULES.md](BUSINESS_RULES.md).

## 6. What lives where — quick test

"Does X belong in a component?" → only if it's rendering/interaction. "In a hook?" → only wiring. "In a service?" → any if/formula/sequence a tester would write a case for. "In a repository?" → only query shape. Anything failing all four is probably `src/lib/` (pure utilities) or config.

## 7. Evolution

- **MVP:** as above.
- **Phase 2:** + `SyncEngine` service (outbox/pull, [SUPABASE_SYNC_PLAN.md](SUPABASE_SYNC_PLAN.md) §4) and `AuthService`; TanStack Query enters at the hook layer for remote reads only — local layering unchanged. AI features are services calling edge functions ([API_STRATEGY.md](API_STRATEGY.md) §3).
- **Phase 3:** workshop/community modules as isolated features flag-gated at the route level; fleet web app reuses services via the shared domain package.
- **Long-term:** services + validation extracted to `packages/domain` (monorepo) shared by app/web/edge — enabled by rule §1.2 (React-free services). No layer change anticipated.
