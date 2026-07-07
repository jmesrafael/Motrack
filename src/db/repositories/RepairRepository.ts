import { and, desc, eq, gte, isNull, like, lte, or } from 'drizzle-orm';

import { db } from '@/db/client';
import { repairs, type RepairRow } from '@/db/schema';
import { guard, insertMeta, softDeleteMeta, touchMeta } from './base';

export interface NewRepair {
  motorcycleId: string;
  title: string;
  repairDate: string;
  odometerKm: number | null;
  problem: string | null;
  diagnosis: string | null;
  solution: string | null;
  shopName: string | null;
  costCentavos: number | null;
  photoPaths: string | null;
  notes: string | null;
}

export type RepairUpdate = Partial<Omit<NewRepair, 'motorcycleId'>>;

const notDeleted = isNull(repairs.deletedAt);

export const RepairRepository = {
  getById(id: string): RepairRow | undefined {
    return guard('repairs.getById', () =>
      db
        .select()
        .from(repairs)
        .where(and(eq(repairs.id, id), notDeleted))
        .get(),
    );
  },

  listByBike(motorcycleId: string, year?: string, limit = 50, offset = 0): RepairRow[] {
    return guard('repairs.listByBike', () =>
      db
        .select()
        .from(repairs)
        .where(
          and(
            eq(repairs.motorcycleId, motorcycleId),
            notDeleted,
            year !== undefined
              ? and(gte(repairs.repairDate, `${year}-01-01`), lte(repairs.repairDate, `${year}-12-31`))
              : undefined,
          ),
        )
        .orderBy(desc(repairs.repairDate), desc(repairs.createdAt))
        .limit(limit)
        .offset(offset)
        .all(),
    );
  },

  insert(input: NewRepair): RepairRow {
    return guard('repairs.insert', () => {
      const row = { ...insertMeta(), ...input };
      db.insert(repairs).values(row).run();
      return row as RepairRow;
    });
  },

  update(id: string, changes: RepairUpdate): void {
    guard('repairs.update', () =>
      db
        .update(repairs)
        .set({ ...changes, ...touchMeta() })
        .where(eq(repairs.id, id))
        .run(),
    );
  },

  softDelete(id: string): void {
    guard('repairs.softDelete', () =>
      db.update(repairs).set(softDeleteMeta()).where(eq(repairs.id, id)).run(),
    );
  },

  softDeleteByBike(motorcycleId: string): void {
    guard('repairs.softDeleteByBike', () =>
      db
        .update(repairs)
        .set(softDeleteMeta())
        .where(and(eq(repairs.motorcycleId, motorcycleId), notDeleted))
        .run(),
    );
  },

  search(query: string, limit: number): RepairRow[] {
    const pattern = `%${query}%`;
    return guard('repairs.search', () =>
      db
        .select()
        .from(repairs)
        .where(
          and(
            notDeleted,
            or(
              like(repairs.title, pattern),
              like(repairs.problem, pattern),
              like(repairs.solution, pattern),
              like(repairs.shopName, pattern),
              like(repairs.notes, pattern),
            ),
          ),
        )
        .orderBy(desc(repairs.repairDate))
        .limit(limit)
        .all(),
    );
  },
};
