import { useState } from 'react';
import { Animated, Modal, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { TextField } from '@/components/TextField';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { makeStyles, shadow, typeStyle } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';

export interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  /** User must type this exact string to enable confirm (delete bike/all data). */
  typedConfirmation?: string;
  /** Renders the confirm action in the destructive style (default true — this component is used for irreversible actions). */
  destructive?: boolean;
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
      borderRadius: t.radius.xl,
      padding: t.space.s5,
      gap: t.space.s3,
      ...shadow(t.elevation.sheet),
    },
    iconWell: {
      width: 52,
      height: 52,
      borderRadius: t.radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: t.space.s1,
    },
    title: typeStyle(t.type.h2, t.text.primary, t.type.family),
    body: typeStyle(t.type.body, t.text.secondary, t.type.family),
    actions: { gap: t.space.s2, marginTop: t.space.s1 },
  }),
);

/**
 * The one alert primitive for important/irreversible actions ("Delete
 * maintenance record?"). Never a browser-default alert. Explains the
 * consequence in `body`; the confirm button reads the action, not "OK".
 */
export function ConfirmDialog({
  visible,
  title,
  body,
  confirmLabel,
  typedConfirmation,
  destructive = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const styles = useStyles();
  const { tokens } = useTheme();
  const reduceMotion = useReducedMotion();
  const [typed, setTyped] = useState('');
  const [scale] = useState(() => new Animated.Value(0.94));
  const [opacity] = useState(() => new Animated.Value(0));
  const canConfirm = typedConfirmation === undefined || typed === typedConfirmation;

  // Reset + animate on the native "shown" event rather than a visible-keyed
  // effect — setState belongs in a callback, not synchronously in an effect
  // body (react-hooks/refs & set-state-in-effect).
  const handleShow = () => {
    setTyped('');
    scale.setValue(0.94);
    opacity.setValue(0);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: reduceMotion ? 0 : 160, useNativeDriver: true }),
      Animated.spring(scale, {
        toValue: 1,
        damping: tokens.motion.spring.damping,
        stiffness: tokens.motion.spring.stiffness,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onShow={handleShow} onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <Animated.View style={[styles.sheet, { opacity, transform: [{ scale }] }]}>
          <View
            style={[
              styles.iconWell,
              { backgroundColor: destructive ? tokens.feedback.error.bg : tokens.primary.bg },
            ]}>
            <Icon
              name={destructive ? 'statusOverdue' : 'help'}
              size={tokens.iconSize.md}
              color={destructive ? tokens.feedback.error.base : tokens.primary.text}
            />
          </View>
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
            <Button
              label={confirmLabel}
              onPress={onConfirm}
              disabled={!canConfirm}
              variant={destructive ? 'destructive' : 'primary'}
              size="md"
              block
            />
            <Button label="Cancel" onPress={onCancel} variant="ghost" size="md" block />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
