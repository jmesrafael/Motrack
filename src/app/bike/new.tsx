import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';

import { Screen } from '@/components/Screen';
import { BikeForm, toMotorcycleInput, type BikeFormValues } from '@/features/garage/ui/BikeForm';
import { MotorcycleService } from '@/services/MotorcycleService';
import { makeStyles, typeStyle } from '@/theme/styles';

const useStyles = makeStyles((t) => ({
  title: typeStyle(t.type.h1, t.text.primary),
  error: typeStyle(t.type.caption, t.feedback.error.base),
}));

/** S-00c / S-02 — add a motorcycle. First bike doubles as onboarding's minimum entry. */
export default function AddBikeRoute() {
  const router = useRouter();
  const styles = useStyles();
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>();
  const [formError, setFormError] = useState<string>();

  const handleSubmit = (values: BikeFormValues) => {
    setSubmitting(true);
    setFormError(undefined);
    const result = MotorcycleService.createBike(toMotorcycleInput(values));
    setSubmitting(false);
    if (!result.ok) {
      setFieldErrors(result.error.fieldErrors);
      setFormError(result.error.message);
      return;
    }
    router.replace('/(tabs)');
  };

  return (
    <Screen>
      <Text style={styles.title}>Add motorcycle</Text>
      {formError !== undefined ? <Text style={styles.error}>{formError}</Text> : null}
      <BikeForm submitLabel="Save" submitting={submitting} onSubmit={handleSubmit} fieldErrors={fieldErrors} />
    </Screen>
  );
}
