# PRODUCT_DECISIONS.md — Current Product Policy

> **Status of this document:** This is the single quickest reference for how Motrack behaves **today**. It states the *current agreed policy* of the product. It is updated whenever a policy changes; the *history and reasoning* of each decision lives in [DECISION_LOG.md](DECISION_LOG.md) (product decisions) and [ARCHITECTURE_DECISIONS.md](ARCHITECTURE_DECISIONS.md) (technical decisions). If any other document appears to contradict this one, this document wins and the other document must be fixed.

---

## 1. Product identity

| Policy | Current decision |
|---|---|
| Product name | **Motrack** (provisional working title; branding pass pending — see [DECISION_LOG.md](DECISION_LOG.md) D-003) |
| Mission | "Never forget motorcycle maintenance again" — see [PROJECT_MISSION.md](PROJECT_MISSION.md) |
| Primary market | Philippines first; architecture must not hard-code PH-only behavior |
| Primary users | Daily commuters, delivery riders, families/small businesses with 2–5 bikes, small fleets — see [USER_PERSONAS.md](USER_PERSONAS.md) |

## 2. Platforms & distribution

| Policy | Current decision |
|---|---|
| Platforms | Android + iOS, single React Native (Expo) codebase. Android is the priority platform for testing and performance work. |
| Minimum Android | **Android 8.0 (API 26)** — required for notification channels; covers the low-end PH device fleet |
| Minimum iOS | **iOS 15.1** (Expo SDK minimum) |
| Distribution | Google Play + Apple App Store via EAS. Direct APK distribution: not in MVP, revisit post-launch ([DECISION_LOG.md](DECISION_LOG.md) D-011) |
| Device target | Must run smoothly on low-end Android (2 GB RAM class) — budgets in [PERFORMANCE.md](PERFORMANCE.md) |

## 3. Offline policy

| Policy | Current decision |
|---|---|
| Offline scope | **Every MVP feature works 100% offline.** No feature may silently require connectivity. |
| Network use in MVP | Only: optional crash reporting, store purchase validation (premium unlock), and app updates. Each degrades gracefully offline. |
| Source of truth | The on-device SQLite database is the source of truth in MVP and **remains** the local source of truth after cloud sync arrives (offline-first, not cloud-first). See [OFFLINE_ARCHITECTURE.md](OFFLINE_ARCHITECTURE.md). |
| Sync readiness | All user-data tables carry UUID primary keys, `created_at`/`updated_at` timestamps, and `deleted_at` soft deletes from day one so Supabase sync (Phase 2) needs no schema rewrite. See [SUPABASE_SYNC_PLAN.md](SUPABASE_SYNC_PLAN.md). |

## 4. Data & units

| Policy | Current decision |
|---|---|
| Currency | Philippine Peso (₱). Money stored as **integer centavos** (`*_centavos` columns). Display formatting in [LOCALIZATION.md](LOCALIZATION.md). |
| Distance | Kilometers only in MVP. Odometer readings are **non-negative integers** (whole km). |
| Volume | Liters, up to 2 decimals (fuel). |
| Calendar dates (user-entered) | `TEXT 'YYYY-MM-DD'` in the user's local sense (a service happened on a *date*, not an instant) |
| Timestamps (system) | `INTEGER` milliseconds since Unix epoch, UTC |
| IDs | UUID v4 stored as `TEXT` (lowercase, hyphenated) |
| Languages | English (`en`) + Filipino (`fil`); device-language default, user-overridable. See [LOCALIZATION.md](LOCALIZATION.md). |
| Theming | Light + Dark at MVP; user setting **System default / Light / Dark** — instant apply, persisted locally. Multi-theme engine: a new theme (AMOLED, color packs, high contrast, seasonal) = one token file + one registry entry, zero component edits ([DECISION_LOG.md](DECISION_LOG.md) D-018, [THEME_GUIDE.md](THEME_GUIDE.md)). |

## 5. Database (authoritative table list)

Schema detail, columns, and indexes live in [DATABASE_DESIGN.md](DATABASE_DESIGN.md). The canonical table set is:

`motorcycles`, `maintenance_schedules`, `maintenance_records`, `repairs`, `expenses`, `fuel_logs`, `odometer_logs`, `documents`, `scheduled_notifications`, `app_settings`

No other tables exist in MVP. Adding a table requires updating [DATABASE_DESIGN.md](DATABASE_DESIGN.md) and this list.

## 6. Maintenance model

| Policy | Current decision |
|---|---|
| Component set | The canonical component-type enum (22 values) is defined in [BUSINESS_RULES.md](BUSINESS_RULES.md) §2. UI, DB, and notifications all use those exact string values. |
| Drivetrain gating | Each motorcycle has `drivetrain_type` ∈ `cvt` \| `chain` \| `other`. CVT components apply only to `cvt` bikes; chain components only to `chain` bikes. |
| Intervals | Every schedule has `interval_km` and/or `interval_months` (at least one). Defaults per component are in [BUSINESS_RULES.md](BUSINESS_RULES.md) §3 and are user-editable per bike. Defaults are assumptions pending real-model data ([DECISION_LOG.md](DECISION_LOG.md) A-list). |
| Due status | Ratio `r = max(km_used/interval_km, days_used/interval_days)`; **green** `r < 0.80`, **yellow** `0.80 ≤ r < 1.00`, **red** `r ≥ 1.00`. Defined once in [BUSINESS_RULES.md](BUSINESS_RULES.md) §4. |
| Health Score | Weighted 0–100 score per bike; exact formula, weights, and worked examples live **only** in [HEALTH_SCORE.md](HEALTH_SCORE.md). Registration/insurance expiry is excluded from the score (legal, not mechanical) and surfaced separately. |
| Odometer | `odometer_logs` is the source of truth for mileage; `motorcycles.current_odometer_km` is a maintained cache. Odometer never decreases except via explicit correction flow ([BUSINESS_RULES.md](BUSINESS_RULES.md) §6). |

## 7. Notification policy

| Policy | Current decision |
|---|---|
| Mechanism | **Local scheduled notifications only** in MVP (expo-notifications). No server push. |
| Km-based reminders | Projected to a date using the bike's rolling average daily km (30-day window, fallback 25 km/day), re-planned on every odometer update. Spec: [NOTIFICATION_ENGINE.md](NOTIFICATION_ENGINE.md). |
| Time-based reminders | Fire 7 days before due and on the due date. |
| Overdue nagging | Weekly, maximum 3 repeats per item, then silent until data changes. |
| Document expiry | Registration/insurance: 30, 7, and 1 day(s) before expiry. |
| Delivery time & quiet hours | Default fire time 08:00 local; quiet hours 21:00–07:00 (notifications shift to next 08:00). User-configurable. |

## 8. Premium policy

| Policy | Current decision |
|---|---|
| Model | **One-time lifetime purchase ("Motrack Pro")** — no subscription. Managed via RevenueCat non-consumable entitlement `pro`. ([DECISION_LOG.md](DECISION_LOG.md) D-002) |
| Free tier | All MVP features, up to **2 motorcycles**, manual backup/export included. |
| Pro tier | Unlimited motorcycles + Phase 2 premium features as they ship (see [PREMIUM_SYSTEM.md](PREMIUM_SYSTEM.md) for the authoritative gate list). |
| Price | Set in RevenueCat/store consoles, not hard-coded. Launch placeholder assumption: ₱499 (~USD 8.99) — needs owner confirmation. |
| Offline behavior | Entitlement is cached locally; a purchased user never loses Pro features offline. Purchase itself requires connectivity. |

## 9. Documents & storage policy

| Policy | Current decision |
|---|---|
| Document types | OR/CR, insurance, driver's license, warranty, receipt, service invoice, other |
| Storage | Files stored in the app's private sandbox (`expo-file-system` document directory); never in public media storage. Images re-compressed on import ([PERFORMANCE.md](PERFORMANCE.md)). |
| Supported formats | Images: JPEG, PNG, WebP, HEIC (imported → stored as JPEG). Documents: PDF. |
| Sensitive data | Government-ID-class documents (OR/CR, license) are treated as sensitive personal information under the PH Data Privacy Act (RA 10173). Handling rules: [SECURITY.md](SECURITY.md). |
| Data retention | All data stays on-device until the user deletes it or uninstalls. Soft-deleted rows are purged after 30 days by a cleanup job. No server-side copies exist in MVP. |

## 10. Backup, export & recovery policy

| Policy | Current decision |
|---|---|
| Backup | Manual full backup to a single archive file (database export + documents/photos), saved/shared via the OS share sheet. Monthly local reminder to back up. Spec: [BACKUP_RECOVERY.md](BACKUP_RECOVERY.md). |
| Restore | Full restore from a backup archive, with pre-restore safety snapshot and schema-version migration on import. |
| Export | CSV export per data domain (maintenance, fuel, expenses, repairs) + PDF service-history report. Both free. Spec: [EXPORT_IMPORT.md](EXPORT_IMPORT.md). |
| Cloud backup/sync | Phase 2, via Supabase. Local backup remains available forever (cloud is additive, never a replacement). |

## 11. Privacy, security & telemetry

| Policy | Current decision |
|---|---|
| Accounts | **No account required in MVP.** The app is fully usable anonymously. Accounts arrive with Phase 2 sync (optional even then). |
| Crash reporting | Sentry, enabled by default, anonymized (no PII, no document content), with in-app opt-out. ([DECISION_LOG.md](DECISION_LOG.md) D-009) |
| Product analytics | None in MVP. |
| Permissions | Only: notifications, camera (photo capture), photo library (import), file access via system pickers. No location, no contacts. |
| Compliance | PH Data Privacy Act (RA 10173) analysis and obligations: [SECURITY.md](SECURITY.md) §7. |

## 12. Technology (summary — full rationale in TECH_STACK.md)

Expo (managed) + TypeScript strict · Expo Router (file-based, on React Navigation) · Zustand · expo-sqlite + Drizzle ORM · React Hook Form + Zod · expo-notifications · expo-file-system / image-picker / document-picker · i18next + expo-localization · react-native-purchases (RevenueCat) · Sentry. Every dependency is justified in [DEPENDENCY_GUIDE.md](DEPENDENCY_GUIDE.md); additions require an ADR.

## 13. Engineering priority order (binding)

When two goals conflict, the higher one wins and the trade-off is documented:

**Data integrity > user safety > offline reliability > maintainability > scalability > simplicity > performance > accessibility > developer experience > implementation speed.**

The full project constitution is [DEVELOPMENT_RULES.md](DEVELOPMENT_RULES.md).

## 14. Phase boundaries (summary — authoritative scope in PRODUCT_REQUIREMENTS.md)

- **MVP (Phase 1):** everything in [PRODUCT_REQUIREMENTS.md](PRODUCT_REQUIREMENTS.md) §3 — fully offline, no accounts, no backend.
- **Phase 2:** Supabase sync + accounts, cloud backup, receipt scanner, VIN scanner, QR service history, AI mechanic, smart notifications, parts-life prediction, model database.
- **Phase 3:** workshop integration, community, fleet/business dashboard.
- **Long-term:** multi-region, web dashboard, B2B fleet platform. See [FUTURE_ROADMAP.md](FUTURE_ROADMAP.md).
