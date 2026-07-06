# API_STRATEGY.md — Future API Surface

> **Owns:** how Motrack exposes/consumes APIs across phases. MVP has **no API** — this document exists so MVP code doesn't foreclose the path. Sync specifics: [SUPABASE_SYNC_PLAN.md](SUPABASE_SYNC_PLAN.md); backend choice: ADR-020.

## 1. MVP — no API, by design

No HTTP client, no API layer, no tokens (except RevenueCat/Sentry SDKs inside adapters). The binding rule: anything that would someday be an API call must already live in a **service** with a typed interface ([SOFTWARE_ARCHITECTURE.md](SOFTWARE_ARCHITECTURE.md)) — the seam where a remote implementation slots in.

## 2. Phase 2 — Supabase as the API

- **Data plane:** supabase-js (PostgREST) under RLS — no custom REST layer for CRUD/sync. Client access stays inside `services/adapters/supabase.ts`; features never import supabase-js directly.
- **Compute plane:** Supabase **Edge Functions** for anything with secrets or heavy lifting:
  - `receipt-scan` (R-32) and `ai-mechanic` (R-34): proxy to the AI provider (keys server-side only — **never** in the app bundle, [SECURITY.md](SECURITY.md) §5); request/response contracts versioned in a shared types package.
  - `qr-history` (R-35): generates a signed, read-only, expiring share token; a public web route renders the service history for that token (no auth needed by the viewer; revocable).
  - `model-db` (R-33): read endpoint over curated model/spec data, cached on device.
- **Auth:** Supabase Auth JWTs; anonymous users have no API access (fully local).
- **Versioning:** edge function routes carry `/v1/`; breaking contract changes add `/v2/` and keep `/v1/` for one app-release cycle (users update slowly on Android PH).

## 3. Phase 3 — partner surfaces

- **Workshop API:** scoped grants — a workshop account may append `maintenance_records` (`source='workshop'`) to bikes explicitly shared with it; implemented as RLS policies + edge-function invitations, not a parallel API.
- **Fleet web app:** same Supabase API as mobile; server-side views for fleet aggregates ([SUPABASE_SYNC_PLAN.md](SUPABASE_SYNC_PLAN.md) §8).

## 4. Long-term

If third-party integrations (insurers, resale platforms) materialize: a thin public REST facade (OpenAPI-documented) in front of Postgres — decided by ADR then. Nothing in earlier phases assumes its existence.

## 5. Cross-phase rules

1. All remote calls go through adapters; features depend on service interfaces (mockable, [TESTING.md](TESTING.md) §3).
2. Every remote feature defines offline degradation before it ships ([OFFLINE_ARCHITECTURE.md](OFFLINE_ARCHITECTURE.md) §3).
3. No API keys or secrets in the app bundle, ever ([SECURITY.md](SECURITY.md) §5).
4. Contracts live as shared TS types (Zod-parsed at the boundary — the server is also an untrusted input to the app).
