/**
 * Maintenance record save/edit/delete + anchor updates + cascade trigger —
 * the canonical write path (DATA_FLOW.md §3, FEATURE_SPECIFICATIONS.md §6.3).
 */

import { inTransaction } from '@/db/client';
import { MaintenanceRepository } from '@/db/repositories/MaintenanceRepository';
import { ScheduleRepository } from '@/db/repositories/ScheduleRepository';
import type { MaintenanceRecordRow } from '@/db/schema';
import { emitDomainEvent } from '@/lib/events';
import { appError, err, ok, type AppError, type Result } from '@/lib/result';
import { OdometerService } from './OdometerService';
import { ScheduleService } from './ScheduleService';
import { maintenanceRecordInput, type MaintenanceRecordInput } from './validation/schemas';
import { guardService, validateWith } from './serviceUtils';

/** Carries an AppError out of withTransactionSync so the driver rolls back. */
class RollbackSignal extends Error {
  constructor(readonly appErrorValue: AppError) {
    super('rollback');
  }
}

/** Transaction wrapper that converts a RollbackSignal into an err Result. */
export function runTx<T>(fn: () => T): Result<T> {
  try {
    return ok(inTransaction(fn));
  } catch (cause) {
    if (cause instanceof RollbackSignal) {
      return err(cause.appErrorValue);
    }
    throw cause;
  }
}

/** Aborts the enclosing runTx transaction with an expected failure. */
export function rollbackWith(error: AppError): never {
  throw new RollbackSignal(error);
}

export const MaintenanceService = {
  /**
   * The canonical save sequence: validate → transaction (insert record, insert
   * odometer log, cache, anchor) → events after commit (DATA_FLOW.md §3).
   */
  saveRecord(motorcycleId: string, input: unknown): Result<MaintenanceRecordRow> {
    const parsed = validateWith(maintenanceRecordInput, input);
    if (!parsed.ok) {
      return parsed;
    }
    const value: MaintenanceRecordInput = parsed.value;
    return guardService('maintenance.save', () => {
      const schedule = ScheduleRepository.getById(value.scheduleId);
      if (schedule === undefined || schedule.motorcycleId !== motorcycleId) {
        return err(appError('BusinessRuleError', 'schedule.notFound', 'Schedule not found'));
      }
      const result = runTx(() => {
        const record = MaintenanceRepository.insert({
          motorcycleId,
          scheduleId: value.scheduleId,
          performedDate: value.performedDate,
          odometerKm: value.odometerKm,
          serviceType: value.serviceType,
          costCentavos: value.costCentavos,
          brand: value.brand,
          quantity: value.quantity,
          details: value.details !== null ? JSON.stringify(value.details) : null,
          notes: value.notes,
          photoPath: value.photoPath,
          source: 'user' as const,
        });
        if (value.odometerKm !== null) {
          const odo = OdometerService.recordReadingInTx(
            motorcycleId,
            value.odometerKm,
            value.performedDate,
            'maintenance',
            record.id,
          );
          if (!odo.ok) {
            rollbackWith(odo.error);
          }
        }
        ScheduleService.recomputeAnchorInTx(value.scheduleId);
        return record;
      });
      if (result.ok) {
        emitDomainEvent('maintenance:changed', { bikeId: motorcycleId, scheduleId: value.scheduleId });
        emitDomainEvent('odometer:changed', { bikeId: motorcycleId });
      }
      return result;
    });
  },

  editRecord(recordId: string, input: unknown): Result<void> {
    const parsed = validateWith(maintenanceRecordInput, input);
    if (!parsed.ok) {
      return parsed;
    }
    const value = parsed.value;
    return guardService('maintenance.edit', () => {
      const existing = MaintenanceRepository.getById(recordId);
      if (existing === undefined) {
        return err(appError('BusinessRuleError', 'record.notFound', 'Record not found'));
      }
      const result = runTx(() => {
        MaintenanceRepository.update(recordId, {
          performedDate: value.performedDate,
          odometerKm: value.odometerKm,
          serviceType: value.serviceType,
          costCentavos: value.costCentavos,
          brand: value.brand,
          quantity: value.quantity,
          details: value.details !== null ? JSON.stringify(value.details) : null,
          notes: value.notes,
          photoPath: value.photoPath,
        });
        // Re-validate the odometer trail: replace the record's log entry (§6.5).
        OdometerService.removeBySourceInTx(existing.motorcycleId, recordId);
        if (value.odometerKm !== null) {
          const odo = OdometerService.recordReadingInTx(
            existing.motorcycleId,
            value.odometerKm,
            value.performedDate,
            'maintenance',
            recordId,
          );
          if (!odo.ok) {
            rollbackWith(odo.error);
          }
        }
        ScheduleService.recomputeAnchorInTx(existing.scheduleId);
      });
      if (result.ok) {
        emitDomainEvent('maintenance:changed', {
          bikeId: existing.motorcycleId,
          scheduleId: existing.scheduleId,
        });
        emitDomainEvent('odometer:changed', { bikeId: existing.motorcycleId });
      }
      return result.ok ? ok(undefined) : result;
    });
  },

  /** Soft delete + odometer trail cleanup + re-anchor (FEATURE_SPECIFICATIONS.md §6.5). */
  deleteRecord(recordId: string): Result<void> {
    return guardService('maintenance.delete', () => {
      const existing = MaintenanceRepository.getById(recordId);
      if (existing === undefined) {
        return err(appError('BusinessRuleError', 'record.notFound', 'Record not found'));
      }
      const result = runTx(() => {
        MaintenanceRepository.softDelete(recordId);
        OdometerService.removeBySourceInTx(existing.motorcycleId, recordId);
        ScheduleService.recomputeAnchorInTx(existing.scheduleId);
      });
      if (result.ok) {
        emitDomainEvent('maintenance:changed', {
          bikeId: existing.motorcycleId,
          scheduleId: existing.scheduleId,
        });
        emitDomainEvent('odometer:changed', { bikeId: existing.motorcycleId });
      }
      return result.ok ? ok(undefined) : result;
    });
  },
};
