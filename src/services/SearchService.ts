/**
 * Global search across motorcycles, maintenance, documents, expenses, fuel,
 * repairs, and notes. Repository LIKE queries, merged and date-sorted.
 */

import { rawDb } from '@/db/client';
import { DocumentRepository } from '@/db/repositories/DocumentRepository';
import { ExpenseRepository } from '@/db/repositories/ExpenseRepository';
import { FuelRepository } from '@/db/repositories/FuelRepository';
import { RepairRepository } from '@/db/repositories/RepairRepository';

export type SearchResultKind =
  | 'motorcycle'
  | 'maintenance'
  | 'repair'
  | 'fuel'
  | 'expense'
  | 'document';

export interface SearchResult {
  kind: SearchResultKind;
  id: string;
  motorcycleId: string | null;
  /** Primary display line (nickname, component, title…). */
  title: string;
  /** Secondary line (notes excerpt, brand, station…). */
  subtitle: string | null;
  date: string;
}

const PER_SOURCE_LIMIT = 15;

export function searchAll(query: string): SearchResult[] {
  const q = query.trim();
  if (q.length < 2) {
    return [];
  }
  const pattern = `%${q}%`;
  const results: SearchResult[] = [];

  const bikes = rawDb.getAllSync<{
    id: string;
    nickname: string;
    brand: string;
    model: string;
    plate_number: string | null;
  }>(
    `SELECT id, nickname, brand, model, plate_number FROM motorcycles
     WHERE deleted_at IS NULL AND (nickname LIKE ? OR brand LIKE ? OR model LIKE ? OR plate_number LIKE ?)
     LIMIT ?`,
    [pattern, pattern, pattern, pattern, PER_SOURCE_LIMIT],
  );
  for (const b of bikes) {
    results.push({
      kind: 'motorcycle',
      id: b.id,
      motorcycleId: b.id,
      title: b.nickname,
      subtitle: `${b.brand} ${b.model}`,
      date: '9999-12-31', // bikes sort first
    });
  }

  // Maintenance search joins the schedule for its component name.
  const records = rawDb.getAllSync<{
    id: string;
    motorcycle_id: string;
    performed_date: string;
    component_type: string;
    custom_name: string | null;
    notes: string | null;
    brand: string | null;
  }>(
    `SELECT r.id, r.motorcycle_id, r.performed_date, s.component_type, s.custom_name, r.notes, r.brand
       FROM maintenance_records r JOIN maintenance_schedules s ON s.id = r.schedule_id
      WHERE r.deleted_at IS NULL
        AND (r.notes LIKE ? OR r.brand LIKE ? OR s.component_type LIKE ? OR s.custom_name LIKE ?)
      ORDER BY r.performed_date DESC LIMIT ?`,
    [pattern, pattern, pattern, pattern, PER_SOURCE_LIMIT],
  );
  for (const r of records) {
    results.push({
      kind: 'maintenance',
      id: r.id,
      motorcycleId: r.motorcycle_id,
      title: r.custom_name ?? r.component_type,
      subtitle: r.notes ?? r.brand,
      date: r.performed_date,
    });
  }

  for (const r of RepairRepository.search(q, PER_SOURCE_LIMIT)) {
    results.push({
      kind: 'repair',
      id: r.id,
      motorcycleId: r.motorcycleId,
      title: r.title,
      subtitle: r.problem ?? r.shopName,
      date: r.repairDate,
    });
  }

  for (const f of FuelRepository.search(q, PER_SOURCE_LIMIT)) {
    results.push({
      kind: 'fuel',
      id: f.id,
      motorcycleId: f.motorcycleId,
      title: f.station ?? 'fuel',
      subtitle: f.notes,
      date: f.fuelDate,
    });
  }

  for (const e of ExpenseRepository.search(q, PER_SOURCE_LIMIT)) {
    results.push({
      kind: 'expense',
      id: e.id,
      motorcycleId: e.motorcycleId,
      title: e.category,
      subtitle: e.notes,
      date: e.expenseDate,
    });
  }

  for (const d of DocumentRepository.search(q, PER_SOURCE_LIMIT)) {
    results.push({
      kind: 'document',
      id: d.id,
      motorcycleId: d.motorcycleId,
      title: d.title,
      subtitle: d.notes,
      date: d.expiryDate ?? '0000-00-00',
    });
  }

  return results.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}
