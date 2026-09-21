import { backupDataSchema, manifestSchema, SUPPORTED_FORMAT_VERSIONS } from './backupSchemas';

function validManifest() {
  return {
    formatVersion: 1,
    appVersion: '1.0.0',
    schemaVersion: 1,
    createdAt: 1_700_000_000_000,
    counts: { motorcycles: 1 },
    fileCount: 0,
    totalFileBytes: 0,
  };
}

describe('manifestSchema', () => {
  test('accepts a well-formed manifest', () => {
    expect(manifestSchema.safeParse(validManifest()).success).toBe(true);
  });

  test('rejects a missing required field', () => {
    const { schemaVersion, ...rest } = validManifest();
    void schemaVersion;
    expect(manifestSchema.safeParse(rest).success).toBe(false);
  });

  test('rejects a non-numeric formatVersion', () => {
    expect(manifestSchema.safeParse({ ...validManifest(), formatVersion: '1' }).success).toBe(false);
  });

  test('SUPPORTED_FORMAT_VERSIONS currently contains exactly [1]', () => {
    expect(SUPPORTED_FORMAT_VERSIONS).toEqual([1]);
  });
});

describe('backupDataSchema', () => {
  function emptyData() {
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
    };
  }

  test('accepts an all-empty data set', () => {
    expect(backupDataSchema.safeParse(emptyData()).success).toBe(true);
  });

  test('rejects a table replaced with the wrong shape', () => {
    const bad = { ...emptyData(), motorcycles: 'not-an-array' };
    expect(backupDataSchema.safeParse(bad).success).toBe(false);
  });

  test('rejects a row missing a required column', () => {
    const bad = {
      ...emptyData(),
      motorcycles: [{ id: 'b1', created_at: 0, updated_at: 0, deleted_at: null /* missing nickname etc. */ }],
    };
    expect(backupDataSchema.safeParse(bad).success).toBe(false);
  });

  test('rejects a row with a wrong-typed field (string where int expected)', () => {
    const bad = {
      ...emptyData(),
      motorcycles: [
        {
          id: 'b1',
          created_at: 0,
          updated_at: 0,
          deleted_at: null,
          nickname: 'Red',
          brand: 'Honda',
          model: 'Click',
          year: null,
          drivetrain_type: 'cvt',
          photo_path: null,
          plate_number: null,
          vin: null,
          engine_number: null,
          purchase_date: null,
          purchase_price_centavos: null,
          current_odometer_km: '5000', // should be a number
          odometer_offset_km: 0,
          is_archived: 0,
          sort_order: 0,
        },
      ],
    };
    expect(backupDataSchema.safeParse(bad).success).toBe(false);
  });

  test('accepts nullable fields as null', () => {
    const data = {
      ...emptyData(),
      documents: [
        {
          id: 'd1',
          created_at: 0,
          updated_at: 0,
          deleted_at: null,
          motorcycle_id: null, // rider-level document, no bike
          doc_type: 'license',
          title: 'License',
          file_path: 'documents/x.jpg',
          mime_type: 'image/jpeg',
          file_size: 100,
          expiry_date: null,
          notes: null,
          document_number: null,
          link: null,
          extra_files: null,
        },
      ],
    };
    expect(backupDataSchema.safeParse(data).success).toBe(true);
  });
});
