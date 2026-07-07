import { create } from 'zustand';

import { MotorcycleRepository } from '@/db/repositories/MotorcycleRepository';
import { ScheduleRepository } from '@/db/repositories/ScheduleRepository';
import type { ScheduleRow } from '@/db/schema';
import { todayIso } from '@/lib/dates';
import { onDomainEvents } from '@/lib/events';
import { computeScheduleStatus } from '@/services/StatusService';

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

const THIS_WEEK_DAYS = 7;

/** In-app Reminders list (S-05) — overdue/due-soon across all non-archived bikes, no OS scheduling. */
export const useReminderStore = create<ReminderState>((set) => ({
  items: [],
  status: 'idle',
  load: () => {
    const today = todayIso();
    const items: ReminderItem[] = [];
    for (const bike of MotorcycleRepository.list().filter((b) => b.isArchived === 0)) {
      const schedules = ScheduleRepository.listByBike(bike.id).filter(
        (s) => s.isEnabled === 1 && (s.snoozedUntil === null || s.snoozedUntil < today),
      );
      for (const schedule of schedules) {
        const status = computeScheduleStatus(schedule, bike.currentOdometerKm, today);
        if (status.status !== 'dueSoon' && status.status !== 'overdue') {
          continue;
        }
        const bucket: ReminderItem['bucket'] =
          status.status === 'overdue'
            ? 'overdue'
            : (status.remainingDays ?? Infinity) <= THIS_WEEK_DAYS
              ? 'thisWeek'
              : 'later';
        items.push({
          schedule,
          bikeId: bike.id,
          bikeNickname: bike.nickname,
          bucket,
          remainingKm: status.remainingKm,
          remainingDays: status.remainingDays,
        });
      }
    }
    const order: Record<ReminderItem['bucket'], number> = { overdue: 0, thisWeek: 1, later: 2 };
    items.sort((a, b) => order[a.bucket] - order[b.bucket]);
    set({ items, status: 'ready' });
  },
}));

onDomainEvents(
  ['schedule:changed', 'maintenance:changed', 'odometer:changed', 'bike:changed'],
  () => {
    if (useReminderStore.getState().status === 'ready') {
      useReminderStore.getState().load();
    }
  },
);
