# DEVELOPER_SETUP.md — Clone to Running App

> **Owns:** environment setup and daily dev workflow. Target: **< 30 minutes to a running app** ([PROJECT_MISSION.md](PROJECT_MISSION.md) §2). Contribution workflow: [CONTRIBUTING.md](CONTRIBUTING.md); release tooling: [RELEASE_PROCESS.md](RELEASE_PROCESS.md).

## 1. Prerequisites

- Node LTS (via nvm/fnm; version pinned in `.nvmrc`), npm (lockfile is npm — do not mix package managers).
- Git. An Expo account (free) for EAS.
- **Android:** Android Studio (SDK + emulator) or a physical device with USB debugging. Recommended emulator profile: low-RAM device image to mirror the reference device ([PERFORMANCE.md](PERFORMANCE.md)).
- **iOS (macOS only):** Xcode + simulator.
- No secrets needed to develop: RevenueCat public key + Sentry DSN ship in committed config (designed-public, [SECURITY.md](SECURITY.md) §5); EAS credentials only for release builders ([RELEASE_PROCESS.md](RELEASE_PROCESS.md) §2).

## 2. First-time setup

```bash
git clone <repo> && cd motrack
nvm use               # or fnm use
npm ci                # frozen lockfile
npm run typecheck && npm test    # sanity: green before you start
```

## 3. Running the app — dev build, not Expo Go

RevenueCat + Sentry require native modules → **use a development build** (ADR-001):

```bash
# one-time per platform (or download the latest dev build from EAS artifacts):
eas build --profile development --platform android   # or ios
# daily:
npm start             # expo start --dev-client
```

Install the dev build on emulator/device once; iterate with Fast Refresh. Purchases in dev hit the RevenueCat sandbox; notifications, SQLite, and files behave real.

## 4. Daily commands

| Command | Does |
|---|---|
| `npm start` | Metro for dev client |
| `npm test` / `npm run test:watch` | Jest suites ([TESTING.md](TESTING.md)) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` / `lint:fix` | ESLint + Prettier |
| `npm run db:generate` | drizzle-kit migration from schema change ([DATABASE_DESIGN.md](DATABASE_DESIGN.md) §8) |
| `npm run db:studio` | Drizzle Studio inspector against a local fixture DB |
| `npm run fixtures:large` | Seeds the large perf fixture into the dev app DB |

## 5. Device testing notes

- Notification timing: use "fire in 2 minutes" dev override (`__DEV__` shortcut in S-31) rather than waiting for 08:00. Android loses scheduled notifications on reboot by design — verify the *recovery* path (reboot → open app → plan restored), not persistence ([NOTIFICATION_ENGINE.md](NOTIFICATION_ENGINE.md) §9a).
- Airplane-mode pass is part of any feature touching data ([OFFLINE_ARCHITECTURE.md](OFFLINE_ARCHITECTURE.md) §1).
- Low-end verification: emulator with 2 GB RAM cap or the real reference device before calling perf-sensitive work done ([PERFORMANCE.md](PERFORMANCE.md) §8).

## 6. Troubleshooting (keep updated)

Metro cache weirdness → `npx expo start -c` · dev build out of date after native dep change → rebuild `--profile development` · Android emulator no notifications → check exact-alarm/battery settings on the image · migration dev loop: wipe app data (dev only!) or use `npm run db:reset:dev` — never ship a migration that assumes a wipe ([DATABASE_DESIGN.md](DATABASE_DESIGN.md) §8).

## 7. Evolution

**Phase 2:** + `supabase start` (local stack) and `.env.local` for edge-function dev (first real secrets — SecureStore/env handling added then). **Phase 3+:** monorepo commands if/when the workspace splits ([FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md) §5).
