import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { DateField } from '@/components/DateField';
import { FormField } from '@/components/FormField';
import { MoneyInput } from '@/components/MoneyInput';
import { OdoInput } from '@/components/OdoInput';
import { PickerField } from '@/components/PickerField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { SegmentedControl } from '@/components/SegmentedControl';
import { TextField } from '@/components/TextField';
import { MaintenanceRepository } from '@/db/repositories/MaintenanceRepository';
import { ScheduleRepository } from '@/db/repositories/ScheduleRepository';
import { componentLabel } from '@/features/maintenance/componentMeta';
import { useActiveBike } from '@/hooks/useActiveBike';
import { todayIso } from '@/lib/dates';
import { MaintenanceService } from '@/services/MaintenanceService';
import { componentDefaultServiceType } from '@/db/seed/defaults';
import { makeStyles, typeStyle } from '@/theme/styles';
import { SERVICE_TYPES, type ComponentType, type ServiceType } from '@/types/enums';

const useStyles = makeStyles((t) => ({
  title: typeStyle(t.type.h1, t.text.primary),
  error: typeStyle(t.type.caption, t.feedback.error.base),
  form: { gap: t.space.s4 },
}));

const SERVICE_TYPE_OPTIONS = SERVICE_TYPES.map((s) => ({
  value: s,
  label: s === 'replace' ? 'Replace' : s === 'clean' ? 'Clean' : 'Adjust',
}));

/** S-12 Log maintenance (full form) — also handles edit via ?recordId. */
export default function MaintenanceLogRoute() {
  const params = useLocalSearchParams<{ scheduleId?: string; recordId?: string }>();
  const router = useRouter();
  const styles = useStyles();
  const { activeBike } = useActiveBike();

  const existingRecord = params.recordId !== undefined ? MaintenanceRepository.getById(params.recordId) : undefined;
  const initialScheduleId = existingRecord?.scheduleId ?? params.scheduleId ?? null;

  const bikeId = existingRecord?.motorcycleId ?? activeBike?.id ?? null;
  const schedules = bikeId !== null ? ScheduleRepository.listByBike(bikeId).filter((s) => s.isEnabled === 1) : [];

  const [scheduleId, setScheduleId] = useState<string | null>(initialScheduleId);
  const schedule = scheduleId !== null ? ScheduleRepository.getById(scheduleId) : undefined;

  const [date, setDate] = useState(existingRecord?.performedDate ?? todayIso());
  const [odometer, setOdometer] = useState(
    existingRecord?.odometerKm !== undefined && existingRecord?.odometerKm !== null
      ? String(existingRecord.odometerKm)
      : activeBike !== null
        ? String(activeBike.currentOdometerKm)
        : '',
  );
  const [cost, setCost] = useState(
    existingRecord?.costCentavos !== undefined && existingRecord?.costCentavos !== null
      ? (existingRecord.costCentavos / 100).toFixed(2)
      : '',
  );
  const [serviceType, setServiceType] = useState<ServiceType>(
    (existingRecord?.serviceType as ServiceType) ??
      (schedule !== undefined ? componentDefaultServiceType(schedule.componentType as ComponentType) : 'replace'),
  );
  const [brand, setBrand] = useState(existingRecord?.brand ?? '');
  const [notes, setNotes] = useState(existingRecord?.notes ?? '');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>();
  const [formError, setFormError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  if (bikeId === null) {
    return (
      <Screen>
        <Text style={styles.title}>No motorcycle selected</Text>
      </Screen>
    );
  }

  const handleSubmit = () => {
    if (scheduleId === null) {
      setFormError('Choose a component');
      return;
    }
    setSubmitting(true);
    setFormError(undefined);
    const input = {
      scheduleId,
      performedDate: date,
      odometerKm: odometer !== '' ? Number(odometer) : null,
      serviceType,
      costCentavos: cost !== '' ? Math.round(Number(cost) * 100) : null,
      brand: brand !== '' ? brand : null,
      quantity: null,
      details: null,
      notes: notes !== '' ? notes : null,
      photoPath: null,
    };
    const result =
      existingRecord !== undefined
        ? MaintenanceService.editRecord(existingRecord.id, input)
        : MaintenanceService.saveRecord(bikeId, input);
    setSubmitting(false);
    if (!result.ok) {
      setFieldErrors(result.error.fieldErrors);
      setFormError(result.error.message);
      return;
    }
    router.back();
  };

  const handleDelete = () => {
    if (existingRecord !== undefined) {
      MaintenanceService.deleteRecord(existingRecord.id);
      router.back();
    }
  };

  return (
    <Screen>
      <Text style={styles.title}>{existingRecord !== undefined ? 'Edit record' : 'Log maintenance'}</Text>
      {formError !== undefined ? <Text style={styles.error}>{formError}</Text> : null}
      <FormField label="Component" required error={fieldErrors?.scheduleId}>
        <PickerField
          options={schedules.map((s) => ({
            value: s.id,
            label: componentLabel(s.componentType as ComponentType, s.customName),
          }))}
          value={scheduleId}
          onChange={setScheduleId}
          placeholder="Select component"
        />
      </FormField>
      <FormField label="Date" required error={fieldErrors?.performedDate}>
        <DateField value={date} onChange={setDate} maxIso={todayIso()} />
      </FormField>
      <FormField label="Odometer (km)" error={fieldErrors?.odometerKm}>
        <OdoInput value={odometer} onChange={setOdometer} />
      </FormField>
      <FormField label="Service type">
        <SegmentedControl segments={SERVICE_TYPE_OPTIONS} value={serviceType} onChange={setServiceType} />
      </FormField>
      <FormField label="Cost" error={fieldErrors?.costCentavos}>
        <MoneyInput value={cost} onChange={setCost} />
      </FormField>
      <FormField label="Brand / product" error={fieldErrors?.brand}>
        <TextField value={brand} onChangeText={setBrand} maxLength={40} />
      </FormField>
      <FormField label="Notes" error={fieldErrors?.notes}>
        <TextField value={notes} onChangeText={setNotes} maxLength={500} multiline />
      </FormField>
      <PrimaryButton
        label={existingRecord !== undefined ? 'Save changes' : 'Save'}
        loading={submitting}
        onPress={handleSubmit}
      />
      {existingRecord !== undefined ? <PrimaryButton label="Delete" onPress={handleDelete} /> : null}
    </Screen>
  );
}
