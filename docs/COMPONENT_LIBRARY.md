# COMPONENT_LIBRARY.md — Reusable UI Components

> **Owns:** the shared component inventory — purpose, props, variants, behavior. **Does not own:** tokens ([DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)), where components appear ([SCREEN_SPECIFICATIONS.md](SCREEN_SPECIFICATIONS.md)). Components live in `src/components/` ([FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md)); they are presentation-only — **no business logic, no repository/service imports** ([SOFTWARE_ARCHITECTURE.md](SOFTWARE_ARCHITECTURE.md) §6). Every component: theme-token styling, every registered theme (MVP: light + dark — [THEME_GUIDE.md](THEME_GUIDE.md) §7), a11y label support, and a component test ([TESTING.md](TESTING.md) §5). No component references a raw color or branches on theme identity ([THEME_GUIDE.md](THEME_GUIDE.md) §3).

Naming: PascalCase, prop types exported as `<Name>Props`. Variants via a `variant` prop, never boolean explosions.

## Inputs

| Component | Props (key) | Behavior |
|---|---|---|
| `FormField` | `label, error, hint, required, children` | Label-above wrapper; error text + `feedback.error` border; announces error to screen readers |
| `TextField` | `value, onChangeText, maxLength, keyboardType, …TextInput` | Styled input; counter when `maxLength`; clears via trailing icon |
| `OdoInput` | `value, onChange, lastReading?, projected?` | Odometer entry: tabular numerals, big keypad on focus, "last: 21,340 km" caption, accepts 0–999,999 int |
| `MoneyInput` | `valueCentavos, onChange` | ₱ prefix, 2-decimal mask, stores centavos int ([PRODUCT_DECISIONS.md](PRODUCT_DECISIONS.md) §4) |
| `DateField` | `value, onChange, min?, max?` | Opens native date picker; displays localized date |
| `PickerField` | `options, value, onChange, searchable?` | Bottom-sheet single-select (brand, station, category…) |
| `SegmentedControl` | `segments, value, onChange` | 2–4 options (drivetrain, service type, Money tabs); radio-group semantics |
| `Stepper` | `value, onChange, step, min, max` | Interval editors (S-13) |
| `Toggle` | `value, onChange, label` | Settings switches |
| `PhotoPicker` | `uri?, onPick(source), onRemove` | Camera/library sheet; thumbnail preview; compression per [PERFORMANCE.md](PERFORMANCE.md) §6 |

## Display

| Component | Props | Behavior |
|---|---|---|
| `HealthRing` | `score (0–100 \| null), band, size` | Animated ring + `type.display` number; null → "—" + setup CTA slot; a11y "Health score {n}, {band}" ([HEALTH_SCORE.md](HEALTH_SCORE.md) §6 bands/colors) |
| `HealthChip` | `score \| null` | Compact pill for cards (S-01) |
| `StatusPill` | `status: excellent\|good\|dueSoon\|overdue\|critical\|neutral, label, icon` | Triple-encoded status ([UI_UX_GUIDELINES.md](UI_UX_GUIDELINES.md) §1.2); due statuses use the middle four ([BUSINESS_RULES.md](BUSINESS_RULES.md) §4) |
| `ScheduleRow` | `schedule, status, remainingText, onPress, onLog` | List row: component icon, name, `StatusPill`, remaining km/days; swipe → Log |
| `TimelineItem` | `entry (maintenance\|repair), onPress` | History row; repairs visually distinct (icon + border accent) |
| `BikeCard` | `bike, healthScore, active, onPress` | Garage card (photo, nickname, plate, odo, `HealthChip`) |
| `StatCard` | `label, value, caption?, onPress?` | Dashboard/statistics tiles; tabular numerals |
| `DocumentCard` | `doc, expiryState, onPress` | Thumbnail, title, expiry badge (countdown/expired) |
| `CategoryIcon` | `category, size` | Expense category glyph + fixed chart-slot color where charted ([DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) §3) |
| `MonthBarChart` | `series (by category), months, mode` | 6/12-month stacked bars using `chart.*` tokens; 2 px surface gaps between segments; y-axis hairlines; value list beside/below chart carries labels (relief rule); a11y: data table alternative via accessible summary |
| `EmptyState` | `illustration, title, body, cta` | Per-screen empty pattern |
| `ErrorState` | `message, onRetry, onReport?` | Non-crash error surface ([ERROR_HANDLING.md](ERROR_HANDLING.md) §6) |
| `SkeletonBlock` | `shape` | Loading placeholder |

## Containers & chrome

| Component | Props | Behavior |
|---|---|---|
| `Screen` | `title?, headerRight?, scroll?, children` | Safe-area, header, keyboard handling defaults |
| `Card` | `onPress?, children` | Surface + radius.md + hairline ring |
| `ListSection` | `header?, footer?, children` | Grouped list block |
| `SheetContainer` | `snapPoints?, onClose, children` | Bottom sheet base (Quick Log, pickers), built on `@gorhom/bottom-sheet` (ADR-027); focus trap; drag + backdrop dismiss |
| `AppHeader` | `bikeChip?, bellBadge?` | Home header: bike switcher chip + reminders bell (S-04) |
| `TabBar` | — | 5 tabs, raised center Log button ([SCREEN_SPECIFICATIONS.md](SCREEN_SPECIFICATIONS.md) §0) |
| `PrimaryButton` / `SecondaryButton` / `DestructiveButton` | `label, onPress, loading?, disabled?` | Single primary per screen rule; loading spinner replaces label |
| `ConfirmDialog` | `title, body, confirmLabel, typedConfirmation?` | Destructive confirms; `typedConfirmation` = user must type given string (delete bike/all data, restore) |
| `Snackbar` (service) | `show(message, { undo? })` | Global queue, 5 s, undo action; announced to screen readers |
| `NudgeCard` | `icon, title, body, cta, onDismiss` | Dashboard setup/permission nudges (dismiss persisted) |

## Composition rules

1. New shared component only after the pattern appears **twice**; single-use compositions stay in their feature folder ([FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md) §3).
2. Components receive data via props — they never fetch. Hooks feed screens; screens feed components ([DATA_FLOW.md](DATA_FLOW.md) §3).
3. Icons only via `Icon` wrapper ([ICON_GUIDE.md](ICON_GUIDE.md) §3); motion via tokens ([ANIMATION_GUIDE.md](ANIMATION_GUIDE.md)).
4. Charts: before building or changing any chart component, follow the project chart standards in [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) §3 (palette validated; entity-stable slots; no dual axes; values in ink, not series color).

## Evolution

**MVP:** inventory above. **Phase 2:** scanner/AI surfaces add `CameraSheet`, `SuggestionList`; QR adds `QrCard` — same rules. **Phase 3:** fleet tables introduce a `DataTable` with virtualization. **Long-term:** extract the primitive layer (buttons/fields/cards) into a shared package for the web dashboard.
