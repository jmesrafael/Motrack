/**
 * Thin helper over FileAdapter for form-time image attachments (expense
 * receipts, Build cover photos, plan-item screenshots): the entity being
 * edited (a new expense, a not-yet-saved plan item) doesn't exist yet, so the
 * picked image is copied into app storage immediately and its relative path
 * carried in local form state until the entity itself is saved. FileAdapter
 * stays the only module that touches expo-file-system directly.
 */

import { newUuid } from '@/lib/uuid';
import { FileAdapter } from './adapters/files';

export const ImageStorage = {
  /** Copies a picked image (camera/library asset uri) into app storage and returns its relative path. */
  importPickedImage(uri: string, name: string): string {
    return FileAdapter.importFile(uri, newUuid(), name).relativePath;
  },

  uriFor(relativePath: string): string {
    return FileAdapter.uriFor(relativePath);
  },
};
