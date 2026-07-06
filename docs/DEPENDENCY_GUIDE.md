# DEPENDENCY_GUIDE.md — Every Dependency, Justified

> **Owns:** the dependency register, the addition policy, and upgrade cadence. Choice rationale lives in [TECH_STACK.md](TECH_STACK.md)/ADRs; this file is the operational ledger. Rule: **a dependency not in this file does not get installed.**

## 1. Register (MVP)

| Package | Why (one line) | ADR |
|---|---|---|
| `expo` (SDK, latest stable at project start) | Framework/runtime | ADR-001 |
| `expo-router` | File-based navigation on React Navigation | ADR-002 |
| `react`, `react-native` | Per Expo SDK | — |
| `typescript` | Language | — |
| `expo-sqlite` | Local DB engine | ADR-003 |
| `drizzle-orm` + `drizzle-kit` (dev) | Typed schema/queries/migrations | ADR-003 |
| `zustand` | UI/session state | ADR-004 |
| `react-hook-form` + `@hookform/resolvers` | Forms | ADR-016 |
| `zod` | Validation single-source | ADR-016 |
| `expo-notifications` | Local reminders | ADR-015 |
| `expo-file-system` | Files, backup archive I/O | ADR-018 |
| `expo-image-picker`, `expo-document-picker` | Media/document import | — |
| `expo-image-manipulator` | Compression/EXIF strip | [PERFORMANCE.md](PERFORMANCE.md) §6 |
| `expo-print` | PDF report | ADR-018 |
| `expo-sharing` | Share sheets (exports/backups) | — |
| `expo-localization`, `i18next`, `react-i18next` | i18n | ADR-012 |
| `date-fns` | Date math/locale formatting (tree-shakeable) | — |
| `react-native-svg` | HealthRing + in-house chart | ADR-024 |
| `react-native-reanimated` | Motion (router dependency anyway) | [ANIMATION_GUIDE.md](ANIMATION_GUIDE.md) |
| `react-native-screens`, `react-native-safe-area-context`, `react-native-gesture-handler` | Expo Router / navigation prerequisites (would be installed implicitly — listed so nothing is unaccounted) | ADR-002 |
| `@gorhom/bottom-sheet` | `SheetContainer` base — gesture-correct, accessible sheets are core to Quick Log; hand-rolling to that quality costs more than the dependency | ADR-027 |
| `@react-native-community/datetimepicker` | Native date pickers for `DateField` (Expo-compatible standard) | — |
| `react-native-purchases` | RevenueCat Pro unlock | ADR-013 |
| `@sentry/react-native` | Crash reporting | ADR-014 |
| `@expo/vector-icons` | Icons (bundled with Expo) | ADR-011 |
| zip implementation for backup (`react-native-zip-archive` or JS `fflate` — benchmark at implementation, T-114; prefer `fflate` if large-fixture backup meets the 30 s budget without native code; **must support streaming** — the archive is never held fully in RAM, ADR-026) | Backup archives | ADR-018/026 |
| **Dev:** `jest`, `jest-expo`, `@testing-library/react-native`, `better-sqlite3`, `eslint` (+plugins incl. boundaries, i18next), `prettier`, `maestro` (later) | Per [TESTING.md](TESTING.md)/[CODE_STYLE.md](CODE_STYLE.md) | — |

Explicit non-dependencies (do not add): AsyncStorage (settings live in SQLite — [STATE_MANAGEMENT.md](STATE_MANAGEMENT.md) §5), chart libraries (ADR-024), moment.js, lodash (write the 3 helpers), NativeWind, Redux, axios (no network in MVP — [OFFLINE_ARCHITECTURE.md](OFFLINE_ARCHITECTURE.md) §3).

## 2. Addition policy (gate for every new package)

1. Measurable value a maintained existing dep or ≤ ~150 lines of our own code can't provide.
2. Health check: maintained (release < 12 mo), typed, compatible with current Expo SDK, license MIT/Apache/BSD-class.
3. Cost check: install-size impact vs [PERFORMANCE.md](PERFORMANCE.md) §7; native code? (dev-build implications).
4. Recorded: ADR (if architectural) + row here + `npm audit` clean.
Fail any → write the code in-house or don't.

## 3. Upgrade policy

- **Expo SDK:** upgrade once per SDK release cycle, within 2 months of stable (never mid-milestone); run full manual E2E checklist after ([TESTING.md](TESTING.md) §7).
- **Everything else:** minor/patch monthly batch; majors deliberately with changelog review.
- Security advisories: immediately (CI `npm audit` fails high+).
- Lockfile committed; CI installs frozen (`npm ci`).
- Renovate/dependabot optional later; a human always merges.

## 4. Evolution

**Phase 2 additions (pre-approved direction, still gated by §2):** `@supabase/supabase-js`, `@tanstack/react-query` (ADR-004 trigger), `expo-secure-store` (auth tokens), `expo-local-authentication` (privacy lock candidate), camera/scanner modules per feature. Each lands with its ADR and register row.
