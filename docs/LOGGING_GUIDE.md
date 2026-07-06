# LOGGING_GUIDE.md — Logging & Crash Reporting

> **Owns:** the log facade, levels, privacy rules, and Sentry configuration. Error taxonomy: [ERROR_HANDLING.md](ERROR_HANDLING.md); privacy policy: [SECURITY.md](SECURITY.md) §7, [PRODUCT_DECISIONS.md](PRODUCT_DECISIONS.md) §11.

## 1. The facade

All logging through `src/lib/log.ts` — `log.debug|info|warn|error(message, context?)`. Direct `console.*` outside the facade is lint-banned ([CODE_STYLE.md](CODE_STYLE.md) §9). Dev: pretty console. Production: `debug` dropped; `info+` kept in a small in-memory ring buffer (last 200 entries) attached as breadcrumbs to crash reports; `error` also forwarded to Sentry as handled events.

## 2. Levels

| Level | Use | Production |
|---|---|---|
| `debug` | dev diagnostics | stripped |
| `info` | lifecycle milestones: migration applied, backup created, re-plan completed, restore done | breadcrumb |
| `warn` | degraded-but-continuing: notification cap hit, projection fallback used, purge skipped | breadcrumb |
| `error` | any `AppError` at service boundary + all caught exceptions | breadcrumb + Sentry |

Messages are English, stable, machine-greppable (`"backup.create.success"` style key + human tail); never localized.

## 3. Privacy rules (binding)

Never log: document contents/paths+filenames, plate/VIN/engine numbers, nicknames, notes, money amounts, or any free-text user input. Allowed context: entity **ids**, counts, durations, enum values, booleans. Sentry config: `sendDefaultPii:false`, breadcrumb scrubber strips URLs/paths, no user identifier set (none exists in MVP). Crash reports carry: OS/device model, app version, migration version, and the ring buffer.

## 4. Crash reporting (ADR-014)

`@sentry/react-native` initialized deferred post-first-frame ([DATA_FLOW.md](DATA_FLOW.md) §1.5), respecting the `crash_reports_enabled` setting (default on; toggle S-33; takes effect immediately). Offline: SDK queues. Performance tracing sampled at 10% (startup + navigation transactions only) to watch the [PERFORMANCE.md](PERFORMANCE.md) budgets in the wild.

## 5. What to log (checklist for implementers)

Every migration (version, duration, row counts) · backup/restore (sizes, counts, durations — no filenames) · notification re-plans (counts scheduled/dropped) · cleanup purges (counts) · entitlement refreshes (state only) · all `error`-level per §2. When adding a feature, add its §5 lines in the same PR ([CONTRIBUTING.md](CONTRIBUTING.md)).

## 6. Evolution

**Phase 2:** sync engine logs cycle summaries (pushed/pulled/conflict counts); optional PostHog product analytics — if adopted (ADR + privacy-policy update + opt-**in** consent), events go through this same facade. **Phase 3+:** server-side logs (edge functions) follow the same privacy rules; correlation via request ids, never user content.
