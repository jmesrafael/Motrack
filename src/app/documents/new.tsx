import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';

import { DateField } from '@/components/DateField';
import { FormField } from '@/components/FormField';
import { PickerField } from '@/components/PickerField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { SecondaryButton } from '@/components/SecondaryButton';
import { TextField } from '@/components/TextField';
import { useActiveBike } from '@/hooks/useActiveBike';
import { strings } from '@/i18n/strings';
import { todayIso } from '@/lib/dates';
import { DocumentService, type PickedFile } from '@/services/DocumentService';
import { makeStyles, typeStyle } from '@/theme/styles';
import { DOC_TYPES, EXPIRY_DOC_TYPES, type DocType } from '@/types/enums';

const useStyles = makeStyles((t) => ({
  title: typeStyle(t.type.h1, t.text.primary),
  error: typeStyle(t.type.caption, t.feedback.error.base),
  caption: typeStyle(t.type.caption, t.text.secondary),
}));

const DOC_TYPE_OPTIONS = DOC_TYPES.map((d) => ({ value: d, label: strings.docTypes[d] }));

/** S-27 Document add — camera/library/file source, then metadata. */
export default function AddDocumentRoute() {
  const router = useRouter();
  const styles = useStyles();
  const { activeBike } = useActiveBike();

  const [docType, setDocType] = useState<DocType>('orcr');
  const [title, setTitle] = useState('');
  const [expiryDate, setExpiryDate] = useState(todayIso());
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<PickedFile>();
  const [error, setError] = useState<string>();

  const canHaveExpiry = EXPIRY_DOC_TYPES.includes(docType);

  const pickFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
    if (!result.canceled && result.assets[0] !== undefined) {
      const asset = result.assets[0];
      setFile({ uri: asset.uri, name: asset.fileName ?? 'photo.jpg', mimeType: asset.mimeType ?? 'image/jpeg', size: asset.fileSize ?? 0 });
    }
  };

  const pickFromCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setError('Camera permission denied');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled && result.assets[0] !== undefined) {
      const asset = result.assets[0];
      setFile({ uri: asset.uri, name: asset.fileName ?? 'photo.jpg', mimeType: asset.mimeType ?? 'image/jpeg', size: asset.fileSize ?? 0 });
    }
  };

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
    if (!result.canceled && result.assets[0] !== undefined) {
      const asset = result.assets[0];
      setFile({ uri: asset.uri, name: asset.name, mimeType: asset.mimeType ?? 'application/octet-stream', size: asset.size ?? 0 });
    }
  };

  const handleSave = () => {
    if (file === undefined) {
      setError('Pick a photo or file first');
      return;
    }
    const result = DocumentService.importDocument(file, {
      motorcycleId: docType === 'license' ? null : (activeBike?.id ?? null),
      docType,
      title: title !== '' ? title : strings.docTypes[docType],
      expiryDate: canHaveExpiry ? expiryDate : null,
      notes: notes !== '' ? notes : null,
    });
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    router.back();
  };

  return (
    <Screen>
      <Text style={styles.title}>Add document</Text>
      {error !== undefined ? <Text style={styles.error}>{error}</Text> : null}
      <FormField label="Type" required>
        <PickerField options={DOC_TYPE_OPTIONS} value={docType} onChange={setDocType} placeholder="Select type" />
      </FormField>
      <SecondaryButton label={file !== undefined ? 'File selected ✓' : 'Choose from library'} onPress={pickFromLibrary} />
      <SecondaryButton label="Take photo" onPress={pickFromCamera} />
      <SecondaryButton label="Choose file (PDF)" onPress={pickFile} />
      <FormField label="Title" required>
        <TextField value={title} onChangeText={setTitle} maxLength={60} placeholder={strings.docTypes[docType]} />
      </FormField>
      {canHaveExpiry ? (
        <FormField label="Expiry date">
          <DateField value={expiryDate} onChange={setExpiryDate} />
        </FormField>
      ) : null}
      <FormField label="Notes">
        <TextField value={notes} onChangeText={setNotes} multiline maxLength={500} />
      </FormField>
      <PrimaryButton label="Save" onPress={handleSave} />
    </Screen>
  );
}
