import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';

import { FormField } from '@/components/FormField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { useActiveBike } from '@/hooks/useActiveBike';
import { ScheduleService } from '@/services/ScheduleService';
import { makeStyles, typeStyle } from '@/theme/styles';

const useStyles = makeStyles((t) => ({
  title: typeStyle(t.type.h1, t.text.primary),
  error: typeStyle(t.type.caption, t.feedback.error.base),
}));

/** Add a custom maintenance component (BUSINESS_RULES.md §2, unlimited, free). */
export default function AddCustomComponentRoute() {
  const router = useRouter();
  const styles = useStyles();
  const { activeBike } = useActiveBike();
  const [name, setName] = useState('');
  const [intervalKm, setIntervalKm] = useState('');
  const [intervalMonths, setIntervalMonths] = useState('');
  const [error, setError] = useState<string>();

  if (activeBike === null) {
    return (
      <Screen>
        <Text style={styles.title}>No motorcycle selected</Text>
      </Screen>
    );
  }

  const handleSave = () => {
    const result = ScheduleService.addCustomComponent(activeBike.id, {
      customName: name,
      intervalKm: intervalKm !== '' ? Number(intervalKm) : null,
      intervalMonths: intervalMonths !== '' ? Number(intervalMonths) : null,
    });
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    router.back();
  };

  return (
    <Screen>
      <Text style={styles.title}>Custom component</Text>
      {error !== undefined ? <Text style={styles.error}>{error}</Text> : null}
      <FormField label="Name" required>
        <TextField value={name} onChangeText={setName} maxLength={30} placeholder="e.g. Handlebar grips" />
      </FormField>
      <FormField label="Interval (km)" hint="At least one of km/months is required">
        <TextField value={intervalKm} onChangeText={(v) => setIntervalKm(v.replace(/[^0-9]/g, ''))} keyboardType="number-pad" />
      </FormField>
      <FormField label="Interval (months)">
        <TextField
          value={intervalMonths}
          onChangeText={(v) => setIntervalMonths(v.replace(/[^0-9]/g, ''))}
          keyboardType="number-pad"
        />
      </FormField>
      <PrimaryButton label="Add" onPress={handleSave} />
    </Screen>
  );
}
