import { create } from 'zustand';

import type { ScheduleRow } from '@/db/schema';

export interface ReminderItem {
  schedule: ScheduleRow;
  bikeId: string;
  bikeNickname: string;
  bucket: 'overdue' | 'thisWeek' | 'later';
  remainingKm: number | null;
  remainingDays: number | null;
}

interface ReminderState {
  items: ReminderItem[];
  status: 'idle' | 'ready';
  load: () => void;
}

/** Web preview store: reminders are derived from native SQLite data. */
export const useReminderStore = create<ReminderState>((set) => ({
  items: [],
  status: 'idle',
  load: () => set({ items: [], status: 'ready' }),
}));
