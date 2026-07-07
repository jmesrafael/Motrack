import { create } from 'zustand';

import { onDomainEvents } from '@/lib/events';
import { computeStatistics, type BikeStatistics } from '@/services/StatisticsService';

interface StatsState {
  scope: 'bike' | 'all';
  bikeId: string | null;
  stats: BikeStatistics | null;
  status: 'idle' | 'ready';
  load: (scope: 'bike' | 'all', bikeId: string | null) => void;
}

/** Statistics view model (S-28) — active-bike or all-bikes scope. */
export const useStatsStore = create<StatsState>((set) => ({
  scope: 'bike',
  bikeId: null,
  stats: null,
  status: 'idle',
  load: (scope, bikeId) => {
    set({
      scope,
      bikeId,
      stats: computeStatistics(scope === 'bike' && bikeId !== null ? bikeId : undefined),
      status: 'ready',
    });
  },
}));

onDomainEvents(
  ['maintenance:changed', 'fuel:changed', 'expense:changed', 'repair:changed', 'odometer:changed', 'bike:changed'],
  () => {
    const state = useStatsStore.getState();
    if (state.status === 'ready') {
      state.load(state.scope, state.bikeId);
    }
  },
);
