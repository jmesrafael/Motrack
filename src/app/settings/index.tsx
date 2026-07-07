import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { ConfirmDialog } from '@/components/ConfirmDialog';
import { DestructiveButton } from '@/components/DestructiveButton';
import { PickerField } from '@/components/PickerField';
import { Screen } from '@/components/Screen';
import { SecondaryButton } from '@/components/SecondaryButton';
import { strings } from '@/i18n/strings';
import { THEME_PREFERENCES } from '@/theme/registry';
import { DataPrivacyService } from '@/services/DataPrivacyService';
import { useSettingsStore, type LanguagePreference } from '@/stores/useSettingsStore';
import { makeStyles, typeStyle } from '@/theme/styles';

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    title: typeStyle(t.type.h1, t.text.primary),
    sectionTitle: { ...typeStyle(t.type.h2, t.text.primary), marginTop: t.space.s4 },
  }),
);

const THEME_OPTIONS = THEME_PREFERENCES.map((p) => ({
  value: p,
  label: p === 'system' ? 'System default' : p === 'light' ? 'Light' : p === 'dark' ? 'Dark' : p,
}));

const LANGUAGE_OPTIONS: { value: LanguagePreference; label: string }[] = [
  { value: 'system', label: 'System default' },
  { value: 'en', label: 'English' },
  { value: 'fil', label: 'Filipino' },
];

/** S-30/31/33 Settings — theme (registry-driven, THEME_GUIDE.md §5), language, data & privacy. */
export default function SettingsRoute() {
  const styles = useStyles();
  const router = useRouter();
  const themePreference = useSettingsStore((s) => s.themePreference);
  const setThemePreference = useSettingsStore((s) => s.setThemePreference);
  const language = useSettingsStore((s) => s.language);
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const [confirmingReset, setConfirmingReset] = useState(false);

  const handleReset = () => {
    setConfirmingReset(false);
    DataPrivacyService.deleteAllData();
    router.replace('/(tabs)');
  };

  return (
    <Screen>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.sectionTitle}>Theme</Text>
      <PickerField options={THEME_OPTIONS} value={themePreference} onChange={setThemePreference} placeholder="Theme" />
      <Text style={styles.sectionTitle}>Language</Text>
      <PickerField options={LANGUAGE_OPTIONS} value={language} onChange={setLanguage} placeholder="Language" />
      <Text style={styles.sectionTitle}>{strings.help.title}</Text>
      <SecondaryButton label={strings.help.title} onPress={() => router.push('/settings/help')} />
      <Text style={styles.sectionTitle}>Data & privacy</Text>
      <DestructiveButton label="Delete all data" onPress={() => setConfirmingReset(true)} />
      <ConfirmDialog
        visible={confirmingReset}
        title="Delete all data?"
        body="Type DELETE to confirm. This permanently erases every motorcycle and record — it cannot be undone."
        confirmLabel="Delete everything"
        typedConfirmation="DELETE"
        onConfirm={handleReset}
        onCancel={() => setConfirmingReset(false)}
      />
    </Screen>
  );
}
