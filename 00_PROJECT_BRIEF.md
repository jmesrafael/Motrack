# Project Brief: Motorcycle Maintenance Tracker App
*(Working title — rename once you have a brand name. Referred to as "the App" throughout.)*

This document is the single source of truth about **what** the product is. It contains no instructions about how an AI model should behave — that lives in `01_INSTRUCTIONS_FOR_FABLE.md`. Read this brief in full before generating anything.

---

## 1. Mission

Help everyday motorcycle riders — commuters, delivery workers, and small fleet owners, starting in the Philippines — never miss maintenance, understand their true cost of ownership, and keep a verifiable service history.

Core promise: **"Never forget motorcycle maintenance again."**

## 2. Target Users

- **Daily commuters** who own one motorcycle and want simple reminders, not a hobbyist toolset.
- **Delivery riders** (food/parcel) who put heavy, fast mileage on their bikes and need low-friction logging (seconds, not minutes).
- **Families / small businesses** managing 2–5 motorcycles across riders.
- **Small fleet operators** who eventually need an admin view across many bikes and employees.

## 3. Market Context & Competitive Landscape

Millions of motorcycles are used daily in the Philippines for commuting, delivery, and small business. Most existing maintenance-tracker apps are built for enthusiasts and can feel heavy or overwhelming for this audience.

Known competitors and their general positioning:

| App | Known focus |
|---|---|
| Riderr | Smart reminders, service history, manual uploads, recall alerts, modification tracking |
| MotorManage | Maintenance logs, parts-condition tracking, reminders, offline support, broad model coverage |
| BikerGarage | Multi-bike management, mileage, fuel tracking, full service history |
| RideLog | Ride recording, fuel logs, maintenance reminders, riding statistics |
| MotoLogger | Digital garage, AI assistant, document vault, ride logs, manual-based recommendations |
| Revvo | Offline-first maintenance diary, service logs, reminders, fuel tracking, PDF/CSV export |

> Note: this competitor list came from an earlier brainstorm, not verified market research. Treat it as a starting hypothesis — one of Fable 5's first real jobs (see instructions doc) should be re-verifying and deepening this research.

### Differentiation opportunity
- Ultra-simple maintenance logging (target: under 10 seconds per entry)
- A clear, single "Health Score" number instead of a wall of stats
- Automatic maintenance schedules by motorcycle make/model
- AI-powered receipt scanning
- QR-code shareable service history (resale value)
- Fleet management for businesses with multiple motorcycles
- Local relevance: Philippine registration cycles, common local costs, common local bike models (Honda Click, Yamaha NMAX, Honda ADV, Suzuki Raider, etc.)

## 4. Product Philosophy (non-negotiable principles)

- Maintainability over speed
- Readability over cleverness
- Offline-first over cloud-first
- Scalability over shortcuts
- Consistency over personal preference
- Every feature must work offline
- Every database migration must preserve existing data
- Every screen must support dark mode
- All strings must be localizable (English + Filipino at minimum)
- No duplicate logic; business logic never lives inside UI components
- Production quality only — no placeholder implementations

## 5. Phase 1 — MVP Feature Set

**Dashboard**
Per-bike snapshot: current odometer, Health Score (%), next-maintenance list with status color (green/yellow/red), recent expenses this month.

**Motorcycle Profile**
Photo, nickname, brand, model, year, plate number, VIN (optional), engine number (optional), purchase date, purchase price, current mileage.

**Maintenance Tracker** (per-component tracking, each with its own interval logic)
- Engine oil — brand, oil type, viscosity, quantity, date, mileage, cost, notes; reminder every ~1,500 km or 3 months
- Gear oil — date, mileage, brand, cost
- Oil filter — replacement interval
- Air filter — cleaning + replacement tracking
- Spark plug — replacement tracking
- CVT maintenance (scooters) — cleaning, belt replacement, roller replacement, slider replacement, clutch cleaning
- Chain (manual bikes) — cleaning, lubrication, replacement, sprocket replacement
- Brake pads — front/rear, remaining %, replacement date
- Brake fluid — replacement reminder
- Coolant — replacement reminder
- Battery — purchase date, brand, warranty, voltage (optional)
- Tires — front/rear: purchase date, mileage installed, brand, size, pressure, remaining tread

**Maintenance History** — chronological timeline of completed work with cost.

**Maintenance Reminders** — automatic notifications (e.g., "oil change due tomorrow," "CVT cleaning in 300 km," "brake pads overdue," "registration expires in 5 days").

**Expense Tracker** — categorized (fuel, oil, tires, service, repairs, registration, insurance, parking, accessories, washing) with monthly totals/graph.

**Fuel Tracker** — liters, cost, odometer, station; auto-calculates cost/km, average consumption, monthly fuel cost.

**Documents** — photo/PDF storage for OR/CR, insurance, driver's license, warranty, receipts, service invoices.

**Service History / Repair Log** — distinct from routine maintenance: problem, diagnosis, solution, cost.

**Mileage Log** — manual odometer updates that recalculate every dependent schedule (oil, tires, brakes, etc.).

**Multi-Motorcycle Support** — a "garage" view for families or small fleets.

**Statistics** — total km, total maintenance cost, fuel cost, average monthly expense, cost per km, number of oil changes, lifetime maintenance cost.

**Health Score** — single calculated percentage based on how many/how overdue items are.

## 6. Phase 2 — Premium Feature Set (build after Phase 1 is validated)

- **AI Mechanic** — user describes a symptom, gets likely-cause suggestions
- **VIN Scanner** — auto-loads specs, oil capacity, tire sizes, recommended schedule
- **Receipt Scanner** — AI extracts cost, shop, date, parts from a photo
- **Voice Logging** — spoken maintenance entries auto-create records
- **QR Code Service History** — shareable read-only history, useful when reselling
- **Workshop Integration** — mechanics can update service, upload invoices, mark work complete
- **Parts Life Prediction** — estimated remaining km before a part needs replacing
- **Smart Notifications** — context-aware reminder phrasing instead of generic alerts
- **Community** — shared mechanic recommendations, DIY guides, oil-brand tips
- **Fleet/Business Features** — admin dashboard across many bikes, employee assignment, fleet-wide health and cost tracking

## 7. Technical Direction (decided/assumed — confirm before building)

- **Framework:** React Native via **Expo** (Expo Router for file-based navigation, EAS for builds/updates). Current default for cross-platform mobile; one codebase covers both iOS and Android, which matters for a Philippines-first launch.
- **Client state:** **Zustand**. Right-sized for this app — no boilerplate, tiny footprint. The MVP has no backend, so there's no "server state" to manage yet; a data-fetching library (e.g. TanStack Query) only becomes relevant once Phase 2 introduces a backend.
- **Local database:** **SQLite via `expo-sqlite`, paired with Drizzle ORM** for type-safe queries and migrations. This is the current standard pairing for new Expo apps with real relational data (bikes, maintenance records, expenses, joins, aggregates) — a much better fit than key-value storage. Works fine inside Expo Go during development.
- **Monetization:** **RevenueCat** — implies a subscription-based premium tier (Phase 2 features gated behind entitlements) rather than one-time purchases. Confirm this matches the intended business model. Note: real purchases require an EAS development build; RevenueCat won't process actual transactions inside plain Expo Go.
- **Monitoring:** "Performance" was listed without a specific tool. Recommend **Sentry** for crash reporting + performance monitoring (JS-thread stalls, slow screens, crash grouping) — the current mature standard for React Native. If product analytics (retention, feature usage) matters too, **PostHog** bundles that with error tracking at a more generous free tier, worth a look if budget is tight early on.
- **Not yet decided:** anything backend-related. The MVP as scoped is fully offline/local-device, but several Phase 2 features (workshop integration, community, cross-device QR sharing, backup) imply a backend eventually — Supabase, Firebase, or custom. Decide this now even if it's not built until later, so the local schema can sync later without a rewrite.

## 8. Open Assumptions — Confirm or Override

These weren't explicitly stated earlier in the brainstorm. Sensible defaults are filled in below; correct anything wrong before sending this to Fable 5.

- **Platforms:** iOS + Android both, Android-prioritized given the Philippines market. *(Assumption)*
- **Distribution:** Google Play + Apple App Store. *(Assumption — some PH apps also distribute APKs directly; flag if that matters.)*
- **Localization:** English + Filipino (Tagalog), currency in ₱ (PHP), distances in km. *(Assumption, matches examples used throughout this brief.)*
- **Notifications:** Local, on-device scheduled notifications only for MVP — no server-sent push needed, consistent with offline-first. *(Assumption)*
- **Data privacy:** The app stores sensitive documents (government IDs, OR/CR, insurance). Security docs should explicitly account for the Philippines Data Privacy Act (RA 10173). *(Flagging this — not addressed anywhere yet.)*
- **Team size:** Assuming a solo developer or very small team, which affects how heavy the coding-standards/process docs should be. *(Assumption — correct if this is for a larger team.)*
- **App name:** Still a placeholder. Worth deciding before design-system work starts, since it affects branding, icon, and store listing.

## 9. Documentation Deliverable

The end goal is a folder of focused Markdown files (the "knowledge base") that any AI model or engineer can read to build this app consistently. The exact file list and per-file scope is defined in `01_INSTRUCTIONS_FOR_FABLE.md` — this brief is the input; that document is the task.
