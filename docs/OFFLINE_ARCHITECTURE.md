# OFFLINE_ARCHITECTURE.md — The Offline-First Guarantee

> **Owns:** what offline-first means here, how it's enforced, and how connectivity is treated. Sync design: [SUPABASE_SYNC_PLAN.md](SUPABASE_SYNC_PLAN.md). Policy: [PRODUCT_DECISIONS.md](PRODUCT_DECISIONS.md) §3.

## 1. The guarantee

**Every MVP feature works with the radio off, forever** — create/read/edit/delete anything, reminders fire, exports and backups generate, Pro features (once purchased) keep working. Airplane-mode is a first-class QA environment, not an edge case ([TESTING.md](TESTING.md) §7).

## 2. How it's true by construction

- The **only** data store is on-device SQLite ([DATABASE_DESIGN.md](DATABASE_DESIGN.md)); no repository or service has a network dependency in MVP.
- Notifications are locally scheduled (ADR-015). Files are local (documents dir). Exports/backups are local file generation + OS share sheet.
- The three network touchpoints and their offline behavior:

| Touchpoint | Offline behavior |
|---|---|
| RevenueCat purchase/restore | Paywall shows "requires internet" inline (S-34); **owned entitlement is cached** and never re-checked to *deny* ([PREMIUM_SYSTEM.md](PREMIUM_SYSTEM.md) §5) |
| Sentry crash upload | Queued by SDK, sent when possible; zero user impact |
| Store app updates | OS concern |

## 3. Enforcement rules

1. Adding **any** network call requires an ADR + a defined offline degradation path — CI greps for `fetch(`/network imports outside `services/adapters/` ([CODE_STYLE.md](CODE_STYLE.md) §8).
2. No feature may show a spinner waiting on connectivity; anything network-flavored is fire-and-forget or explicitly inline-messaged.
3. No "offline banner" exists in MVP — the app doesn't care, so the UI must not either.

## 4. Time & clock handling

Offline devices drift: business ordering uses user-entered event *dates*, not device timestamps ([BUSINESS_RULES.md](BUSINESS_RULES.md) §10); notifications recompute on foreground so clock jumps self-heal ([NOTIFICATION_ENGINE.md](NOTIFICATION_ENGINE.md) §5).

## 5. Evolution — staying offline-first with a cloud attached

- **Phase 2 (sync):** local SQLite **remains the source of truth** (ADR-005). Sync is background replication: writes commit locally first, always; the outbox drains opportunistically; pulls merge through services ([SUPABASE_SYNC_PLAN.md](SUPABASE_SYNC_PLAN.md) §4–5). No feature gains a connectivity requirement by existing; cloud-only features (AI calls, QR pages) state it inline and fail soft.
- **Phase 3:** workshop/community are online features by nature — they degrade to read-cached content offline; core tracking never regresses.
- **Long-term:** the acceptance test stays: unplug the network for a month → every Phase-1 feature still fully functional; sync catches up cleanly after.
