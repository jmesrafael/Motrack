# HEALTH_SCORE.md — Exact Calculation Specification

> The single authoritative definition of the Health Score (R-14). Inputs come from due ratios defined in [BUSINESS_RULES.md](BUSINESS_RULES.md) §4. Implemented in `HealthScoreService` ([SOFTWARE_ARCHITECTURE.md](SOFTWARE_ARCHITECTURE.md) §4) as a pure function; test vectors below are mandatory unit tests ([TESTING.md](TESTING.md) §4). Display surfaces: [FEATURE_SPECIFICATIONS.md](FEATURE_SPECIFICATIONS.md) §14.

## 1. Intent

One number, 0–100, answering "how is my bike?" for a non-technical rider. It must be:
- **Explainable** — the score sheet lists every contributing item (no black box).
- **Actionable** — it only moves when maintenance state moves; logging overdue work visibly improves it.
- **Honest** — unknown ≠ healthy: un-anchored items are excluded and surfaced as "setup incomplete", never assumed OK.

## 2. Inputs

All schedules of the bike that are **enabled** and **anchored** ([BUSINESS_RULES.md](BUSINESS_RULES.md) §4). For each, its due ratio `r`. Registration/insurance are excluded ([BUSINESS_RULES.md](BUSINESS_RULES.md) §8.3). Archived bikes are not scored.

## 3. Item score

```
s(r) = 100                          if r ≤ 0.80        (comfortably within interval)
s(r) = 100 − 150 × (r − 0.80)       if 0.80 < r ≤ 1.00 (approaching due: 100 → 70)
s(r) = max(0, 70 − 70 × (r − 1.00)) if r > 1.00        (overdue: 70 → 0, floor at r = 2.00)
```

Continuous, monotonically non-increasing; an item twice past its interval contributes zero.

## 4. Component weights

| Weight | Components | Rationale |
|---|---|---|
| **3** | `engine_oil`, `brake_pads_front`, `brake_pads_rear`, `brake_fluid`, `tire_front`, `tire_rear` | Rider safety / engine survival |
| **2** | `gear_oil`, `oil_filter`, `coolant`, `cvt_belt`, `cvt_rollers`, `cvt_slider`, `chain_lube`, `chain_replacement`, `sprockets` | Drivetrain reliability; failure strands or costs heavily |
| **1** | `air_filter_clean`, `air_filter_replace`, `spark_plug`, `battery`, `cvt_cleaning`, `clutch_cleaning`, `custom` | Routine upkeep |

Weights are seed config alongside intervals ([BUSINESS_RULES.md](BUSINESS_RULES.md) §1); values are assumption A-05.

## 5. Bike score

```
score = round( Σ (wᵢ × s(rᵢ)) / Σ wᵢ )        over all enabled, anchored schedules
```

Rounding: half away from zero. Edge cases:
- **No enabled anchored schedules:** score is undisplayable → UI shows "—" + "Finish setup" (S-04).
- **Partial setup:** if anchored < 60% of enabled schedules, show the score with a "partial" indicator and setup nudge. (The 60% threshold is A-06.)
- **Any record for a schedule re-anchors it** regardless of service type (a cleaning resets the cleaning schedule; a `clean` on `spark_plug` also re-anchors — the user asserted work was done).

## 6. Bands

Five display bands (D-018 — display-only refinement; the formula in §3–§5 is unchanged):

| Score | Band (en) | Color token ([DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) §2.2) |
|---|---|---|
| 90–100 | Excellent | `health.excellent` |
| 75–89 | Good | `health.good` |
| 50–74 | Needs attention | `health.fair` |
| 25–49 | Poor | `health.poor` |
| 0–24 | Critical | `health.critical` |

Band labels are i18n keys (`healthScore.band.*`, [LOCALIZATION.md](LOCALIZATION.md)); the label always accompanies the color (never color-alone, [UI_UX_GUIDELINES.md](UI_UX_GUIDELINES.md) §1.2).

## 7. Worked examples (mandatory test vectors)

### Example A — well-kept scooter (today = 2026-07-06, effective odo 21,480)

| Schedule | w | interval km / days | anchor odo / date | km_used | days_used | r | s |
|---|---|---|---|---|---|---|---|
| engine_oil | 3 | 1,500 / 91 | 20,400 / 2026-05-30 | 1,080 | 37 | **0.720** | 100 |
| cvt_cleaning | 1 | 4,000 / 183 | 18,200 / 2026-03-15 | 3,280 | 113 | **0.820** | 97.0 |
| brake_pads_front | 3 | 12,000 / 731 | 12,000 / 2025-08-10 | 9,480 | 330 | **0.790** | 100 |
| tire_rear | 3 | 15,000 / 1,826 | 8,000 / 2025-01-20 | 13,480 | 532 | **0.8987** | 85.2 |
| battery | 1 | — / 731 | — / 2024-11-02 | — | 611 | **0.836** | 94.6 |

`Σw = 11`; `Σw·s = 3·100 + 1·97.0 + 3·100 + 3·85.2 + 1·94.6 = 1,047.2` → `score = round(95.2) = **95** → Excellent`. (Other schedules un-anchored → excluded; anchored 5 of, say, 14 enabled → "partial" indicator shows.)

### Example B — neglected chain bike

| Schedule | w | r | s |
|---|---|---|---|
| engine_oil | 3 | 1.50 | 35.0 |
| chain_lube | 2 | 2.30 | 0 |
| tire_front | 3 | 0.50 | 100 |
| brake_pads_rear | 3 | 1.05 | 66.5 |

`Σw = 11`; `Σw·s = 105 + 0 + 300 + 199.5 = 604.5` → `score = round(54.95) = **55** → Needs attention`.

### Example C — boundary checks (unit tests)

| r | s(r) | Assert |
|---|---|---|
| 0.80 | 100 | boundary belongs to top branch |
| 0.90 | 85 | mid-ramp |
| 1.00 | 70 | due-today |
| 1.50 | 35 | half-interval overdue |
| 2.00 | 0 | floor reached |
| 3.00 | 0 | clamped |

## 8. Recomputation & performance

Recomputed synchronously (pure function over in-memory schedule statuses) whenever the recalculation cascade runs ([DATA_FLOW.md](DATA_FLOW.md) §4): maintenance/fuel/repair/odometer/schedule/baseline changes, bike switch, and app foreground (date may have advanced). Never persisted — always derived (single source of truth is the underlying data). Cost is trivial (≤ 22 items); no caching needed beyond the Zustand view state ([STATE_MANAGEMENT.md](STATE_MANAGEMENT.md) §5).

## 9. Evolution

- **MVP:** formula above.
- **Phase 2:** wear-informed items — tread/pads % ([BUSINESS_RULES.md](BUSINESS_RULES.md) §5) and parts-life prediction (R-38) may *lower* an item's s below its interval-based value (never raise it). Weights per model from the model DB (R-33). Any formula change bumps a `healthScoreVersion` noted in the score explanation sheet. **Historical comparability:** because the score is never persisted (ADR-019), MVP has no cross-version comparability problem; if score *history/trends* ever ship, snapshots must be stored as `(score, healthScoreVersion, computed_at)` so mixed-version histories render honestly.
- **Phase 3:** fleet roll-ups (min/mean per fleet) on synced data — server-side implementation must match this spec exactly (shared test vectors).
- **Long-term:** insurer/resale-facing verified score — requires audit trail (synced records + workshop verification, R-50).
