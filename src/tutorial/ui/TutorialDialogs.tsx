import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { SecondaryButton } from '@/components/SecondaryButton';
import { strings } from '@/i18n/strings';
import { makeStyles, typeStyle } from '@/theme/styles';

/**
 * Tour offer + resume dialogs. Three stacked choices each (ConfirmDialog is a
 * two-action component, so these are their own small modals). Dismissable via
 * hardware back / backdrop — declining is always available.
 */

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
    actions: { gap: t.space.s2, marginTop: t.space.s2 },
    tertiaryButton: {
      minHeight: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tertiaryLabel: typeStyle(t.type.bodyStrong, t.text.secondary),
  }),
);

interface ChoiceDialogProps {
  visible: boolean;
  title: string;
  body: string;
  primaryLabel: string;
  secondaryLabel: string;
  tertiaryLabel: string;
  onPrimary: () => void;
  onSecondary: () => void;
  onTertiary: () => void;
}

function ChoiceDialog({
  visible,
  title,
  body,
  primaryLabel,
  secondaryLabel,
  tertiaryLabel,
  onPrimary,
  onSecondary,
  onTertiary,
}: ChoiceDialogProps) {
  const styles = useStyles();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onSecondary}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title} accessibilityRole="header">
            {title}
          </Text>
          <Text style={styles.body}>{body}</Text>
          <View style={styles.actions}>
            <PrimaryButton label={primaryLabel} onPress={onPrimary} />
            <SecondaryButton label={secondaryLabel} onPress={onSecondary} />
            <Pressable
              onPress={onTertiary}
              accessibilityRole="button"
              accessibilityLabel={tertiaryLabel}
              style={({ pressed }) => [styles.tertiaryButton, pressed && { opacity: 0.7 }]}>
              <Text style={styles.tertiaryLabel}>{tertiaryLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export interface TourOfferDialogProps {
  visible: boolean;
  onStart: () => void;
  onLater: () => void;
  onNever: () => void;
}

export function TourOfferDialog({ visible, onStart, onLater, onNever }: TourOfferDialogProps) {
  return (
    <ChoiceDialog
      visible={visible}
      title={strings.tutorial.offer.title}
      body={strings.tutorial.offer.body}
      primaryLabel={strings.tutorial.offer.start}
      secondaryLabel={strings.tutorial.offer.later}
      tertiaryLabel={strings.tutorial.offer.never}
      onPrimary={onStart}
      onSecondary={onLater}
      onTertiary={onNever}
    />
  );
}

export interface ResumeDialogProps {
  visible: boolean;
  onResume: () => void;
  onRestart: () => void;
  onDismiss: () => void;
}

export function ResumeDialog({ visible, onResume, onRestart, onDismiss }: ResumeDialogProps) {
  return (
    <ChoiceDialog
      visible={visible}
      title={strings.tutorial.resume.title}
      body={strings.tutorial.resume.body}
      primaryLabel={strings.tutorial.resume.resume}
      secondaryLabel={strings.tutorial.resume.restart}
      tertiaryLabel={strings.tutorial.resume.dismiss}
      onPrimary={onResume}
      onSecondary={onRestart}
      onTertiary={onDismiss}
    />
  );
}
