import { and, asc, eq, isNull } from 'drizzle-orm';

import { db } from '@/db/client';
import { buildPlanItems, type BuildPlanItemRow } from '@/db/schema';
import type { BuildPlanPriority } from '@/types/enums';
import { guard, insertMeta, softDeleteMeta, touchMeta } from './base';

export interface NewBuildPlanItem {
  buildId: string;
  name: string;
  estimatedPriceCentavos: number | null;
  photos: string[] | null;
  productLink: string | null;
  notes: string | null;
  priority: BuildPlanPriority;
}

export type BuildPlanItemUpdate = Partial<Omit<NewBuildPlanItem, 'buildId'>> & {
  isAcquired?: number;
  acquiredExpenseId?: string | null;
};

const notDeleted = isNull(buildPlanItems.deletedAt);

export const BuildPlanItemRepository = {
  listByBuild(buildId: string): BuildPlanItemRow[] {
    return guard('buildPlanItems.listByBuild', () =>
      db
        .select()
        .from(buildPlanItems)
        .where(and(eq(buildPlanItems.buildId, buildId), notDeleted))
        .orderBy(asc(buildPlanItems.sortOrder), asc(buildPlanItems.createdAt))
        .all(),
    );
  },

  getById(id: string): BuildPlanItemRow | undefined {
    return guard('buildPlanItems.getById', () =>
      db
        .select()
        .from(buildPlanItems)
        .where(and(eq(buildPlanItems.id, id), notDeleted))
        .get(),
    );
  },

  insert(input: NewBuildPlanItem): BuildPlanItemRow {
    return guard('buildPlanItems.insert', () => {
      const row = {
        ...insertMeta(),
        ...input,
        photos: input.photos !== null ? JSON.stringify(input.photos) : null,
        isAcquired: 0,
        acquiredExpenseId: null,
        sortOrder: 0,
      };
      db.insert(buildPlanItems).values(row).run();
      return row as BuildPlanItemRow;
    });
  },

  update(id: string, changes: BuildPlanItemUpdate): void {
    const { photos, ...rest } = changes;
    guard('buildPlanItems.update', () =>
      db
        .update(buildPlanItems)
        .set({
          ...rest,
          ...(photos !== undefined ? { photos: photos !== null ? JSON.stringify(photos) : null } : {}),
          ...touchMeta(),
        })
        .where(eq(buildPlanItems.id, id))
        .run(),
    );
  },

  softDelete(id: string): void {
    guard('buildPlanItems.softDelete', () =>
      db.update(buildPlanItems).set(softDeleteMeta()).where(eq(buildPlanItems.id, id)).run(),
    );
  },
};
