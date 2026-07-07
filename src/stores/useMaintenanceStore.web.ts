import { create } from 'zustand';

import type { ScheduleRow } from '@/db/schema';
import type { HealthScoreResult } from '@/services/HealthScoreService';
import type { ScheduleStatus } from '@/services/StatusService';

export interface ScheduleWithStatus {
  schedule: ScheduleRow;
  status: ScheduleStatus;
}

interface MaintenanceState {
  bikeId: string | null;
  items: ScheduleWithStatus[];
  health: HealthScoreResult | null;
  status: 'idle' | 'ready';
  load: (bikeId: string, currentEffectiveOdo: number) => void;
  clear: () => void;
}

/** Web preview store: maintenance schedules are native SQLite data. */
export const useMaintenanceStore = create<MaintenanceState>((set) => ({
  bikeId: null,
  items: [],
  health: null,
  status: 'idle',
  load: (bikeId) => set({ bikeId, items: [], health: null, status: 'ready' }),
  clear: () => set({ bikeId: null, items: [], health: null, status: 'idle' }),
}));
