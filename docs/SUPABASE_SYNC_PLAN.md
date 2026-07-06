# SUPABASE_SYNC_PLAN.md — Phase-2 Sync Protocol & Conflict Resolution

> **Owns:** the designed-but-not-yet-built sync architecture that today's schema must remain compatible with. Nothing here ships in MVP; everything in MVP must avoid breaking it. Backend choice rationale: ADR-020. Offline guarantee: [OFFLINE_ARCHITECTURE.md](OFFLINE_ARCHITECTURE.md).

## 1. Goals & non-goals

**Goals:** cross-device continuity, cloud backup (R-30/31), the data substrate for QR history (R-35), workshops (R-50), fleet (R-52). **Non-goals:** realtime collaboration; multi-writer-per-row concurrency beyond last-write-wins granularity (single human owns a garage in Phase 2).

## 2. Accounts

Supabase Auth, **optional** — the app keeps working anonymously; sign-in is pitched as "protect your data / use two phones". On first sign-in, local data adopts the user's `user_id` and uploads. Sign-out keeps local data (device remains usable offline-first).

## 3. Server schema = local schema, mirrored

Postgres tables mirror [DATABASE_DESIGN.md](DATABASE_DESIGN.md) §5 one-to-one (same names, same UUID ids — this is why ADR-006 mandates device-generated UUIDs), plus per-row `user_id UUID` and `server_updated_at timestamptz`. Row-Level Security: `user_id = auth.uid()` on every table. Documents/photos → Supabase Storage bucket `documents/{user_id}/…` mirroring local relative paths ([SECURITY.md](SECURITY.md) §4); DB rows carry the same relative path in both worlds.

`scheduled_notifications` and device-local `app_settings` keys (theme etc.) do **not** sync; synced user preferences get their own table when needed.

## 4. Sync engine (client)

- **Outbox:** Phase-2 migration adds `sync_outbox (id, table_name, row_id, op, changed_at)`; every service mutation writes an outbox row **in the same transaction** ([DATA_FLOW.md](DATA_FLOW.md) §7).
- **Push:** drain outbox in `changed_at` order, batched upserts (soft deletes travel as updates with `deleted_at`).
- **Pull:** per-table incremental `where server_updated_at > last_pulled_at`, applied **through services** so cascades/replans/events fire identically (`origin:'sync'`).
- **Triggers:** app foreground, post-mutation debounce (30 s), connectivity regained, manual "sync now".
- **State surface:** per-account `last_synced_at` + a quiet status row in Settings; sync failures never interrupt tasks ([ERROR_HANDLING.md](ERROR_HANDLING.md) §6).

## 5. Conflict resolution

- Granularity: whole row. Policy: **last-write-wins by `updated_at`** (device clock), with guards:
  - Server rejects updates whose `updated_at` is older than the stored row's (client then keeps the newer server copy).
  - **Deletes never win over later edits:** a row edited after (`updated_at` >) its competing `deleted_at` is resurrected (deletion cleared). Data-preservation bias per priority order ([PRODUCT_DECISIONS.md](PRODUCT_DECISIONS.md) §13).
  - `odometer_logs` are append-mostly and merge by union; the odometer cache recomputes locally after merge ([BUSINESS_RULES.md](BUSINESS_RULES.md) §6.1).
  - Anchor columns are recomputed locally after merge (denormalized — never trusted from remote).
- Clock-skew note: LWW tolerance is acceptable for a single-owner garage; Phase-3 multi-writer (workshops) upgrades to server-timestamp authority + per-field merge for `maintenance_records` — designed then via ADR, enabled now by `source` column ([DATABASE_DESIGN.md](DATABASE_DESIGN.md) §5.3).

## 6. Migration compatibility contract (binding on MVP work today)

1. Never reuse or change the meaning of an existing column; additive migrations only ([DATABASE_DESIGN.md](DATABASE_DESIGN.md) §8).
2. Never introduce device-local identifiers as foreign keys (UUIDs only).
3. Keep every business recomputation reachable via services (pulls must trigger identical logic) — no logic in UI (constitution).
4. Keep file references relative (§3).
5. Any MVP change violating one of these requires an ADR and an update here **before** merging.

## 7. Cost & scale posture

Supabase free tier covers early Phase 2 (≤ 500 MB DB, 1 GB storage); per-user rows are small (a heavy user ≈ 5k rows). Storage (photos) is the scaling cost → compression policy ([PERFORMANCE.md](PERFORMANCE.md) §6) and per-user quota (Pro: 2 GB, config) manage it. At ~50k active synced users, move to paid tier — linear, no re-architecture. Long-term: self-host Postgres remains the exit hatch (ADR-020).

## 8. Evolution

**Phase 2:** everything above. **Phase 3:** workshop writes (scoped RLS grants per shared bike), fleet read models (server views). **Long-term:** regional Supabase projects if latency/data-residency demands; UUIDs make cross-region moves tractable.
