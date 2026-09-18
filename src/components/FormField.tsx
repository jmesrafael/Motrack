import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { makeStyles, typeStyle } from '@/theme/styles';

export interface FormFieldProps {
  label: string;
  error?: string | undefined;
  hint?: string | undefined;
  required?: boolean;
  children: ReactNode;
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: { gap: t.space.s1 },
    label: typeStyle(t.type.label, t.text.secondary, t.type.family),
    error: typeStyle(t.type.caption, t.feedback.error.base, t.type.family),
    hint: typeStyle(t.type.caption, t.text.tertiary, t.type.family),
  }),
);

/** Label-above wrapper; error text announced via accessibilityLiveRegion. */
export function FormField({ label, error, hint, required = false, children }: FormFieldProps) {
  const styles = useStyles();
  return (
    <View style={styles.root}>
      <Text style={styles.label}>
        {label}
        {required ? ' *' : ''}
      </Text>
      {children}
      {error !== undefined ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : hint !== undefined ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}
