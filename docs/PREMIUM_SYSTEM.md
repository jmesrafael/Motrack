# PREMIUM_SYSTEM.md — Motrack Pro Gating

> **Owns:** the free/Pro boundary, entitlement architecture, purchase flows, and edge cases. Policy summary: [PRODUCT_DECISIONS.md](PRODUCT_DECISIONS.md) §8; decision history: D-002; technical choice: ADR-013/023.

## 1. Model

**One-time lifetime purchase — "Motrack Pro"** via RevenueCat non-consumable, entitlement id `pro`. No subscription anywhere in the consumer app (B2B fleet SaaS is a separate long-term product, [FUTURE_ROADMAP.md](FUTURE_ROADMAP.md)). Price configured in store consoles/RevenueCat (placeholder assumption ₱499 ≈ $8.99 — A-09, owner to confirm).

## 2. The authoritative gate list

| Capability | Free | Pro |
|---|---|---|
| All MVP features ([PRODUCT_REQUIREMENTS.md](PRODUCT_REQUIREMENTS.md) §3) | ✔ | ✔ |
| Motorcycles | up to **2** | unlimited |
| Custom components, exports, backup/restore, dark mode, localization | ✔ (never gated) | ✔ |
| Phase-2 premium features (receipt scan R-32, VIN/model R-33, AI mechanic R-34, QR history R-35, voice R-36, parts-life R-38) | — | ✔ when shipped |
| Phase-2 sync/cloud backup (R-30/31) | account features; free-vs-Pro split decided at Phase 2 (D-013 placeholder) | — |

Nothing else may check `isPro()`. Adding a gate = update this table + [PRODUCT_DECISIONS.md](PRODUCT_DECISIONS.md) §8 + a DECISION_LOG entry.

## 3. The bike limit (only MVP gate)

`canAddBike(): count(non-deleted motorcycles) < 2 || isPro()` — archived bikes count (anti-gaming, [FEATURE_SPECIFICATIONS.md](FEATURE_SPECIFICATIONS.md) §3); soft-deleted don't (they purge). Enforced in `MotorcycleService.create` (service boundary, not just UI — [SOFTWARE_ARCHITECTURE.md](SOFTWARE_ARCHITECTURE.md) §5). UI: Garage shows "2 of 2", add action routes to paywall (F-8).

## 4. Architecture (ADR-023)

`EntitlementService` is the **single** gate authority: wraps the RevenueCat adapter, exposes `isPro()`, `canAddBike()`, `purchase()`, `restore()`; publishes state to `useEntitlementStore`. Rules: features call the service/store — never react-native-purchases directly; new Pro features (Phase 2) add named capability checks (`can('receiptScan')`) resolved from the same entitlement, so gating stays additive.

## 5. Purchase, restore, offline

- **Purchase (S-34):** RevenueCat offering → store sheet → success ⇒ entitlement active ⇒ persisted to `app_settings` (`entitlement_pro`, `entitlement_checked_at`) ⇒ store updates ⇒ gates open immediately. Pending/deferred states show "processing" (store handles it).
- **Restore:** explicit button (S-30/S-34) + automatic check on fresh installs (deferred startup refresh, [DATA_FLOW.md](DATA_FLOW.md) §1.5).
- **Offline:** `isPro()` reads the cached flag — a Pro user is Pro forever offline ([OFFLINE_ARCHITECTURE.md](OFFLINE_ARCHITECTURE.md) §2). Purchases require connectivity (inline message, S-34).
- Purchase state changes are logged as state-only events ([LOGGING_GUIDE.md](LOGGING_GUIDE.md) §5).

## 6. Edge cases (binding)

| Case | Behavior |
|---|---|
| Refund/entitlement revoked with 3+ bikes | **Never delete data.** Bikes beyond 2 become read-only (view/export/backup allowed; no new logs) with an explanatory banner; full function returns on re-purchase ([BUSINESS_RULES.md](BUSINESS_RULES.md) §10) |
| Restore fails offline on new phone | Cached flag absent → free tier; restoring the **backup archive** never restores entitlement (store owns truth — anti-piracy + correctness); banner prompts "Restore purchases" |
| Store region mismatch | RevenueCat/store handles pricing; app displays offering price verbatim |
| Family sharing | Follow store defaults (non-consumables shareable on iOS if enabled — leave enabled; A-10) |

## 7. Paywall rules

Shown only: on gated action (3rd bike), from the More row, and via onboarding *mention* (no hard-sell interstitials). Contents per S-34. Never dark patterns: no fake urgency, no pre-checked anything, restore always visible. Tone per [UI_UX_GUIDELINES.md](UI_UX_GUIDELINES.md) §6.

## 8. Evolution

- **Phase 2:** premium features check named capabilities (§4); if a cloud-cost feature (AI calls) needs usage limits, they're metered per-account server-side — still one-time purchase client-side (fair-use caps, D-013 to be decided with real cost data).
- **Phase 3:** fleet/business pricing is a separate subscription product (separate offering), never retro-gating consumer Pro.
- **Long-term:** grandfather principle — lifetime Pro keeps everything it ever had; new mega-features may form a second tier, decided by DECISION_LOG entry.
