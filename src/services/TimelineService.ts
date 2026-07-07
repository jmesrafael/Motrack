/**
 * Activity history — generated automatically at read time from the underlying
 * tables (single source of truth; no manual timeline rows). Feeds the history
 * screen (FEATURE_SPECIFICATIONS.md §7) and the dashboard activity feed.
 */

import { rawDb } from '@/db/client';
import type { ComponentType } from '@/types/enums';

export type TimelineKind = 'maintenance' | 'repair' | 'fuel' | 'expense' | 'document' | 'bike';

export interface TimelineEntry {
  id: string;
  kind: TimelineKind;
  motorcycleId: string;
  date: string;
  /** component_type / custom name / repair title / station / category / doc title. */
  title: string;
  odometerKm: number | null;
  amountCentavos: number | null;
  componentType: ComponentType | null;
}

export interface TimelineFilter {
  /** Maintenance + repairs only (the S-14 history view) vs everything. */
  scope: 'history' | 'all';
  componentType?: ComponentType;
  year?: string;
  limit?: number;
  offset?: number;
}

interface RawEntry {
  id: string;
  kind: TimelineKind;
  motorcycle_id: string;
  date: string;
  title: string;
  odometer_km: number | null;
  amount_centavos: number | null;
  component_type: string | null;
}

export function loadTimeline(motorcycleId: string, filter: TimelineFilter): TimelineEntry[] {
  const parts: string[] = [];
  const params: (string | number)[] = [];

  const componentClause = filter.componentType !== undefined ? 'AND s.component_type = ?' : '';

  parts.push(`
    SELECT r.id AS id, 'maintenance' AS kind, r.motorcycle_id AS motorcycle_id,
           r.performed_date AS date,
           CASE WHEN s.component_type = 'custom' THEN COALESCE(s.custom_name, 'custom')
                ELSE s.component_type END AS title,
           r.odometer_km AS odometer_km, r.cost_centavos AS amount_centavos,
           s.component_type AS component_type
      FROM maintenance_records r JOIN maintenance_schedules s ON s.id = r.schedule_id
     WHERE r.deleted_at IS NULL AND r.motorcycle_id = ? ${componentClause}`);
  params.push(motorcycleId);
  if (filter.componentType !== undefined) {
    params.push(filter.componentType);
  }

  if (filter.componentType === undefined) {
    parts.push(`
      SELECT p.id, 'repair', p.motorcycle_id, p.repair_date, p.title,
             p.odometer_km, p.cost_centavos, NULL
        FROM repairs p WHERE p.deleted_at IS NULL AND p.motorcycle_id = ?`);
    params.push(motorcycleId);

    if (filter.scope === 'all') {
      parts.push(`
        SELECT f.id, 'fuel', f.motorcycle_id, f.fuel_date,
               COALESCE(f.station, 'fuel'), f.odometer_km, f.total_cost_centavos, NULL
          FROM fuel_logs f WHERE f.deleted_at IS NULL AND f.motorcycle_id = ?`);
      params.push(motorcycleId);
      parts.push(`
        SELECT e.id, 'expense', e.motorcycle_id, e.expense_date, e.category,
               NULL, e.amount_centavos, NULL
          FROM expenses e WHERE e.deleted_at IS NULL AND e.motorcycle_id = ?`);
      params.push(motorcycleId);
      parts.push(`
        SELECT d.id, 'document', d.motorcycle_id, substr(d.created_at_date, 1, 10), d.title,
               NULL, NULL, NULL
          FROM (SELECT id, motorcycle_id, title, deleted_at,
                       date(created_at / 1000, 'unixepoch', 'localtime') AS created_at_date
                  FROM documents) d
         WHERE d.deleted_at IS NULL AND d.motorcycle_id = ?`);
      params.push(motorcycleId);
    }
  }

  let sql = `SELECT * FROM (${parts.join(' UNION ALL ')})`;
  const outer: string[] = [];
  if (filter.year !== undefined) {
    outer.push(`substr(date, 1, 4) = ?`);
    params.push(filter.year);
  }
  if (outer.length > 0) {
    sql += ` WHERE ${outer.join(' AND ')}`;
  }
  sql += ` ORDER BY date DESC LIMIT ? OFFSET ?`;
  params.push(filter.limit ?? 50, filter.offset ?? 0);

  return rawDb.getAllSync<RawEntry>(sql, params).map((r) => ({
    id: r.id,
    kind: r.kind,
    motorcycleId: r.motorcycle_id,
    date: r.date,
    title: r.title,
    odometerKm: r.odometer_km,
    amountCentavos: r.amount_centavos,
    componentType: (r.component_type as ComponentType | null) ?? null,
  }));
}
