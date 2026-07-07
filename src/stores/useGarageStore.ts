import { create } from 'zustand';

import { MotorcycleRepository } from '@/db/repositories/MotorcycleRepository';
import type { MotorcycleRow } from '@/db/schema';
import { onDomainEvents } from '@/lib/events';
import { MotorcycleService } from '@/services/MotorcycleService';

interface GarageState {
  bikes: MotorcycleRow[];
  activeBike: MotorcycleRow | null;
  status: 'idle' | 'ready';
  load: () => void;
}

/** Bike list + active bike VMs (STATE_MANAGEMENT.md §2). */
export const useGarageStore = create<GarageState>((set) => ({
  bikes: [],
  activeBike: null,
  status: 'idle',
  load: () => {
    set({
      bikes: MotorcycleRepository.list(),
      activeBike: MotorcycleService.getActiveBike(),
      status: 'ready',
    });
  },
}));

// Event-driven invalidation (STATE_MANAGEMENT.md §4) — reload once loaded.
onDomainEvents(['bike:changed', 'settings:changed', 'odometer:changed'], () => {
  if (useGarageStore.getState().status === 'ready') {
    useGarageStore.getState().load();
  }
});
