# PROJECT_MISSION.md — Mission, Success Metrics, Business Philosophy

> What Motrack exists to do and how we will know it is working. Product scope lives in [PRODUCT_REQUIREMENTS.md](PRODUCT_REQUIREMENTS.md); positioning and users in [PRODUCT_VISION.md](PRODUCT_VISION.md).

## 1. Mission

Help everyday motorcycle riders — commuters, delivery workers, and small fleet owners, starting in the Philippines — **never miss maintenance, understand their true cost of ownership, and keep a verifiable service history**.

Core promise: **"Never forget motorcycle maintenance again."**

The motorcycle is not a hobby object for our users; it is their livelihood and daily transport. A missed oil change is not an inconvenience — it is a blown engine that costs two weeks of delivery income. Motrack's job is to make staying on top of maintenance effortless for someone with no mechanical background, no patience for data entry, and an entry-level Android phone.

## 2. What "success" means

### Product success metrics (post-launch, measured once analytics exist — none in MVP per [PRODUCT_DECISIONS.md](PRODUCT_DECISIONS.md) §11)

| Metric | Target | Why this metric |
|---|---|---|
| Time to log a maintenance entry (Quick Log) | **≤ 10 seconds** median | The brief's core differentiator; measured in usability tests before launch, instrumented later |
| Week-4 retention | ≥ 25% | A reminder app only works if it's still installed when the reminder fires |
| Reminder → action rate | ≥ 40% of fired reminders followed by a log within 14 days | Measures whether reminders are trusted and correctly timed |
| Bikes with ≥ 3 schedules configured | ≥ 70% of active bikes | Health Score and reminders are useless without configured schedules |
| Data loss reports | **Zero** caused by the app | Data integrity is priority #1 ([DEVELOPMENT_RULES.md](DEVELOPMENT_RULES.md)); competitor reviews show data loss is the #1 trust killer |
| Crash-free sessions | ≥ 99.5% | Low-end Android reliability bar ([PERFORMANCE.md](PERFORMANCE.md)) |

### Engineering success metrics (verifiable from day one)

- Every MVP feature demonstrably works in airplane mode ([OFFLINE_ARCHITECTURE.md](OFFLINE_ARCHITECTURE.md)).
- Every migration upgrades a populated production database without loss ([DATABASE_DESIGN.md](DATABASE_DESIGN.md) §8).
- A new engineer can go from clone to running app in under 30 minutes using [DEVELOPER_SETUP.md](DEVELOPER_SETUP.md).
- The Phase-2 sync layer is added without altering any existing table's primary keys or removing columns ([SUPABASE_SYNC_PLAN.md](SUPABASE_SYNC_PLAN.md)).

## 3. Business philosophy

1. **Trust before monetization.** The free tier is genuinely useful (full MVP, 2 bikes). We earn the one-time Pro purchase ([PREMIUM_SYSTEM.md](PREMIUM_SYSTEM.md)) by being reliable, not by crippling the free product.
2. **One-time purchase, not subscription.** Our users are price-sensitive; a ₱-denominated lifetime unlock matches how they buy. This was a deliberate override of an earlier subscription assumption ([DECISION_LOG.md](DECISION_LOG.md) D-002).
3. **The user's data belongs to the user.** Everything is exportable ([EXPORT_IMPORT.md](EXPORT_IMPORT.md)) and backupable ([BACKUP_RECOVERY.md](BACKUP_RECOVERY.md)) for free, forever. Lock-in comes from being good, not from holding data hostage.
4. **Simple beats complete.** When a feature choice is between "covers every enthusiast case" and "a delivery rider understands it instantly," we choose the rider. Depth is progressive disclosure, never a wall of fields ([UI_UX_GUIDELINES.md](UI_UX_GUIDELINES.md)).
5. **Built to last five years.** Architecture decisions favor evolution over rewrites — every major system documents its MVP → Phase 2 → Phase 3 → long-term path.

## 4. Non-goals

- Motrack is **not** a ride tracker / GPS logger (no location permission in MVP).
- Motrack is **not** a social network in MVP (community is Phase 3, see [FUTURE_ROADMAP.md](FUTURE_ROADMAP.md)).
- Motrack is **not** an enthusiast's dyno-sheet toolbox; modification tracking and lap timing are out of scope permanently unless the market demands otherwise.
- Motrack does **not** diagnose safety-critical failures; AI Mechanic (Phase 2) suggests likely causes with explicit "see a mechanic" framing ([SECURITY.md](SECURITY.md) §8 — user safety).
