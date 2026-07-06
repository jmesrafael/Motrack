# DESIGN_SYSTEM.md — Design Tokens (Color, Type, Spacing, Radius, Elevation, Motion, Icon)

> **Owns:** the design tokens — names and values, for every registered theme. **Does not own:** the theme engine that delivers them ([THEME_GUIDE.md](THEME_GUIDE.md)), component anatomy ([COMPONENT_LIBRARY.md](COMPONENT_LIBRARY.md)), interaction principles ([UI_UX_GUIDELINES.md](UI_UX_GUIDELINES.md)). Tokens are the only place raw values live; components must consume tokens, never hex/px literals ([CODE_STYLE.md](CODE_STYLE.md) §7).
>
> Brand note: Motrack's visual identity is provisional (D-003, A-17). The token *names* are the stable contract; a branding pass or a new theme changes values only.

## 1. Token model & semantic colors

Tokens are grouped: `color` (this section) · `status`/`health`/`notif` (§2) · `chart` (§3) · `type` (§4) · `space`/`radius`/`elevation` (§5) · `motion` (values owned by [ANIMATION_GUIDE.md](ANIMATION_GUIDE.md) §2) · `icon` (sizes owned by [ICON_GUIDE.md](ICON_GUIDE.md) §2). Every registered theme supplies the **complete** set (the `ThemeTokens` contract, [THEME_GUIDE.md](THEME_GUIDE.md) §2); a theme missing any token is a type error. Components consume tokens semantically ("this is a card surface"), never by value ("this is gray") — that is what lets an AMOLED, color, high-contrast, or seasonal theme ship without touching a single component.

### 1.1 Surfaces & structure (light / dark)

| Token | Light | Dark | Use |
|---|---|---|---|
| `bg.page` | `#f9f9f7` | `#0d0d0d` | Screen background |
| `bg.surface` | `#fcfcfb` | `#1a1a19` | Default surface: grouped lists, chart surface |
| `bg.surfaceVariant` | `#f1f0ec` | `#232322` | Alternate fills: segmented-control track, skeleton blocks, section headers |
| `bg.card` | `#fcfcfb` | `#1e1e1d` | Cards (dark: one elevation step above `bg.surface`) |
| `bg.raised` | `#ffffff` | `#242423` | Modals, dialogs, raised cards |
| `bg.sheet` | `#ffffff` | `#242423` | Bottom sheets |
| `bg.nav` | `#fcfcfb` | `#161615` | Tab bar, headers |
| `bg.input` | `#ffffff` | `#232322` | Text fields, pickers |
| `overlay.scrim` | `rgba(11,11,11,0.45)` | `rgba(0,0,0,0.60)` | Backdrop behind sheets/modals |
| `border.divider` | `rgba(11,11,11,0.10)` | `rgba(255,255,255,0.10)` | Hairlines: card rings, separators |
| `border.strong` | `#c3c2b7` | `#383835` | Input borders, emphasis dividers |

Dark is **not** inverted light: it uses layered near-black surfaces (elevation = lighter surface, §5), softened borders, and re-tuned status/chart colors below. Dark surfaces deliberately stay ≥ `#0d0d0d` grays in the `dark` theme; a future AMOLED theme overrides `bg.*` to pure black — components stay untouched because separation on dark bases always comes from `border.divider`, never from assuming a particular surface value ([THEME_GUIDE.md](THEME_GUIDE.md) §3 rule 3).

### 1.2 Text & icons

| Token | Light | Dark | Use |
|---|---|---|---|
| `text.primary` | `#0b0b0b` | `#ffffff` | Headings, values |
| `text.secondary` | `#52514e` | `#c3c2b7` | Body, captions |
| `text.tertiary` | `#898781` | `#8f8d86` | Hints, axis labels, metadata |
| `text.placeholder` | `#898781` | `#7c7a74` | Input placeholder only (≥ 3:1, deliberately sub-body) |
| `text.disabled` | `rgba(11,11,11,0.35)` | `rgba(255,255,255,0.35)` | Disabled labels |
| `icon.primary` | `#52514e` | `#c3c2b7` | Default icon ink |
| `icon.secondary` | `#898781` | `#8f8d86` | Supporting/decorative icons |

### 1.3 Brand & action colors

| Token | Light | Dark | Use |
|---|---|---|---|
| `primary` | `#256abf` | `#3987e5` | Primary buttons, links, active tab, focus |
| `primary.pressed` | `#1c5cab` | `#2a78d6` | Pressed state |
| `primary.bg` | `#cde2fb` | `#104281` | Selected chips, subtle fills |
| `onPrimary` | `#ffffff` | `#ffffff` | Text/icons on `primary` |
| `secondary` | `#4b5c6b` | `#9fb3c2` | Secondary actions, quiet emphasis |
| `secondary.bg` | `#e4e9ee` | `#243039` | Secondary tinted fills |
| `accent` | `#b4540a` | `#e5863c` | Highlights, selection emphasis, illustration accents (never body text — pair with label per §6) |
| `premium` | `#8a6400` | `#e3b341` | Pro branding: crown, Pro badges, upsell surfaces ([PREMIUM_SYSTEM.md](PREMIUM_SYSTEM.md)) |
| `premium.bg` | `#f6ecd2` | `#33290f` | Pro tinted fills |
| `onPremium` | `#ffffff` | `#1a1400` | Text/icons on solid `premium` |
| `state.disabledBg` | `rgba(11,11,11,0.08)` | `rgba(255,255,255,0.08)` | Disabled control fills |

### 1.4 Feedback colors (system feedback, forms, banners, snackbars)

| Token | Light | Dark | Use |
|---|---|---|---|
| `feedback.success` | `#0ca30c` | `#35b940` | Save confirmations, positive banners |
| `feedback.warning` | `#b97d00` | `#ffc247` | Non-blocking warnings |
| `feedback.error` | `#d03b3b` | `#e46262` | Validation errors, destructive actions, failures |
| `feedback.info` | `#256abf` | `#3987e5` | Informational banners/hints |

Each has a `*.bg` tint precomputed per theme (visually = 12% over `bg.surface`) for banner/badge fills carrying `text.primary`.

## 2. Status, Health Score & notification colors

### 2.1 Motorcycle status ramp (reserved — never used as chart series or decoration)

| Token | Light | Dark | Meaning |
|---|---|---|---|
| `status.excellent` | `#0b7a2e` | `#52d269` | Everything comfortably within intervals |
| `status.good` | `#0ca30c` | `#35b940` | OK / healthy (due ratio, [BUSINESS_RULES.md](BUSINESS_RULES.md) §4) |
| `status.dueSoon` | `#fab219` | `#ffc247` | Due soon / expiring |
| `status.overdue` | `#d03b3b` | `#e46262` | Overdue / expired |
| `status.critical` | `#8f1212` | `#ff7a70` | Severely past due / lowest health band |
| `status.neutral` | `#898781` | `#8f8d86` | Unknown / un-anchored |

Each has a `status.*Bg` tint (12% over surface) per theme. **Mapping is fixed:** per-schedule due statuses ([BUSINESS_RULES.md](BUSINESS_RULES.md) §4) use `good`/`dueSoon`/`overdue`/`neutral`; `excellent` and `critical` are consumed by Health Score surfaces (§2.2) and reserved for future per-item severity — the business logic itself is unchanged and owned by BUSINESS_RULES. Rules: a status color **never appears without an icon or label** (`status.dueSoon` is sub-3:1 on light surfaces by design — the pairing is the mitigation); text on status fills uses tinted `*Bg` + `text.primary` unless a solid fill pairing is verified ≥ 4.5:1.

### 2.2 Health Score band colors

Five display bands ([HEALTH_SCORE.md](HEALTH_SCORE.md) §6, D-018). Distinct tokens (themes may diverge), valued in MVP themes as aliases of the status ramp:

| Token | Band | MVP value |
|---|---|---|
| `health.excellent` | 90–100 | = `status.excellent` |
| `health.good` | 75–89 | = `status.good` |
| `health.fair` | 50–74 | = `status.dueSoon` |
| `health.poor` | 25–49 | = `status.overdue` |
| `health.critical` | 0–24 | = `status.critical` |

Consumed by `HealthRing`/`HealthChip` ([COMPONENT_LIBRARY.md](COMPONENT_LIBRARY.md)); the band label always accompanies the color.

### 2.3 Notification colors

Used by the reminders list (S-05), notification badges, and in-app notification surfaces ([NOTIFICATION_ENGINE.md](NOTIFICATION_ENGINE.md)):

| Token | Light | Dark | Use |
|---|---|---|---|
| `notif.reminder` | `#256abf` | `#3987e5` | Upcoming maintenance reminders |
| `notif.warning` | `#b97d00` | `#ffc247` | Due-soon / expiring documents |
| `notif.success` | `#0ca30c` | `#35b940` | Completed / resolved |
| `notif.info` | `#0f7f8c` | `#45b8c8` | Tips, non-urgent information |
| `notif.error` | `#d03b3b` | `#e46262` | Overdue / failed |

## 3. Chart tokens (expense/statistics charts)

Categorical slots — fixed assignment order, entity-stable (a category keeps its slot regardless of filtering; fold beyond 5 categories into "Other" in `chart.other`):

| Slot | Light | Dark | Fixed assignment |
|---|---|---|---|
| `chart.1` | `#2a78d6` | `#3987e5` | fuel |
| `chart.2` | `#1baf7a` | `#199e70` | service |
| `chart.3` | `#eda100` | `#c98500` | oil |
| `chart.4` | `#008300` | `#008300` | repair |
| `chart.5` | `#4a3aa7` | `#9085e9` | tires |
| `chart.other` | `#898781` | `#8f8d86` | all remaining categories folded |
| `chart.grid` | `#e1e0d9` | `#2c2c2a` | Grid hairlines |

Axis text uses `text.tertiary`; values render in text tokens, never series color. Palette provenance: validated reference set (adjacent-pair CVD ΔE 24.2 light; dark steps validated against `#1a1a19`). Relief rule: slots 2–3 are sub-3:1 on light — charts must carry visible direct labels or a value list beside the chart (S-22/S-28 do: the list *is* the labels). New themes re-validate their chart palette with the same validator method before registration.

## 4. Typography

System font stack (no bundled font — install-size and low-end rendering; ADR-010): `system-ui` (SF Pro on iOS, Roboto on Android). Tabular numerals (`fontVariant: ['tabular-nums']`) for odometer, money columns, and axis ticks.

| Token | Size/line | Weight | Use |
|---|---|---|---|
| `type.display` | 34/40 | 700 | Health Score number |
| `type.h1` | 24/30 | 700 | Screen titles |
| `type.h2` | 19/24 | 600 | Section headers, card titles |
| `type.body` | 16/22 | 400 | Default text |
| `type.bodyStrong` | 16/22 | 600 | Emphasis, row titles |
| `type.caption` | 13/18 | 400 | Hints, timestamps, captions |
| `type.label` | 11/14 | 600, +0.5 tracking, uppercase | Tiny labels, tab labels |

Type tokens live in the shared theme base and are per-theme overridable (a high-contrast theme may raise weights) — components consume `type.*` from the active theme like any other token. All sizes scale with OS font scaling up to 130% ([UI_UX_GUIDELINES.md](UI_UX_GUIDELINES.md) §8); layouts must tolerate it.

## 5. Spacing, radius, elevation

- **Spacing scale (4-pt):** `space.1`=4, `.2`=8, `.3`=12, `.4`=16, `.5`=20, `.6`=24, `.8`=32, `.10`=40. Screen gutter = 16; card padding = 16; list row min-height = 56.
- **Radius:** `radius.sm`=8 (chips, inputs), `radius.md`=12 (cards), `radius.lg`=20 (sheets, modals), `radius.full` (pills, FAB).
- **Elevation tokens** (flat design, hairline borders preferred):
  - `elevation.flat` — none.
  - `elevation.card` — no shadow; 1 px `border.divider` ring.
  - `elevation.sheet` — light-base themes: y2 blur8 @10% black; dark-base themes: no shadow, separation via the raised surface step + `border.divider`.
  - `elevation.nav` — top hairline (`border.divider`) on tab bar/headers, both bases.
  - Dark-base themes express depth through surface steps (`bg.page` → `bg.surface` → `bg.card` → `bg.raised`), never shadows; AMOLED-class themes express it through dividers alone.
- **Touch target:** minimum 44×44 pt everywhere (hit-slop where visuals are smaller).

Spacing/radius/elevation live in the shared theme base, per-theme overridable (same mechanism as §4).

## 6. Contrast & accessibility requirements

Every **registered theme** must pass this matrix (unit-tested per theme, [THEME_GUIDE.md](THEME_GUIDE.md) §7 — a theme that fails cannot register):

- `text.primary` ≥ 4.5:1 on `bg.page`, `bg.surface`, `bg.surfaceVariant`, `bg.card`, `bg.raised`, `bg.sheet`, `bg.input`, and every `*.bg` tint it sits on.
- `text.secondary` ≥ 4.5:1 on the same surfaces; `text.tertiary`/`text.placeholder` ≥ 3:1 (never used for essential information).
- `onPrimary` on `primary` ≥ 4.5:1; `onPremium` on `premium` ≥ 4.5:1.
- Large text (≥ 19 pt bold) and meaningful icons ≥ 3:1 on their surface.
- Known sub-3:1 exceptions (`status.dueSoon`, `accent`, chart slots 2–3 on light) are permitted **only** with the pairing rules in §2–§3 (icon + label, direct labels).
- **No color-only communication** ([UI_UX_GUIDELINES.md](UI_UX_GUIDELINES.md) §1.2): status, health, and notification meaning is always triple-encoded (color + icon + text) — this is also the color-vision-deficiency mitigation.
- Sunlight readability: rely on contrast + size, not thin grays ([UI_UX_GUIDELINES.md](UI_UX_GUIDELINES.md) §7); visual hierarchy must survive both bright outdoor light and dark rooms.

## 7. Token delivery

Each theme is a complete typed token object in its own file (`src/theme/themes/<id>.ts`), assembled from a shared base (non-color groups) plus the theme's color sets, and registered in the theme registry — architecture, contract, and the adding-a-theme recipe: [THEME_GUIDE.md](THEME_GUIDE.md). Charts read `chart.*` from the same object. Icon sizing rules: [ICON_GUIDE.md](ICON_GUIDE.md). Motion token values: [ANIMATION_GUIDE.md](ANIMATION_GUIDE.md) §2 (carried in the theme object, per-theme overridable). Keep all values serializable (plain values, no functions) for the Phase-3 JSON export.

## 8. Evolution

- **MVP:** `light` + `dark` themes above.
- **Phase 2:** branding pass re-values tokens (names stable, A-17); candidate new themes — AMOLED black, brand color packs (blue/green/orange/red), high contrast, seasonal — each ships as one token file + registry entry with its §6 matrix passing and chart palette re-validated; zero component changes ([THEME_GUIDE.md](THEME_GUIDE.md) §5).
- **Phase 3+:** web dashboard consumes the same token JSON (export script) — keep tokens platform-neutral (no RN-specific units in values).
