import { Pressable, StyleSheet } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { interpolate, strings } from '@/i18n/strings';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { makeStyles } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';

/**
 * Validation-phase switcher: steps system → light → dark. The shipped picker
 * lives in Settings and lists the registry (S-30, THEME_GUIDE.md §5).
 */
const PREFERENCE_ICONS: Partial<Record<string, IconName>> = {
  system: 'themeSystem',
  light: 'themeLight',
  dark: 'themeDark',
};

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    button: {
      width: 44,
      height: 44,
      borderRadius: t.radius.full,
      backgroundColor: t.bg.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
    },
  }),
);

export function ThemeCycleButton() {
  const styles = useStyles();
  const { tokens, preference } = useTheme();
  const cycle = useSettingsStore((s) => s.cycleThemePreference);

  const modeLabel =
    preference === 'system'
      ? strings.themeSwitcher.system
      : preference === 'light'
        ? strings.themeSwitcher.light
        : strings.themeSwitcher.dark;

  return (
    <Pressable
      onPress={cycle}
      accessibilityRole="button"
      accessibilityLabel={interpolate(strings.themeSwitcher.a11y, { mode: modeLabel })}
      style={({ pressed }) => [styles.button, pressed && { opacity: 0.7 }]}>
      <Icon
        name={PREFERENCE_ICONS[preference] ?? 'themeSystem'}
        size={tokens.iconSize.md}
      />
    </Pressable>
  );
}
