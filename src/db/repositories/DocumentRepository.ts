import { and, asc, desc, eq, isNotNull, isNull, like, lte, or } from 'drizzle-orm';

import { db } from '@/db/client';
import { documents, type DocumentRow } from '@/db/schema';
import type { DocType } from '@/types/enums';
import { guard, insertMeta, softDeleteMeta, touchMeta } from './base';

export interface NewDocument {
  motorcycleId: string | null;
  docType: DocType;
  title: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  expiryDate: string | null;
  notes: string | null;
}

export type DocumentUpdate = Partial<Pick<NewDocument, 'title' | 'expiryDate' | 'notes' | 'docType'>>;

const notDeleted = isNull(documents.deletedAt);

export const DocumentRepository = {
  getById(id: string): DocumentRow | undefined {
    return guard('documents.getById', () =>
      db
        .select()
        .from(documents)
        .where(and(eq(documents.id, id), notDeleted))
        .get(),
    );
  },

  listAll(): DocumentRow[] {
    return guard('documents.listAll', () =>
      db
        .select()
        .from(documents)
        .where(notDeleted)
        .orderBy(asc(documents.motorcycleId), asc(documents.docType), desc(documents.createdAt))
        .all(),
    );
  },

  listByBike(motorcycleId: string): DocumentRow[] {
    return guard('documents.listByBike', () =>
      db
        .select()
        .from(documents)
        .where(and(eq(documents.motorcycleId, motorcycleId), notDeleted))
        .orderBy(asc(documents.docType), desc(documents.createdAt))
        .all(),
    );
  },

  /** Documents expiring on or before `date` (dashboard warnings, badges). */
  listExpiringBy(date: string): DocumentRow[] {
    return guard('documents.listExpiringBy', () =>
      db
        .select()
        .from(documents)
        .where(and(notDeleted, isNotNull(documents.expiryDate), lte(documents.expiryDate, date)))
        .orderBy(asc(documents.expiryDate))
        .all(),
    );
  },

  insert(input: NewDocument): DocumentRow {
    return guard('documents.insert', () => {
      const row = { ...insertMeta(), ...input };
      db.insert(documents).values(row).run();
      return row as DocumentRow;
    });
  },

  update(id: string, changes: DocumentUpdate): void {
    guard('documents.update', () =>
      db
        .update(documents)
        .set({ ...changes, ...touchMeta() })
        .where(eq(documents.id, id))
        .run(),
    );
  },

  softDelete(id: string): void {
    guard('documents.softDelete', () =>
      db.update(documents).set(softDeleteMeta()).where(eq(documents.id, id)).run(),
    );
  },

  softDeleteByBike(motorcycleId: string): void {
    guard('documents.softDeleteByBike', () =>
      db
        .update(documents)
        .set(softDeleteMeta())
        .where(and(eq(documents.motorcycleId, motorcycleId), notDeleted))
        .run(),
    );
  },

  search(query: string, limit: number): DocumentRow[] {
    const pattern = `%${query}%`;
    return guard('documents.search', () =>
      db
        .select()
        .from(documents)
        .where(and(notDeleted, or(like(documents.title, pattern), like(documents.notes, pattern))))
        .orderBy(desc(documents.createdAt))
        .limit(limit)
        .all(),
    );
  },
};
