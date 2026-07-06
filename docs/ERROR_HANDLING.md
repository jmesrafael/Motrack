# ERROR_HANDLING.md — Errors as a System

> **Owns:** error taxonomy, propagation, and user-facing failure behavior. Logging of errors: [LOGGING_GUIDE.md](LOGGING_GUIDE.md); crash reporting: ADR-014; UI surfaces: [SCREEN_SPECIFICATIONS.md](SCREEN_SPECIFICATIONS.md) §0.

## 1. Philosophy

Priority order applies ([PRODUCT_DECISIONS.md](PRODUCT_DECISIONS.md) §13): protect data first, keep the user moving second. Errors are **expected outcomes with designed paths**, not exceptions bubbling to a red screen. A rider outside a talyer with a failing save must always know: did it save, and what do I do now?

## 2. Taxonomy (`AppError`, discriminated union in `src/lib/result.ts`)

| Kind | Examples | Default handling |
|---|---|---|
| `ValidationError` | bad field, odometer conflict | Inline field errors + fix-it options (never a toast-only) |
| `BusinessRuleError` | bike limit reached, restore version too new | Contextual sheet/dialog with the specific path forward |
| `DbError` | SQL failure, constraint hit | Retry once → `ErrorState` with report option; logged always |
| `FileError` | disk full, missing file, unreadable import | Actionable message ("Free up space"); never partial writes (temp-file + rename pattern) |
| `NotificationError` | permission denied, OS limit | Silent degrade + one-time nudge card ([NOTIFICATION_ENGINE.md](NOTIFICATION_ENGINE.md) §9) |
| `PurchaseError` | store offline, cancelled, pending | Paywall inline states ([PREMIUM_SYSTEM.md](PREMIUM_SYSTEM.md) §5); cancellation is not an error UI |
| `MigrationError` / `CorruptionError` | failed migration, quick_check fail | Blocking recovery screen (§7) |

## 3. Propagation rules

1. **Repositories** throw `DbError` (wrapping the driver error, with query context, no user data in the message).
2. **Services** catch, wrap, and return `Result<T, AppError>` — services never throw for expected failures; only programmer errors (bugs) throw.
3. **Hooks/stores** map `Result` to UI state; **components** render states, never `try/catch`.
4. Programmer errors reach the **root ErrorBoundary**: friendly full-screen fallback ("Something broke — your data is safe"), auto-reported to Sentry, "restart" action. Boundary also wraps each tab so one tab's crash doesn't kill navigation.
5. `console.error` is banned outside the log facade ([LOGGING_GUIDE.md](LOGGING_GUIDE.md)); silent `catch {}` is a review-blocker ([CODE_STYLE.md](CODE_STYLE.md) §9).

## 4. `Result` pattern

`type Result<T,E=AppError> = { ok:true; value:T } | { ok:false; error:E }` with helpers (`ok`, `err`, `map`, `unwrapOr`). Exhaustive `switch` on `error.kind` at UI mapping points (compiler-enforced totality).

## 5. Async & background failures

Deferred jobs (cleanup, re-plan, entitlement refresh) catch-log-continue: a background failure never surfaces a modal; user-visible impact only if a *user action* depended on it. Each job is independently try-caught so one failure doesn't stop the startup chain ([DATA_FLOW.md](DATA_FLOW.md) §1.5).

## 6. User-facing copy

Error copy follows [UI_UX_GUIDELINES.md](UI_UX_GUIDELINES.md) §6: say what happened + what to do, never codes alone ("Couldn't save — storage is full. Free up space and tap retry."). All via i18n keys `error.*`. Technical detail goes to the log/report, not the screen.

## 7. Catastrophic recovery (migration/corruption)

Blocking screen (pre-navigation) with, in order: (1) retry; (2) restore from backup ([BACKUP_RECOVERY.md](BACKUP_RECOVERY.md)); (3) export-what's-readable attempt (best-effort dump of intact tables to a share-able file); (4) reset app (typed confirmation, last resort). Every step logged + reported. This screen is tested against fixture corruption cases ([TESTING.md](TESTING.md) §4).

## 8. Evolution

**Phase 2:** + `SyncError`/`AuthError`/`NetworkError` kinds; sync failures accumulate quietly into the sync status row, never modals ([SUPABASE_SYNC_PLAN.md](SUPABASE_SYNC_PLAN.md) §4); AI-feature errors degrade to "try later" inline. **Phase 3+:** taxonomy extends, rules unchanged.
