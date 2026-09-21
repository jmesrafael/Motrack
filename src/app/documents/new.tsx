import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Text, View } from 'react-native';

import { DateField } from '@/components/DateField';
import { FormField } from '@/components/FormField';
import { Icon } from '@/components/Icon';
import { PickerField } from '@/components/PickerField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SecondaryButton } from '@/components/SecondaryButton';
import { TextField } from '@/components/TextField';
import { showToast } from '@/components/Toast';
import { useActiveBike } from '@/hooks/useActiveBike';
import { strings } from '@/i18n/strings';
import { todayIso } from '@/lib/dates';
import { pickAnyFile, pickImageFromCamera, pickImagesFromLibrary } from '@/lib/pickers';
import { DocumentService, type PickedFile } from '@/services/DocumentService';
import { makeStyles, typeStyle } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';
import { DOC_TYPES, EXPIRY_DOC_TYPES, type DocType } from '@/types/enums';

const useStyles = makeStyles((t) => ({
  title: typeStyle(t.type.h1, t.text.primary),
  error: typeStyle(t.type.caption, t.feedback.error.base),
  caption: typeStyle(t.type.caption, t.text.secondary),
  hint: typeStyle(t.type.caption, t.text.tertiary),
  previewRow: { flexDirection: 'row', flexWrap: 'wrap', gap: t.space.s2, marginBottom: t.space.s2 },
  previewThumb: { width: 72, height: 72, borderRadius: t.radius.md },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.space.s2,
    padding: t.space.s3,
    borderRadius: t.radius.md,
    backgroundColor: t.bg.surfaceVariant,
  },
  fileCardText: { flex: 1 },
}));

const DOC_TYPE_OPTIONS = DOC_TYPES.map((d) => ({ value: d, label: strings.docTypes[d] }));

/** S-27 Document add — camera/library/file source, then metadata, with an immediate preview (item 20). */
export default function AddDocumentRoute() {
  const router = useRouter();
  const styles = useStyles();
  const { tokens } = useTheme();
  const { activeBike } = useActiveBike();

  const [docType, setDocType] = useState<DocType>('orcr');
  const [title, setTitle] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState(todayIso());
  const [notes, setNotes] = useState('');
  const [link, setLink] = useState('');
  const [files, setFiles] = useState<PickedFile[]>([]);
  const [error, setError] = useState<string>();

  const canHaveExpiry = EXPIRY_DOC_TYPES.includes(docType);

  const pickFromLibrary = async () => {
    const assets = await pickImagesFromLibrary({ allowsMultipleSelection: true });
    setFiles((prev) => [...prev, ...assets]);
  };

  const pickFromCamera = async () => {
    const result = await pickImageFromCamera();
    if (result.status === 'permissionDenied') {
      setError('Camera permission denied');
      return;
    }
    if (result.status === 'captured') {
      setFiles((prev) => [...prev, result.asset]);
    }
  };

  const pickFile = async () => {
    const asset = await pickAnyFile();
    if (asset !== null) {
      setFiles((prev) => [...prev, asset]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (files.length === 0) {
      setError('Pick at least one photo or file');
      return;
    }
    const result = DocumentService.importDocument(files, {
      motorcycleId: docType === 'license' ? null : (activeBike?.id ?? null),
      docType,
      title: title !== '' ? title : strings.docTypes[docType],
      documentNumber: documentNumber !== '' ? documentNumber : null,
      expiryDate: canHaveExpiry ? expiryDate : null,
      notes: notes !== '' ? notes : null,
      link: link !== '' ? link : null,
    });
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    showToast('Document saved');
    router.back();
  };

  return (
    <Screen>
      <ScreenHeader title="Add document" />
      {error !== undefined ? <Text style={styles.error}>{error}</Text> : null}
      <FormField label="Type" required>
        <PickerField options={DOC_TYPE_OPTIONS} value={docType} onChange={setDocType} placeholder="Select type" />
      </FormField>

      {files.length > 0 ? (
        <View style={styles.previewRow}>
          {files.map((file, index) =>
            file.mimeType.startsWith('image/') ? (
              <View key={`${file.uri}-${index}`}>
                <Image source={{ uri: file.uri }} style={styles.previewThumb} resizeMode="cover" />
                <SecondaryButton label="Remove" size="sm" onPress={() => removeFile(index)} />
              </View>
            ) : (
              <View key={`${file.uri}-${index}`} style={styles.fileCard}>
                <Icon name="file" size={tokens.iconSize.listLeading} color={tokens.icon.secondary} />
                <View style={styles.fileCardText}>
                  <Text numberOfLines={1}>{file.name}</Text>
                  <Text style={styles.caption}>{Math.max(1, Math.round(file.size / 1024))} KB</Text>
                </View>
                <SecondaryButton label="Remove" size="sm" onPress={() => removeFile(index)} />
              </View>
            ),
          )}
        </View>
      ) : null}

      <SecondaryButton icon="camera" label="Take photo" onPress={() => void pickFromCamera()} block />
      <SecondaryButton icon="image" label="Choose from library" onPress={() => void pickFromLibrary()} block />
      <SecondaryButton icon="file" label="Choose file (PDF)" onPress={() => void pickFile()} block />

      <FormField label="Title" required>
        <TextField value={title} onChangeText={setTitle} maxLength={60} placeholder={strings.docTypes[docType]} />
      </FormField>
      <FormField label="Number" hint="Optional, e.g. the OR/CR or policy number.">
        <TextField value={documentNumber} onChangeText={setDocumentNumber} maxLength={40} />
      </FormField>
      {canHaveExpiry ? (
        <FormField label="Expiry date">
          <DateField value={expiryDate} onChange={setExpiryDate} />
        </FormField>
      ) : null}
      <FormField label="Notes">
        <TextField value={notes} onChangeText={setNotes} multiline maxLength={500} />
        <Text style={styles.hint}>Tip: You can save your LTO online portal link here.</Text>
      </FormField>
      <FormField label="Link" hint="Optional.">
        <TextField
          value={link}
          onChangeText={setLink}
          placeholder="https://"
          autoCapitalize="none"
          keyboardType="url"
        />
      </FormField>
      <PrimaryButton label="Save" onPress={handleSave} />
    </Screen>
  );
}
