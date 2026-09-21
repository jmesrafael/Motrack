/**
 * Document import/store/delete + metadata (FEATURE_SPECIFICATIONS.md §11,
 * DATA_FLOW.md §6). Files are copied into app-private storage; rows keep
 * relative paths only.
 */

import { DocumentRepository, type DocFile } from '@/db/repositories/DocumentRepository';
import type { DocumentRow } from '@/db/schema';
import { emitDomainEvent } from '@/lib/events';
import { log } from '@/lib/log';
import type { PickedAsset } from '@/lib/pickers';
import { appError, err, ok, type Result } from '@/lib/result';
import { newUuid } from '@/lib/uuid';
import { FileAdapter } from './adapters/files';
import { runTx } from './MaintenanceService';
import { documentInput, type DocumentInput } from './validation/schemas';
import { guardService, validateWith } from './serviceUtils';

/** Same shape as the picker's PickedAsset — kept as its own export so callers don't need to know this service is picker-agnostic. */
export type PickedFile = PickedAsset;

function storeFile(file: PickedFile): Result<DocFile> {
  try {
    const stored = FileAdapter.importFile(file.uri, newUuid(), file.name);
    return ok({ path: stored.relativePath, mimeType: file.mimeType, size: stored.size > 0 ? stored.size : file.size });
  } catch {
    log.error('document.import.fileError');
    return err(appError('FileError', 'document.copyFailed', 'Could not store the file. Check free space.'));
  }
}

export const DocumentService = {
  importDocument(files: readonly PickedFile[], input: unknown): Result<DocumentRow> {
    const parsed = validateWith(documentInput, input);
    if (!parsed.ok) {
      return parsed;
    }
    const value: DocumentInput = parsed.value;
    return guardService('document.import', () => {
      const stored: DocFile[] = [];
      for (const file of files) {
        const result = storeFile(file);
        if (!result.ok) {
          return result;
        }
        stored.push(result.value);
      }
      const [primary, ...extras] = stored;
      if (primary === undefined) {
        return err(appError('ValidationError', 'document.noFile', 'Pick a photo or file first'));
      }
      const result = runTx(() =>
        DocumentRepository.insert({
          motorcycleId: value.motorcycleId,
          docType: value.docType,
          title: value.title,
          filePath: primary.path,
          mimeType: primary.mimeType,
          fileSize: primary.size,
          expiryDate: value.expiryDate,
          notes: value.notes,
          documentNumber: value.documentNumber,
          link: value.link,
          extraFiles: extras.length > 0 ? extras : null,
        }),
      );
      if (result.ok) {
        emitDomainEvent('document:changed', {
          bikeId: value.motorcycleId ?? undefined,
          entityId: result.value.id,
        });
      }
      return result;
    });
  },

  updateMetadata(documentId: string, input: unknown): Result<void> {
    const parsed = validateWith(documentInput, input);
    if (!parsed.ok) {
      return parsed;
    }
    const value = parsed.value;
    return guardService('document.update', () => {
      const existing = DocumentRepository.getById(documentId);
      if (existing === undefined) {
        return err(appError('BusinessRuleError', 'document.notFound', 'Document not found'));
      }
      const result = runTx(() => {
        DocumentRepository.update(documentId, {
          docType: value.docType,
          title: value.title,
          expiryDate: value.expiryDate,
          notes: value.notes,
          documentNumber: value.documentNumber,
          link: value.link,
        });
      });
      if (result.ok) {
        emitDomainEvent('document:changed', { entityId: documentId });
      }
      return result.ok ? ok(undefined) : result;
    });
  },

  /**
   * Add/replace/remove images (item 20). Caller supplies the full new ordered
   * list, mixing already-stored files (kept as-is, never re-copied) with
   * freshly picked ones (uri present, imported now) — so removing one image
   * and keeping the rest doesn't duplicate storage for the untouched ones.
   */
  updateFiles(documentId: string, files: readonly (DocFile | PickedFile)[]): Result<void> {
    return guardService('document.updateFiles', () => {
      const existing = DocumentRepository.getById(documentId);
      if (existing === undefined) {
        return err(appError('BusinessRuleError', 'document.notFound', 'Document not found'));
      }
      const stored: DocFile[] = [];
      for (const file of files) {
        if ('uri' in file) {
          const result = storeFile(file);
          if (!result.ok) {
            return result;
          }
          stored.push(result.value);
        } else {
          stored.push(file);
        }
      }
      if (stored.length === 0) {
        return err(appError('ValidationError', 'document.noFile', 'A document needs at least one photo or file'));
      }
      runTx(() => DocumentRepository.updateFiles(documentId, stored));
      emitDomainEvent('document:changed', { entityId: documentId });
      return ok(undefined);
    });
  },

  /** Soft delete; the file stays for the 30-day recovery window (DATA_FLOW.md §6). */
  deleteDocument(documentId: string): Result<void> {
    return guardService('document.delete', () => {
      const existing = DocumentRepository.getById(documentId);
      if (existing === undefined) {
        return err(appError('BusinessRuleError', 'document.notFound', 'Document not found'));
      }
      const result = runTx(() => {
        DocumentRepository.softDelete(documentId);
      });
      if (result.ok) {
        emitDomainEvent('document:changed', { entityId: documentId });
      }
      return result.ok ? ok(undefined) : result;
    });
  },

  viewUri(doc: DocumentRow): string {
    return FileAdapter.uriFor(doc.filePath);
  },
};
