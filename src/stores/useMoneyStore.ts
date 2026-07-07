import { create } from 'zustand';

import {
  ExpenseRepository,
  type UnifiedExpenseRow,
} from '@/db/repositories/ExpenseRepository';
import { FuelRepository } from '@/db/repositories/FuelRepository';
import type { FuelLogRow } from '@/db/schema';
import { monthKey, todayIso } from '@/lib/dates';
import { onDomainEvents } from '@/lib/events';
import { averageKmPerLiter, computeSpans, fuelCostPerKm } from '@/services/FuelService';

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

/** Expense/fuel view models for the Money tab (STATE_MANAGEMENT.md §2). */
export const useMoneyStore = create<MoneyState>((set, get) => ({
  bikeId: null,
  month: monthKey(todayIso()),
  unified: [],
  monthTotalCentavos: 0,
  fuelLogs: [],
  averageKmPerLiter: null,
  fuelCostPerKmCentavos: null,
  status: 'idle',
  load: (bikeId, month) => {
    const scopedMonth = month ?? get().month;
    const unified = ExpenseRepository.listUnified({ motorcycleId: bikeId, month: scopedMonth, limit: 100 });
    const monthTotalCentavos = unified.reduce((sum, row) => sum + row.amountCentavos, 0);
    const fuelLogs = FuelRepository.listByBike(bikeId, 50);
    const chronological = FuelRepository.listChronological(bikeId);
    set({
      bikeId,
      month: scopedMonth,
      unified,
      monthTotalCentavos,
      fuelLogs,
      averageKmPerLiter: averageKmPerLiter(computeSpans(chronological)),
      fuelCostPerKmCentavos: fuelCostPerKm(chronological, todayIso()),
      status: 'ready',
    });
  },
  setMonth: (month) => {
    const { bikeId } = get();
    if (bikeId !== null) {
      get().load(bikeId, month);
    } else {
      set({ month });
    }
  },
}));

onDomainEvents(['fuel:changed', 'expense:changed', 'maintenance:changed', 'repair:changed'], () => {
  const state = useMoneyStore.getState();
  if (state.status === 'ready' && state.bikeId !== null) {
    state.load(state.bikeId, state.month);
  }
});
