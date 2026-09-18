import { create } from 'zustand';

import type { BikeStatistics } from '@/services/StatisticsService';

interface StatsState {
  scope: 'bike' | 'all';
  bikeId: string | null;
  stats: BikeStatistics | null;
  status: 'idle' | 'ready';
  load: (scope: 'bike' | 'all', bikeId: string | null) => void;
}

const EMPTY_STATS: BikeStatistics = {
  kmTracked: 0,
  maintenanceSpendCentavos: 0,
  fuelSpendCentavos: 0,
  repairSpendCentavos: 0,
  standaloneSpendCentavos: 0,
  overallSpendCentavos: 0,
  oilChangeCount: 0,
  serviceCount: 0,
  averageMonthlySpendCentavos: null,
  costPerKmCentavos: null,
  averageKmPerLiter: null,
  fuelCostPerKmCentavos: null,
};

/** Web preview store: statistics are computed from native SQLite data. */
export const useStatsStore = create<StatsState>((set) => ({
  scope: 'bike',
  bikeId: null,
  stats: null,
  status: 'idle',
  load: (scope, bikeId) => set({ scope, bikeId, stats: EMPTY_STATS, status: 'ready' }),
}));
