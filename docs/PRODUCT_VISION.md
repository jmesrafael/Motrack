# PRODUCT_VISION.md — Users, Positioning, Competitive Stance

> Who Motrack serves, where it wins, and the product philosophy in depth. Mission and metrics: [PROJECT_MISSION.md](PROJECT_MISSION.md). Concrete personas: [USER_PERSONAS.md](USER_PERSONAS.md). Scope boundaries: [PRODUCT_REQUIREMENTS.md](PRODUCT_REQUIREMENTS.md).

## 1. Target users (priority order)

1. **Daily commuters** — one bike, zero mechanical interest. Want to be told what to do and when. Success = they never think about maintenance until the app tells them to.
2. **Delivery riders** (food/parcel) — 80–150 km/day; intervals arrive in weeks, not months. Logging must cost seconds. Cost-per-km matters because the bike is a business expense.
3. **Families / small businesses** — 2–5 bikes, several riders, one "responsible person" doing the tracking. Needs the garage view and per-bike clarity.
4. **Small fleet operators** — 5+ bikes with employed riders. Served minimally in MVP (multiple bikes via Pro); properly served in Phase 3 fleet features ([FUTURE_ROADMAP.md](FUTURE_ROADMAP.md)).

The app is designed for user #1's simplicity with user #2's speed; power features must never tax them. See [USER_PERSONAS.md](USER_PERSONAS.md) for the four concrete personas used in every design review.

## 2. Competitive landscape (verified July 2026 — lightweight scan)

The brief's original competitor table was a brainstorm. A verification scan (July 2026) found:

| App | Verified? | Position | What we learned |
|---|---|---|---|
| MotorManage | ✅ Active, iOS+Android | Detailed logging, offline SQLite, one-time purchase | Closest philosophical competitor. Validates offline-first + one-time purchase. Its own positioning admits time-based reminders are weaker than km-based — an opening. |
| BikerGarage | ✅ Active, Android-only, free | Multi-bike, service log | No real offline architecture or model database; free but shallow. |
| MotoLogger | ✅ Active (motologger.ie) | Digital garage, document vault | Enthusiast-oriented, EU-focused. |
| RideLog | ⚠️ Unverified as significant | Ride recording + maintenance | Not a maintenance-first product. |
| Riderr | ❌ Could not verify as active/significant | — | Treat as non-factor; brief's table corrected. |
| Revvo | ❌ Could not verify as active/significant | — | Treat as non-factor; brief's table corrected. |
| MotoVault, Rydful, MyBikes.App | ➕ New entrants found in scan | Various; Rydful notably offline-first + free with AI mileage prediction | The space is active; differentiation must come from PH-localization + radical simplicity, not feature count. |

**Recurring complaints across the category (from reviews/forums):**
1. **Data loss on phone change** — no backup path. → Backup/restore is a trust-critical MVP feature, not an afterthought ([BACKUP_RECOVERY.md](BACKUP_RECOVERY.md)).
2. **"Overloaded for what I need"** — enthusiast feature walls. → Quick Log ≤ 10 s and progressive disclosure are the core UX bets ([UI_UX_GUIDELINES.md](UI_UX_GUIDELINES.md)).
3. **Unreliable/odd reminders**, especially time-based. → The notification engine is specified to the day and re-planned on every data change ([NOTIFICATION_ENGINE.md](NOTIFICATION_ENGINE.md)).
4. **Apps going read-only offline.** → Hard offline guarantee ([OFFLINE_ARCHITECTURE.md](OFFLINE_ARCHITECTURE.md)).

## 3. Where Motrack wins

1. **Philippines-native**: PH registration cycles and LTO document reminders, ₱ costs, Filipino localization, the actual bikes people ride (Click, NMAX, Raider, Wave — see [GLOSSARY.md](GLOSSARY.md)), CVT-first component model. No verified competitor does any of this.
2. **Radical logging speed**: Quick Log ≤ 10 seconds, last-used values pre-filled ([USER_FLOWS.md](USER_FLOWS.md) F-2).
3. **One number, not a dashboard of stats**: the Health Score ([HEALTH_SCORE.md](HEALTH_SCORE.md)) tells a non-technical rider "how is my bike" at a glance.
4. **Trustworthy by architecture**: offline-first, zero-data-loss migrations, free backup/export. We win the review war competitors lose.
5. **Honest monetization**: one-time Pro purchase; free tier is complete for a single-bike owner ([PREMIUM_SYSTEM.md](PREMIUM_SYSTEM.md)).

## 4. Product philosophy in depth

- **Reminders are the product.** Everything else exists to make reminders accurate (odometer data), trusted (reliability), and actionable (Quick Log). Any feature that doesn't feed that loop must justify itself.
- **The odometer is the heartbeat.** Every logging surface (fuel, maintenance, repairs, manual update) captures an odometer reading and feeds one shared log ([BUSINESS_RULES.md](BUSINESS_RULES.md) §6). More readings → better projections → better reminders.
- **Progressive disclosure.** Every form has a ≤ 3-field fast path; detail fields (brand, viscosity, notes, photo) are visible but never required ([SCREEN_SPECIFICATIONS.md](SCREEN_SPECIFICATIONS.md)).
- **Local first, global ready.** PH defaults are configuration, not hard-code: currency, units, document types, and registration rules live in config/i18n layers so a second market is a content change, not a rewrite ([LOCALIZATION.md](LOCALIZATION.md), [FUTURE_ROADMAP.md](FUTURE_ROADMAP.md)).
- **Evolution over rewrite.** MVP (offline, no accounts) → Phase 2 (Supabase sync, AI features) → Phase 3 (workshops, community, fleet) — each documented per-system with the four-horizon pattern required by [DEVELOPMENT_RULES.md](DEVELOPMENT_RULES.md).
