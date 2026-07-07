import { and, asc, desc, eq, gte, isNull, like, lte, or, sql } from 'drizzle-orm';

import { db } from '@/db/client';
import { fuelLogs, type FuelLogRow } from '@/db/schema';
import { guard, insertMeta, softDeleteMeta, touchMeta } from './base';

export interface NewFuelLog {
  motorcycleId: string;
  fuelDate: string;
  liters: number;
  totalCostCentavos: number;
  odometerKm: number;
  station: string | null;
  isFullTank: number;
  notes: string | null;
}

export type FuelLogUpdate = Partial<Omit<NewFuelLog, 'motorcycleId'>>;

const notDeleted = isNull(fuelLogs.deletedAt);

export const FuelRepository = {
  getById(id: string): FuelLogRow | undefined {
    return guard('fuel.getById', () =>
      db
        .select()
        .from(fuelLogs)
        .where(and(eq(fuelLogs.id, id), notDeleted))
        .get(),
    );
  },

  listByBike(motorcycleId: string, limit = 50, offset = 0): FuelLogRow[] {
    return guard('fuel.listByBike', () =>
      db
        .select()
        .from(fuelLogs)
        .where(and(eq(fuelLogs.motorcycleId, motorcycleId), notDeleted))
        .orderBy(desc(fuelLogs.fuelDate), desc(fuelLogs.createdAt))
        .limit(limit)
        .offset(offset)
        .all(),
    );
  },

  /** Chronological fills for consumption spans (BUSINESS_RULES.md §7.2). */
  listChronological(motorcycleId: string): FuelLogRow[] {
    return guard('fuel.listChronological', () =>
      db
        .select()
        .from(fuelLogs)
        .where(and(eq(fuelLogs.motorcycleId, motorcycleId), notDeleted))
        .orderBy(asc(fuelLogs.fuelDate), asc(fuelLogs.createdAt))
        .all(),
    );
  },

  /** Fuel spend inside [fromDate, toDate] (monthly cost, §7.4). */
  costInWindow(motorcycleId: string, fromDate: string, toDate: string): number {
    return guard(
      'fuel.costInWindow',
      () =>
        db
          .select({ total: sql<number>`COALESCE(SUM(${fuelLogs.totalCostCentavos}), 0)` })
          .from(fuelLogs)
          .where(
            and(
              eq(fuelLogs.motorcycleId, motorcycleId),
              notDeleted,
              gte(fuelLogs.fuelDate, fromDate),
              lte(fuelLogs.fuelDate, toDate),
            ),
          )
          .get()?.total ?? 0,
    );
  },

  /** Last-used station for pre-fill (FEATURE_SPECIFICATIONS.md §10). */
  lastStation(motorcycleId: string): string | null {
    return guard(
      'fuel.lastStation',
      () =>
        db
          .select({ station: fuelLogs.station })
          .from(fuelLogs)
          .where(and(eq(fuelLogs.motorcycleId, motorcycleId), notDeleted))
          .orderBy(desc(fuelLogs.fuelDate), desc(fuelLogs.createdAt))
          .limit(1)
          .get()?.station ?? null,
    );
  },

  insert(input: NewFuelLog): FuelLogRow {
    return guard('fuel.insert', () => {
      const row = { ...insertMeta(), ...input };
      db.insert(fuelLogs).values(row).run();
      return row as FuelLogRow;
    });
  },

  update(id: string, changes: FuelLogUpdate): void {
    guard('fuel.update', () =>
      db
        .update(fuelLogs)
        .set({ ...changes, ...touchMeta() })
        .where(eq(fuelLogs.id, id))
        .run(),
    );
  },

  softDelete(id: string): void {
    guard('fuel.softDelete', () =>
      db.update(fuelLogs).set(softDeleteMeta()).where(eq(fuelLogs.id, id)).run(),
    );
  },

  softDeleteByBike(motorcycleId: string): void {
    guard('fuel.softDeleteByBike', () =>
      db
        .update(fuelLogs)
        .set(softDeleteMeta())
        .where(and(eq(fuelLogs.motorcycleId, motorcycleId), notDeleted))
        .run(),
    );
  },

  search(query: string, limit: number): FuelLogRow[] {
    const pattern = `%${query}%`;
    return guard('fuel.search', () =>
      db
        .select()
        .from(fuelLogs)
        .where(and(notDeleted, or(like(fuelLogs.notes, pattern), like(fuelLogs.station, pattern))))
        .orderBy(desc(fuelLogs.fuelDate))
        .limit(limit)
        .all(),
    );
  },
};
