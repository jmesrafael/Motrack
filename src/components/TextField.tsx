import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { makeStyles } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';

export type TextFieldProps = TextInputProps;

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    input: {
      minHeight: 44,
      borderRadius: t.radius.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.border.divider,
      backgroundColor: t.bg.input,
      paddingHorizontal: t.space.s3,
      color: t.text.primary,
      fontSize: t.type.body.fontSize,
    },
  }),
);

export function TextField(props: TextFieldProps) {
  const styles = useStyles();
  const { tokens } = useTheme();
  return <TextInput style={styles.input} placeholderTextColor={tokens.text.placeholder} {...props} />;
}
