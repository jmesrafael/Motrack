import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';

import { FormField } from '@/components/FormField';
import { ImagesField } from '@/components/ImagesField';
import { MoneyInput } from '@/components/MoneyInput';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TextField } from '@/components/TextField';
import { showToast } from '@/components/Toast';
import { useActiveBike } from '@/hooks/useActiveBike';
import { BuildService } from '@/services/BuildService';
import { makeStyles, typeStyle } from '@/theme/styles';

const useStyles = makeStyles((t) => ({
  title: typeStyle(t.type.h1, t.text.primary),
  error: typeStyle(t.type.caption, t.feedback.error.base),
}));

/** New Build (item 18): name, description, optional cover photo, optional budget. */
export default function NewBuildRoute() {
  const router = useRouter();
  const styles = useStyles();
  const { activeBike } = useActiveBike();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [coverPhoto, setCoverPhoto] = useState<string[]>([]);
  const [error, setError] = useState<string>();

  if (activeBike === null) {
    return (
      <Screen>
        <Text style={styles.title}>No motorcycle selected</Text>
      </Screen>
    );
  }

  const handleSave = () => {
    const result = BuildService.saveBuild(activeBike.id, {
      name,
      description: description !== '' ? description : null,
      coverPhoto: coverPhoto[0] ?? null,
      budgetCentavos: budget !== '' ? Math.round(Number(budget) * 100) : null,
    });
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    showToast('Build created');
    router.replace(`/builds/${result.value.id}` as never);
  };

  return (
    <Screen>
      <ScreenHeader title="New Build" />
      {error !== undefined ? <Text style={styles.error}>{error}</Text> : null}
      <FormField label="Name" required>
        <TextField value={name} onChangeText={setName} maxLength={50} placeholder="e.g. Classic Build" />
      </FormField>
      <FormField label="Description">
        <TextField value={description} onChangeText={setDescription} maxLength={500} multiline />
      </FormField>
      <FormField label="Budget" hint="Optional. Shown as progress on the Build page.">
        <MoneyInput value={budget} onChange={setBudget} />
      </FormField>
      <FormField label="Cover photo">
        <ImagesField images={coverPhoto} onChange={setCoverPhoto} maxImages={1} />
      </FormField>
      <PrimaryButton label="Create Build" onPress={handleSave} />
    </Screen>
  );
}
