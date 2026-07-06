# STATE_MANAGEMENT.md — Zustand Patterns

> **Owns:** what state exists where, store design rules, and persistence. Data movement: [DATA_FLOW.md](DATA_FLOW.md); layer rules: [SOFTWARE_ARCHITECTURE.md](SOFTWARE_ARCHITECTURE.md).

## 1. State taxonomy — decide placement first

| Kind | Lives in | Example |
|---|---|---|
| **Persistent domain data** | SQLite only (source of truth) | bikes, records, logs |
| **View models** (loaded projections of DB data) | Zustand slices, invalidated by events | dashboard summary, schedule statuses |
| **Session/UI state** | Zustand slices | active bike id, filters, sheet visibility |
| **Settings** | SQLite `app_settings` + mirrored in a slice | theme, language, notification prefs |
| **Form state** | React Hook Form (never Zustand) | any form in progress |
| **Ephemeral component state** | `useState` | expanded row, input focus |

Rule: if it can be recomputed from SQLite, it is a view model — never a second source of truth. Health Score is always derived (ADR-019).

## 2. Store slices (MVP inventory)

`useSettingsStore` (theme, language, notification prefs, activeBikeId, onboarding progress, dismissed nudges) · `useGarageStore` (bike list VMs + active bike VM) · `useMaintenanceStore` (schedule statuses, history pages, component detail) · `useMoneyStore` (expense/fuel VMs, month selection) · `useDocumentStore` · `useStatsStore` · `useEntitlementStore` (isPro, purchase state) · `useReminderStore` (upcoming list, S-05).

One file per slice in `src/stores/`; no god-store. Slices may not import each other — cross-slice reads happen in hooks.

## 3. Store design rules

1. Shape: `{ data…, status: 'idle'|'loading'|'ready'|'error', actions… }`. Actions call services; services return `Result` ([ERROR_HANDLING.md](ERROR_HANDLING.md) §4).
2. **Components subscribe via selectors** (`useGarageStore(s => s.activeBike)`) — never whole-store subscriptions (re-render budget, [PERFORMANCE.md](PERFORMANCE.md) §4).
3. Stores contain **no business logic** — they orchestrate load/invalidate and hold results. A formula in a store is a review-blocker ([DEVELOPMENT_RULES.md](DEVELOPMENT_RULES.md)).
4. Mutations flow through services; stores never write to repositories directly.
5. Derived values used by multiple screens are computed in the slice once (e.g., overdue count), not re-derived in components.

## 4. Invalidation (event-driven)

Slices subscribe to domain events ([DATA_FLOW.md](DATA_FLOW.md) §5) and reload affected view models (`maintenance:changed` → maintenance + garage + reminder slices; `settings:changed` → theme/i18n appliers). Reloads are per-bike-scoped where the payload allows. No polling, no manual "refresh" plumbing in screens.

## 5. Persistence

Only `useSettingsStore` persists — and to **SQLite `app_settings`** (via SettingsRepository), not AsyncStorage: one storage engine, one backup path ([BACKUP_RECOVERY.md](BACKUP_RECOVERY.md) covers settings automatically). Hydration happens in the startup sequence before first render ([DATA_FLOW.md](DATA_FLOW.md) §1). Entitlement cache persists via the same table (`entitlement_pro=true` + last-verified timestamp, [PREMIUM_SYSTEM.md](PREMIUM_SYSTEM.md) §5).

## 6. Testing

Slices are tested with real service fakes ([TESTING.md](TESTING.md) §5): dispatch action → assert state transitions incl. `status` and event-driven invalidation.

## 7. Evolution

- **MVP:** above.
- **Phase 2:** TanStack Query manages **remote** state (sync status, model-DB lookups, AI calls); Zustand keeps UI/session + local VMs. Do not migrate local VMs into Query — the DB is local and event-invalidated already. `useEntitlementStore` gains subscription to Supabase auth state.
- **Phase 3:** fleet dashboards (web) use the same slice patterns over synced data.
- **Long-term:** if VM invalidation grows hairy, adopt a small local-first query layer via ADR — the hook-level API (`useDashboard()` etc.) shields screens from that swap.
