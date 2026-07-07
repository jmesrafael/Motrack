import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';

import { DateField } from '@/components/DateField';
import { FormField } from '@/components/FormField';
import { MoneyInput } from '@/components/MoneyInput';
import { OdoInput } from '@/components/OdoInput';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { Toggle } from '@/components/Toggle';
import { FuelRepository } from '@/db/repositories/FuelRepository';
import { useActiveBike } from '@/hooks/useActiveBike';
import { todayIso } from '@/lib/dates';
import { FuelLogService } from '@/services/FuelLogService';
import { makeStyles, typeStyle } from '@/theme/styles';

const useStyles = makeStyles((t) => ({
  title: typeStyle(t.type.h1, t.text.primary),
  error: typeStyle(t.type.caption, t.feedback.error.base),
}));

/** S-21 Log fuel. */
export default function FuelLogRoute() {
  const { fuelLogId } = useLocalSearchParams<{ fuelLogId?: string }>();
  const router = useRouter();
  const styles = useStyles();
  const { activeBike } = useActiveBike();
  const existing = fuelLogId !== undefined ? FuelRepository.getById(fuelLogId) : undefined;

  const [date, setDate] = useState(existing?.fuelDate ?? todayIso());
  const [liters, setLiters] = useState(existing !== undefined ? String(existing.liters) : '');
  const [totalCost, setTotalCost] = useState(
    existing !== undefined ? (existing.totalCostCentavos / 100).toFixed(2) : '',
  );
  const [odometer, setOdometer] = useState(
    existing !== undefined ? String(existing.odometerKm) : activeBike !== null ? String(activeBike.currentOdometerKm) : '',
  );
  const [station, setStation] = useState(existing?.station ?? FuelRepository.lastStation(activeBike?.id ?? '') ?? '');
  const [isFullTank, setIsFullTank] = useState(existing?.isFullTank !== 0);
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>();
  const [error, setError] = useState<string>();

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
      fuelDate: date,
      liters: liters !== '' ? Number(liters) : 0,
      totalCostCentavos: totalCost !== '' ? Math.round(Number(totalCost) * 100) : 0,
      odometerKm: odometer !== '' ? Number(odometer) : 0,
      station: station !== '' ? station : null,
      isFullTank,
      notes: notes !== '' ? notes : null,
    };
    const result =
      existing !== undefined
        ? FuelLogService.editFuelLog(existing.id, input)
        : FuelLogService.saveFuelLog(bikeId, input);
    if (!result.ok) {
      setFieldErrors(result.error.fieldErrors);
      setError(result.error.message);
      return;
    }
    router.back();
  };

  const priceLabel =
    liters !== '' && totalCost !== '' && Number(liters) > 0
      ? `₱${(Number(totalCost) / Number(liters)).toFixed(2)}/L`
      : '';

  return (
    <Screen>
      <Text style={styles.title}>{existing !== undefined ? 'Edit fuel log' : 'Log fuel'}</Text>
      {error !== undefined ? <Text style={styles.error}>{error}</Text> : null}
      <FormField label="Liters" required error={fieldErrors?.liters}>
        <TextField value={liters} onChangeText={(v) => setLiters(v.replace(/[^0-9.]/g, ''))} keyboardType="decimal-pad" />
      </FormField>
      <FormField label="Total cost" required error={fieldErrors?.totalCostCentavos} hint={priceLabel}>
        <MoneyInput value={totalCost} onChange={setTotalCost} />
      </FormField>
      <FormField label="Odometer (km)" required error={fieldErrors?.odometerKm}>
        <OdoInput value={odometer} onChange={setOdometer} />
      </FormField>
      <FormField label="Date" required error={fieldErrors?.fuelDate}>
        <DateField value={date} onChange={setDate} maxIso={todayIso()} />
      </FormField>
      <FormField label="Station" error={fieldErrors?.station}>
        <TextField value={station} onChangeText={setStation} maxLength={40} placeholder="Petron, Shell, Caltex…" />
      </FormField>
      <Toggle value={isFullTank} onChange={setIsFullTank} label="Full tank" />
      <FormField label="Notes" error={fieldErrors?.notes}>
        <TextField value={notes} onChangeText={setNotes} multiline maxLength={500} />
      </FormField>
      <PrimaryButton label={existing !== undefined ? 'Save changes' : 'Save'} onPress={handleSubmit} />
    </Screen>
  );
}
