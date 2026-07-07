import { create } from 'zustand';

import type { UnifiedExpenseRow } from '@/db/repositories/ExpenseRepository';
import type { FuelLogRow } from '@/db/schema';
import { monthKey, todayIso } from '@/lib/dates';

interface MoneyState {
  bikeId: string | null;
  month: string;
  unified: UnifiedExpenseRow[];
  monthTotalCentavos: number;
  fuelLogs: FuelLogRow[];
  averageKmPerLiter: number | null;
  fuelCostPerKmCentavos: number | null;
  status: 'idle' | 'ready';
  load: (bikeId: string, month?: string) => void;
  setMonth: (month: string) => void;
}

/** Web preview store: expense and fuel data are native SQLite data. */
export const useMoneyStore = create<MoneyState>((set, get) => ({
  bikeId: null,
  month: monthKey(todayIso()),
  unified: [],
  monthTotalCentavos: 0,
  fuelLogs: [],
  averageKmPerLiter: null,
  fuelCostPerKmCentavos: null,
  status: 'idle',
  load: (bikeId, month) =>
    set({
      bikeId,
      month: month ?? get().month,
      unified: [],
      monthTotalCentavos: 0,
      fuelLogs: [],
      averageKmPerLiter: null,
      fuelCostPerKmCentavos: null,
      status: 'ready',
    }),
  setMonth: (month) => set({ month }),
}));
