import { and, desc, eq, gte, isNull, like, lte, or, sql } from 'drizzle-orm';

import { db } from '@/db/client';
import { maintenanceRecords, type MaintenanceRecordRow } from '@/db/schema';
import type { RecordSource, ServiceType } from '@/types/enums';
import { guard, insertMeta, softDeleteMeta, touchMeta } from './base';

export interface NewMaintenanceRecord {
  motorcycleId: string;
  scheduleId: string;
  performedDate: string;
  odometerKm: number | null;
  serviceType: ServiceType;
  costCentavos: number | null;
  brand: string | null;
  quantity: string | null;
  details: string | null;
  notes: string | null;
  photoPath: string | null;
  source: RecordSource;
}

export type MaintenanceRecordUpdate = Partial<Omit<NewMaintenanceRecord, 'motorcycleId' | 'source'>>;

export interface RecordListFilter {
  scheduleId?: string;
  year?: string;
  limit?: number;
  offset?: number;
}

const notDeleted = isNull(maintenanceRecords.deletedAt);

export const MaintenanceRepository = {
  getById(id: string): MaintenanceRecordRow | undefined {
    return guard('records.getById', () =>
      db
        .select()
        .from(maintenanceRecords)
        .where(and(eq(maintenanceRecords.id, id), notDeleted))
        .get(),
    );
  },

  listByBike(motorcycleId: string, filter: RecordListFilter = {}): MaintenanceRecordRow[] {
    return guard('records.listByBike', () =>
      db
        .select()
        .from(maintenanceRecords)
        .where(
          and(
            eq(maintenanceRecords.motorcycleId, motorcycleId),
            notDeleted,
            filter.scheduleId !== undefined
              ? eq(maintenanceRecords.scheduleId, filter.scheduleId)
              : undefined,
            filter.year !== undefined
              ? and(
                  gte(maintenanceRecords.performedDate, `${filter.year}-01-01`),
                  lte(maintenanceRecords.performedDate, `${filter.year}-12-31`),
                )
              : undefined,
          ),
        )
        .orderBy(desc(maintenanceRecords.performedDate), desc(maintenanceRecords.createdAt))
        .limit(filter.limit ?? 50)
        .offset(filter.offset ?? 0)
        .all(),
    );
  },

  /**
   * The schedule's anchor record: latest by performed date, ties by odometer
   * (BUSINESS_RULES.md §4 anchoring; date fields, never created_at — §10).
   */
  latestForSchedule(scheduleId: string): MaintenanceRecordRow | undefined {
    return guard('records.latestForSchedule', () =>
      db
        .select()
        .from(maintenanceRecords)
        .where(and(eq(maintenanceRecords.scheduleId, scheduleId), notDeleted))
        .orderBy(
          desc(maintenanceRecords.performedDate),
          desc(sql`COALESCE(${maintenanceRecords.odometerKm}, -1)`),
        )
        .limit(1)
        .get(),
    );
  },

  countForSchedule(scheduleId: string): number {
    return guard(
      'records.countForSchedule',
      () =>
        db
          .select({ n: sql<number>`count(*)` })
          .from(maintenanceRecords)
          .where(and(eq(maintenanceRecords.scheduleId, scheduleId), notDeleted))
          .get()?.n ?? 0,
    );
  },

  totalCostForSchedule(scheduleId: string): number {
    return guard(
      'records.totalCostForSchedule',
      () =>
        db
          .select({ total: sql<number>`COALESCE(SUM(${maintenanceRecords.costCentavos}), 0)` })
          .from(maintenanceRecords)
          .where(and(eq(maintenanceRecords.scheduleId, scheduleId), notDeleted))
          .get()?.total ?? 0,
    );
  },

  insert(input: NewMaintenanceRecord): MaintenanceRecordRow {
    return guard('records.insert', () => {
      const row = { ...insertMeta(), ...input };
      db.insert(maintenanceRecords).values(row).run();
      return row as MaintenanceRecordRow;
    });
  },

  update(id: string, changes: MaintenanceRecordUpdate): void {
    guard('records.update', () =>
      db
        .update(maintenanceRecords)
        .set({ ...changes, ...touchMeta() })
        .where(eq(maintenanceRecords.id, id))
        .run(),
    );
  },

  softDelete(id: string): void {
    guard('records.softDelete', () =>
      db.update(maintenanceRecords).set(softDeleteMeta()).where(eq(maintenanceRecords.id, id)).run(),
    );
  },

  softDeleteByBike(motorcycleId: string): void {
    guard('records.softDeleteByBike', () =>
      db
        .update(maintenanceRecords)
        .set(softDeleteMeta())
        .where(and(eq(maintenanceRecords.motorcycleId, motorcycleId), notDeleted))
        .run(),
    );
  },

  search(query: string, limit: number): MaintenanceRecordRow[] {
    const pattern = `%${query}%`;
    return guard('records.search', () =>
      db
        .select()
        .from(maintenanceRecords)
        .where(
          and(
            notDeleted,
            or(
              like(maintenanceRecords.notes, pattern),
              like(maintenanceRecords.brand, pattern),
            ),
          ),
        )
        .orderBy(desc(maintenanceRecords.performedDate))
        .limit(limit)
        .all(),
    );
  },
};
