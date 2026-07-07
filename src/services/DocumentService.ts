/**
 * Document import/store/delete + metadata (FEATURE_SPECIFICATIONS.md §11,
 * DATA_FLOW.md §6). Files are copied into app-private storage; rows keep
 * relative paths only.
 */

import { DocumentRepository } from '@/db/repositories/DocumentRepository';
import type { DocumentRow } from '@/db/schema';
import { emitDomainEvent } from '@/lib/events';
import { log } from '@/lib/log';
import { appError, err, ok, type Result } from '@/lib/result';
import { newUuid } from '@/lib/uuid';
import { FileAdapter } from './adapters/files';
import { runTx } from './MaintenanceService';
import { documentInput, type DocumentInput } from './validation/schemas';
import { guardService, validateWith } from './serviceUtils';

export interface PickedFile {
  uri: string;
  name: string;
  mimeType: string;
  size: number;
}

export const DocumentService = {
  importDocument(file: PickedFile, input: unknown): Result<DocumentRow> {
    const parsed = validateWith(documentInput, input);
    if (!parsed.ok) {
      return parsed;
    }
    const value: DocumentInput = parsed.value;
    return guardService('document.import', () => {
      const fileId = newUuid();
      let stored;
      try {
        stored = FileAdapter.importFile(file.uri, fileId, file.name);
      } catch {
        log.error('document.import.fileError');
        return err(
          appError('FileError', 'document.copyFailed', 'Could not store the file — check free space'),
        );
      }
      const result = runTx(() =>
        DocumentRepository.insert({
          motorcycleId: value.motorcycleId,
          docType: value.docType,
          title: value.title,
          filePath: stored.relativePath,
          mimeType: file.mimeType,
          fileSize: stored.size > 0 ? stored.size : file.size,
          expiryDate: value.expiryDate,
          notes: value.notes,
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
        });
      });
      if (result.ok) {
        emitDomainEvent('document:changed', { entityId: documentId });
      }
      return result.ok ? ok(undefined) : result;
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
