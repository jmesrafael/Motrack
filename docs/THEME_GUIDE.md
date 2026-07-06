# THEME_GUIDE.md — Theme Engine

> **Owns:** the theme engine — how tokens ([DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)) become working, switchable, unlimited theming in code: contract, registry, provider, persistence, switching behavior, and the adding-a-theme process. **Does not own:** token names/values ([DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)), motion values ([ANIMATION_GUIDE.md](ANIMATION_GUIDE.md)), component specs ([COMPONENT_LIBRARY.md](COMPONENT_LIBRARY.md)). Decision record: ADR-028.

## 1. Requirements

- Every screen supports every registered theme; dark mode is constitutional ([DEVELOPMENT_RULES.md](DEVELOPMENT_RULES.md) rule 5). MVP registers `light` and `dark`.
- Theme preference: `system` (default) / `light` / `dark`, persisted in `app_settings` key `theme` ([STATE_MANAGEMENT.md](STATE_MANAGEMENT.md) §5), applied instantly — no app restart, no data loss, no navigation reset.
- `system` follows the OS appearance live (change in OS settings re-themes a foregrounded app immediately).
- **Unlimited future themes** (AMOLED black, blue/green/orange/red packs, high contrast, seasonal) must require exactly: one new token file + one registry entry. Zero component edits — a theme addition that touches a component reveals a defect in that component, not a limitation of the engine.
- No component ever references a raw color or branches on theme identity.

## 2. Architecture

```
src/theme/
  types.ts           // ThemeTokens contract + ThemeDefinition { id, base: 'light' | 'dark', tokens }
  registry.ts        // THEMES: Record<ThemeId, ThemeDefinition> — the ONLY place themes are registered
  themes/
    base.ts          // shared non-color groups (type/space/radius/elevation/motion/icon) — spread + override per theme
    light.ts         // complete ThemeTokens for light
    dark.ts          // complete ThemeTokens for dark
  ThemeProvider.tsx  // context: { tokens, themeId, base, preference, setPreference }
  useTheme.ts        // the one consumption hook
  styles.ts          // makeStyles((t) => ...) factory, memoized per themeId
```

- **Contract:** `ThemeTokens` is one exhaustive type covering every group in [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) §1–§5 (+ `motion`, `icon`). A theme file must satisfy it completely — a missing token is a compile error, so a new theme cannot ship half-finished. Non-color groups come from `themes/base.ts` by spread and are per-theme overridable (a high-contrast theme can thicken hairlines or raise type weights without special-casing anywhere).
- **`ThemeDefinition.base`** declares the theme's light-or-dark family. Only the engine reads it: StatusBar style (`light-content` on dark bases), `keyboardAppearance`, native dialog/date-picker appearance, the mode-aware image-variant helper (rule 4 below), and which built-in the `system` preference maps to. Feature code never reads `base` or `themeId`.
- **Resolution:** preference `system` → `Appearance.getColorScheme()` → the `light`/`dark` built-ins (live listener); any other preference value is a `ThemeId` looked up in the registry (unknown/retired id falls back to `system` — never crash on a stale setting).
- **Persistence & startup:** preference lives in the settings store mirrored to SQLite `app_settings` ([STATE_MANAGEMENT.md](STATE_MANAGEMENT.md) §5), hydrated in the startup sequence **before first render** ([DATA_FLOW.md](DATA_FLOW.md) §1) — so there is no wrong-theme flash; the splash screen stays mode-neutral.
- **`makeStyles` pattern:** `const useStyles = makeStyles((t) => StyleSheet.create({ card: { backgroundColor: t.bg.card } }))` — memoized per `themeId` so style objects are referentially stable across renders ([PERFORMANCE.md](PERFORMANCE.md) §4).
- **Navigation theming:** tokens map to the React Navigation theme object (`bg.page`, `bg.nav`, `text.primary`, `border.divider`, `primary`) so headers/tab bar re-theme automatically with everything else.
- **Charts, icons, elevation** read their token groups from the same object — never a parallel theme.

## 3. Rules

1. **No raw values in components** — lint-enforced (no hex/rgb literals outside `src/theme/`, [CODE_STYLE.md](CODE_STYLE.md) §7).
2. **No theme conditionals in feature code** — neither `base === 'dark'` nor `themeId === '…'`. If a component needs a theme-specific value, add or re-value a semantic token.
3. **Any-theme robustness:** components never assume a surface value (pure-black AMOLED must work); separation on dark bases comes from `border.divider` and surface-step tokens, never hardcoded shadows ([DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) §5).
4. **Images/illustrations:** provide per-base variants or base-neutral art, selected by a single image-variant helper keyed on `theme.base`; bike photos render unchanged with a `border.divider` ring in all themes.
5. **New tokens:** update [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) first (single source), then the `ThemeTokens` type, then every registered theme file — the compiler enforces the sweep.
6. **Charts** read `chart.*` tokens; new themes re-validate their chart palette ([DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) §3).

## 4. Switching behavior & transition

- `setPreference` persists the setting and swaps the context value — a pure re-render. The provider must never key or remount the tree on theme change, so navigation state, scroll positions, and in-progress form data survive **by construction** (guarded by a test, §7).
- **Transition:** a root-level, pointer-events-none overlay filled with the outgoing theme's `bg.page` fades from 1 → 0 over `motion.base` while the new tokens render beneath — a smooth cross-dissolve with no flash, opacity-only on the native driver ([ANIMATION_GUIDE.md](ANIMATION_GUIDE.md) §3). StatusBar style switches animated. Reduced motion → instant swap ([ANIMATION_GUIDE.md](ANIMATION_GUIDE.md) §5).
- Switching is safe at any moment, including mid-form and while sheets are open; OS-driven switches (system preference) behave identically.

## 5. Adding a theme (the complete process — nothing else may be required)

1. Create `src/theme/themes/<id>.ts`: spread the nearest base theme, override tokens; the `ThemeTokens` contract forces completeness.
2. Add the theme's value table to [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) (values live there) and verify the §6 contrast matrix + chart palette validation.
3. Register it in `registry.ts` (`id`, `base`, tokens).
4. Add the picker label i18n key ([LOCALIZATION.md](LOCALIZATION.md)).

The theme setting (S-30 Settings, [SCREEN_SPECIFICATIONS.md](SCREEN_SPECIFICATIONS.md)) renders its theme list **from the registry**; token snapshots, contrast tests, and multi-theme component tests iterate the registry (§7) — so a new theme is automatically listed and tested. Planned examples this must cover without component work: **AMOLED black** (`base: 'dark'`, overrides `bg.*` to `#000`/near-black — rule 3 makes this safe), **color packs** (re-valued `primary`/`accent` families), **high contrast** (stronger inks + overridden base groups), **seasonal** (value-only reskins).

## 6. Accessibility across themes

Every registered theme passes the [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) §6 matrix (WCAG AA) — enforced by a per-theme unit test, not by review memory. Meaning is never color-only in any theme ([UI_UX_GUIDELINES.md](UI_UX_GUIDELINES.md) §1.2); the switch transition honors reduced motion; sunlight readability and visual hierarchy are acceptance-gated per theme ([ACCEPTANCE_CRITERIA.md](ACCEPTANCE_CRITERIA.md) §2).

## 7. Testing

- **Registry-driven:** token snapshot per registered theme (catches accidental edits); contrast-matrix unit test per registered theme (fails the build on an AA violation).
- Component tests render in every registered theme via the test wrapper ([TESTING.md](TESTING.md) §5).
- **Switch test:** live theme switch preserves navigation state, scroll position, and entered form data; no remount (assert stable component identity).
- Manual QA: all-screens pass per registered theme ([ACCEPTANCE_CRITERIA.md](ACCEPTANCE_CRITERIA.md) §2); PRs with UI changes include screenshots in both MVP themes ([CONTRIBUTING.md](CONTRIBUTING.md) §3).

## 8. Evolution

- **MVP:** `light` + `dark` registered; preference system/light/dark.
- **Phase 2:** branding pass re-values tokens only; new themes per §5 (AMOLED, color packs, high contrast, seasonal). Whether theme packs are Pro-gated is a **product** decision ([PREMIUM_SYSTEM.md](PREMIUM_SYSTEM.md), via [DECISION_LOG.md](DECISION_LOG.md)) — the engine is indifferent. Optional per-bike accent is likewise a product decision, not a theming hack.
- **Phase 3/long-term:** the registry serializes to token JSON feeding the web dashboard — keep theme files plain-value ([DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) §7).
