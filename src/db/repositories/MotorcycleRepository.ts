import { and, asc, eq, isNull, ne, sql } from 'drizzle-orm';

import { db } from '@/db/client';
import { motorcycles, type MotorcycleRow } from '@/db/schema';
import type { DrivetrainType } from '@/types/enums';
import { guard, insertMeta, softDeleteMeta, touchMeta } from './base';

export interface NewMotorcycle {
  nickname: string;
  brand: string;
  model: string;
  year: number | null;
  drivetrainType: DrivetrainType;
  photoPath: string | null;
  plateNumber: string | null;
  vin: string | null;
  engineNumber: string | null;
  purchaseDate: string | null;
  purchasePriceCentavos: number | null;
  currentOdometerKm: number;
}

export type MotorcycleUpdate = Partial<NewMotorcycle> & {
  isArchived?: number;
  sortOrder?: number;
  odometerOffsetKm?: number;
  currentOdometerKm?: number;
};

const notDeleted = isNull(motorcycles.deletedAt);

export const MotorcycleRepository = {
  list(): MotorcycleRow[] {
    return guard('motorcycles.list', () =>
      db
        .select()
        .from(motorcycles)
        .where(notDeleted)
        .orderBy(asc(motorcycles.sortOrder), asc(motorcycles.createdAt))
        .all(),
    );
  },

  getById(id: string): MotorcycleRow | undefined {
    return guard('motorcycles.getById', () =>
      db
        .select()
        .from(motorcycles)
        .where(and(eq(motorcycles.id, id), notDeleted))
        .get(),
    );
  },

  /** Case-insensitive nickname clash among non-deleted bikes (excluding `excludeId` on edit). */
  nicknameExists(nickname: string, excludeId?: string): boolean {
    return guard('motorcycles.nicknameExists', () => {
      const clash = db
        .select({ id: motorcycles.id })
        .from(motorcycles)
        .where(
          and(
            notDeleted,
            sql`${motorcycles.nickname} = ${nickname} COLLATE NOCASE`,
            excludeId !== undefined ? ne(motorcycles.id, excludeId) : undefined,
          ),
        )
        .get();
      return clash !== undefined;
    });
  },

  insert(input: NewMotorcycle): MotorcycleRow {
    return guard('motorcycles.insert', () => {
      const row = {
        ...insertMeta(),
        ...input,
        odometerOffsetKm: 0,
        isArchived: 0,
        sortOrder: 0,
      };
      db.insert(motorcycles).values(row).run();
      return row as MotorcycleRow;
    });
  },

  update(id: string, changes: MotorcycleUpdate): void {
    guard('motorcycles.update', () =>
      db
        .update(motorcycles)
        .set({ ...changes, ...touchMeta() })
        .where(eq(motorcycles.id, id))
        .run(),
    );
  },

  softDelete(id: string): void {
    guard('motorcycles.softDelete', () =>
      db.update(motorcycles).set(softDeleteMeta()).where(eq(motorcycles.id, id)).run(),
    );
  },

  /** Odometer cache writer — call only from OdometerService inside its transaction (§6.1). */
  setOdometerCache(id: string, effectiveKm: number): void {
    guard('motorcycles.setOdometerCache', () =>
      db
        .update(motorcycles)
        .set({ currentOdometerKm: effectiveKm, ...touchMeta() })
        .where(eq(motorcycles.id, id))
        .run(),
    );
  },

  count(): number {
    return guard(
      'motorcycles.count',
      () =>
        db
          .select({ n: sql<number>`count(*)` })
          .from(motorcycles)
          .where(notDeleted)
          .get()?.n ?? 0,
    );
  },
};
