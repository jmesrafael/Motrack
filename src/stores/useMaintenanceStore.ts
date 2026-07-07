import { create } from 'zustand';

import { ScheduleRepository } from '@/db/repositories/ScheduleRepository';
import type { ScheduleRow } from '@/db/schema';
import { onDomainEvents } from '@/lib/events';
import { todayIso } from '@/lib/dates';
import { computeHealthScore, type HealthScoreResult } from '@/services/HealthScoreService';
import { computeScheduleStatus, type ScheduleStatus } from '@/services/StatusService';

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

/**
 * Schedule statuses + Health Score for the active bike — recomputed on every
 * cascade event (DATA_FLOW.md §4); score always derived (ADR-019).
 */
export const useMaintenanceStore = create<MaintenanceState>((set) => ({
  bikeId: null,
  items: [],
  health: null,
  status: 'idle',
  load: (bikeId, currentEffectiveOdo) => {
    const schedules = ScheduleRepository.listByBike(bikeId);
    const today = todayIso();
    const statuses = new Map<string, ScheduleStatus>();
    const items: ScheduleWithStatus[] = schedules.map((schedule) => {
      const status = computeScheduleStatus(schedule, currentEffectiveOdo, today);
      statuses.set(schedule.id, status);
      return { schedule, status };
    });
    set({ bikeId, items, health: computeHealthScore(schedules, statuses), status: 'ready' });
  },
  clear: () => set({ bikeId: null, items: [], health: null, status: 'idle' }),
}));

onDomainEvents(
  ['maintenance:changed', 'schedule:changed', 'odometer:changed', 'bike:changed'],
  () => {
    // Reload is driven by the hook layer (needs current odometer); mark stale here.
    const state = useMaintenanceStore.getState();
    if (state.status === 'ready') {
      useMaintenanceStore.setState({ status: 'idle' });
    }
  },
);
