/**
 * Bike CRUD orchestration: default-schedule creation, drivetrain re-gating,
 * archive/delete cascades (FEATURE_SPECIFICATIONS.md §2, §5.5).
 */

import { DocumentRepository } from '@/db/repositories/DocumentRepository';
import { ExpenseRepository } from '@/db/repositories/ExpenseRepository';
import { FuelRepository } from '@/db/repositories/FuelRepository';
import { MaintenanceRepository } from '@/db/repositories/MaintenanceRepository';
import { MotorcycleRepository } from '@/db/repositories/MotorcycleRepository';
import { OdometerRepository } from '@/db/repositories/OdometerRepository';
import { RepairRepository } from '@/db/repositories/RepairRepository';
import { ScheduleRepository } from '@/db/repositories/ScheduleRepository';
import { SettingsRepository } from '@/db/repositories/SettingsRepository';
import type { MotorcycleRow } from '@/db/schema';
import { todayIso } from '@/lib/dates';
import { emitDomainEvent } from '@/lib/events';
import { appError, err, ok, type Result } from '@/lib/result';
import { runTx } from './MaintenanceService';
import { ScheduleService } from './ScheduleService';
import { motorcycleInput, type MotorcycleInput } from './validation/schemas';
import { guardService, validateWith } from './serviceUtils';

const ACTIVE_BIKE_KEY = 'active_bike_id';

export const MotorcycleService = {
  /** Creates the bike + initial odometer log + default schedules in one transaction. */
  createBike(input: unknown): Result<MotorcycleRow> {
    const parsed = validateWith(motorcycleInput, input);
    if (!parsed.ok) {
      return parsed;
    }
    const value: MotorcycleInput = parsed.value;
    return guardService('bike.create', () => {
      if (MotorcycleRepository.nicknameExists(value.nickname)) {
        return err(
          appError('ValidationError', 'bike.nicknameTaken', 'Nickname already used', {
            nickname: 'bike.nicknameTaken',
          }),
        );
      }
      const result = runTx(() => {
        const bike = MotorcycleRepository.insert({
          nickname: value.nickname,
          brand: value.brand,
          model: value.model,
          year: value.year,
          drivetrainType: value.drivetrainType,
          photoPath: value.photoPath,
          plateNumber: value.plateNumber,
          vin: value.vin,
          engineNumber: value.engineNumber,
          purchaseDate: value.purchaseDate,
          purchasePriceCentavos: value.purchasePriceCentavos,
          currentOdometerKm: value.currentOdometerKm,
        });
        // The entered odometer becomes the first log entry (FEATURE_SPECIFICATIONS.md §2).
        OdometerRepository.insert({
          motorcycleId: bike.id,
          readingKm: value.currentOdometerKm,
          effectiveKm: value.currentOdometerKm,
          recordedDate: todayIso(),
          source: 'initial',
          sourceId: null,
        });
        ScheduleService.createDefaultsForBikeInTx(bike.id, value.drivetrainType);
        return bike;
      });
      if (result.ok) {
        // First bike becomes active automatically.
        const active = SettingsRepository.get<string | null>(ACTIVE_BIKE_KEY, null);
        if (active === null) {
          SettingsRepository.set(ACTIVE_BIKE_KEY, result.value.id);
        }
        emitDomainEvent('bike:changed', { bikeId: result.value.id });
      }
      return result;
    });
  },

  /** Profile edits. Odometer changes go through OdometerService, never here. */
  updateBike(bikeId: string, input: unknown): Result<void> {
    const parsed = validateWith(motorcycleInput, input);
    if (!parsed.ok) {
      return parsed;
    }
    const value = parsed.value;
    return guardService('bike.update', () => {
      const bike = MotorcycleRepository.getById(bikeId);
      if (bike === undefined) {
        return err(appError('BusinessRuleError', 'bike.notFound', 'Motorcycle not found'));
      }
      if (MotorcycleRepository.nicknameExists(value.nickname, bikeId)) {
        return err(
          appError('ValidationError', 'bike.nicknameTaken', 'Nickname already used', {
            nickname: 'bike.nicknameTaken',
          }),
        );
      }
      const drivetrainChanged = bike.drivetrainType !== value.drivetrainType;
      const result = runTx(() => {
        MotorcycleRepository.update(bikeId, {
          nickname: value.nickname,
          brand: value.brand,
          model: value.model,
          year: value.year,
          drivetrainType: value.drivetrainType,
          photoPath: value.photoPath,
          plateNumber: value.plateNumber,
          vin: value.vin,
          engineNumber: value.engineNumber,
          purchaseDate: value.purchaseDate,
          purchasePriceCentavos: value.purchasePriceCentavos,
        });
        if (drivetrainChanged) {
          ScheduleService.regateForDrivetrainInTx(bikeId, value.drivetrainType);
        }
      });
      if (result.ok) {
        emitDomainEvent('bike:changed', { bikeId });
        if (drivetrainChanged) {
          emitDomainEvent('schedule:changed', { bikeId });
        }
      }
      return result.ok ? ok(undefined) : result;
    });
  },

  /** Archive: excluded from reminders/aggregates, data intact, reversible (§3). */
  setArchived(bikeId: string, archived: boolean): Result<void> {
    return guardService('bike.archive', () => {
      const bike = MotorcycleRepository.getById(bikeId);
      if (bike === undefined) {
        return err(appError('BusinessRuleError', 'bike.notFound', 'Motorcycle not found'));
      }
      const result = runTx(() => {
        MotorcycleRepository.update(bikeId, { isArchived: archived ? 1 : 0 });
      });
      if (result.ok) {
        this.repairActiveBike();
        emitDomainEvent('bike:changed', { bikeId });
      }
      return result.ok ? ok(undefined) : result;
    });
  },

  /**
   * Soft-deletes the bike and cascades soft-delete to every child row
   * (FEATURE_SPECIFICATIONS.md §2). Caller enforces the typed confirmation.
   */
  deleteBike(bikeId: string): Result<void> {
    return guardService('bike.delete', () => {
      const bike = MotorcycleRepository.getById(bikeId);
      if (bike === undefined) {
        return err(appError('BusinessRuleError', 'bike.notFound', 'Motorcycle not found'));
      }
      const result = runTx(() => {
        MaintenanceRepository.softDeleteByBike(bikeId);
        RepairRepository.softDeleteByBike(bikeId);
        FuelRepository.softDeleteByBike(bikeId);
        ExpenseRepository.softDeleteByBike(bikeId);
        OdometerRepository.softDeleteByBike(bikeId);
        DocumentRepository.softDeleteByBike(bikeId);
        ScheduleRepository.softDeleteByBike(bikeId);
        MotorcycleRepository.softDelete(bikeId);
      });
      if (result.ok) {
        this.repairActiveBike();
        emitDomainEvent('bike:changed', { bikeId });
      }
      return result.ok ? ok(undefined) : result;
    });
  },

  setActiveBike(bikeId: string): Result<void> {
    return guardService('bike.setActive', () => {
      const bike = MotorcycleRepository.getById(bikeId);
      if (bike === undefined) {
        return err(appError('BusinessRuleError', 'bike.notFound', 'Motorcycle not found'));
      }
      SettingsRepository.set(ACTIVE_BIKE_KEY, bikeId);
      emitDomainEvent('settings:changed', { bikeId });
      return ok(undefined);
    });
  },

  /**
   * Resolves the active bike with the §10 fallback: dangling/archived id →
   * first non-archived bike; none → null (UI routes to add-bike). Never crashes.
   */
  getActiveBike(): MotorcycleRow | null {
    const id = SettingsRepository.get<string | null>(ACTIVE_BIKE_KEY, null);
    if (id !== null) {
      const bike = MotorcycleRepository.getById(id);
      if (bike !== undefined && bike.isArchived === 0) {
        return bike;
      }
    }
    const fallback = MotorcycleRepository.list().find((b) => b.isArchived === 0) ?? null;
    if (fallback !== null && fallback.id !== id) {
      SettingsRepository.set(ACTIVE_BIKE_KEY, fallback.id);
    }
    return fallback;
  },

  /** Re-points active_bike_id after archive/delete races (BUSINESS_RULES.md §10). */
  repairActiveBike(): void {
    this.getActiveBike();
  },
};
