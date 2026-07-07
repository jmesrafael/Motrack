import { useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';

import { DestructiveButton } from '@/components/DestructiveButton';
import { SecondaryButton } from '@/components/SecondaryButton';
import { TextField } from '@/components/TextField';
import { makeStyles, typeStyle } from '@/theme/styles';

export interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  /** User must type this exact string to enable confirm (delete bike/all data). */
  typedConfirmation?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: t.overlay.scrim,
      alignItems: 'center',
      justifyContent: 'center',
      padding: t.space.s5,
    },
    sheet: {
      width: '100%',
      maxWidth: 400,
      backgroundColor: t.bg.sheet,
      borderRadius: t.radius.lg,
      padding: t.space.s5,
      gap: t.space.s3,
    },
    title: typeStyle(t.type.h2, t.text.primary),
    body: typeStyle(t.type.body, t.text.secondary),
    actions: { flexDirection: 'row', gap: t.space.s2, justifyContent: 'flex-end' },
  }),
);

export function ConfirmDialog({
  visible,
  title,
  body,
  confirmLabel,
  typedConfirmation,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const styles = useStyles();
  const [typed, setTyped] = useState('');
  const canConfirm = typedConfirmation === undefined || typed === typedConfirmation;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title} accessibilityRole="header">
            {title}
          </Text>
          <Text style={styles.body}>{body}</Text>
          {typedConfirmation !== undefined ? (
            <TextField
              value={typed}
              onChangeText={setTyped}
              placeholder={typedConfirmation}
              autoCapitalize="none"
              accessibilityLabel={`Type ${typedConfirmation} to confirm`}
            />
          ) : null}
          <View style={styles.actions}>
            <SecondaryButton label="Cancel" onPress={onCancel} />
            <DestructiveButton label={confirmLabel} onPress={onConfirm} disabled={!canConfirm} />
          </View>
        </View>
      </View>
    </Modal>
  );
}
