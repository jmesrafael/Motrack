import { and, asc, eq, isNull } from 'drizzle-orm';

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
        isMuted: 0,
        snoozedUntil: null,
        anchorOdometerKm: null,
        anchorDate: null,
        anchorSource: null,
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
