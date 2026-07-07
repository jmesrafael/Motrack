import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, Text } from 'react-native';

import { ConfirmDialog } from '@/components/ConfirmDialog';
import { DestructiveButton } from '@/components/DestructiveButton';
import { Screen } from '@/components/Screen';
import { DocumentRepository } from '@/db/repositories/DocumentRepository';
import { strings } from '@/i18n/strings';
import { DocumentService } from '@/services/DocumentService';
import { makeStyles, typeStyle } from '@/theme/styles';
import type { DocType } from '@/types/enums';
import { useState } from 'react';

const useStyles = makeStyles((t) => ({
  title: typeStyle(t.type.h1, t.text.primary),
  caption: typeStyle(t.type.caption, t.text.secondary),
  image: { width: '100%', height: 300, borderRadius: t.radius.md, marginVertical: t.space.s3 },
}));

/** S-27 Document view — image viewer + metadata + delete. */
export default function DocumentDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const styles = useStyles();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const doc = DocumentRepository.getById(id);

  if (doc === undefined) {
    return (
      <Screen>
        <Text style={styles.title}>Document not found</Text>
      </Screen>
    );
  }

  const isImage = doc.mimeType.startsWith('image/');
  const uri = DocumentService.viewUri(doc);

  const handleDelete = () => {
    setConfirmingDelete(false);
    DocumentService.deleteDocument(doc.id);
    router.back();
  };

  return (
    <Screen>
      <Text style={styles.title}>{doc.title}</Text>
      <Text style={styles.caption}>{strings.docTypes[doc.docType as DocType]}</Text>
      {doc.expiryDate !== null ? <Text style={styles.caption}>Expires {doc.expiryDate}</Text> : null}
      {isImage ? <Image source={{ uri }} style={styles.image} resizeMode="contain" /> : null}
      {doc.notes !== null ? <Text style={styles.caption}>{doc.notes}</Text> : null}
      <DestructiveButton label="Delete document" onPress={() => setConfirmingDelete(true)} />
      <ConfirmDialog
        visible={confirmingDelete}
        title="Delete this document?"
        body="This can be recovered for 30 days."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    </Screen>
  );
}
