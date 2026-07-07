/**
 * Repair log CRUD (FEATURE_SPECIFICATIONS.md §12). Repairs never touch
 * schedule anchors; an odometer reading, when present, joins the odometer trail.
 */

import { RepairRepository } from '@/db/repositories/RepairRepository';
import type { RepairRow } from '@/db/schema';
import { emitDomainEvent } from '@/lib/events';
import { appError, err, ok, type Result } from '@/lib/result';
import { runTx, rollbackWith } from './MaintenanceService';
import { OdometerService } from './OdometerService';
import { repairInput, type RepairInput } from './validation/schemas';
import { guardService, validateWith } from './serviceUtils';

export const RepairService = {
  saveRepair(motorcycleId: string, input: unknown): Result<RepairRow> {
    const parsed = validateWith(repairInput, input);
    if (!parsed.ok) {
      return parsed;
    }
    const value: RepairInput = parsed.value;
    return guardService('repair.save', () => {
      const result = runTx(() => {
        const row = RepairRepository.insert({
          motorcycleId,
          title: value.title,
          repairDate: value.repairDate,
          odometerKm: value.odometerKm,
          problem: value.problem,
          diagnosis: value.diagnosis,
          solution: value.solution,
          shopName: value.shopName,
          costCentavos: value.costCentavos,
          photoPaths: null,
          notes: value.notes,
        });
        if (value.odometerKm !== null) {
          const odo = OdometerService.recordReadingInTx(
            motorcycleId,
            value.odometerKm,
            value.repairDate,
            'repair',
            row.id,
          );
          if (!odo.ok) {
            rollbackWith(odo.error);
          }
        }
        return row;
      });
      if (result.ok) {
        emitDomainEvent('repair:changed', { bikeId: motorcycleId });
        emitDomainEvent('odometer:changed', { bikeId: motorcycleId });
      }
      return result;
    });
  },

  editRepair(repairId: string, input: unknown): Result<void> {
    const parsed = validateWith(repairInput, input);
    if (!parsed.ok) {
      return parsed;
    }
    const value = parsed.value;
    return guardService('repair.edit', () => {
      const existing = RepairRepository.getById(repairId);
      if (existing === undefined) {
        return err(appError('BusinessRuleError', 'repair.notFound', 'Repair not found'));
      }
      const result = runTx(() => {
        RepairRepository.update(repairId, {
          title: value.title,
          repairDate: value.repairDate,
          odometerKm: value.odometerKm,
          problem: value.problem,
          diagnosis: value.diagnosis,
          solution: value.solution,
          shopName: value.shopName,
          costCentavos: value.costCentavos,
          notes: value.notes,
        });
        OdometerService.removeBySourceInTx(existing.motorcycleId, repairId);
        if (value.odometerKm !== null) {
          const odo = OdometerService.recordReadingInTx(
            existing.motorcycleId,
            value.odometerKm,
            value.repairDate,
            'repair',
            repairId,
          );
          if (!odo.ok) {
            rollbackWith(odo.error);
          }
        }
      });
      if (result.ok) {
        emitDomainEvent('repair:changed', { bikeId: existing.motorcycleId });
        emitDomainEvent('odometer:changed', { bikeId: existing.motorcycleId });
      }
      return result.ok ? ok(undefined) : result;
    });
  },

  deleteRepair(repairId: string): Result<void> {
    return guardService('repair.delete', () => {
      const existing = RepairRepository.getById(repairId);
      if (existing === undefined) {
        return err(appError('BusinessRuleError', 'repair.notFound', 'Repair not found'));
      }
      const result = runTx(() => {
        RepairRepository.softDelete(repairId);
        OdometerService.removeBySourceInTx(existing.motorcycleId, repairId);
      });
      if (result.ok) {
        emitDomainEvent('repair:changed', { bikeId: existing.motorcycleId });
        emitDomainEvent('odometer:changed', { bikeId: existing.motorcycleId });
      }
      return result.ok ? ok(undefined) : result;
    });
  },
};
