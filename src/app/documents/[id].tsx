import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Linking, Pressable, Text, View } from 'react-native';

import { ConfirmDialog } from '@/components/ConfirmDialog';
import { DateField } from '@/components/DateField';
import { DestructiveButton } from '@/components/DestructiveButton';
import { FormField } from '@/components/FormField';
import { Icon } from '@/components/Icon';
import { ImageViewerModal } from '@/components/ImageViewerModal';
import { PickerField } from '@/components/PickerField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SecondaryButton } from '@/components/SecondaryButton';
import { TextField } from '@/components/TextField';
import { showToast } from '@/components/Toast';
import { allFiles, DocumentRepository, type DocFile } from '@/db/repositories/DocumentRepository';
import { strings } from '@/i18n/strings';
import { todayIso } from '@/lib/dates';
import { DocumentService, type PickedFile } from '@/services/DocumentService';
import { ImageStorage } from '@/services/imageStorage';
import { makeStyles, typeStyle } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';
import { DOC_TYPES, EXPIRY_DOC_TYPES, type DocType } from '@/types/enums';

type FileEntry = DocFile | PickedFile;

const useStyles = makeStyles((t) => ({
  title: typeStyle(t.type.h1, t.text.primary),
  caption: typeStyle(t.type.caption, t.text.secondary),
  hint: typeStyle(t.type.caption, t.text.tertiary),
  link: { ...typeStyle(t.type.body, t.primary.text), textDecorationLine: 'underline' },
  error: typeStyle(t.type.caption, t.feedback.error.base),
  previewRow: { flexDirection: 'row', flexWrap: 'wrap', gap: t.space.s2, marginBottom: t.space.s2 },
  previewThumb: { width: 88, height: 88, borderRadius: t.radius.md },
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

function isImageFile(f: FileEntry): boolean {
  return f.mimeType.startsWith('image/');
}

function uriFor(f: FileEntry): string {
  return 'uri' in f ? f.uri : ImageStorage.uriFor(f.path);
}

/** S-27 Document view/edit — previews stay after saving, every field is editable, images support add/replace/remove and full-screen zoom (items 20-22). */
export default function DocumentDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const styles = useStyles();
  const { tokens } = useTheme();
  const doc = DocumentRepository.getById(id);

  const [docType, setDocType] = useState<DocType>((doc?.docType as DocType) ?? 'other');
  const [title, setTitle] = useState(doc?.title ?? '');
  const [documentNumber, setDocumentNumber] = useState(doc?.documentNumber ?? '');
  const [expiryDate, setExpiryDate] = useState(doc?.expiryDate ?? '');
  const [notes, setNotes] = useState(doc?.notes ?? '');
  const [link, setLink] = useState(doc?.link ?? '');
  const [files, setFiles] = useState<FileEntry[]>(doc !== undefined ? allFiles(doc) : []);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [error, setError] = useState<string>();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  if (doc === undefined) {
    return (
      <Screen>
        <ScreenHeader title="Document not found" />
      </Screen>
    );
  }

  const canHaveExpiry = EXPIRY_DOC_TYPES.includes(docType);
  const imageIndexes = files.map((f, i) => (isImageFile(f) ? i : -1)).filter((i) => i >= 0);
  const imageUris = imageIndexes.map((i) => uriFor(files[i]!));

  const addFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7, allowsMultipleSelection: true });
    if (!result.canceled) {
      setFiles((prev) => [
        ...prev,
        ...result.assets.map((asset) => ({
          uri: asset.uri,
          name: asset.fileName ?? 'photo.jpg',
          mimeType: asset.mimeType ?? 'image/jpeg',
          size: asset.fileSize ?? 0,
        })),
      ]);
    }
  };

  const addFromCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled && result.assets[0] !== undefined) {
      const asset = result.assets[0];
      setFiles((prev) => [
        ...prev,
        { uri: asset.uri, name: asset.fileName ?? 'photo.jpg', mimeType: asset.mimeType ?? 'image/jpeg', size: asset.fileSize ?? 0 },
      ]);
    }
  };

  const addFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
    if (!result.canceled && result.assets[0] !== undefined) {
      const asset = result.assets[0];
      setFiles((prev) => [
        ...prev,
        { uri: asset.uri, name: asset.name, mimeType: asset.mimeType ?? 'application/octet-stream', size: asset.size ?? 0 },
      ]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (files.length === 0) {
      setError('A document needs at least one photo or file');
      return;
    }
    const metaResult = DocumentService.updateMetadata(id, {
      motorcycleId: doc.motorcycleId,
      docType,
      title,
      documentNumber: documentNumber !== '' ? documentNumber : null,
      expiryDate: canHaveExpiry && expiryDate !== '' ? expiryDate : null,
      notes: notes !== '' ? notes : null,
      link: link !== '' ? link : null,
    });
    if (!metaResult.ok) {
      setError(metaResult.error.message);
      return;
    }
    const filesResult = DocumentService.updateFiles(id, files);
    if (!filesResult.ok) {
      setError(filesResult.error.message);
      return;
    }
    showToast('Document updated');
    router.back();
  };

  const handleDelete = () => {
    setConfirmingDelete(false);
    DocumentService.deleteDocument(doc.id);
    showToast({ kind: 'info', message: 'Document deleted' });
    router.back();
  };

  const openLink = () => {
    if (link !== '') {
      void Linking.openURL(link);
    }
  };

  return (
    <Screen>
      <ScreenHeader title={doc.title} />
      {error !== undefined ? <Text style={styles.error}>{error}</Text> : null}

      {files.length > 0 ? (
        <View style={styles.previewRow}>
          {files.map((file, index) => {
            const imgIdx = imageIndexes.indexOf(index);
            return isImageFile(file) ? (
              <Pressable
                key={uriFor(file) + index}
                onPress={() => setViewerIndex(imgIdx)}
                accessibilityRole="imagebutton"
                accessibilityLabel={`Open image ${imgIdx + 1}`}>
                <Image source={{ uri: uriFor(file) }} style={styles.previewThumb} resizeMode="cover" />
                <SecondaryButton label="Remove" size="sm" onPress={() => removeFile(index)} />
              </Pressable>
            ) : (
              <View key={uriFor(file) + index} style={styles.fileCard}>
                <Icon name="file" size={tokens.iconSize.listLeading} color={tokens.icon.secondary} />
                <View style={styles.fileCardText}>
                  <Text numberOfLines={1}>{'name' in file ? file.name : file.path}</Text>
                </View>
                <SecondaryButton label="Remove" size="sm" onPress={() => removeFile(index)} />
              </View>
            );
          })}
        </View>
      ) : null}
      <SecondaryButton icon="camera" label="Take photo" onPress={() => void addFromCamera()} block />
      <SecondaryButton icon="image" label="Add from library" onPress={() => void addFromLibrary()} block />
      <SecondaryButton icon="file" label="Add file (PDF)" onPress={() => void addFile()} block />

      <FormField label="Type" required>
        <PickerField options={DOC_TYPE_OPTIONS} value={docType} onChange={setDocType} placeholder="Select type" />
      </FormField>
      <FormField label="Name" required>
        <TextField value={title} onChangeText={setTitle} maxLength={60} />
      </FormField>
      <FormField label="Number" hint="Optional, e.g. the OR/CR or policy number.">
        <TextField value={documentNumber} onChangeText={setDocumentNumber} maxLength={40} />
      </FormField>
      {canHaveExpiry ? (
        <FormField label="Expiry date">
          <DateField value={expiryDate !== '' ? expiryDate : todayIso()} onChange={setExpiryDate} />
        </FormField>
      ) : null}
      <FormField label="Notes">
        <TextField value={notes} onChangeText={setNotes} multiline maxLength={500} />
        <Text style={styles.hint}>Tip: You can save your LTO online portal link here.</Text>
      </FormField>
      <FormField label="Link" hint="Optional. Opens in your browser when tapped.">
        <TextField value={link} onChangeText={setLink} placeholder="https://" autoCapitalize="none" keyboardType="url" />
        {link !== '' ? (
          <Pressable onPress={openLink} accessibilityRole="link">
            <Text style={styles.link}>{link}</Text>
          </Pressable>
        ) : null}
      </FormField>

      <PrimaryButton label="Save changes" onPress={handleSave} />
      <DestructiveButton label="Delete document" onPress={() => setConfirmingDelete(true)} />
      <ConfirmDialog
        visible={confirmingDelete}
        title="Delete this document?"
        body="This can be recovered for 30 days."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
      <ImageViewerModal
        visible={viewerIndex !== null}
        images={imageUris}
        initialIndex={viewerIndex ?? 0}
        onClose={() => setViewerIndex(null)}
      />
    </Screen>
  );
}
