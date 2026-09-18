/**
 * Zip archive adapter (BACKUP_RECOVERY.md §3) — the only module that touches
 * the zip library (fflate). Whole-archive in memory (Uint8Array), not the
 * streaming-to-disk shape ADR-026 calls for — see the scope note in
 * BackupService.ts / docs/PROGRESS.md. Extraction sanitizes entry names
 * (SECURITY.md §5): no traversal, no absolute paths, files only.
 */

import { unzipSync, zipSync, type Zippable } from 'fflate';

export interface ArchiveEntry {
  /** Forward-slash relative path inside the archive, e.g. 'data.json' or 'files/<uuid>.jpg'. */
  path: string;
  bytes: Uint8Array;
}

export function buildZip(entries: readonly ArchiveEntry[]): Uint8Array {
  const zippable: Zippable = {};
  for (const entry of entries) {
    zippable[entry.path] = entry.bytes;
  }
  return zipSync(zippable, { level: 6 });
}

/** Rejects traversal (`..`), absolute paths, and empty/directory-only entries. */
function isSafeEntryPath(path: string): boolean {
  if (path === '' || path.endsWith('/')) {
    return false;
  }
  if (path.startsWith('/') || path.startsWith('\\')) {
    return false;
  }
  const segments = path.split(/[/\\]/);
  return segments.every((segment) => segment !== '..' && segment !== '.');
}

export interface ExtractResult {
  entries: ArchiveEntry[];
  /** Entry names present in the zip but rejected as unsafe — callers should treat this as corruption. */
  rejectedPaths: string[];
}

export function extractZip(zipBytes: Uint8Array): ExtractResult {
  const unzipped = unzipSync(zipBytes);
  const entries: ArchiveEntry[] = [];
  const rejectedPaths: string[] = [];
  for (const [path, bytes] of Object.entries(unzipped)) {
    if (isSafeEntryPath(path)) {
      entries.push({ path, bytes });
    } else {
      rejectedPaths.push(path);
    }
  }
  return { entries, rejectedPaths };
}
