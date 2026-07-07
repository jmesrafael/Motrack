import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';

import { FormField } from '@/components/FormField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { Toggle } from '@/components/Toggle';
import { ScheduleRepository } from '@/db/repositories/ScheduleRepository';
import { componentLabel } from '@/features/maintenance/componentMeta';
import { ScheduleService } from '@/services/ScheduleService';
import { makeStyles, typeStyle } from '@/theme/styles';
import type { ComponentType } from '@/types/enums';

const useStyles = makeStyles((t) => ({
  title: typeStyle(t.type.h1, t.text.primary),
  error: typeStyle(t.type.caption, t.feedback.error.base),
}));

/** S-13 Edit schedule — interval km/months, enable toggle, custom-name/delete for custom components. */
export default function EditScheduleRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const styles = useStyles();
  const schedule = ScheduleRepository.getById(id);

  const [intervalKm, setIntervalKm] = useState(schedule?.intervalKm !== null ? String(schedule?.intervalKm ?? '') : '');
  const [intervalMonths, setIntervalMonths] = useState(
    schedule?.intervalMonths !== null ? String(schedule?.intervalMonths ?? '') : '',
  );
  const [customName, setCustomName] = useState(schedule?.customName ?? '');
  const [isEnabled, setIsEnabled] = useState(schedule?.isEnabled === 1);
  const [error, setError] = useState<string>();

  if (schedule === undefined) {
    return (
      <Screen>
        <Text style={styles.title}>Not found</Text>
      </Screen>
    );
  }

  const isCustom = schedule.componentType === 'custom';

  const handleSave = () => {
    const result = ScheduleService.editSchedule(id, {
      customName: isCustom ? (customName !== '' ? customName : null) : null,
      intervalKm: intervalKm !== '' ? Number(intervalKm) : null,
      intervalMonths: intervalMonths !== '' ? Number(intervalMonths) : null,
      isEnabled,
    });
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    router.back();
  };

  const handleDeleteCustom = () => {
    const result = ScheduleService.deleteCustomComponent(id);
    if (result.ok) {
      router.back();
    }
  };

  return (
    <Screen>
      <Text style={styles.title}>{componentLabel(schedule.componentType as ComponentType, schedule.customName)}</Text>
      {error !== undefined ? <Text style={styles.error}>{error}</Text> : null}
      {isCustom ? (
        <FormField label="Name" required>
          <TextField value={customName} onChangeText={setCustomName} maxLength={30} />
        </FormField>
      ) : null}
      <FormField label="Interval (km)" hint="At least one of km/months is required">
        <TextField
          value={intervalKm}
          onChangeText={(v) => setIntervalKm(v.replace(/[^0-9]/g, ''))}
          keyboardType="number-pad"
        />
      </FormField>
      <FormField label="Interval (months)">
        <TextField
          value={intervalMonths}
          onChangeText={(v) => setIntervalMonths(v.replace(/[^0-9]/g, ''))}
          keyboardType="number-pad"
        />
      </FormField>
      <Toggle value={isEnabled} onChange={setIsEnabled} label="Enabled" />
      <PrimaryButton label="Save" onPress={handleSave} />
      {isCustom ? <PrimaryButton label="Delete component" onPress={handleDeleteCustom} /> : null}
    </Screen>
  );
}
