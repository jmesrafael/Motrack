import { basenameOf, collectReferencedFilePaths, columnsFor } from './backupData';
import type { BackupData } from './validation/backupSchemas';

function emptyBackupData(overrides: Partial<BackupData> = {}): BackupData {
  return {
    motorcycles: [],
    maintenance_schedules: [],
    maintenance_records: [],
    repairs: [],
    builds: [],
    expenses: [],
    fuel_logs: [],
    odometer_logs: [],
    documents: [],
    build_plan_items: [],
    app_settings: [],
    ...overrides,
  };
}

const syncCols = { created_at: 0, updated_at: 0, deleted_at: null };

describe('basenameOf', () => {
  test('extracts the filename from a relative path', () => {
    expect(basenameOf('documents/abc-123.jpg')).toBe('abc-123.jpg');
  });

  test('returns the whole string when there is no slash', () => {
    expect(basenameOf('abc-123.jpg')).toBe('abc-123.jpg');
  });
});

describe('columnsFor', () => {
  test('derives the exact column list from the Zod schema, in schema order', () => {
    expect(columnsFor('motorcycles')).toEqual([
      'id',
      'created_at',
      'updated_at',
      'deleted_at',
      'nickname',
      'brand',
      'model',
      'year',
      'drivetrain_type',
      'photo_path',
      'plate_number',
      'vin',
      'engine_number',
      'purchase_date',
      'purchase_price_centavos',
      'current_odometer_km',
      'odometer_offset_km',
      'is_archived',
      'sort_order',
    ]);
  });
});

describe('collectReferencedFilePaths', () => {
  test('collects document file_path (always present)', () => {
    const data = emptyBackupData({
      documents: [
        { id: 'd1', ...syncCols, motorcycle_id: 'b1', doc_type: 'orcr', title: 'OR/CR', file_path: 'documents/d1.jpg', mime_type: 'image/jpeg', file_size: 100, expiry_date: null, notes: null, document_number: null, link: null, extra_files: null },
      ],
    });
    expect(collectReferencedFilePaths(data)).toEqual(['documents/d1.jpg']);
  });

  test('collects optional photo_path/images fields, skipping nulls', () => {
    const data = emptyBackupData({
      motorcycles: [
        { id: 'b1', ...syncCols, nickname: 'Red', brand: 'Honda', model: 'Click', year: null, drivetrain_type: 'cvt', photo_path: 'documents/bike.jpg', plate_number: null, vin: null, engine_number: null, purchase_date: null, purchase_price_centavos: null, current_odometer_km: 0, odometer_offset_km: 0, is_archived: 0, sort_order: 0 },
      ],
      maintenance_records: [
        { id: 'r1', ...syncCols, motorcycle_id: 'b1', schedule_id: 's1', performed_date: '2026-01-01', odometer_km: null, service_type: 'replace', cost_centavos: null, brand: null, quantity: null, details: null, notes: null, photo_path: null, source: 'user' },
      ],
      expenses: [
        { id: 'e1', ...syncCols, motorcycle_id: 'b1', category: 'other', amount_centavos: 100, expense_date: '2026-01-01', notes: null, images: '["documents/receipt.jpg"]', build_id: null, schedule_id: null },
      ],
      builds: [
        { id: 'bd1', ...syncCols, motorcycle_id: 'b1', name: 'Build', description: null, cover_photo: 'documents/cover.jpg', budget_centavos: null, sort_order: 0 },
      ],
      build_plan_items: [
        { id: 'pi1', ...syncCols, build_id: 'bd1', name: 'Item', estimated_price_centavos: null, photos: '["documents/plan1.jpg"]', product_link: null, notes: null, priority: 'normal', is_acquired: 0, acquired_expense_id: null, sort_order: 0 },
      ],
    });
    expect(collectReferencedFilePaths(data).sort()).toEqual([
      'documents/bike.jpg',
      'documents/cover.jpg',
      'documents/plan1.jpg',
      'documents/receipt.jpg',
    ]);
  });

  test('parses repairs.photo_paths as a JSON array and ignores malformed JSON', () => {
    const goodRepair = { id: 'p1', ...syncCols, motorcycle_id: 'b1', title: 'Fix', repair_date: '2026-01-01', odometer_km: null, problem: null, diagnosis: null, solution: null, shop_name: null, cost_centavos: null, notes: null, photo_paths: '["documents/p1a.jpg","documents/p1b.jpg"]' };
    const badRepair = { ...goodRepair, id: 'p2', photo_paths: 'not json' };
    const data = emptyBackupData({ repairs: [goodRepair, badRepair] });
    expect(collectReferencedFilePaths(data).sort()).toEqual(['documents/p1a.jpg', 'documents/p1b.jpg']);
  });

  test('deduplicates paths referenced from multiple rows', () => {
    const doc = { id: 'd1', ...syncCols, motorcycle_id: 'b1', doc_type: 'orcr' as const, title: 'OR/CR', file_path: 'documents/shared.jpg', mime_type: 'image/jpeg', file_size: 100, expiry_date: null, notes: null, document_number: null, link: null, extra_files: null };
    const data = emptyBackupData({ documents: [doc, { ...doc, id: 'd2' }] });
    expect(collectReferencedFilePaths(data)).toEqual(['documents/shared.jpg']);
  });

  test('empty data set yields no paths', () => {
    expect(collectReferencedFilePaths(emptyBackupData())).toEqual([]);
  });
});
