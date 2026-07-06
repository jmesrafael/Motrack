# SECURITY.md — Data Protection, Document Handling, Compliance

> **Owns:** threat model, storage protection, input validation posture, privacy compliance (PH RA 10173), and user-safety framing. Related: [LOGGING_GUIDE.md](LOGGING_GUIDE.md) (log privacy), [BACKUP_RECOVERY.md](BACKUP_RECOVERY.md) (backup security), [PREMIUM_SYSTEM.md](PREMIUM_SYSTEM.md) (entitlement integrity).

## 1. Threat model (MVP)

Assets: the SQLite DB (service/financial history) and the **document vault** (OR/CR, license, insurance — government-ID-class images). Realistic threats: device loss/theft, shared devices, malicious apps reading *public* storage, user-shared backups leaking, and our own telemetry over-collecting. Out of scope MVP (no accounts/server): credential theft, server breaches — arrive with Phase 2 (§9).

## 2. Posture

**Data minimization first**: no accounts, no analytics, no location, no contacts, no advertising SDKs ([PRODUCT_DECISIONS.md](PRODUCT_DECISIONS.md) §11). What we never collect can't leak.

## 3. At-rest protection

- DB + files live in the **app-private sandbox** (expo-file-system document directory) — inaccessible to other apps on both platforms; iOS adds `NSFileProtectionComplete`-class encryption by default; Android app-sandbox + (device-dependent) file-based encryption.
- **No custom at-rest encryption in MVP** — a local key can't be meaningfully protected better than the OS sandbox already does without imposing a passcode UX. Revisit trigger: if an in-app privacy-lock feature (§8) is added, encrypt the documents dir with a Keychain/Keystore-held key (SecureStore) at that time. Recorded as decision D-010.
- Nothing is ever written to public/shared storage except **explicit user exports/backups** via the OS share sheet — leaving the sandbox is always a deliberate user act with visible destination choice.

## 4. Document vault rules

- Import path: picker/camera → **EXIF/GPS metadata stripped** + recompressed ([DATA_FLOW.md](DATA_FLOW.md) §6) → UUID filename (no meaningful names) → `documents/` under the app dir → DB stores the **relative path** only (survives container moves; syncs cleanly later, [SUPABASE_SYNC_PLAN.md](SUPABASE_SYNC_PLAN.md) §3).
- Camera captures for documents are **not** saved to the system photo gallery.
- No document content, filename, or path ever reaches logs/crash reports ([LOGGING_GUIDE.md](LOGGING_GUIDE.md) §3).
- Sharing/viewing uses OS viewers/share sheets; no third-party upload anywhere in MVP.

## 5. Input validation & code-level rules

- Every external input is untrusted: user forms (Zod at UI **and** service boundary — defense in depth, [SOFTWARE_ARCHITECTURE.md](SOFTWARE_ARCHITECTURE.md) §5), **backup archives** (schema-validated, size-capped, path-traversal-safe extraction — entry names sanitized, no `..`, files only into the staging dir; [BACKUP_RECOVERY.md](BACKUP_RECOVERY.md) §4), CSV import content, and (Phase 2+) server responses.
- SQL always parameterized ([SQLITE_GUIDE.md](SQLITE_GUIDE.md) §2). CSV exports escape formula-injection prefixes (`= + - @` cells prefixed with `'`; [EXPORT_IMPORT.md](EXPORT_IMPORT.md) §3).
- **No secrets in the bundle** — MVP's only keys (RevenueCat public API key, Sentry DSN) are designed-public; anything sensitive stays server-side forever ([API_STRATEGY.md](API_STRATEGY.md) §5).
- Permissions requested: notifications, camera, media library — each just-in-time with context, never at launch ([UI_UX_GUIDELINES.md](UI_UX_GUIDELINES.md)). Nothing else.
- Dependency hygiene: `npm audit` in CI; new deps need [DEPENDENCY_GUIDE.md](DEPENDENCY_GUIDE.md) justification.

## 6. User rights & data lifecycle

Everything exportable (CSV/PDF) and backupable free ([PROJECT_MISSION.md](PROJECT_MISSION.md) §3). **Delete all data** (S-33): typed confirmation → DB wiped, files deleted, notifications cancelled, settings reset — complete erasure, nothing retained anywhere (there is no server). Soft-deleted rows purge after 30 days ([DATABASE_DESIGN.md](DATABASE_DESIGN.md) §7).

## 7. PH Data Privacy Act (RA 10173) compliance

Motrack MVP is deliberately low-exposure: personal data is **processed and stored only on the user's own device**, by the user, for the user — no transmission to us except anonymized crash telemetry.

| Obligation | How met |
|---|---|
| Transparency | Privacy policy (plain-language, en+fil) in-app (S-33) + store listings: what's stored (locally), what leaves the device (crash reports only), no sale/sharing |
| Legitimate purpose / proportionality | Data collected = data the user themselves enters for their own use; telemetry minimized + anonymized (ADR-014) with visible opt-out |
| Security measures | §3–§5 above |
| User rights (access/erasure/portability) | §6 — export + delete-all are first-class features |
| Breach notification readiness | MVP: no server-held personal data → breach surface ≈ nil. Phase 2 (§9) adds DPO designation, NPC registration assessment, processor agreements (Supabase), breach runbook — gate items in the Phase-2 plan |

Documents photographed by users (own OR/CR, own license) are the user's own records on their own device — Motrack is not a processor of third parties' data in MVP. Re-assess at Phase 2 when data reaches our servers (this is a launch-gate legal review item, [DECISION_LOG.md](DECISION_LOG.md) D-012).

## 8. User safety (product-level)

Maintenance guidance thresholds (intervals, Health Score) are conservative defaults, clearly editable; the app never advises "keep riding" on overdue safety items — copy for red-status brakes/tires always suggests service. Phase-2 AI Mechanic ships with fixed safety framing: likely causes + "have a mechanic verify — brakes/steering issues are urgent", never repair instructions for safety-critical systems. A future in-app privacy lock (PIN/biometric via LocalAuthentication) is a Phase-2 candidate (backlog, not committed).

## 9. Evolution

- **Phase 2:** accounts/sync move data server-side → RLS per user ([SUPABASE_SYNC_PLAN.md](SUPABASE_SYNC_PLAN.md) §3), TLS everywhere (platform default), storage bucket privacy, token handling via supabase-js + SecureStore, DPA §7 upgrades, AI-feature data flows documented in the privacy policy (receipt images processed transiently, never retained server-side).
- **Phase 3:** workshop access = explicit, revocable, per-bike grants (RLS); community moderation + reporting.
- **Long-term:** SOC2-style posture if B2B fleet demands it; regional data residency per market.
