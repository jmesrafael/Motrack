/**
 * Standalone expense CRUD (FEATURE_SPECIFICATIONS.md §9). Derived expenses
 * (fuel/maintenance/repair) are a read-time union — never written here (ADR-021).
 */

import { ExpenseRepository } from '@/db/repositories/ExpenseRepository';
import type { ExpenseRow } from '@/db/schema';
import { emitDomainEvent } from '@/lib/events';
import { appError, err, ok, type Result } from '@/lib/result';
import { runTx } from './MaintenanceService';
import { expenseInput, type ExpenseInput } from './validation/schemas';
import { guardService, validateWith } from './serviceUtils';

export const ExpenseService = {
  saveExpense(motorcycleId: string, input: unknown): Result<ExpenseRow> {
    const parsed = validateWith(expenseInput, input);
    if (!parsed.ok) {
      return parsed;
    }
    const value: ExpenseInput = parsed.value;
    return guardService('expense.save', () => {
      const result = runTx(() =>
        ExpenseRepository.insert({
          motorcycleId,
          category: value.category,
          amountCentavos: value.amountCentavos,
          expenseDate: value.expenseDate,
          notes: value.notes,
          photoPath: value.photoPath,
        }),
      );
      if (result.ok) {
        emitDomainEvent('expense:changed', { bikeId: motorcycleId });
      }
      return result;
    });
  },

  editExpense(expenseId: string, input: unknown): Result<void> {
    const parsed = validateWith(expenseInput, input);
    if (!parsed.ok) {
      return parsed;
    }
    const value = parsed.value;
    return guardService('expense.edit', () => {
      const existing = ExpenseRepository.getById(expenseId);
      if (existing === undefined) {
        return err(appError('BusinessRuleError', 'expense.notFound', 'Expense not found'));
      }
      const result = runTx(() => {
        ExpenseRepository.update(expenseId, {
          category: value.category,
          amountCentavos: value.amountCentavos,
          expenseDate: value.expenseDate,
          notes: value.notes,
          photoPath: value.photoPath,
        });
      });
      if (result.ok) {
        emitDomainEvent('expense:changed', { bikeId: existing.motorcycleId });
      }
      return result.ok ? ok(undefined) : result;
    });
  },

  deleteExpense(expenseId: string): Result<void> {
    return guardService('expense.delete', () => {
      const existing = ExpenseRepository.getById(expenseId);
      if (existing === undefined) {
        return err(appError('BusinessRuleError', 'expense.notFound', 'Expense not found'));
      }
      const result = runTx(() => {
        ExpenseRepository.softDelete(expenseId);
      });
      if (result.ok) {
        emitDomainEvent('expense:changed', { bikeId: existing.motorcycleId });
      }
      return result.ok ? ok(undefined) : result;
    });
  },
};
