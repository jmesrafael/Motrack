# GLOSSARY.md — Domain & Project Terms

> Definitions used consistently across every document and in code identifiers. When naming things in code, use these exact terms (see [CODE_STYLE.md](CODE_STYLE.md) for casing rules). Domain rules referenced here are specified in [BUSINESS_RULES.md](BUSINESS_RULES.md).

## Motorcycle & maintenance domain

| Term | Definition |
|---|---|
| **CVT** | Continuously Variable Transmission — the belt-driven automatic transmission in scooters (Honda Click, Yamaha NMAX, etc.). Requires periodic cleaning and replacement of belt, rollers, and sliders. |
| **CVT belt (drive belt)** | Rubber belt transferring engine power in a CVT. Wear item; snapping strands a rider. |
| **Rollers (weight rollers)** | Cylindrical weights inside the CVT variator controlling gear ratio; wear flat over time causing sluggish acceleration. |
| **Slider (slider piece)** | Plastic guide pieces in the CVT variator; wear item replaced alongside rollers. |
| **Drivetrain type** | Motrack's classification of how power reaches the wheel: `cvt` (scooters), `chain` (underbones/sport bikes), `other` (shaft/belt-drive, rare in PH). Gates which components apply to a bike. |
| **Underbone** | Small motorcycle with step-through frame and chain drive (e.g., Suzuki Raider, Honda Wave). Very common in PH. |
| **Gear oil** | Oil for the final-drive gearbox of a scooter (separate from engine oil). |
| **Sprockets** | Toothed wheels engaging the chain (front/engine + rear/wheel); replaced as a set with the chain. |
| **Tread depth** | Remaining tire groove depth; Motrack tracks "remaining %" as user-estimated. |
| **Odometer** | The bike's total-distance meter. In Motrack, an *odometer reading* is a whole, non-negative km value at a point in time. |
| **OR/CR** | Official Receipt / Certificate of Registration — the two documents proving motorcycle registration in the Philippines. Renewed annually with LTO. |
| **LTO** | Land Transportation Office — Philippine agency handling vehicle registration and driver's licenses. |
| **Registration cycle** | PH motorcycles re-register yearly; the month is determined by the plate number's last digit. |
| **VIN / chassis number** | Vehicle Identification Number; optional field on the motorcycle profile. |
| **Engine number** | Engine serial stamped on the crankcase; appears on the CR; optional field. |
| **Kasama** | Filipino for "companion" — reserved as a potential brand voice concept, not a feature. |
| **Talyer** | Filipino colloquial term for a small motorcycle repair shop. Used in UX copy where appropriate. |
| **Preventive maintenance (PMS)** | Scheduled service at fixed intervals; PH dealers call it "PMS" (Preventive Maintenance Service). |

## Motrack product concepts

| Term | Definition |
|---|---|
| **Garage** | The user's collection of motorcycles. "Garage view" lists all bikes. |
| **Component** | A maintainable part/consumable tracked per bike (engine oil, CVT belt, front tire, …). Canonical enum in [BUSINESS_RULES.md](BUSINESS_RULES.md) §2. |
| **Schedule** | Per-bike, per-component interval configuration (`maintenance_schedules` row): interval in km and/or months, enabled flag, and anchor (last-done point). |
| **Anchor** | The odometer reading + date from which a schedule's next due point is computed — normally the most recent maintenance record for that component, or a user-set baseline. |
| **Baseline** | A user-declared "last done at X km on date Y" for a component when real history is unknown (e.g., freshly added used bike). |
| **Due ratio (r)** | `max(km_used/interval_km, days_used/interval_days)` — how far a component is through its interval. Drives status colors and Health Score. |
| **Status color** | Green (`r < 0.80`), yellow (`0.80 ≤ r < 1.00`), red (`r ≥ 1.00`). Single definition in [BUSINESS_RULES.md](BUSINESS_RULES.md) §4. |
| **Health Score** | 0–100 weighted score summarizing a bike's maintenance state. Formula lives only in [HEALTH_SCORE.md](HEALTH_SCORE.md). |
| **Maintenance record** | A logged completed maintenance action (`maintenance_records` row) — what/when/at what km/cost. |
| **Repair** | An unplanned fix (problem → diagnosis → solution → cost), distinct from scheduled maintenance. Stored in `repairs`. |
| **Quick Log** | The ≤10-second logging flow (pre-filled component, current odometer, last-used values). See [USER_FLOWS.md](USER_FLOWS.md) F-2. |
| **Document vault** | The Documents feature storing OR/CR, insurance, license, receipts as photos/PDFs in app-private storage. |
| **Fuel log** | One refueling event: liters, cost, odometer, station, full-tank flag. |
| **Full-tank flag** | Marks a fill-up as "filled to full"; consumption math only uses full-to-full spans ([BUSINESS_RULES.md](BUSINESS_RULES.md) §7). |
| **Pro / Motrack Pro** | The one-time lifetime premium unlock. Gate list in [PREMIUM_SYSTEM.md](PREMIUM_SYSTEM.md). |
| **Backup archive** | Single `.motrack` file containing full database export + documents, for manual backup/restore ([BACKUP_RECOVERY.md](BACKUP_RECOVERY.md)). |

## Technical terms (project-specific usage)

| Term | Definition |
|---|---|
| **Repository (code)** | Data-access class wrapping Drizzle queries for one aggregate (e.g., `MotorcycleRepository`). The only layer that touches the DB. See [SOFTWARE_ARCHITECTURE.md](SOFTWARE_ARCHITECTURE.md). |
| **Service (code)** | Stateless business-logic module (e.g., `HealthScoreService`, `ReminderPlanner`). Never imports React. |
| **Store (code)** | A Zustand store slice holding UI/session state ([STATE_MANAGEMENT.md](STATE_MANAGEMENT.md)). |
| **Soft delete** | Setting `deleted_at` instead of removing a row; enables future sync and undo. Purged after 30 days. |
| **Anchor cache / odometer cache** | Denormalized columns (`motorcycles.current_odometer_km`, schedule anchors) maintained by services for read performance; the underlying logs remain the source of truth. |
| **Entitlement** | RevenueCat's record that a user owns Pro; cached locally for offline use. |
| **Sync-ready** | Schema conventions (UUID PK, `updated_at`, `deleted_at`) that let rows sync to Supabase later without migration. |
| **ADR** | Architecture Decision Record — numbered entries in [ARCHITECTURE_DECISIONS.md](ARCHITECTURE_DECISIONS.md). |
| **Knowledge base (KB)** | This `docs/` folder — the project constitution described in [README.md](README.md). |
