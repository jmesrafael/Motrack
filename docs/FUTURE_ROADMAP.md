# FUTURE_ROADMAP.md — Beyond Phase 2 (Five-Year Horizon)

> Directional plan for years 1–5. Phase boundaries and requirement IDs are owned by [PRODUCT_REQUIREMENTS.md](PRODUCT_REQUIREMENTS.md); this file describes where the product goes after those phases and what today's architecture must therefore already tolerate. Nothing here is a commitment; everything here is a constraint-check for current design.

## Year 1 — MVP launch & validation (Phase 1)

- Ship MVP (all R-0x/R-1x/R-2x requirements) to Play Store + App Store, PH market.
- Iterate on reminder accuracy and Quick Log friction using qualitative feedback (no analytics in MVP).
- Establish the backup habit (monthly reminder) to inoculate against the category's #1 complaint ([PRODUCT_VISION.md](PRODUCT_VISION.md) §2).
- **Architecture obligations today:** none beyond MVP spec — but every table sync-ready ([DATABASE_DESIGN.md](DATABASE_DESIGN.md) §3), config-not-hardcode localization ([LOCALIZATION.md](LOCALIZATION.md)).

## Year 2 — Cloud & intelligence (Phase 2)

- Supabase accounts + sync ([SUPABASE_SYNC_PLAN.md](SUPABASE_SYNC_PLAN.md)), cloud backup, QR service history (R-30/31/35).
- Intelligence tier: receipt scanner, VIN scanner + model database, AI Mechanic, parts-life prediction (R-32/33/34/38).
- The **model database** (make/model → specs, capacities, recommended intervals) replaces assumption-based default intervals; sourced/curated server-side, cached on device.
- **Architecture obligations today:** interval defaults must be data, not code ([BUSINESS_RULES.md](BUSINESS_RULES.md) §3); document storage must keep stable relative paths for later upload ([SECURITY.md](SECURITY.md) §4); premium gates checked through one service so new Pro features are additive ([PREMIUM_SYSTEM.md](PREMIUM_SYSTEM.md) §4).

## Year 3 — Ecosystem (Phase 3)

- Workshop integration: verified mechanics append service records; invoice uploads (R-50). Requires roles/permissions on shared records — anticipated by `maintenance_records.source` field ([DATABASE_DESIGN.md](DATABASE_DESIGN.md) §5.3).
- Community: shop recommendations, DIY guides (R-51). Separate service; must not bloat the core app (feature-flagged module).
- Fleet admin v1: web-based dashboard over synced data, employee/bike assignment (R-52).

## Years 4–5 — Platform & regional expansion

- **Regional expansion** (Vietnam, Indonesia, Thailand — similar motorcycle economies): new locale packs, currency, registration-rule config, model data. Must require zero schema change — verified by the localization/config boundaries above.
- **B2B fleet platform**: subscription SaaS for fleets (this is where recurring revenue enters; consumer app stays one-time-purchase per [PRODUCT_DECISIONS.md](PRODUCT_DECISIONS.md) §8).
- **Web app** for fleet + power users over the same Supabase backend ([API_STRATEGY.md](API_STRATEGY.md) long-term section).
- **Resale ecosystem**: verified-history reports as a trust product (builds on QR history).

## Standing architectural bets this roadmap depends on

| Bet | Where enforced |
|---|---|
| Local SQLite stays source of truth; cloud is a replica | [OFFLINE_ARCHITECTURE.md](OFFLINE_ARCHITECTURE.md) |
| UUID/soft-delete/updated_at on all user data from v1 | [DATABASE_DESIGN.md](DATABASE_DESIGN.md) §3 |
| Business logic in services, never UI — reusable on web later | [SOFTWARE_ARCHITECTURE.md](SOFTWARE_ARCHITECTURE.md) |
| All user-visible strings in i18n resources | [LOCALIZATION.md](LOCALIZATION.md) |
| Premium checks behind one entitlement service | [PREMIUM_SYSTEM.md](PREMIUM_SYSTEM.md) |
| PH specifics (registration rules, document types) as config data | [BUSINESS_RULES.md](BUSINESS_RULES.md) §8 |

If a proposed change breaks one of these bets, escalate per [AI_INSTRUCTIONS.md](AI_INSTRUCTIONS.md) §5 before implementing.
