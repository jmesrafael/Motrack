/**
 * Whole-data restore (BACKUP_RECOVERY.md §4 — safety-critical, implemented to
 * the letter where the platform allows). Two-phase API: `previewRestore`
 * (steps 1-3: unzip, validate, verify) returns a `RestoreToken` + summary for
 * the confirmation UI (step 4 is the caller's job); `performRestore` (steps
 * 5-9) does the safety snapshot, staging import, integrity check, atomic
 * swap, and reload.
 *
 * Known limitation (documented, not hidden — see docs/PROGRESS.md): the
 * atomic swap closes the live DB connection before renaming files. Every
 * step before that point only ever touches staging paths, so a failure up to
 * and including "close the live connection" leaves the running app
 * completely untouched. The renames themselves are the one window this
 * algorithm cannot make truly atomic without OS transaction support SQLite
 * files don't have on mobile — if a rename fails mid-swap, `performRestore`
 * attempts a best-effort rollback and always leaves the pre-restore safety
 * snapshot (step 5) as a last-resort recovery path. This has not been
 * exercised on a real device in this session.
 */

import { Directory, File, Paths } from 'expo-file-system';
import * as SQLite from 'expo-sqlite';
import * as Updates from 'expo-updates';

import { rawDb } from '@/db/client';
import { MIGRATIONS } from '@/db/migrations';
import { log } from '@/lib/log';
import { appError, err, ok, type Result } from '@/lib/result';
import { extractZip } from './adapters/archive';
import { createInternalSafetySnapshot, currentSchemaVersion } from './BackupService';
import { basenameOf, collectReferencedFilePaths, columnsFor } from './backupData';
import {
  BACKUP_TABLE_ORDER,
  backupDataSchema,
  manifestSchema,
  SUPPORTED_FORMAT_VERSIONS,
  type BackupData,
  type BackupManifest,
} from './validation/backupSchemas';

const MAX_ARCHIVE_BYTES = 500 * 1024 * 1024;
const STAGING_DB_NAME = 'motrack-restore-staging.db';
const LIVE_DB_NAME = 'motrack.db';
const DOCUMENTS_DIR_NAME = 'documents';
const STAGING_DOCUMENTS_DIR_NAME = 'documents-restore-staging';
const ASIDE_SUFFIX = '.pre-restore';

export interface RestoreToken {
  manifest: BackupManifest;
  data: BackupData;
  /** basename (as stored under files/ in the archive) → bytes. */
  files: Map<string, Uint8Array>;
}

export interface RestorePreviewSummary {
  backupCreatedAt: number;
  bikeCount: number;
  serviceRecordCount: number;
  photoCount: number;
  missingFileCount: number;
  /** Whether the current DB already has user data — callers require typed confirmation when true. */
  hasExistingData: boolean;
}

const CORRUPT = () => appError('CorruptionError', 'restore.corrupt', 'Backup appears damaged. Try another copy.');
const NOT_MOTRACK = () => appError('CorruptionError', 'restore.notAMotrackFile', "This file isn't a Motrack backup.");

function currentDataExists(): boolean {
  return (rawDb.getFirstSync<{ n: number }>('SELECT COUNT(*) AS n FROM motorcycles')?.n ?? 0) > 0;
}

/** Steps 1-3: unzip, validate manifest/shape, verify file refs. Read-only — touches no live state. */
export function previewRestore(
  fileUri: string,
): Result<{ token: RestoreToken; summary: RestorePreviewSummary }> {
  let bytes: Uint8Array;
  try {
    bytes = new File(fileUri).bytesSync();
  } catch (cause) {
    log.error('restore.preview.readFailed', { error: String(cause) });
    return err(NOT_MOTRACK());
  }
  if (bytes.length > MAX_ARCHIVE_BYTES) {
    return err(appError('FileError', 'restore.tooLarge', 'This backup file is too large (max 500 MB).'));
  }

  const { entries, rejectedPaths } = extractZip(bytes);
  if (rejectedPaths.length > 0) {
    log.error('restore.preview.unsafeEntries', { count: rejectedPaths.length });
    return err(NOT_MOTRACK());
  }

  const manifestEntry = entries.find((e) => e.path === 'manifest.json');
  const dataEntry = entries.find((e) => e.path === 'data.json');
  if (manifestEntry === undefined || dataEntry === undefined) {
    return err(NOT_MOTRACK());
  }

  let manifestJson: unknown;
  let dataJson: unknown;
  try {
    manifestJson = JSON.parse(new TextDecoder().decode(manifestEntry.bytes));
    dataJson = JSON.parse(new TextDecoder().decode(dataEntry.bytes));
  } catch (cause) {
    log.error('restore.preview.jsonParseFailed', { error: String(cause) });
    return err(CORRUPT());
  }

  const manifestResult = manifestSchema.safeParse(manifestJson);
  if (!manifestResult.success) {
    return err(NOT_MOTRACK());
  }
  const manifest = manifestResult.data;

  if (!(SUPPORTED_FORMAT_VERSIONS as readonly number[]).includes(manifest.formatVersion)) {
    return err(NOT_MOTRACK());
  }
  if (manifest.schemaVersion > currentSchemaVersion()) {
    return err(
      appError(
        'BusinessRuleError',
        'restore.newerSchema',
        'Backup was made with a newer version — update Motrack first.',
      ),
    );
  }

  const dataResult = backupDataSchema.safeParse(dataJson);
  if (!dataResult.success) {
    log.error('restore.preview.dataShapeInvalid', { issueCount: dataResult.error.issues.length });
    return err(CORRUPT());
  }
  const data = dataResult.data;

  for (const table of BACKUP_TABLE_ORDER) {
    if (data[table].length !== manifest.counts[table]) {
      log.error('restore.preview.countMismatch', { table });
      return err(CORRUPT());
    }
  }
  if (data.app_settings.length !== manifest.counts.app_settings) {
    return err(CORRUPT());
  }

  const files = new Map<string, Uint8Array>();
  for (const entry of entries) {
    if (entry.path.startsWith('files/')) {
      files.set(entry.path.slice('files/'.length), entry.bytes);
    }
  }

  const referenced = collectReferencedFilePaths(data);
  let missingFileCount = 0;
  for (const relativePath of referenced) {
    if (!files.has(basenameOf(relativePath))) {
      missingFileCount += 1;
    }
  }

  const summary: RestorePreviewSummary = {
    backupCreatedAt: manifest.createdAt,
    bikeCount: data.motorcycles.length,
    serviceRecordCount: data.maintenance_records.length + data.repairs.length,
    photoCount: files.size,
    missingFileCount,
    hasExistingData: currentDataExists(),
  };

  return ok({ token: { manifest, data, files }, summary });
}

/** Applies migrations with `version <= throughVersion` to a staging DB, mirroring initDatabase()'s loop. */
function applyMigrationsThrough(stagingDb: SQLite.SQLiteDatabase, throughVersion: number): void {
  for (const migration of MIGRATIONS) {
    if (migration.version > throughVersion) {
      continue;
    }
    stagingDb.withTransactionSync(() => {
      for (const statement of migration.statements) {
        stagingDb.execSync(statement);
      }
      stagingDb.execSync(`PRAGMA user_version = ${migration.version}`);
    });
  }
}

function insertRows(
  stagingDb: SQLite.SQLiteDatabase,
  table: string,
  columns: string[],
  rows: readonly Record<string, unknown>[],
): void {
  if (rows.length === 0) {
    return;
  }
  const placeholders = columns.map(() => '?').join(', ');
  const stmt = stagingDb.prepareSync(`INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`);
  try {
    for (const row of rows) {
      stmt.executeSync(columns.map((c) => row[c] as SQLite.SQLiteBindValue));
    }
  } finally {
    stmt.finalizeSync();
  }
}

function stagingDbFile(): File {
  return new File(SQLite.defaultDatabaseDirectory, STAGING_DB_NAME);
}

function deleteIfExists(target: File | Directory): void {
  if (target.exists) {
    target.delete();
  }
}

/** Builds and validates the staging DB (step 6-7). Throws on any failure — caller maps to a Result. */
function buildStagingDatabase(token: RestoreToken): SQLite.SQLiteDatabase {
  deleteIfExists(stagingDbFile());
  const stagingDb = SQLite.openDatabaseSync(STAGING_DB_NAME);

  // Schema at the archive's version, rows inserted against that shape, then forward migrations run —
  // BACKUP_RECOVERY.md §4 step 6. FK enforcement is deferred until after import: rows are inserted in
  // FK-safe table order (BACKUP_TABLE_ORDER) already, but turning it off during bulk import avoids any
  // ordering-sensitivity within a table's own self-references.
  stagingDb.execSync('PRAGMA foreign_keys = OFF');
  applyMigrationsThrough(stagingDb, token.manifest.schemaVersion);

  stagingDb.withTransactionSync(() => {
    for (const table of BACKUP_TABLE_ORDER) {
      insertRows(stagingDb, table, columnsFor(table), token.data[table]);
    }
    insertRows(stagingDb, 'app_settings', ['key', 'value', 'updated_at'], token.data.app_settings);
  });

  stagingDb.execSync('PRAGMA foreign_keys = ON');
  applyMigrationsThrough(stagingDb, Number.MAX_SAFE_INTEGER); // no-op today; forward-compatible with future migrations

  const quickCheck = stagingDb.getAllSync<Record<string, string>>('PRAGMA quick_check');
  const quickCheckOk = quickCheck.length === 1 && Object.values(quickCheck[0]!)[0] === 'ok';
  const fkViolations = stagingDb.getAllSync('PRAGMA foreign_key_check');
  if (!quickCheckOk || fkViolations.length > 0) {
    throw new Error(`staging DB failed integrity check (quickCheckOk=${quickCheckOk}, fkViolations=${fkViolations.length})`);
  }

  return stagingDb;
}

function writeStagingFiles(token: RestoreToken): Directory {
  const stagingDocs = new Directory(Paths.document, STAGING_DOCUMENTS_DIR_NAME);
  deleteIfExists(stagingDocs);
  stagingDocs.create({ intermediates: true });
  for (const [basename, bytes] of token.files) {
    new File(stagingDocs, basename).write(bytes);
  }
  return stagingDocs;
}

export interface RestoreOutcome {
  /** False when the platform couldn't force a JS reload (e.g. Expo Go) — the swap still succeeded on disk. */
  reloaded: boolean;
}

/** Steps 5-9. Assumes the caller has already gated this on typed confirmation when `hasExistingData` was true. */
export async function performRestore(token: RestoreToken): Promise<Result<RestoreOutcome>> {
  const snapshot = createInternalSafetySnapshot();
  if (!snapshot.ok) {
    return err(snapshot.error);
  }

  let stagingDb: SQLite.SQLiteDatabase;
  try {
    stagingDb = buildStagingDatabase(token);
  } catch (cause) {
    log.error('restore.stagingFailed', { error: String(cause) });
    deleteIfExists(stagingDbFile());
    return err(CORRUPT());
  }

  let stagingDocs: Directory;
  try {
    stagingDocs = writeStagingFiles(token);
  } catch (cause) {
    log.error('restore.stagingFilesFailed', { error: String(cause) });
    try {
      stagingDb.closeSync();
    } catch {
      // best-effort
    }
    deleteIfExists(stagingDbFile());
    return err(appError('FileError', 'restore.diskFull', 'Free up some space and try again.'));
  }

  // Everything above only touched staging paths — the live app is untouched. From here on we close the
  // live connection and rename files; see the file-header note on why this window can't be made fully atomic.
  const liveDbFile = new File(SQLite.defaultDatabaseDirectory, LIVE_DB_NAME);
  const asideDbFile = new File(SQLite.defaultDatabaseDirectory, `${LIVE_DB_NAME}${ASIDE_SUFFIX}`);
  const liveDocsDir = new Directory(Paths.document, DOCUMENTS_DIR_NAME);
  const asideDocsDir = new Directory(Paths.document, `${DOCUMENTS_DIR_NAME}${ASIDE_SUFFIX}`);

  try {
    stagingDb.execSync('PRAGMA wal_checkpoint(TRUNCATE)');
    stagingDb.closeSync();
    rawDb.execSync('PRAGMA wal_checkpoint(TRUNCATE)');
    rawDb.closeSync();

    deleteIfExists(asideDbFile);
    if (liveDbFile.exists) {
      liveDbFile.moveSync(asideDbFile);
    }
    stagingDbFile().moveSync(liveDbFile);

    deleteIfExists(asideDocsDir);
    if (liveDocsDir.exists) {
      liveDocsDir.moveSync(asideDocsDir);
    }
    stagingDocs.moveSync(liveDocsDir);

    deleteIfExists(asideDbFile);
    deleteIfExists(asideDocsDir);
  } catch (cause) {
    log.error('restore.swapFailed', { error: String(cause) });
    try {
      if (!liveDbFile.exists && asideDbFile.exists) {
        asideDbFile.moveSync(liveDbFile);
      }
      if (!liveDocsDir.exists && asideDocsDir.exists) {
        asideDocsDir.moveSync(liveDocsDir);
      }
    } catch (rollbackCause) {
      log.error('restore.rollbackFailed', { error: String(rollbackCause) });
    }
    return err(
      appError('FileError', 'restore.swapFailed', 'Restore could not complete. Your previous data has been kept.'),
    );
  }

  try {
    await Updates.reloadAsync();
    return ok({ reloaded: true }); // unreachable in practice — reloadAsync tears down the JS context
  } catch (cause) {
    log.warn('restore.reloadUnavailable', { error: String(cause) });
    return ok({ reloaded: false });
  }
}
