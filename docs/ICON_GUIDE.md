# ICON_GUIDE.md — Iconography

> **Owns:** icon set choice, usage rules, and the canonical icon mapping. **Does not own:** colors ([DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)), component APIs ([COMPONENT_LIBRARY.md](COMPONENT_LIBRARY.md)).

## 1. Icon set

**Single set: Material Community Icons via `@expo/vector-icons`** (already bundled with Expo — zero added install size, huge coverage including motorcycle-domain glyphs; ADR-011 in [ARCHITECTURE_DECISIONS.md](ARCHITECTURE_DECISIONS.md)). Never mix sets; never ship one-off SVGs for concepts the set covers. Custom SVGs (react-native-svg) are allowed only for brand/illustration assets (empty states, onboarding art, Health ring).

## 2. Sizing & color

- Sizes: 16 (inline), 20 (list leading), 24 (default/tab), 32 (feature headers). Match text optical size when inline.
- Color: `icon.primary` default, `icon.secondary` for supporting/decorative glyphs ([DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) §1.2); `primary` when active/interactive; status icons use `status.*` **with** label ([UI_UX_GUIDELINES.md](UI_UX_GUIDELINES.md) §1.2). Never raw hex.
- Tab bar: outline variant idle, filled variant active.

## 3. Usage

All icons through the `Icon` wrapper component (`name` from a typed union — compile-time safety against typos; central mapping file `src/components/Icon.tsx`). Decorative icons set `accessibilityElementsHidden`; meaningful icons carry labels.

## 4. Canonical mapping (stable — extend, don't rename)

| Concept | Glyph (MCI name) |
|---|---|
| Motorcycle/bike | `motorbike` |
| Engine oil / gear oil | `oil` |
| Oil filter / air filter | `air-filter` |
| Spark plug | `flash` |
| Coolant | `coolant-temperature` |
| Brakes (pads/fluid) | `car-brake-alert` |
| Tires | `tire` |
| Battery | `car-battery` |
| CVT (all CVT components) | `cog-sync` |
| Chain / sprockets | `link-variant` |
| Custom component | `wrench-cog` |
| Maintenance/log | `wrench` |
| Repair | `hammer-wrench` |
| Fuel | `gas-station` |
| Expense/money | `cash` |
| Odometer | `speedometer` |
| Documents | `file-document-multiple` |
| Reminder/bell | `bell` |
| Health/heart of bike | `heart-pulse` |
| Statistics | `chart-bar` |
| Backup | `cloud-upload-outline` (MVP file backup still uses this glyph) |
| Export | `export-variant` |
| Pro/premium | `crown` |
| Settings | `cog` |
| Garage | `garage` |
| Categories (expenses) | fuel `gas-station` · oil `oil` · tires `tire` · service `wrench` · repair `hammer-wrench` · registration `card-account-details` · insurance `shield-check` · parking `parking` · accessories `puzzle` · washing `car-wash` · other `dots-horizontal` |

## 5. Evolution

**MVP:** set above. **Phase 2:** scanner/AI icons from the same set; branding pass may introduce a custom icon font — only via a wrapper-compatible swap. **Phase 3+:** shared icon mapping JSON reused by web.
