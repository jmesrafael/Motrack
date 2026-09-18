import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';

import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { showToast } from '@/components/Toast';
import { BikeForm, toMotorcycleInput, type BikeFormValues } from '@/features/garage/ui/BikeForm';
import { MotorcycleService } from '@/services/MotorcycleService';
import { makeStyles, typeStyle } from '@/theme/styles';

const useStyles = makeStyles((t) => ({
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
    showToast(`${result.value.nickname} added`);
    router.replace('/(tabs)');
  };

  return (
    <Screen>
      <ScreenHeader title="Add motorcycle" />
      {formError !== undefined ? <Text style={styles.error}>{formError}</Text> : null}
      <BikeForm submitLabel="Save" submitting={submitting} onSubmit={handleSubmit} fieldErrors={fieldErrors} />
    </Screen>
  );
}
