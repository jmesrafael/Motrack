import { and, asc, eq, isNull } from 'drizzle-orm';

import { db } from '@/db/client';
import { builds, type BuildRow } from '@/db/schema';
import { guard, insertMeta, softDeleteMeta, touchMeta } from './base';

export interface NewBuild {
  motorcycleId: string;
  name: string;
  description: string | null;
  coverPhoto: string | null;
  budgetCentavos: number | null;
}

export type BuildUpdate = Partial<Omit<NewBuild, 'motorcycleId'>>;

const notDeleted = isNull(builds.deletedAt);

export const BuildRepository = {
  listByBike(motorcycleId: string): BuildRow[] {
    return guard('builds.listByBike', () =>
      db
        .select()
        .from(builds)
        .where(and(eq(builds.motorcycleId, motorcycleId), notDeleted))
        .orderBy(asc(builds.sortOrder), asc(builds.createdAt))
        .all(),
    );
  },

  getById(id: string): BuildRow | undefined {
    return guard('builds.getById', () =>
      db
        .select()
        .from(builds)
        .where(and(eq(builds.id, id), notDeleted))
        .get(),
    );
  },

  insert(input: NewBuild): BuildRow {
    return guard('builds.insert', () => {
      const row = { ...insertMeta(), ...input, sortOrder: 0 };
      db.insert(builds).values(row).run();
      return row as BuildRow;
    });
  },

  update(id: string, changes: BuildUpdate): void {
    guard('builds.update', () =>
      db
        .update(builds)
        .set({ ...changes, ...touchMeta() })
        .where(eq(builds.id, id))
        .run(),
    );
  },

  softDelete(id: string): void {
    guard('builds.softDelete', () => db.update(builds).set(softDeleteMeta()).where(eq(builds.id, id)).run());
  },
};
