/**
 * Statistics & aggregation — the single implementation of BUSINESS_RULES.md §9.
 * All aggregates computed in SQL via ExpenseRepository/OdometerRepository;
 * fuel averages via the pure FuelService math.
 */

import { rawDb } from '@/db/client';
import { ExpenseRepository } from '@/db/repositories/ExpenseRepository';
import { FuelRepository } from '@/db/repositories/FuelRepository';
import { OdometerRepository } from '@/db/repositories/OdometerRepository';
import { monthKey, shiftMonthKey, todayIso } from '@/lib/dates';
import { averageKmPerLiter, computeSpans, fuelCostPerKm } from './FuelService';

export interface BikeStatistics {
  kmTracked: number;
  maintenanceSpendCentavos: number;
  fuelSpendCentavos: number;
  repairSpendCentavos: number;
  standaloneSpendCentavos: number;
  overallSpendCentavos: number;
  oilChangeCount: number;
  serviceCount: number;
  /** Mean monthly union spend over trailing 12 months (§9.3); null with no data. */
  averageMonthlySpendCentavos: number | null;
  /** Union spend ÷ km, trailing 12 months (§9.4); null when insufficient data. */
  costPerKmCentavos: number | null;
  /** Mean of last 5 valid consumption spans (§7.3). */
  averageKmPerLiter: number | null;
  fuelCostPerKmCentavos: number | null;
}

function countScoped(sql: string, motorcycleId?: string): number {
  const params: string[] = motorcycleId !== undefined ? [motorcycleId] : [];
  return rawDb.getFirstSync<{ n: number }>(sql, params)?.n ?? 0;
}

/**
 * Full statistics for one bike, or across all non-archived bikes when
 * `motorcycleId` is undefined (§9.5 — archived excluded from aggregates).
 */
export function computeStatistics(motorcycleId?: string): BikeStatistics {
  const today = todayIso();
  const bikeFilter =
    motorcycleId !== undefined
      ? ''
      : `AND motorcycle_id IN (SELECT id FROM motorcycles WHERE deleted_at IS NULL AND is_archived = 0)`;

  // km tracked = effective max − min per bike, summed (§9.2).
  const kmTracked =
    motorcycleId !== undefined
      ? OdometerRepository.maxEffective(motorcycleId) - OdometerRepository.minEffective(motorcycleId)
      : (rawDb.getFirstSync<{ km: number }>(
          `SELECT COALESCE(SUM(span), 0) AS km FROM (
             SELECT MAX(effective_km) - MIN(effective_km) AS span FROM odometer_logs
              WHERE deleted_at IS NULL ${bikeFilter} GROUP BY motorcycle_id)`,
        )?.km ?? 0);

  const sourceTotals = ExpenseRepository.sourceTotals(motorcycleId);

  const oilChangeCount = countScoped(
    `SELECT COUNT(*) AS n FROM maintenance_records r
      JOIN maintenance_schedules s ON s.id = r.schedule_id
     WHERE r.deleted_at IS NULL AND s.component_type = 'engine_oil' AND r.service_type = 'replace'
       ${motorcycleId !== undefined ? 'AND r.motorcycle_id = ?' : `AND r.motorcycle_id IN (SELECT id FROM motorcycles WHERE deleted_at IS NULL AND is_archived = 0)`}`,
    motorcycleId,
  );

  const serviceCount = countScoped(
    `SELECT COUNT(*) AS n FROM maintenance_records r
     WHERE r.deleted_at IS NULL
       ${motorcycleId !== undefined ? 'AND r.motorcycle_id = ?' : `AND r.motorcycle_id IN (SELECT id FROM motorcycles WHERE deleted_at IS NULL AND is_archived = 0)`}`,
    motorcycleId,
  );

  // Average monthly spend (§9.3): trailing 12 calendar months incl. current.
  const currentMonth = monthKey(today);
  const twelveMonthsAgo = shiftMonthKey(currentMonth, -11);
  const trailingSpend = ExpenseRepository.unionTotal(motorcycleId, `${twelveMonthsAgo}-01`, today);
  const firstMoneyDate = ExpenseRepository.firstMoneyDate(motorcycleId);
  let averageMonthlySpendCentavos: number | null = null;
  if (firstMoneyDate !== null) {
    const firstMonth = monthKey(firstMoneyDate);
    let monthsSinceFirst = 1;
    const [fy, fm] = firstMonth.split('-').map(Number);
    const [cy, cm] = currentMonth.split('-').map(Number);
    monthsSinceFirst = Math.max(1, ((cy ?? 0) - (fy ?? 0)) * 12 + ((cm ?? 0) - (fm ?? 0)) + 1);
    averageMonthlySpendCentavos = Math.round(trailingSpend / Math.min(12, monthsSinceFirst));
  }

  // Cost/km (§9.4): union spend ÷ km tracked, both in trailing 12 months.
  let costPerKmCentavos: number | null = null;
  if (motorcycleId !== undefined) {
    const windowLogs = OdometerRepository.listInWindow(motorcycleId, `${twelveMonthsAgo}-01`, today);
    if (windowLogs.length >= 2) {
      const kms = windowLogs.map((l) => l.effectiveKm);
      const windowKm = Math.max(...kms) - Math.min(...kms);
      if (windowKm > 0) {
        costPerKmCentavos = trailingSpend / windowKm;
      }
    }
  }

  // Fuel math (per-bike only; all-bikes fuel averages would mix machines).
  let avgKmPerLiter: number | null = null;
  let fuelPerKm: number | null = null;
  if (motorcycleId !== undefined) {
    const fills = FuelRepository.listChronological(motorcycleId);
    avgKmPerLiter = averageKmPerLiter(computeSpans(fills));
    fuelPerKm = fuelCostPerKm(fills, today);
  }

  return {
    kmTracked,
    maintenanceSpendCentavos: sourceTotals.maintenance,
    fuelSpendCentavos: sourceTotals.fuel,
    repairSpendCentavos: sourceTotals.repair,
    standaloneSpendCentavos: sourceTotals.expense,
    overallSpendCentavos:
      sourceTotals.maintenance + sourceTotals.fuel + sourceTotals.repair + sourceTotals.expense,
    oilChangeCount,
    serviceCount,
    averageMonthlySpendCentavos,
    costPerKmCentavos,
    averageKmPerLiter: avgKmPerLiter,
    fuelCostPerKmCentavos: fuelPerKm,
  };
}
