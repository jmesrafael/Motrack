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
    label: typeStyle(t.type.label, t.text.secondary),
    error: typeStyle(t.type.caption, t.feedback.error.base),
    hint: typeStyle(t.type.caption, t.text.tertiary),
  }),
);

/** Label-above wrapper; error text announced via accessibilityLiveRegion (COMPONENT_LIBRARY.md). */
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
