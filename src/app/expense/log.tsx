import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';

import { ConfirmDialog } from '@/components/ConfirmDialog';
import { DateField } from '@/components/DateField';
import { DestructiveButton } from '@/components/DestructiveButton';
import { FormField } from '@/components/FormField';
import { MoneyInput } from '@/components/MoneyInput';
import { PickerField } from '@/components/PickerField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TextField } from '@/components/TextField';
import { showToast } from '@/components/Toast';
import { ExpenseRepository } from '@/db/repositories/ExpenseRepository';
import { useActiveBike } from '@/hooks/useActiveBike';
import { strings } from '@/i18n/strings';
import { todayIso } from '@/lib/dates';
import { ExpenseService } from '@/services/ExpenseService';
import { makeStyles, typeStyle } from '@/theme/styles';
import { EXPENSE_CATEGORIES, type ExpenseCategory } from '@/types/enums';

const useStyles = makeStyles((t) => ({
  title: typeStyle(t.type.h1, t.text.primary),
  error: typeStyle(t.type.caption, t.feedback.error.base),
}));

const CATEGORY_OPTIONS = EXPENSE_CATEGORIES.map((c) => ({ value: c, label: strings.categories[c] }));

/** S-23 Add/Edit standalone expense (fuel/maintenance/repair are logged in their own tabs). */
export default function ExpenseLogRoute() {
  const { expenseId } = useLocalSearchParams<{ expenseId?: string }>();
  const router = useRouter();
  const styles = useStyles();
  const { activeBike } = useActiveBike();
  const existing = expenseId !== undefined ? ExpenseRepository.getById(expenseId) : undefined;

  const [category, setCategory] = useState<ExpenseCategory>((existing?.category as ExpenseCategory) ?? 'other');
  const [amount, setAmount] = useState(existing !== undefined ? (existing.amountCentavos / 100).toFixed(2) : '');
  const [date, setDate] = useState(existing?.expenseDate ?? todayIso());
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>();
  const [error, setError] = useState<string>();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const bikeId = existing?.motorcycleId ?? activeBike?.id ?? null;
  if (bikeId === null) {
    return (
      <Screen>
        <Text style={styles.title}>No motorcycle selected</Text>
      </Screen>
    );
  }

  const handleSubmit = () => {
    const input = {
      category,
      amountCentavos: amount !== '' ? Math.round(Number(amount) * 100) : 0,
      expenseDate: date,
      notes: notes !== '' ? notes : null,
      photoPath: null,
    };
    const result =
      existing !== undefined ? ExpenseService.editExpense(existing.id, input) : ExpenseService.saveExpense(bikeId, input);
    if (!result.ok) {
      setFieldErrors(result.error.fieldErrors);
      setError(result.error.message);
      return;
    }
    showToast(existing !== undefined ? 'Expense updated' : 'Expense saved');
    router.back();
  };

  const handleDelete = () => {
    setConfirmingDelete(false);
    if (existing !== undefined) {
      ExpenseService.deleteExpense(existing.id);
      showToast({ kind: 'info', message: 'Expense deleted' });
      router.back();
    }
  };

  return (
    <Screen>
      <ScreenHeader title={existing !== undefined ? 'Edit expense' : 'Add expense'} />
      {error !== undefined ? <Text style={styles.error}>{error}</Text> : null}
      <FormField label="Category" required error={fieldErrors?.category}>
        <PickerField options={CATEGORY_OPTIONS} value={category} onChange={setCategory} placeholder="Select category" />
      </FormField>
      <FormField label="Amount" required error={fieldErrors?.amountCentavos}>
        <MoneyInput value={amount} onChange={setAmount} />
      </FormField>
      <FormField label="Date" required error={fieldErrors?.expenseDate}>
        <DateField value={date} onChange={setDate} maxIso={todayIso()} />
      </FormField>
      <FormField label="Notes" error={fieldErrors?.notes}>
        <TextField value={notes} onChangeText={setNotes} multiline maxLength={500} />
      </FormField>
      <PrimaryButton label={existing !== undefined ? 'Save changes' : 'Save'} onPress={handleSubmit} />
      {existing !== undefined ? (
        <DestructiveButton label="Delete expense" onPress={() => setConfirmingDelete(true)} />
      ) : null}
      <ConfirmDialog
        visible={confirmingDelete}
        title="Delete this expense?"
        body="This removes it from your spending history. Recoverable for 30 days."
        confirmLabel="Delete expense"
        onConfirm={handleDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    </Screen>
  );
}
