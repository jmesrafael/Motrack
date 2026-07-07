import { and, asc, desc, eq, gt, gte, isNull, lt, lte, sql } from 'drizzle-orm';

import { db } from '@/db/client';
import { odometerLogs, type OdometerLogRow } from '@/db/schema';
import type { OdometerSource } from '@/types/enums';
import { guard, insertMeta, softDeleteMeta, touchMeta } from './base';

export interface NewOdometerLog {
  motorcycleId: string;
  readingKm: number;
  effectiveKm: number;
  recordedDate: string;
  source: OdometerSource;
  sourceId: string | null;
}

const notDeleted = isNull(odometerLogs.deletedAt);

export const OdometerRepository = {
  getById(id: string): OdometerLogRow | undefined {
    return guard('odo.getById', () =>
      db
        .select()
        .from(odometerLogs)
        .where(and(eq(odometerLogs.id, id), notDeleted))
        .get(),
    );
  },

  listByBike(motorcycleId: string, limit = 100, offset = 0): OdometerLogRow[] {
    return guard('odo.listByBike', () =>
      db
        .select()
        .from(odometerLogs)
        .where(and(eq(odometerLogs.motorcycleId, motorcycleId), notDeleted))
        .orderBy(desc(odometerLogs.recordedDate), desc(odometerLogs.createdAt))
        .limit(limit)
        .offset(offset)
        .all(),
    );
  },

  findBySourceId(sourceId: string): OdometerLogRow | undefined {
    return guard('odo.findBySourceId', () =>
      db
        .select()
        .from(odometerLogs)
        .where(and(eq(odometerLogs.sourceId, sourceId), notDeleted))
        .get(),
    );
  },

  /**
   * Monotonicity neighbors (BUSINESS_RULES.md §6.2): the latest log at-or-before
   * `date` and the earliest at-or-after, ordered by recorded date with
   * created_at tiebreak. `excludeId` skips the row being edited.
   */
  latestBefore(motorcycleId: string, date: string, excludeId?: string): OdometerLogRow | undefined {
    return guard('odo.latestBefore', () =>
      db
        .select()
        .from(odometerLogs)
        .where(
          and(
            eq(odometerLogs.motorcycleId, motorcycleId),
            notDeleted,
            lte(odometerLogs.recordedDate, date),
            excludeId !== undefined ? sql`${odometerLogs.id} != ${excludeId}` : undefined,
          ),
        )
        .orderBy(desc(odometerLogs.recordedDate), desc(odometerLogs.createdAt))
        .limit(1)
        .get(),
    );
  },

  earliestAfter(motorcycleId: string, date: string, excludeId?: string): OdometerLogRow | undefined {
    return guard('odo.earliestAfter', () =>
      db
        .select()
        .from(odometerLogs)
        .where(
          and(
            eq(odometerLogs.motorcycleId, motorcycleId),
            notDeleted,
            gt(odometerLogs.recordedDate, date),
            excludeId !== undefined ? sql`${odometerLogs.id} != ${excludeId}` : undefined,
          ),
        )
        .orderBy(asc(odometerLogs.recordedDate), asc(odometerLogs.createdAt))
        .limit(1)
        .get(),
    );
  },

  maxEffective(motorcycleId: string): number {
    return guard(
      'odo.maxEffective',
      () =>
        db
          .select({ max: sql<number>`COALESCE(MAX(${odometerLogs.effectiveKm}), 0)` })
          .from(odometerLogs)
          .where(and(eq(odometerLogs.motorcycleId, motorcycleId), notDeleted))
          .get()?.max ?? 0,
    );
  },

  minEffective(motorcycleId: string): number {
    return guard(
      'odo.minEffective',
      () =>
        db
          .select({ min: sql<number>`COALESCE(MIN(${odometerLogs.effectiveKm}), 0)` })
          .from(odometerLogs)
          .where(and(eq(odometerLogs.motorcycleId, motorcycleId), notDeleted))
          .get()?.min ?? 0,
    );
  },

  /** Latest log row by date (for "as of" captions and daily-rate windows). */
  latest(motorcycleId: string): OdometerLogRow | undefined {
    return guard('odo.latest', () =>
      db
        .select()
        .from(odometerLogs)
        .where(and(eq(odometerLogs.motorcycleId, motorcycleId), notDeleted))
        .orderBy(desc(odometerLogs.recordedDate), desc(odometerLogs.createdAt))
        .limit(1)
        .get(),
    );
  },

  /** Readings within [fromDate, toDate] for daily-km-rate windows (§7.5). */
  listInWindow(motorcycleId: string, fromDate: string, toDate: string): OdometerLogRow[] {
    return guard('odo.listInWindow', () =>
      db
        .select()
        .from(odometerLogs)
        .where(
          and(
            eq(odometerLogs.motorcycleId, motorcycleId),
            notDeleted,
            gte(odometerLogs.recordedDate, fromDate),
            lte(odometerLogs.recordedDate, toDate),
          ),
        )
        .orderBy(asc(odometerLogs.recordedDate), asc(odometerLogs.createdAt))
        .all(),
    );
  },

  insert(input: NewOdometerLog): OdometerLogRow {
    return guard('odo.insert', () => {
      const row = { ...insertMeta(), ...input };
      db.insert(odometerLogs).values(row).run();
      return row as OdometerLogRow;
    });
  },

  update(id: string, changes: { readingKm: number; effectiveKm: number; recordedDate?: string }): void {
    guard('odo.update', () =>
      db
        .update(odometerLogs)
        .set({ ...changes, ...touchMeta() })
        .where(eq(odometerLogs.id, id))
        .run(),
    );
  },

  softDelete(id: string): void {
    guard('odo.softDelete', () =>
      db.update(odometerLogs).set(softDeleteMeta()).where(eq(odometerLogs.id, id)).run(),
    );
  },

  softDeleteByBike(motorcycleId: string): void {
    guard('odo.softDeleteByBike', () =>
      db
        .update(odometerLogs)
        .set(softDeleteMeta())
        .where(and(eq(odometerLogs.motorcycleId, motorcycleId), notDeleted))
        .run(),
    );
  },
};
