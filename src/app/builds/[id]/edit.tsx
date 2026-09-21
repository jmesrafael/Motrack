import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';

import { ConfirmDialog } from '@/components/ConfirmDialog';
import { DestructiveButton } from '@/components/DestructiveButton';
import { FormField } from '@/components/FormField';
import { ImagesField } from '@/components/ImagesField';
import { MoneyInput } from '@/components/MoneyInput';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TextField } from '@/components/TextField';
import { showToast } from '@/components/Toast';
import { BuildRepository } from '@/db/repositories/BuildRepository';
import { BuildService } from '@/services/BuildService';
import { makeStyles, typeStyle } from '@/theme/styles';

const useStyles = makeStyles((t) => ({
  title: typeStyle(t.type.h1, t.text.primary),
  error: typeStyle(t.type.caption, t.feedback.error.base),
}));

/** Edit/delete a Build (item 18). Deleting keeps expense history, just unlinks it. */
export default function EditBuildRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const styles = useStyles();
  const build = BuildRepository.getById(id);

  const [name, setName] = useState(build?.name ?? '');
  const [description, setDescription] = useState(build?.description ?? '');
  const [budget, setBudget] = useState(
    build?.budgetCentavos !== undefined && build?.budgetCentavos !== null
      ? (build.budgetCentavos / 100).toFixed(2)
      : '',
  );
  const [coverPhoto, setCoverPhoto] = useState<string[]>(build?.coverPhoto !== null && build?.coverPhoto !== undefined ? [build.coverPhoto] : []);
  const [error, setError] = useState<string>();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  if (build === undefined) {
    return (
      <Screen>
        <ScreenHeader title="Not found" />
      </Screen>
    );
  }

  const handleSave = () => {
    const result = BuildService.editBuild(id, {
      name,
      description: description !== '' ? description : null,
      coverPhoto: coverPhoto[0] ?? null,
      budgetCentavos: budget !== '' ? Math.round(Number(budget) * 100) : null,
    });
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    showToast('Build updated');
    router.back();
  };

  const handleDelete = () => {
    setConfirmingDelete(false);
    BuildService.deleteBuild(id);
    showToast({ kind: 'info', message: 'Build deleted' });
    router.replace('/builds' as never);
  };

  return (
    <Screen>
      <ScreenHeader title="Edit Build" />
      {error !== undefined ? <Text style={styles.error}>{error}</Text> : null}
      <FormField label="Name" required>
        <TextField value={name} onChangeText={setName} maxLength={50} />
      </FormField>
      <FormField label="Description">
        <TextField value={description} onChangeText={setDescription} maxLength={500} multiline />
      </FormField>
      <FormField label="Budget">
        <MoneyInput value={budget} onChange={setBudget} />
      </FormField>
      <FormField label="Cover photo">
        <ImagesField images={coverPhoto} onChange={setCoverPhoto} maxImages={1} />
      </FormField>
      <PrimaryButton label="Save changes" onPress={handleSave} />
      <DestructiveButton label="Delete Build" onPress={() => setConfirmingDelete(true)} />
      <ConfirmDialog
        visible={confirmingDelete}
        title="Delete this Build?"
        body="Expenses you assigned to it are kept in your history, just no longer grouped under this Build. Planned items are removed."
        confirmLabel="Delete Build"
        onConfirm={handleDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    </Screen>
  );
}
