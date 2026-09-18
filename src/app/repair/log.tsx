import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';

import { ConfirmDialog } from '@/components/ConfirmDialog';
import { DateField } from '@/components/DateField';
import { DestructiveButton } from '@/components/DestructiveButton';
import { FormField } from '@/components/FormField';
import { MoneyInput } from '@/components/MoneyInput';
import { OdoInput } from '@/components/OdoInput';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TextField } from '@/components/TextField';
import { showToast } from '@/components/Toast';
import { RepairRepository } from '@/db/repositories/RepairRepository';
import { useActiveBike } from '@/hooks/useActiveBike';
import { todayIso } from '@/lib/dates';
import { RepairService } from '@/services/RepairService';
import { makeStyles, typeStyle } from '@/theme/styles';

const useStyles = makeStyles((t) => ({
  title: typeStyle(t.type.h1, t.text.primary),
  error: typeStyle(t.type.caption, t.feedback.error.base),
}));

/** S-15/S-16 Log/edit repair — unplanned fixes, separate from scheduled maintenance. */
export default function RepairLogRoute() {
  const { repairId } = useLocalSearchParams<{ repairId?: string }>();
  const router = useRouter();
  const styles = useStyles();
  const { activeBike } = useActiveBike();
  const existing = repairId !== undefined ? RepairRepository.getById(repairId) : undefined;

  const [title, setTitle] = useState(existing?.title ?? '');
  const [date, setDate] = useState(existing?.repairDate ?? todayIso());
  const [odometer, setOdometer] = useState(existing?.odometerKm !== undefined && existing?.odometerKm !== null ? String(existing.odometerKm) : '');
  const [problem, setProblem] = useState(existing?.problem ?? '');
  const [solution, setSolution] = useState(existing?.solution ?? '');
  const [shopName, setShopName] = useState(existing?.shopName ?? '');
  const [cost, setCost] = useState(existing?.costCentavos !== undefined && existing?.costCentavos !== null ? (existing.costCentavos / 100).toFixed(2) : '');
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
      title,
      repairDate: date,
      odometerKm: odometer !== '' ? Number(odometer) : null,
      problem: problem !== '' ? problem : null,
      diagnosis: null,
      solution: solution !== '' ? solution : null,
      shopName: shopName !== '' ? shopName : null,
      costCentavos: cost !== '' ? Math.round(Number(cost) * 100) : null,
      notes: notes !== '' ? notes : null,
    };
    const result = existing !== undefined ? RepairService.editRepair(existing.id, input) : RepairService.saveRepair(bikeId, input);
    if (!result.ok) {
      setFieldErrors(result.error.fieldErrors);
      setError(result.error.message);
      return;
    }
    showToast(existing !== undefined ? 'Repair updated' : 'Repair saved');
    router.back();
  };

  const handleDelete = () => {
    setConfirmingDelete(false);
    if (existing !== undefined) {
      RepairService.deleteRepair(existing.id);
      showToast({ kind: 'info', message: 'Repair deleted' });
      router.back();
    }
  };

  return (
    <Screen>
      <ScreenHeader title={existing !== undefined ? 'Edit repair' : 'Log repair'} />
      {error !== undefined ? <Text style={styles.error}>{error}</Text> : null}
      <FormField label="Title" required error={fieldErrors?.title}>
        <TextField value={title} onChangeText={setTitle} maxLength={60} placeholder="Brake lever adjustment" />
      </FormField>
      <FormField label="Date" required error={fieldErrors?.repairDate}>
        <DateField value={date} onChange={setDate} maxIso={todayIso()} />
      </FormField>
      <FormField label="Odometer (km)" error={fieldErrors?.odometerKm}>
        <OdoInput value={odometer} onChange={setOdometer} />
      </FormField>
      <FormField label="Problem" error={fieldErrors?.problem}>
        <TextField value={problem} onChangeText={setProblem} multiline maxLength={500} />
      </FormField>
      <FormField label="Solution" error={fieldErrors?.solution}>
        <TextField value={solution} onChangeText={setSolution} multiline maxLength={500} />
      </FormField>
      <FormField label="Shop name" error={fieldErrors?.shopName}>
        <TextField value={shopName} onChangeText={setShopName} maxLength={60} />
      </FormField>
      <FormField label="Cost" error={fieldErrors?.costCentavos}>
        <MoneyInput value={cost} onChange={setCost} />
      </FormField>
      <FormField label="Notes" error={fieldErrors?.notes}>
        <TextField value={notes} onChangeText={setNotes} multiline maxLength={500} />
      </FormField>
      <PrimaryButton label={existing !== undefined ? 'Save changes' : 'Save'} onPress={handleSubmit} />
      {existing !== undefined ? (
        <DestructiveButton label="Delete repair" onPress={() => setConfirmingDelete(true)} />
      ) : null}
      <ConfirmDialog
        visible={confirmingDelete}
        title="Delete this repair?"
        body="This removes it from your repair history. Recoverable for 30 days."
        confirmLabel="Delete repair"
        onConfirm={handleDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    </Screen>
  );
}
