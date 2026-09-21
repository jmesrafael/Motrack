import { and, asc, desc, eq, isNotNull, isNull, like, lte, or } from 'drizzle-orm';

import { db } from '@/db/client';
import { documents, type DocumentRow } from '@/db/schema';
import type { DocType } from '@/types/enums';
import { guard, insertMeta, softDeleteMeta, touchMeta } from './base';

export interface DocFile {
  path: string;
  mimeType: string;
  size: number;
}

export interface NewDocument {
  motorcycleId: string | null;
  docType: DocType;
  title: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  expiryDate: string | null;
  notes: string | null;
  documentNumber: string | null;
  link: string | null;
  /** Images beyond the first (item 20), stored as JSON. */
  extraFiles: DocFile[] | null;
}

export type DocumentUpdate = Partial<
  Pick<NewDocument, 'title' | 'expiryDate' | 'notes' | 'docType' | 'documentNumber' | 'link'>
>;

/** Every attached image as one ordered list: the primary file first, then extraFiles. */
export function allFiles(doc: Pick<DocumentRow, 'filePath' | 'mimeType' | 'fileSize' | 'extraFiles'>): DocFile[] {
  const primary: DocFile = { path: doc.filePath, mimeType: doc.mimeType, size: doc.fileSize };
  if (doc.extraFiles === null) {
    return [primary];
  }
  try {
    const parsed: unknown = JSON.parse(doc.extraFiles);
    const extras = Array.isArray(parsed) ? (parsed as DocFile[]) : [];
    return [primary, ...extras];
  } catch {
    return [primary];
  }
}

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
      const row = {
        ...insertMeta(),
        ...input,
        extraFiles: input.extraFiles !== null ? JSON.stringify(input.extraFiles) : null,
      };
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

  /** Replaces the full ordered image list (item 20: add/replace/remove); `files[0]` becomes the primary file. */
  updateFiles(id: string, files: readonly DocFile[]): void {
    guard('documents.updateFiles', () => {
      const [primary, ...extras] = files;
      if (primary === undefined) {
        return;
      }
      db.update(documents)
        .set({
          filePath: primary.path,
          mimeType: primary.mimeType,
          fileSize: primary.size,
          extraFiles: extras.length > 0 ? JSON.stringify(extras) : null,
          ...touchMeta(),
        })
        .where(eq(documents.id, id))
        .run();
    });
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
