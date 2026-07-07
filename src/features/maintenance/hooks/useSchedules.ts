import { useEffect } from 'react';

import { useMaintenanceStore } from '@/stores/useMaintenanceStore';

/** Binds schedule statuses + Health Score to a bike's current odometer (SOFTWARE_ARCHITECTURE.md §2). */
export function useSchedules(bikeId: string | null, currentOdometerKm: number) {
  const status = useMaintenanceStore((s) => s.status);
  const items = useMaintenanceStore((s) => s.items);
  const health = useMaintenanceStore((s) => s.health);
  const storeBikeId = useMaintenanceStore((s) => s.bikeId);
  const load = useMaintenanceStore((s) => s.load);
  const clear = useMaintenanceStore((s) => s.clear);

  useEffect(() => {
    if (bikeId === null) {
      clear();
      return;
    }
    if (status === 'idle' || storeBikeId !== bikeId) {
      load(bikeId, currentOdometerKm);
    }
  }, [bikeId, currentOdometerKm, status, storeBikeId, load, clear]);

  return {
    items: storeBikeId === bikeId ? items : [],
    health: storeBikeId === bikeId ? health : null,
    ready: status === 'ready' && storeBikeId === bikeId,
  };
}
