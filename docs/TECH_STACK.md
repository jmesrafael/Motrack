# TECH_STACK.md — Chosen Stack & Justification

> **Owns:** the technology choices and why. Per-dependency operational detail (versions, upgrade policy): [DEPENDENCY_GUIDE.md](DEPENDENCY_GUIDE.md). Decision records: [ARCHITECTURE_DECISIONS.md](ARCHITECTURE_DECISIONS.md) (ADR-xxx below). Layering rules: [SOFTWARE_ARCHITECTURE.md](SOFTWARE_ARCHITECTURE.md).

## 1. The stack at a glance

| Concern | Choice | ADR |
|---|---|---|
| Framework | React Native via **Expo (managed workflow)**, TypeScript strict | ADR-001 |
| Navigation | **Expo Router** (file-based, built on React Navigation) | ADR-002 |
| Local database | **expo-sqlite + Drizzle ORM** (typed queries + migrations) | ADR-003 |
| Client state | **Zustand** (+ selectors); no server-state lib in MVP | ADR-004 |
| Forms & validation | **React Hook Form + Zod** (schemas shared with services) | ADR-016 |
| Notifications | **expo-notifications** (local only in MVP) | ADR-015 |
| Files/media | expo-file-system, expo-image-picker, expo-document-picker, expo-image-manipulator | — |
| i18n | **i18next + react-i18next + expo-localization** | ADR-012 |
| Payments | **RevenueCat** (react-native-purchases) — one-time lifetime unlock | ADR-013 |
| Crash reporting | **Sentry** (@sentry/react-native), anonymized, default-on w/ opt-out | ADR-014 |
| Charts | Lightweight in-house SVG bars via react-native-svg (one chart type; a chart lib is unjustified weight) | ADR-024 |
| PDF/CSV export | expo-print (HTML→PDF) + in-house CSV writer | ADR-018 |
| Builds/updates | **EAS Build + Submit + Update** | [RELEASE_PROCESS.md](RELEASE_PROCESS.md) |
| Phase-2 backend | **Supabase** (Postgres, Auth, Storage, RLS) | ADR-020 |

## 2. Why these (condensed rationale)

- **Expo managed**: one codebase for the two target platforms with the smallest ops surface for a startup-sized team; EAS covers signing/builds/updates; every needed native capability (SQLite, notifications, file system, camera, IAP via dev-build) exists as a maintained module. Constraint honored: development uses a **dev build** (not Expo Go) because RevenueCat and Sentry need native modules ([DEVELOPER_SETUP.md](DEVELOPER_SETUP.md) §3).
- **Expo Router**: file-based routes with typed links; it *is* React Navigation underneath (satisfies the engineering constraint list) with less boilerplate and Expo-native deep-linking — which notifications rely on ([NOTIFICATION_ENGINE.md](NOTIFICATION_ENGINE.md) §8).
- **SQLite + Drizzle**: the data is relational (bikes ⇢ schedules ⇢ records; unions for expenses) with real aggregates; Drizzle gives compile-time-typed SQL and a migration story that satisfies the "every migration preserves data" rule ([DATABASE_DESIGN.md](DATABASE_DESIGN.md) §8) without an ORM runtime tax on low-end devices.
- **Zustand**: minimal footprint for UI/session state. There is **no server state in MVP** — introducing TanStack Query now would be dead weight; it is the planned addition when Supabase arrives (ADR-004 records the trigger).
- **RHF + Zod**: performant uncontrolled forms on low-end Android; Zod schemas double as service-layer validation so rules exist once ([SOFTWARE_ARCHITECTURE.md](SOFTWARE_ARCHITECTURE.md) §5).
- **Supabase over Firebase/custom** (Phase 2): Postgres mirrors the relational local schema nearly 1:1 (same tables, same UUIDs) making sync tractable ([SUPABASE_SYNC_PLAN.md](SUPABASE_SYNC_PLAN.md)); RLS gives per-user isolation cheaply; storage covers documents; self-hostable if costs demand it later. Firebase's document model would force a second data model.

## 3. What we deliberately did NOT adopt

| Rejected | Why |
|---|---|
| WatermelonDB / Realm | Sync magic we don't control; heavier native footprint; Drizzle+SQLite is simpler and sufficient at our scale (ADR-003) |
| Redux (+Toolkit) | Boilerplate without benefit at this state size (ADR-004) |
| TanStack Query (MVP) | No remote data yet (ADR-004) |
| Victory/Recharts/Skia charts | One stacked-bar chart type doesn't justify 100s of KB + Skia runtime (ADR-024) |
| Custom font | Install size + rendering cost on low-end devices; system fonts are excellent (ADR-010) |
| NativeWind/Tailwind | Token-typed StyleSheet + theme hook is sufficient; one less transform layer ([THEME_GUIDE.md](THEME_GUIDE.md)) |
| Firebase | See §2 Supabase rationale (ADR-020) |
| CodePush-style OTA for features | EAS Update used for hotfixes only; feature releases go through stores ([RELEASE_PROCESS.md](RELEASE_PROCESS.md) §5) |

## 4. Constraint checklist (from the project directive)

React Native ✔ · Expo managed ✔ · TypeScript ✔ · SQLite ✔ · Drizzle ✔ · Zustand ✔ · React Navigation ✔ (via Expo Router) · React Hook Form ✔ · Zod ✔ · expo-notifications ✔ · expo-file-system ✔ · expo-image-picker ✔ · expo-document-picker ✔ · Android+iOS single codebase ✔ · offline-first ✔ ([OFFLINE_ARCHITECTURE.md](OFFLINE_ARCHITECTURE.md)) · no MVP backend ✔ · Supabase-sync compatible ✔ · one-time premium ✔ · lightweight install ✔ ([PERFORMANCE.md](PERFORMANCE.md) §7) · low-end Android optimized ✔.

## 5. Evolution

- **MVP:** stack above, no backend.
- **Phase 2:** + Supabase JS client, TanStack Query for remote reads, push token handling; sync engine per [SUPABASE_SYNC_PLAN.md](SUPABASE_SYNC_PLAN.md).
- **Phase 3:** web dashboard (Next.js or Expo Web — decide then via ADR) over the same Supabase API ([API_STRATEGY.md](API_STRATEGY.md)).
- **Long-term:** shared TS domain package (services/validation) consumed by mobile + web + edge functions — enabled today by keeping services React-free ([SOFTWARE_ARCHITECTURE.md](SOFTWARE_ARCHITECTURE.md) §4).
