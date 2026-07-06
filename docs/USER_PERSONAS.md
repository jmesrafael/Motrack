# USER_PERSONAS.md — Design Personas

> Four concrete personas used in every design and scope discussion. Each feature/screen decision should name which persona it serves. Positioning context: [PRODUCT_VISION.md](PRODUCT_VISION.md).

## P1 — "Jomar" · Delivery rider (primary persona)

- **Profile:** 26, Metro Manila. Rides a Honda Click 125i (CVT) ~110 km/day, 6 days/week for food delivery. Phone: 3-year-old mid/low-range Android, patchy data plan, storage nearly full.
- **Reality:** The bike earns his income. Oil changes come due every ~2 weeks at his mileage. He services at a neighborhood *talyer* and pays cash; receipts are crumpled or nonexistent.
- **Needs:** Log an oil change in seconds while straddling the bike outside the shop. Know cost-per-km because the bike is a business. Reminders that account for his brutal mileage — a "every 3 months" reminder is useless to him; km-based projection matters.
- **Frustrations:** Apps with sign-up walls, forms with ten fields, anything that needs data signal.
- **Design consequences:** Quick Log fast path ([USER_FLOWS.md](USER_FLOWS.md) F-2), km-projection notifications ([NOTIFICATION_ENGINE.md](NOTIFICATION_ENGINE.md)), aggressive performance budget on low-end Android ([PERFORMANCE.md](PERFORMANCE.md)), offline everything.

## P2 — "Cess" · Daily commuter

- **Profile:** 31, Cebu. Yamaha NMAX (CVT), ~15 km/day commute. Not mechanical at all; her dealer told her "come back at 4,000 km" and she forgot.
- **Needs:** To be told, plainly: what's due, when, roughly what it should cost. One number that says her bike is fine. Reminders for LTO registration month and insurance expiry — she nearly got fined last year.
- **Frustrations:** Jargon ("variator"? "viscosity"?), stats walls, English-only apps (prefers Taglish).
- **Design consequences:** Health Score as the hero element ([HEALTH_SCORE.md](HEALTH_SCORE.md)), document-expiry reminders ([BUSINESS_RULES.md](BUSINESS_RULES.md) §8), Filipino localization ([LOCALIZATION.md](LOCALIZATION.md)), plain-language copy rules ([UI_UX_GUIDELINES.md](UI_UX_GUIDELINES.md) §6).

## P3 — "Marlon" · Small-business owner (multi-bike)

- **Profile:** 45, Bulacan. Runs a water-refilling station with 3 delivery bikes (two Honda Wave chain-drive underbones, one Click) ridden by employees. Tracks costs in a paper notebook today.
- **Needs:** Garage view of all bikes with per-bike health at a glance; who-cares-which-rider, he cares which *bike*. Monthly expense totals per bike and across the fleet. History he can show a buyer when he sells a bike.
- **Frustrations:** Riders don't report problems; he discovers worn brake pads at the worst time. Paper records are unconvincing at resale.
- **Design consequences:** Multi-bike garage with per-bike Health Score ([SCREEN_SPECIFICATIONS.md](SCREEN_SPECIFICATIONS.md) S-01), 2-bike free limit with Pro unlock for his 3rd ([PREMIUM_SYSTEM.md](PREMIUM_SYSTEM.md)), statistics per bike and aggregate ([FEATURE_SPECIFICATIONS.md](FEATURE_SPECIFICATIONS.md) §13), PDF service-history export ([EXPORT_IMPORT.md](EXPORT_IMPORT.md)). Phase 3 fleet features grow from his needs ([FUTURE_ROADMAP.md](FUTURE_ROADMAP.md)).

## P4 — "Dennis" · Careful owner / prosumer (secondary)

- **Profile:** 38, Davao. Suzuki Raider 150 (chain). Does his own chain lube and oil changes; keeps receipts; plans to sell the bike in two years and wants provable history.
- **Needs:** Slightly deeper records (oil brand/viscosity, part brands), tire/brake wear tracking, full export. He's the persona who notices data quality.
- **Frustrations:** Apps that dumb things down with no detail *option*; apps that trap his data.
- **Design consequences:** Progressive-disclosure detail fields on log forms ([SCREEN_SPECIFICATIONS.md](SCREEN_SPECIFICATIONS.md) S-10), CSV/PDF export free ([EXPORT_IMPORT.md](EXPORT_IMPORT.md)), backup archive ([BACKUP_RECOVERY.md](BACKUP_RECOVERY.md)). He is a likely Pro buyer for goodwill + future features — but never the persona we optimize defaults for.

## Anti-persona

**"Track-day Tom"** — enthusiast with a liter bike, wants suspension-clicker logs, lap times, dyno charts, mod lists. Serving him bloats every screen. Motrack politely does not target him ([PROJECT_MISSION.md](PROJECT_MISSION.md) §4).

## Persona priority rule

When personas conflict, priority is **P1 > P2 > P3 > P4**. A feature that helps P4 but adds friction for P1/P2 must be moved behind progressive disclosure or cut. This rule is binding in design reviews ([UI_UX_GUIDELINES.md](UI_UX_GUIDELINES.md) §1).
