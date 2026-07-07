import { FuelRepository } from '@/db/repositories/FuelRepository';
import { MaintenanceRepository } from '@/db/repositories/MaintenanceRepository';
import { useGarageStore } from '@/stores/useGarageStore';
import type { ConditionCtx } from './types';

/**
 * Builds the app-state snapshot smart conditions evaluate against. Called only
 * when a tutorial starts (never on a hot path); repository lookups are cheap
 * local SQLite reads.
 */
export function buildConditionCtx(pathname: string): ConditionCtx {
  if (useGarageStore.getState().status === 'idle') {
    useGarageStore.getState().load();
  }
  const { bikes, activeBike } = useGarageStore.getState();
  return {
    bikeCount: bikes.length,
    hasActiveBike: activeBike !== null,
    hasMaintenanceHistory:
      activeBike !== null && MaintenanceRepository.listByBike(activeBike.id).length > 0,
    hasFuelLogs: activeBike !== null && FuelRepository.listByBike(activeBike.id, 1).length > 0,
    pathname,
  };
}
