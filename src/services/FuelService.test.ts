import type { FuelLogRow } from '@/db/schema';
import { averageKmPerLiter, computeSpans } from './FuelService';

function makeFill(overrides: Partial<FuelLogRow>): FuelLogRow {
  return {
    id: overrides.id ?? 'fill-1',
    createdAt: 0,
    updatedAt: 0,
    deletedAt: null,
    motorcycleId: 'bike-1',
    fuelDate: '2026-01-01',
    liters: 4,
    totalCostCentavos: 20000,
    odometerKm: 1000,
    station: null,
    isFullTank: 1,
    notes: null,
    ...overrides,
  };
}

describe('computeSpans — BUSINESS_RULES.md §7.2', () => {
  test('simple full-to-full span', () => {
    const fills = [
      makeFill({ id: 'a', odometerKm: 1000, liters: 4, fuelDate: '2026-01-01' }),
      makeFill({ id: 'b', odometerKm: 1200, liters: 5, fuelDate: '2026-01-10' }),
    ];
    const spans = computeSpans(fills);
    expect(spans).toHaveLength(1);
    expect(spans[0]?.km).toBe(200);
    expect(spans[0]?.liters).toBe(5);
    expect(spans[0]?.kmPerLiter).toBeCloseTo(40, 5);
  });

  test('partial fills between full tanks sum into the span', () => {
    const fills = [
      makeFill({ id: 'a', odometerKm: 1000, liters: 4, fuelDate: '2026-01-01', isFullTank: 1 }),
      makeFill({ id: 'mid', odometerKm: 1100, liters: 2, fuelDate: '2026-01-05', isFullTank: 0 }),
      makeFill({ id: 'b', odometerKm: 1200, liters: 3, fuelDate: '2026-01-10', isFullTank: 1 }),
    ];
    const spans = computeSpans(fills);
    expect(spans).toHaveLength(1);
    expect(spans[0]?.liters).toBe(5); // mid (2) + closing (3)
    expect(spans[0]?.km).toBe(200);
  });

  test('implausible span (> 2000 km) excluded (A-07)', () => {
    const fills = [
      makeFill({ id: 'a', odometerKm: 1000, fuelDate: '2026-01-01' }),
      makeFill({ id: 'b', odometerKm: 5000, fuelDate: '2026-01-10' }),
    ];
    expect(computeSpans(fills)).toHaveLength(0);
  });

  test('non-positive span excluded', () => {
    const fills = [
      makeFill({ id: 'a', odometerKm: 1000, fuelDate: '2026-01-01' }),
      makeFill({ id: 'b', odometerKm: 1000, fuelDate: '2026-01-10' }),
    ];
    expect(computeSpans(fills)).toHaveLength(0);
  });
});

describe('averageKmPerLiter — mean of last 5 valid spans (§7.3)', () => {
  test('averages only the trailing 5', () => {
    const spans = [10, 20, 30, 40, 50, 60].map((kmPerLiter, i) => ({
      fillId: `f${i}`,
      km: 100,
      liters: 100 / kmPerLiter,
      kmPerLiter,
    }));
    // last 5: 20,30,40,50,60 → mean 40
    expect(averageKmPerLiter(spans)).toBeCloseTo(40, 5);
  });

  test('no spans → null', () => {
    expect(averageKmPerLiter([])).toBeNull();
  });
});
