import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { ConfirmDialog } from '@/components/ConfirmDialog';
import { DestructiveButton } from '@/components/DestructiveButton';
import { Screen } from '@/components/Screen';
import { SecondaryButton } from '@/components/SecondaryButton';
import { MotorcycleRepository } from '@/db/repositories/MotorcycleRepository';
import { BikeForm, toMotorcycleInput, type BikeFormValues } from '@/features/garage/ui/BikeForm';
import { MotorcycleService } from '@/services/MotorcycleService';
import { makeStyles, typeStyle } from '@/theme/styles';

const useStyles = makeStyles((t) => ({
  title: typeStyle(t.type.h1, t.text.primary),
  error: typeStyle(t.type.caption, t.feedback.error.base),
  actions: { gap: t.space.s2, marginTop: t.space.s2 },
}));

/** S-02 edit mode — includes archive/delete actions per FEATURE_SPECIFICATIONS.md §2. */
export default function EditBikeRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const styles = useStyles();
  const bike = MotorcycleRepository.getById(id);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>();
  const [formError, setFormError] = useState<string>();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  if (bike === undefined) {
    return (
      <Screen>
        <Text style={styles.title}>Motorcycle not found</Text>
      </Screen>
    );
  }

  const handleSubmit = (values: BikeFormValues) => {
    setSubmitting(true);
    setFormError(undefined);
    const result = MotorcycleService.updateBike(bike.id, toMotorcycleInput(values));
    setSubmitting(false);
    if (!result.ok) {
      setFieldErrors(result.error.fieldErrors);
      setFormError(result.error.message);
      return;
    }
    router.back();
  };

  const handleArchiveToggle = () => {
    MotorcycleService.setArchived(bike.id, bike.isArchived === 0);
    router.back();
  };

  const handleDelete = () => {
    setConfirmingDelete(false);
    MotorcycleService.deleteBike(bike.id);
    router.replace('/(tabs)');
  };

  return (
    <Screen>
      <Text style={styles.title}>Edit motorcycle</Text>
      {formError !== undefined ? <Text style={styles.error}>{formError}</Text> : null}
      <BikeForm
        initial={bike}
        submitLabel="Save changes"
        submitting={submitting}
        onSubmit={handleSubmit}
        fieldErrors={fieldErrors}
      />
      <View style={styles.actions}>
        <SecondaryButton
          label={bike.isArchived === 0 ? 'Archive' : 'Unarchive'}
          onPress={handleArchiveToggle}
        />
        <DestructiveButton label="Delete motorcycle" onPress={() => setConfirmingDelete(true)} />
      </View>
      <ConfirmDialog
        visible={confirmingDelete}
        title="Delete this motorcycle?"
        body={`Type "${bike.nickname}" to confirm. This removes all its records — recoverable for 30 days.`}
        confirmLabel="Delete"
        typedConfirmation={bike.nickname}
        onConfirm={handleDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    </Screen>
  );
}
