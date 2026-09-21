import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';

import { ConfirmDialog } from '@/components/ConfirmDialog';
import { DestructiveButton } from '@/components/DestructiveButton';
import { FormField } from '@/components/FormField';
import { ImagesField } from '@/components/ImagesField';
import { MoneyInput } from '@/components/MoneyInput';
import { PickerField } from '@/components/PickerField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TextField } from '@/components/TextField';
import { showToast } from '@/components/Toast';
import { BuildPlanItemRepository } from '@/db/repositories/BuildPlanItemRepository';
import { BuildService } from '@/services/BuildService';
import { BUILD_PLAN_PRIORITIES, type BuildPlanPriority } from '@/types/enums';
import { makeStyles, typeStyle } from '@/theme/styles';

const useStyles = makeStyles((t) => ({
  title: typeStyle(t.type.h1, t.text.primary),
  error: typeStyle(t.type.caption, t.feedback.error.base),
}));

const PRIORITY_OPTIONS = BUILD_PLAN_PRIORITIES.map((p) => ({
  value: p,
  label: p === 'low' ? 'Low' : p === 'high' ? 'High' : 'Normal',
}));

/** Add/edit a planned upgrade (item 19): price, photos/screenshots, product link, notes, priority. */
export default function PlanItemFormRoute() {
  const { id: buildId, itemId } = useLocalSearchParams<{ id: string; itemId?: string }>();
  const router = useRouter();
  const styles = useStyles();
  const existing = itemId !== undefined ? BuildPlanItemRepository.getById(itemId) : undefined;

  const [name, setName] = useState(existing?.name ?? '');
  const [price, setPrice] = useState(
    existing?.estimatedPriceCentavos !== undefined && existing?.estimatedPriceCentavos !== null
      ? (existing.estimatedPriceCentavos / 100).toFixed(2)
      : '',
  );
  const [productLink, setProductLink] = useState(existing?.productLink ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [priority, setPriority] = useState<BuildPlanPriority>((existing?.priority as BuildPlanPriority) ?? 'normal');
  const [photos, setPhotos] = useState<string[]>(
    existing?.photos !== undefined && existing?.photos !== null ? (JSON.parse(existing.photos) as string[]) : [],
  );
  const [error, setError] = useState<string>();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const handleSave = () => {
    const input = {
      name,
      estimatedPriceCentavos: price !== '' ? Math.round(Number(price) * 100) : null,
      photos: photos.length > 0 ? photos : null,
      productLink: productLink !== '' ? productLink : null,
      notes: notes !== '' ? notes : null,
      priority,
    };
    const result =
      existing !== undefined ? BuildService.editPlanItem(existing.id, input) : BuildService.addPlanItem(buildId, input);
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    showToast(existing !== undefined ? 'Item updated' : 'Item added to plan');
    router.back();
  };

  const handleDelete = () => {
    setConfirmingDelete(false);
    if (existing !== undefined) {
      BuildService.deletePlanItem(existing.id);
      showToast({ kind: 'info', message: 'Item removed' });
      router.back();
    }
  };

  return (
    <Screen>
      <ScreenHeader title={existing !== undefined ? 'Edit planned item' : 'Add planned item'} />
      {error !== undefined ? <Text style={styles.error}>{error}</Text> : null}
      <FormField label="Name" required>
        <TextField value={name} onChangeText={setName} maxLength={60} placeholder="e.g. Aftermarket exhaust" />
      </FormField>
      <FormField label="Estimated price">
        <MoneyInput value={price} onChange={setPrice} />
      </FormField>
      <FormField label="Priority">
        <PickerField options={PRIORITY_OPTIONS} value={priority} onChange={setPriority} placeholder="Priority" />
      </FormField>
      <FormField label="Product link" hint="Paste the Shopee/Lazada/shop link if you have one.">
        <TextField
          value={productLink}
          onChangeText={setProductLink}
          maxLength={500}
          autoCapitalize="none"
          keyboardType="url"
        />
      </FormField>
      <FormField label="Notes">
        <TextField value={notes} onChangeText={setNotes} maxLength={500} multiline />
      </FormField>
      <FormField label="Photos / screenshots">
        <ImagesField images={photos} onChange={setPhotos} />
      </FormField>
      <PrimaryButton label={existing !== undefined ? 'Save changes' : 'Add to plan'} onPress={handleSave} />
      {existing !== undefined ? (
        <DestructiveButton label="Delete planned item" onPress={() => setConfirmingDelete(true)} />
      ) : null}
      <ConfirmDialog
        visible={confirmingDelete}
        title="Delete this planned item?"
        body="This removes it from your Build plan."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    </Screen>
  );
}
