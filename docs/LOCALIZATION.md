# LOCALIZATION.md — Languages, Formats, i18n Architecture

> **Owns:** localization strategy, formatting rules, i18n mechanics, translation workflow. Referenced by every UI doc; copy tone rules live in [UI_UX_GUIDELINES.md](UI_UX_GUIDELINES.md) §6.

## 1. Scope

- **MVP languages:** English (`en`, fallback) + Filipino (`fil`).
- **Region defaults:** currency ₱ (PHP), distances km, dates PH-style, first day of week Monday.
- Every user-visible string is localizable — including notification copy ([NOTIFICATION_ENGINE.md](NOTIFICATION_ENGINE.md) §8), PDF export headings ([EXPORT_IMPORT.md](EXPORT_IMPORT.md)), and component display names ([BUSINESS_RULES.md](BUSINESS_RULES.md) §2).

## 2. Stack

`i18next` + `react-i18next` + `expo-localization` (justification: [DEPENDENCY_GUIDE.md](DEPENDENCY_GUIDE.md); decision ADR-012). Language preference: `system` (default, resolved via `expo-localization`) or explicit `en`/`fil`, persisted in `app_settings` (key `language`), applied live without restart.

## 3. Mechanics & rules

- Resources: `src/i18n/en.json`, `src/i18n/fil.json` — flat-ish namespaced keys (`dashboard.nextMaintenance.title`, `component.engine_oil.name`, `notification.overdue.body`). Keys named by *meaning*, not by English text.
- **Rule: no user-visible string literals in components** — lint-enforced (`i18next/no-literal-string`, [CODE_STYLE.md](CODE_STYLE.md) §7). Non-UI strings (log messages, error codes) are exempt and stay English ([LOGGING_GUIDE.md](LOGGING_GUIDE.md)).
- Interpolation via i18next variables; **no string concatenation** of sentence fragments (breaks grammar across languages).
- Plurals via i18next plural forms (`_one`/`_other`); `fil` plural rules configured explicitly.
- Dates/relative times: `Intl` via `date-fns` + locale packs — "Jul 6, 2026", "2 weeks ago". Notification `{relative_day}` values localized.
- Missing-key policy: fallback to `en` + dev-mode warning; CI check compares key sets between locales ([TESTING.md](TESTING.md) §8).

## 4. Component & domain names

`component_type` display names come from i18n keys `component.<type>.name` — never from the DB. The DB stores enum values only ([BUSINESS_RULES.md](BUSINESS_RULES.md) §2). Same pattern for expense categories (`category.<value>.name`), document types, health bands, status labels.

## 5. Formatting (canonical)

| Item | Format | Example |
|---|---|---|
| Money | `₱` + thousands separators + 2 decimals; centavos→display in one shared `formatMoney()` | ₱1,250.00 |
| Odometer/km | thousands separators + " km" | 21,480 km |
| Fuel volume | up to 2 decimals + " L" | 4.35 L |
| Consumption | 1 decimal " km/L" | 42.3 km/L |
| Dates | `MMM d, yyyy` (en) / localized (fil) | Jul 6, 2026 |
| Percent | integer + "%" | 80% |

Formatters live in `src/lib/format.ts` — the only place formatting logic exists (no inline `toFixed` in components; [CODE_STYLE.md](CODE_STYLE.md) §6).

## 6. Filipino translation guidance

- Natural Taglish over stilted formal Filipino where riders actually speak Taglish ("Palitan ang oil" is fine; "Palitan ang langis ng makina" where it reads naturally). Tone: helpful kuya/ate, not government-form Filipino.
- Domain terms riders use in English stay English inside `fil` strings: *oil change, brake pads, CVT, registration (or "rehistro")*.
- Translations reviewed by a native speaker before release ([RELEASE_PROCESS.md](RELEASE_PROCESS.md) §3 checklist).

## 7. Evolution

- **MVP:** en + fil, PHP/km fixed; all region specifics (currency symbol, registration hint rules) already isolated in `src/config/` + i18n — no hard-coded ₱ outside `format.ts`.
- **Phase 2:** model DB content localized server-side; sync metadata locale-independent.
- **Phase 3:** community content is user-generated (not translated).
- **Long-term (regional expansion, [FUTURE_ROADMAP.md](FUTURE_ROADMAP.md)):** add locale packs (vi, id, th), currency setting, and per-country config modules (registration rules, station lists, brand lists). The acceptance test for today's architecture: adding a country must touch only `src/config/` + `src/i18n/` + store metadata.
