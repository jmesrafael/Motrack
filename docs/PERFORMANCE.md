# PERFORMANCE.md — Budgets & Constraints

> **Owns:** the numeric performance budgets and the practices that keep them. Reference device class: **2 GB-RAM Android (Android 8–10 era, e.g. entry-level Samsung A-series/realme)** — P1's phone ([USER_PERSONAS.md](USER_PERSONAS.md)). Budgets are acceptance criteria ([ACCEPTANCE_CRITERIA.md](ACCEPTANCE_CRITERIA.md) §2) and verified against the large fixture ([SQLITE_GUIDE.md](SQLITE_GUIDE.md) §6).

## 1. Why this is a top-tier concern

Priority order places performance above DX but below correctness ([PRODUCT_DECISIONS.md](PRODUCT_DECISIONS.md) §13); in practice on 2 GB devices, sloppy lists and heavy deps *become* correctness problems (ANRs, OOM kills). Budgets below are ceilings, not targets.

## 2. Startup

| Metric | Budget (reference device) |
|---|---|
| Cold start → Dashboard interactive | ≤ 2.5 s |
| Warm start | ≤ 1.0 s |
| Notification tap → Quick Log visible | ≤ 3.0 s cold |
| Startup DB work (open+migrate no-op+settings) | ≤ 300 ms |

Startup sequence defers everything deferrable ([DATA_FLOW.md](DATA_FLOW.md) §1.5). Measured via Sentry startup transactions (10% sample, [LOGGING_GUIDE.md](LOGGING_GUIDE.md) §4) + release-checklist manual runs ([RELEASE_PROCESS.md](RELEASE_PROCESS.md)).

## 3. Interaction

| Action | Budget |
|---|---|
| Local read → screen data visible | ≤ 100 ms |
| Save (incl. transaction + cascade, pre-notification step) | ≤ 200 ms |
| Quick Log open → ready for input | ≤ 300 ms |
| History/list scroll | 60 fps, no blank cells at normal fling |
| Statistics screen full compute | ≤ 400 ms on large fixture |
| CSV export (1k rows) / PDF (500 records) | ≤ 2 s / ≤ 5 s with progress |
| Backup create (large fixture + 100 photos) | ≤ 30 s with progress |

## 4. Rendering practices (how the budgets hold)

Virtualization for every unbounded list — **built-in FlatList first**; FlashList may be adopted only through the dependency gate ([DEPENDENCY_GUIDE.md](DEPENDENCY_GUIDE.md) §2) if FlatList measurably misses the scroll budget on the large fixture. Stable `keyExtractor`, memoized row components · selector-based store subscriptions ([STATE_MANAGEMENT.md](STATE_MANAGEMENT.md) §3) · memoized style factories ([THEME_GUIDE.md](THEME_GUIDE.md) §2) · native-driver-only animation ([ANIMATION_GUIDE.md](ANIMATION_GUIDE.md)) · no anonymous-function props on list rows · charts render ≤ 12 bars of pre-aggregated data (SQL aggregates, [SQLITE_GUIDE.md](SQLITE_GUIDE.md) §3).

## 5. Data-size posture

Design row counts (heavy 5-year user): ~15k odometer logs, ~5k records — trivial for SQLite **if** queries are indexed and paged: page size 50, aggregates in SQL, `EXPLAIN QUERY PLAN` checks ([SQLITE_GUIDE.md](SQLITE_GUIDE.md) §6).

## 6. Media & storage

Photos recompressed on import (expo-image-manipulator): documents max 2048 px long edge JPEG q80 (readability); bike/receipt photos max 1600 px q75. Thumbnails (300 px) generated at import for lists. Target: typical document ≤ 600 KB. Storage stat + "free up" guidance if app data exceeds 1 GB (S-32 shows usage).

## 7. App size & memory

| Metric | Budget |
|---|---|
| Android download (Play, arm64 AAB split) | ≤ 30 MB |
| iOS download | ≤ 50 MB |
| Steady-state RAM (Dashboard) | ≤ 350 MB |
| Peak (PDF export) | ≤ 500 MB |

Guarded by: no chart lib (ADR-024), no custom fonts (ADR-010), bundled icon set only (ADR-011), Hermes bytecode (default), dependency review gate ([DEPENDENCY_GUIDE.md](DEPENDENCY_GUIDE.md) §2 includes size impact).

## 8. Regression control

Perf checklist in every release ([RELEASE_PROCESS.md](RELEASE_PROCESS.md) §3): cold start ×3, history fling on large fixture, save latency spot-check — on the reference device (or closest emulator profile with 2 GB cap). Sentry perf dashboards watched post-release. A budget breach is a release blocker ([DEVELOPMENT_RULES.md](DEVELOPMENT_RULES.md)).

## 9. Evolution

**Phase 2:** sync must be jank-free (background, chunked); AI calls show progress with cancel; model-DB cache keeps lookups local. **Phase 3:** fleet dashboards paginate server-side. **Long-term:** budgets re-baselined only when the PH low-end fleet genuinely moves up — never silently.
