/**
 * Pure backup/restore data helpers — no expo-file-system/expo-sqlite imports,
 * so this is fully unit-testable (BackupService.ts and RestoreService.ts do
 * the actual I/O and import from here).
 */

import { BACKUP_TABLE_SCHEMAS, type BackupData, type BackupTableName } from './validation/backupSchemas';

/** Adds every string found in a JSON-array-of-strings column; malformed JSON in an existing row is not this function's problem to fix. */
function addJsonPathArray(paths: Set<string>, json: string | null): void {
  if (json === null) {
    return;
  }
  try {
    const parsed: unknown = JSON.parse(json);
    if (Array.isArray(parsed)) {
      for (const p of parsed) {
        if (typeof p === 'string') {
          paths.add(p);
        }
      }
    }
  } catch {
    // ignore
  }
}

/** Photo/document relative paths referenced by the data set (for packing + restore verification). */
export function collectReferencedFilePaths(data: BackupData): string[] {
  const paths = new Set<string>();
  for (const doc of data.documents) {
    paths.add(doc.file_path);
    addJsonPathArray(paths, doc.extra_files);
  }
  for (const bike of data.motorcycles) {
    if (bike.photo_path !== null) {
      paths.add(bike.photo_path);
    }
  }
  for (const record of data.maintenance_records) {
    if (record.photo_path !== null) {
      paths.add(record.photo_path);
    }
  }
  for (const expense of data.expenses) {
    addJsonPathArray(paths, expense.images);
  }
  for (const repair of data.repairs) {
    addJsonPathArray(paths, repair.photo_paths);
  }
  for (const build of data.builds) {
    if (build.cover_photo !== null) {
      paths.add(build.cover_photo);
    }
  }
  for (const planItem of data.build_plan_items) {
    addJsonPathArray(paths, planItem.photos);
  }
  return [...paths];
}

/** The basename a relative path (e.g. 'documents/<uuid>.jpg') is stored under in the archive's files/ dir. */
export function basenameOf(relativePath: string): string {
  return relativePath.slice(relativePath.lastIndexOf('/') + 1);
}

/** Ordered column list for a table, derived from its Zod schema so there's one source of truth. */
export function columnsFor(table: BackupTableName): string[] {
  return Object.keys(BACKUP_TABLE_SCHEMAS[table].shape);
}
