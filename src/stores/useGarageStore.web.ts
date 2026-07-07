import { create } from 'zustand';

import type { MotorcycleRow } from '@/db/schema';

interface GarageState {
  bikes: MotorcycleRow[];
  activeBike: MotorcycleRow | null;
  status: 'idle' | 'ready';
  load: () => void;
}

/** Web preview store: SQLite-backed garage data is native-only. */
export const useGarageStore = create<GarageState>((set) => ({
  bikes: [],
  activeBike: null,
  status: 'idle',
  load: () => set({ bikes: [], activeBike: null, status: 'ready' }),
}));
