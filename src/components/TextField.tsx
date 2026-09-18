import { useState } from 'react';
import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { makeStyles } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';

export type TextFieldProps = TextInputProps;

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    input: {
      minHeight: t.size.input,
      borderRadius: t.radius.sm,
      borderWidth: 1.5,
      borderColor: 'transparent',
      backgroundColor: t.bg.input,
      paddingHorizontal: t.space.s4,
      color: t.text.primary,
      fontSize: t.type.body.fontSize,
    },
    focused: {
      borderColor: t.border.focus,
      backgroundColor: t.bg.inputFocused,
    },
  }),
);

/** Text input with a lime focus ring — the one look every text field shares. */
export function TextField({ style, onFocus, onBlur, ...props }: TextFieldProps) {
  const styles = useStyles();
  const { tokens } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <TextInput
      style={[styles.input, focused && styles.focused, style]}
      placeholderTextColor={tokens.text.placeholder}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      {...props}
    />
  );
}
