import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { DateField } from '@/components/DateField';
import { FormField } from '@/components/FormField';
import { MoneyInput } from '@/components/MoneyInput';
import { OdoInput } from '@/components/OdoInput';
import { PickerField } from '@/components/PickerField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SegmentedControl } from '@/components/SegmentedControl';
import { TextField } from '@/components/TextField';
import type { MotorcycleRow } from '@/db/schema';
import { todayIso } from '@/lib/dates';
import { makeStyles } from '@/theme/styles';
import { DRIVETRAIN_TYPES } from '@/types/enums';

const BRAND_OPTIONS = [
  'Honda',
  'Yamaha',
  'Suzuki',
  'Kawasaki',
  'Kymco',
  'SYM',
  'Rusi',
  'TVS',
  'Other',
].map((b) => ({ value: b, label: b }));

const DRIVETRAIN_OPTIONS = DRIVETRAIN_TYPES.map((d) => ({
  value: d,
  label: d === 'cvt' ? 'Automatic / scooter' : d === 'chain' ? 'Manual / chain' : 'Other',
}));

export interface BikeFormValues {
  nickname: string;
  brand: string;
  model: string;
  year: string;
  drivetrainType: (typeof DRIVETRAIN_TYPES)[number];
  plateNumber: string;
  vin: string;
  engineNumber: string;
  purchaseDate: string | null;
  purchasePrice: string;
  currentOdometerKm: string;
}

export interface BikeFormProps {
  initial?: MotorcycleRow;
  fieldErrors?: Record<string, string> | undefined;
  submitLabel: string;
  submitting: boolean;
  onSubmit: (values: BikeFormValues) => void;
}

const useStyles = makeStyles((t) => StyleSheet.create({ root: { gap: t.space.s4 } }));

function initialValues(bike?: MotorcycleRow): BikeFormValues {
  return {
    nickname: bike?.nickname ?? '',
    brand: bike?.brand ?? 'Honda',
    model: bike?.model ?? '',
    year: bike?.year !== undefined && bike?.year !== null ? String(bike.year) : '',
    drivetrainType: (bike?.drivetrainType as BikeFormValues['drivetrainType']) ?? 'cvt',
    plateNumber: bike?.plateNumber ?? '',
    vin: bike?.vin ?? '',
    engineNumber: bike?.engineNumber ?? '',
    purchaseDate: bike?.purchaseDate ?? null,
    purchasePrice:
      bike?.purchasePriceCentavos !== undefined && bike?.purchasePriceCentavos !== null
        ? (bike.purchasePriceCentavos / 100).toFixed(2)
        : '',
    currentOdometerKm: bike !== undefined ? String(bike.currentOdometerKm) : '0',
  };
}

/** Shared add/edit form (S-02). Odometer field only meaningful on create — edits go through OdometerService. */
export function BikeForm({ initial, fieldErrors, submitLabel, submitting, onSubmit }: BikeFormProps) {
  const styles = useStyles();
  const [values, setValues] = useState<BikeFormValues>(() => initialValues(initial));

  const set = <K extends keyof BikeFormValues>(key: K, value: BikeFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  return (
    <View style={styles.root}>
      <FormField label="Nickname" required error={fieldErrors?.nickname}>
        <TextField
          value={values.nickname}
          onChangeText={(v) => set('nickname', v)}
          maxLength={30}
          placeholder="Daily NMAX"
        />
      </FormField>
      <FormField label="Brand" required error={fieldErrors?.brand}>
        <PickerField
          options={BRAND_OPTIONS}
          value={values.brand}
          onChange={(v) => set('brand', v)}
          placeholder="Select brand"
        />
      </FormField>
      <FormField label="Model" required error={fieldErrors?.model}>
        <TextField value={values.model} onChangeText={(v) => set('model', v)} maxLength={40} placeholder="NMAX 155" />
      </FormField>
      <FormField label="Drivetrain" required error={fieldErrors?.drivetrainType}>
        <SegmentedControl segments={DRIVETRAIN_OPTIONS} value={values.drivetrainType} onChange={(v) => set('drivetrainType', v)} />
      </FormField>
      {initial === undefined ? (
        <FormField label="Current odometer (km)" required error={fieldErrors?.currentOdometerKm}>
          <OdoInput value={values.currentOdometerKm} onChange={(v) => set('currentOdometerKm', v)} />
        </FormField>
      ) : null}
      <FormField label="Year" error={fieldErrors?.year}>
        <TextField
          value={values.year}
          onChangeText={(v) => set('year', v.replace(/[^0-9]/g, ''))}
          keyboardType="number-pad"
          maxLength={4}
          placeholder={String(new Date().getFullYear())}
        />
      </FormField>
      <FormField label="Plate number" error={fieldErrors?.plateNumber}>
        <TextField
          value={values.plateNumber}
          onChangeText={(v) => set('plateNumber', v.toUpperCase())}
          maxLength={8}
          autoCapitalize="characters"
        />
      </FormField>
      <FormField label="VIN" error={fieldErrors?.vin}>
        <TextField value={values.vin} onChangeText={(v) => set('vin', v)} maxLength={20} />
      </FormField>
      <FormField label="Engine number" error={fieldErrors?.engineNumber}>
        <TextField value={values.engineNumber} onChangeText={(v) => set('engineNumber', v)} maxLength={20} />
      </FormField>
      <FormField label="Purchase date" error={fieldErrors?.purchaseDate}>
        <DateField value={values.purchaseDate ?? todayIso()} onChange={(v) => set('purchaseDate', v)} maxIso={todayIso()} />
      </FormField>
      <FormField label="Purchase price" error={fieldErrors?.purchasePrice}>
        <MoneyInput value={values.purchasePrice} onChange={(v) => set('purchasePrice', v)} />
      </FormField>
      <PrimaryButton label={submitLabel} loading={submitting} onPress={() => onSubmit(values)} />
    </View>
  );
}

/** Converts form strings → the service input shape (pesos→centavos, blanks→null). */
export function toMotorcycleInput(values: BikeFormValues) {
  return {
    nickname: values.nickname.trim(),
    brand: values.brand.trim(),
    model: values.model.trim(),
    year: values.year !== '' ? Number(values.year) : null,
    drivetrainType: values.drivetrainType,
    plateNumber: values.plateNumber.trim() !== '' ? values.plateNumber.trim() : null,
    vin: values.vin.trim() !== '' ? values.vin.trim() : null,
    engineNumber: values.engineNumber.trim() !== '' ? values.engineNumber.trim() : null,
    purchaseDate: values.purchaseDate,
    purchasePriceCentavos:
      values.purchasePrice !== '' ? Math.round(Number(values.purchasePrice) * 100) : null,
    currentOdometerKm: values.currentOdometerKm !== '' ? Number(values.currentOdometerKm) : 0,
    photoPath: null,
  };
}
