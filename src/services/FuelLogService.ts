/**
 * Fuel log persistence orchestration (FEATURE_SPECIFICATIONS.md §10): saving
 * inserts an odometer log (source 'fuel') and triggers the same cascade as
 * maintenance saves. Pure fuel math lives in FuelService.
 */

import { FuelRepository } from '@/db/repositories/FuelRepository';
import type { FuelLogRow } from '@/db/schema';
import { emitDomainEvent } from '@/lib/events';
import { appError, err, ok, type Result } from '@/lib/result';
import { runTx, rollbackWith } from './MaintenanceService';
import { OdometerService } from './OdometerService';
import { fuelLogInput, type FuelLogInput } from './validation/schemas';
import { guardService, validateWith } from './serviceUtils';

export const FuelLogService = {
  saveFuelLog(motorcycleId: string, input: unknown): Result<FuelLogRow> {
    const parsed = validateWith(fuelLogInput, input);
    if (!parsed.ok) {
      return parsed;
    }
    const value: FuelLogInput = parsed.value;
    return guardService('fuel.save', () => {
      const result = runTx(() => {
        const row = FuelRepository.insert({
          motorcycleId,
          fuelDate: value.fuelDate,
          liters: value.liters,
          totalCostCentavos: value.totalCostCentavos,
          odometerKm: value.odometerKm,
          station: value.station,
          isFullTank: value.isFullTank ? 1 : 0,
          notes: value.notes,
        });
        const odo = OdometerService.recordReadingInTx(
          motorcycleId,
          value.odometerKm,
          value.fuelDate,
          'fuel',
          row.id,
        );
        if (!odo.ok) {
          rollbackWith(odo.error);
        }
        return row;
      });
      if (result.ok) {
        emitDomainEvent('fuel:changed', { bikeId: motorcycleId });
        emitDomainEvent('odometer:changed', { bikeId: motorcycleId });
      }
      return result;
    });
  },

  editFuelLog(fuelLogId: string, input: unknown): Result<void> {
    const parsed = validateWith(fuelLogInput, input);
    if (!parsed.ok) {
      return parsed;
    }
    const value = parsed.value;
    return guardService('fuel.edit', () => {
      const existing = FuelRepository.getById(fuelLogId);
      if (existing === undefined) {
        return err(appError('BusinessRuleError', 'fuel.notFound', 'Fuel log not found'));
      }
      const result = runTx(() => {
        FuelRepository.update(fuelLogId, {
          fuelDate: value.fuelDate,
          liters: value.liters,
          totalCostCentavos: value.totalCostCentavos,
          odometerKm: value.odometerKm,
          station: value.station,
          isFullTank: value.isFullTank ? 1 : 0,
          notes: value.notes,
        });
        OdometerService.removeBySourceInTx(existing.motorcycleId, fuelLogId);
        const odo = OdometerService.recordReadingInTx(
          existing.motorcycleId,
          value.odometerKm,
          value.fuelDate,
          'fuel',
          fuelLogId,
        );
        if (!odo.ok) {
          rollbackWith(odo.error);
        }
      });
      if (result.ok) {
        emitDomainEvent('fuel:changed', { bikeId: existing.motorcycleId });
        emitDomainEvent('odometer:changed', { bikeId: existing.motorcycleId });
      }
      return result.ok ? ok(undefined) : result;
    });
  },

  deleteFuelLog(fuelLogId: string): Result<void> {
    return guardService('fuel.delete', () => {
      const existing = FuelRepository.getById(fuelLogId);
      if (existing === undefined) {
        return err(appError('BusinessRuleError', 'fuel.notFound', 'Fuel log not found'));
      }
      const result = runTx(() => {
        FuelRepository.softDelete(fuelLogId);
        OdometerService.removeBySourceInTx(existing.motorcycleId, fuelLogId);
      });
      if (result.ok) {
        emitDomainEvent('fuel:changed', { bikeId: existing.motorcycleId });
        emitDomainEvent('odometer:changed', { bikeId: existing.motorcycleId });
      }
      return result.ok ? ok(undefined) : result;
    });
  },
};
