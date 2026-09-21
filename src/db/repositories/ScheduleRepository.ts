import { and, asc, desc, eq, isNull } from 'drizzle-orm';

import { db } from '@/db/client';
import { maintenanceSchedules, type ScheduleRow } from '@/db/schema';
import type { AnchorSource, ComponentType } from '@/types/enums';
import { guard, insertMeta, softDeleteMeta, touchMeta } from './base';

export interface NewSchedule {
  motorcycleId: string;
  componentType: ComponentType;
  customName: string | null;
  intervalKm: number | null;
  intervalMonths: number | null;
  isEnabled: number;
  /** Custom Components drag order (item 13); defaults to 0 (built-in defaults never reorder). */
  sortOrder?: number;
}

export interface ScheduleUpdate {
  customName?: string | null;
  intervalKm?: number | null;
  intervalMonths?: number | null;
  isEnabled?: number;
  isMuted?: number;
  snoozedUntil?: string | null;
}

export interface AnchorUpdate {
  anchorOdometerKm: number | null;
  anchorDate: string | null;
  anchorSource: AnchorSource | null;
}

const notDeleted = isNull(maintenanceSchedules.deletedAt);

export const ScheduleRepository = {
  listByBike(motorcycleId: string): ScheduleRow[] {
    return guard('schedules.listByBike', () =>
      db
        .select()
        .from(maintenanceSchedules)
        .where(and(eq(maintenanceSchedules.motorcycleId, motorcycleId), notDeleted))
        .orderBy(asc(maintenanceSchedules.createdAt))
        .all(),
    );
  },

  /** Custom components in their saved drag-and-drop order (item 13); ties fall back to creation order. */
  listCustomByBike(motorcycleId: string): ScheduleRow[] {
    return guard('schedules.listCustomByBike', () =>
      db
        .select()
        .from(maintenanceSchedules)
        .where(
          and(
            eq(maintenanceSchedules.motorcycleId, motorcycleId),
            eq(maintenanceSchedules.componentType, 'custom'),
            notDeleted,
          ),
        )
        .orderBy(asc(maintenanceSchedules.sortOrder), asc(maintenanceSchedules.createdAt))
        .all(),
    );
  },

  /** Pinned Dashboard "Quick Logs" cards in their saved order. */
  listPinnedByBike(motorcycleId: string): ScheduleRow[] {
    return guard('schedules.listPinnedByBike', () =>
      db
        .select()
        .from(maintenanceSchedules)
        .where(
          and(
            eq(maintenanceSchedules.motorcycleId, motorcycleId),
            eq(maintenanceSchedules.isPinned, 1),
            notDeleted,
          ),
        )
        .orderBy(asc(maintenanceSchedules.pinnedSortOrder), asc(maintenanceSchedules.createdAt))
        .all(),
    );
  },

  nextPinnedSortOrder(motorcycleId: string): number {
    return guard('schedules.nextPinnedSortOrder', () => {
      const top = db
        .select({ order: maintenanceSchedules.pinnedSortOrder })
        .from(maintenanceSchedules)
        .where(and(eq(maintenanceSchedules.motorcycleId, motorcycleId), eq(maintenanceSchedules.isPinned, 1)))
        .orderBy(desc(maintenanceSchedules.pinnedSortOrder))
        .limit(1)
        .get();
      return (top?.order ?? -1) + 1;
    });
  },

  nextCustomSortOrder(motorcycleId: string): number {
    return guard('schedules.nextCustomSortOrder', () => {
      const top = db
        .select({ order: maintenanceSchedules.sortOrder })
        .from(maintenanceSchedules)
        .where(
          and(eq(maintenanceSchedules.motorcycleId, motorcycleId), eq(maintenanceSchedules.componentType, 'custom')),
        )
        .orderBy(desc(maintenanceSchedules.sortOrder))
        .limit(1)
        .get();
      return (top?.order ?? -1) + 1;
    });
  },

  setPinned(id: string, isPinned: boolean, pinnedSortOrder: number): void {
    guard('schedules.setPinned', () =>
      db
        .update(maintenanceSchedules)
        .set({ isPinned: isPinned ? 1 : 0, pinnedSortOrder, ...touchMeta() })
        .where(eq(maintenanceSchedules.id, id))
        .run(),
    );
  },

  setPinnedSortOrder(id: string, pinnedSortOrder: number): void {
    guard('schedules.setPinnedSortOrder', () =>
      db
        .update(maintenanceSchedules)
        .set({ pinnedSortOrder, ...touchMeta() })
        .where(eq(maintenanceSchedules.id, id))
        .run(),
    );
  },

  setSortOrder(id: string, sortOrder: number): void {
    guard('schedules.setSortOrder', () =>
      db
        .update(maintenanceSchedules)
        .set({ sortOrder, ...touchMeta() })
        .where(eq(maintenanceSchedules.id, id))
        .run(),
    );
  },

  getById(id: string): ScheduleRow | undefined {
    return guard('schedules.getById', () =>
      db
        .select()
        .from(maintenanceSchedules)
        .where(and(eq(maintenanceSchedules.id, id), notDeleted))
        .get(),
    );
  },

  findByBikeComponent(motorcycleId: string, componentType: ComponentType): ScheduleRow | undefined {
    return guard('schedules.findByBikeComponent', () =>
      db
        .select()
        .from(maintenanceSchedules)
        .where(
          and(
            eq(maintenanceSchedules.motorcycleId, motorcycleId),
            eq(maintenanceSchedules.componentType, componentType),
            notDeleted,
          ),
        )
        .get(),
    );
  },

  insert(input: NewSchedule): ScheduleRow {
    return guard('schedules.insert', () => {
      const row = {
        ...insertMeta(),
        ...input,
        sortOrder: input.sortOrder ?? 0,
        isMuted: 0,
        snoozedUntil: null,
        anchorOdometerKm: null,
        anchorDate: null,
        anchorSource: null,
        isPinned: 0,
        pinnedSortOrder: 0,
      };
      db.insert(maintenanceSchedules).values(row).run();
      return row as ScheduleRow;
    });
  },

  update(id: string, changes: ScheduleUpdate): void {
    guard('schedules.update', () =>
      db
        .update(maintenanceSchedules)
        .set({ ...changes, ...touchMeta() })
        .where(eq(maintenanceSchedules.id, id))
        .run(),
    );
  },

  setAnchor(id: string, anchor: AnchorUpdate): void {
    guard('schedules.setAnchor', () =>
      db
        .update(maintenanceSchedules)
        .set({ ...anchor, ...touchMeta() })
        .where(eq(maintenanceSchedules.id, id))
        .run(),
    );
  },

  softDelete(id: string): void {
    guard('schedules.softDelete', () =>
      db.update(maintenanceSchedules).set(softDeleteMeta()).where(eq(maintenanceSchedules.id, id)).run(),
    );
  },

  softDeleteByBike(motorcycleId: string): void {
    guard('schedules.softDeleteByBike', () =>
      db
        .update(maintenanceSchedules)
        .set(softDeleteMeta())
        .where(and(eq(maintenanceSchedules.motorcycleId, motorcycleId), notDeleted))
        .run(),
    );
  },
};
