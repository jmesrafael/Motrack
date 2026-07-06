# ARCHITECTURE_DECISIONS.md — ADR Register

> Numbered, append-only records of every non-obvious **technical** decision: context → decision → trade-offs. Product/scope decisions live in [DECISION_LOG.md](DECISION_LOG.md). Statuses: **Accepted** (all below, as of KB v1.0). Superseding requires a new ADR referencing the old one — never edit history.
>
> Format note: keep new ADRs this size. If a decision needs pages, the design belongs in a system doc and the ADR records *that the choice was made and why*.

---

### ADR-001 · Expo managed workflow
**Context:** Solo/small team, two platforms, PH-first launch; native needs = SQLite, notifications, files, camera, IAP, crash reporting — all covered by maintained Expo/RN modules.
**Decision:** Expo managed workflow + EAS; development via **dev builds** (not Expo Go — RevenueCat/Sentry need native modules).
**Trade-offs:** Accepts Expo's release cadence and module surface; escape hatch (prebuild) exists if an unavailable native capability ever blocks us.

### ADR-002 · Expo Router (file-based) as the navigation layer
**Context:** Constraint list names React Navigation; Expo Router is built on React Navigation and adds typed file-based routing + first-class deep links (notifications depend on deep links).
**Decision:** Expo Router; routes mirror the screen inventory ([FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md) §4).
**Trade-offs:** Slightly more framework "magic" than hand-rolled navigators; accepted for deletion of boilerplate and safer links.

### ADR-003 · expo-sqlite + Drizzle ORM (rejected: WatermelonDB, Realm, key-value)
**Context:** Relational data with joins/aggregates; hard rule of data-preserving migrations; low-end Android budget; future Postgres sync.
**Decision:** SQLite via expo-sqlite with Drizzle for typed schema, queries, and migrations.
**Trade-offs:** We own sync logic later (vs Watermelon's built-in) — accepted because sync must follow our Supabase plan anyway ([SUPABASE_SYNC_PLAN.md](SUPABASE_SYNC_PLAN.md)); Realm/Watermelon add native weight and lock-in.

### ADR-004 · Zustand only; no Redux; no TanStack Query until Phase 2
**Context:** MVP state = UI/session + views over a local DB; there is no server state.
**Decision:** Zustand stores per domain slice ([STATE_MANAGEMENT.md](STATE_MANAGEMENT.md)); TanStack Query is explicitly planned for Phase-2 remote reads.
**Trade-offs:** Hand-rolled invalidation for DB-backed views (event-driven, [DATA_FLOW.md](DATA_FLOW.md) §5) — simpler than adopting a cache library for local reads.

### ADR-005 · Offline-first: local SQLite is the permanent source of truth
**Context:** Riders have patchy connectivity; competitor apps going read-only offline is a top complaint.
**Decision:** Every feature reads/writes local SQLite synchronously-ish; cloud (Phase 2) is a replicated backup/secondary, never required.
**Trade-offs:** Conflict resolution burden lands on us at sync time (accepted, designed in [SUPABASE_SYNC_PLAN.md](SUPABASE_SYNC_PLAN.md) §5).

### ADR-006 · Sync-ready schema conventions from day one
**Context:** Retrofitting sync onto integer-PK, hard-delete schemas forces rewrites.
**Decision:** All user-data tables: UUIDv4 TEXT PKs generated on device, `created_at`/`updated_at` (ms epoch), `deleted_at` soft delete; no autoincrement anywhere; no server-assigned IDs ever.
**Trade-offs:** Slightly larger keys/indexes; purge job needed for soft deletes (30 days, [DATABASE_DESIGN.md](DATABASE_DESIGN.md) §7).

### ADR-007 · Component-specific record fields as a Zod-validated JSON column
**Context:** 22 component types with small, divergent detail fields ([BUSINESS_RULES.md](BUSINESS_RULES.md) §5); alternatives were ~20 sparse columns or EAV.
**Decision:** `maintenance_records.details` TEXT(JSON), validated by per-component Zod schema at the service boundary; never queried inside SQL (only displayed/exported).
**Trade-offs:** No SQL filtering on detail fields (not needed by any spec'd feature); schema evolution handled in code with versioned Zod schemas.

### ADR-008 · Money as integer centavos
**Context:** Floating-point money corrupts totals; PHP uses 2 decimals.
**Decision:** All money columns `INTEGER` centavos (`*_centavos`); single `formatMoney()` display path ([LOCALIZATION.md](LOCALIZATION.md) §5).
**Trade-offs:** Conversion at input/display boundaries only.

### ADR-009 · Odometer "effective km" with per-bike offset for meter replacement
**Context:** Meters get replaced/reset; naive monotonic validation would dead-end those users; per-segment math everywhere would infect all interval logic.
**Decision:** Rows store raw `reading_km` + computed `effective_km = reading + offset_at_insert`; bike carries `odometer_offset_km` updated on a meter-replacement event; **all** business math uses effective km ([BUSINESS_RULES.md](BUSINESS_RULES.md) §6.4).
**Trade-offs:** One denormalized computed column; kept honest by insert-time computation inside a transaction.

### ADR-010 · System font stack, no bundled font
**Context:** Install-size budget + text rendering on low-end Android.
**Decision:** `system-ui` (SF Pro/Roboto) + tabular-nums where alignment matters ([DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) §4).
**Trade-offs:** Less brand distinctiveness; revisit at branding pass via token re-values only.

### ADR-011 · Material Community Icons via @expo/vector-icons
**Context:** Already bundled with Expo (no added size); covers motorcycle-domain glyphs.
**Decision:** Single set behind a typed `Icon` wrapper ([ICON_GUIDE.md](ICON_GUIDE.md)).
**Trade-offs:** Set lock-in mitigated by the wrapper.

### ADR-012 · i18next for localization
**Context:** en+fil at MVP, more locales long-term; plural/interpolation correctness; RN support.
**Decision:** i18next + react-i18next + expo-localization; JSON resources; lint ban on literal strings ([LOCALIZATION.md](LOCALIZATION.md)).
**Trade-offs:** ~small runtime cost; industry-standard tooling and translator familiarity in return.

### ADR-013 · RevenueCat for the one-time lifetime purchase
**Context:** One-time unlock (D-002) across two stores; receipt validation without our own backend in MVP.
**Decision:** react-native-purchases with a single non-consumable product mapped to entitlement `pro`; local entitlement cache for offline ([PREMIUM_SYSTEM.md](PREMIUM_SYSTEM.md)).
**Trade-offs:** Third-party dependency + revenue share of $0 (RC free tier covers our volume initially); alternative (StoreKit/Billing direct) costs more engineering than it saves.

### ADR-014 · Sentry crash reporting, anonymized, default-on with opt-out
**Context:** Crash-free rate is a launch metric; no analytics in MVP; PH Data Privacy Act exposure must stay minimal.
**Decision:** @sentry/react-native with PII scrubbing (no user IDs — none exist; no file paths/document data in breadcrumbs), visible opt-out (S-33).
**Trade-offs:** A network dependency exists but degrades silently offline; legit-interest basis documented in [SECURITY.md](SECURITY.md) §7.

### ADR-015 · Local-only notifications; pure planner + thin scheduler
**Context:** No backend; OS limits (iOS 64 pending); testability of timing logic.
**Decision:** `ReminderPlanner` = pure function producing the full desired plan; `NotificationScheduler` = expo-notifications adapter that cancels-and-reschedules; plan persisted in `scheduled_notifications` ([NOTIFICATION_ENGINE.md](NOTIFICATION_ENGINE.md) §5).
**Trade-offs:** Full replan on each trigger (cheap at our scale) buys determinism and unit-testability.

### ADR-016 · React Hook Form + Zod; schemas shared with services
**Context:** Form perf on low-end devices; single source for validation rules.
**Decision:** RHF uncontrolled forms; Zod schemas defined beside domain types and reused by services for input validation ([SOFTWARE_ARCHITECTURE.md](SOFTWARE_ARCHITECTURE.md) §5).
**Trade-offs:** Two libs instead of zero; hand-rolled forms at this field count would cost more and validate inconsistently.

### ADR-017 · Layered architecture: UI → hooks → services → repositories → DB
**Context:** Constitution bans business logic in UI; future web reuse.
**Decision:** Strict one-way layering with import rules lint-enforced; services are React-free TS ([SOFTWARE_ARCHITECTURE.md](SOFTWARE_ARCHITECTURE.md)).
**Trade-offs:** More files/ceremony than "fetch in component" — the point.

### ADR-018 · Export & backup formats: JSON-based `.motrack` archive; expo-print PDF; in-house CSV
**Context:** Backup must survive schema versions and app reinstalls; raw SQLite file copies are opaque, version-brittle, and risk partial-write corruption.
**Decision:** Backup = zip (`.motrack`) containing `manifest.json` (schema/app versions), `data.json` (full table export), and `files/` (documents/photos) ([BACKUP_RECOVERY.md](BACKUP_RECOVERY.md) §3). PDF via expo-print HTML templates; CSV via a small writer with proper escaping ([EXPORT_IMPORT.md](EXPORT_IMPORT.md)).
**Trade-offs:** Export/import code to maintain (vs file copy) — buys version-tolerant restores and partial recovery.

### ADR-019 · Health Score is always derived, never persisted
**Context:** Persisted scores drift from their inputs (stale-cache bugs).
**Decision:** Pure recomputation on the recalculation cascade ([HEALTH_SCORE.md](HEALTH_SCORE.md) §8).
**Trade-offs:** None at ≤ 22 items; revisit only if fleet roll-ups (Phase 3) need materialization server-side.

### ADR-020 · Supabase as the Phase-2 backend (rejected: Firebase, custom)
**Context:** Sync target must mirror a relational schema; small team; per-user isolation; document storage.
**Decision:** Supabase (Postgres + Auth + Storage + RLS); tables mirror local schema 1:1 ([SUPABASE_SYNC_PLAN.md](SUPABASE_SYNC_PLAN.md) §3).
**Trade-offs:** Vendor dependency (mitigated: it's Postgres — exportable/self-hostable); Firebase would fork our data model; custom backend is unjustified ops for a small team.

### ADR-021 · Unified expenses are a read-time union — no duplicated expense rows
**Context:** Fuel/maintenance/repair costs must appear in expense reporting; writing mirror rows would double-count and desync.
**Decision:** Reporting queries UNION the four sources with category mapping ([BUSINESS_RULES.md](BUSINESS_RULES.md) §9.1); `expenses` stores only standalone entries.
**Trade-offs:** Slightly more complex read queries (indexed, fine at scale, [DATABASE_DESIGN.md](DATABASE_DESIGN.md) §6).

### ADR-022 · Migrations: Drizzle-generated, bundled, forward-only, transactional
**Context:** "Every migration preserves data" is constitutional; users skip versions.
**Decision:** Numbered migrations shipped in-app, run sequentially in a transaction on launch before any query; no down-migrations (recovery = restore backup); each destructive-looking change uses expand-migrate-contract ([DATABASE_DESIGN.md](DATABASE_DESIGN.md) §8).
**Trade-offs:** Contract steps wait a release cycle; discipline over convenience.

### ADR-023 · Entitlement gating through one `EntitlementService` with cached offline state
**Context:** Pro checks appear in several flows; purchases need connectivity but usage must not.
**Decision:** Single service exposing `isPro()` + `canAddBike(count)`; RevenueCat listener updates a persisted flag; degraded-restore edge = read-only extra bikes, never data loss ([PREMIUM_SYSTEM.md](PREMIUM_SYSTEM.md) §6, [BUSINESS_RULES.md](BUSINESS_RULES.md) §10).
**Trade-offs:** A cached flag can briefly lag a refund — acceptable; favor user trust over instant clawback.

### ADR-024 · In-house SVG stacked-bar chart (no chart library)
**Context:** Exactly one chart form ships in MVP (stacked monthly bars, S-22/S-28); chart libs cost 100s of KB and their own theming.
**Decision:** `MonthBarChart` on react-native-svg using `chart.*` tokens and the validated palette ([DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) §3).
**Trade-offs:** We own ~200 lines of chart code; revisit via new ADR if Phase 3 dashboards need richer viz.

### ADR-025 · Notifications are best-effort; in-app surfaces are the guarantee (CTO review)
**Context:** Independent architecture review found the KB implicitly over-promised OS behavior: Android does **not** restore expo-notifications schedules after reboot, Doze/OEM battery managers delay inexact alarms, and `SCHEDULE_EXACT_ALARM` is Play-policy-restricted and unjustified for maintenance reminders.
**Decision:** Treat local notifications as best-effort acceleration with approximate timing; the Reminders list/Dashboard are the always-correct truth; recovery is full re-plan on **every** app foreground; no exact-alarm permission; limitations documented user-honestly ([NOTIFICATION_ENGINE.md](NOTIFICATION_ENGINE.md) §9a).
**Trade-offs:** A user who reboots and never opens the app misses reminders until next open — accepted for MVP; Phase-2 server push (R-37) is the structural fix. Rejected: background-fetch re-planning (itself Doze-throttled — false confidence for real complexity).

### ADR-026 · Streamed backup I/O + forced reload after restore (CTO review)
**Context:** A ≤ 500 MB archive assembled in memory would OOM the 2 GB reference device; and after the restore's atomic DB swap, live Drizzle connections and hydrated Zustand stores reference the replaced database.
**Decision:** Backup create/extract must stream to/from disk (chunked table export, file-at-a-time zip — constrains T-114 library choice); restore ends with a **forced full JS reload** through the normal startup sequence ([BACKUP_RECOVERY.md](BACKUP_RECOVERY.md) §3–4).
**Trade-offs:** Slightly more backup code than a naive buffer; reload adds ~2 s to a rare, safety-critical flow.

### ADR-027 · @gorhom/bottom-sheet for SheetContainer (CTO review)
**Context:** Quick Log — the product's core interaction — lives in a bottom sheet; gesture-correct, keyboard-aware, screen-reader-friendly sheets are notoriously hard to hand-roll, and reanimated/gesture-handler (its deps) are already in the tree.
**Decision:** Build `SheetContainer` on `@gorhom/bottom-sheet` ([DEPENDENCY_GUIDE.md](DEPENDENCY_GUIDE.md) §1).
**Trade-offs:** One more UI dependency (well-maintained, de-facto standard) vs weeks of sheet-physics debugging; wrapper keeps it swappable.

### ADR-028 · Theme engine: registry of complete per-theme token files
**Context:** Dark mode is constitutional and the product direction requires unlimited future themes (AMOLED black, color packs, high contrast, seasonal) without component rewrites (D-018); the original single `tokens.ts` with hardwired light/dark variants dead-ends there.
**Decision:** Every theme is a **complete** `ThemeTokens` object (all groups: color/status/health/notif/chart/type/space/radius/elevation/motion/icon) in its own file under `src/theme/themes/`, registered in one registry; components consume semantic tokens via `useTheme` only; theme identity (`themeId`/`base`) is read by the engine alone, never by feature code; adding a theme = token file + registry entry, with registry-driven snapshot/contrast/component tests ([THEME_GUIDE.md](THEME_GUIDE.md)).
**Trade-offs:** Full-contract theme files are more verbose than ad-hoc overrides — deliberate: a missing token is a compile error, so a theme can't ship half-complete. Rejected: theming libraries (Restyle/styled-components — dependency weight for what ~150 lines deliver) and Appearance-only binary light/dark (blocks AMOLED/high-contrast without rework).
