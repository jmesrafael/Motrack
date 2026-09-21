import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { PrimaryButton } from '@/components/PrimaryButton';
import { resolveLocale, useStrings, type Locale } from '@/i18n/useStrings';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { makeStyles, typeStyle } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';

export interface LanguageStepProps {
  onContinue: () => void;
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: t.bg.page, paddingHorizontal: t.space.gutter, justifyContent: 'center' },
    textBlock: { gap: t.space.s2, marginBottom: t.space.s6 },
    title: { ...typeStyle(t.type.h1, t.text.primary), textAlign: 'center' },
    body: { ...typeStyle(t.type.body, t.text.secondary), textAlign: 'center' },
    cards: { gap: t.space.s3, marginBottom: t.space.s6 },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.s3,
      minHeight: 72,
    },
    cardTextBlock: { flex: 1, gap: 2 },
    cardLabel: typeStyle(t.type.bodyStrong, t.text.primary),
    cardHint: typeStyle(t.type.caption, t.text.secondary),
    checkWell: {
      width: 28,
      height: 28,
      borderRadius: t.radius.full,
      borderWidth: 2,
      borderColor: t.border.strong,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkWellActive: {
      borderColor: t.primary.base,
      backgroundColor: t.primary.base,
    },
  }),
);

function LanguageCard({
  label,
  hint,
  selected,
  onPress,
}: {
  label: string;
  hint: string;
  selected: boolean;
  onPress: () => void;
}) {
  const styles = useStyles();
  const { tokens } = useTheme();
  return (
    <Card
      onPress={onPress}
      variant={selected ? 'tinted' : 'surface'}
      accessibilityLabel={hint}
      style={styles.card}>
      <View style={styles.cardTextBlock}>
        <Text style={styles.cardLabel}>{label}</Text>
        <Text style={styles.cardHint}>{hint}</Text>
      </View>
      <View style={[styles.checkWell, selected && styles.checkWellActive]}>
        {selected ? <Icon name="check" size={tokens.iconSize.inline} color={tokens.primary.on} /> : null}
      </View>
    </Card>
  );
}

/**
 * First-run language choice: two clear options, English and Tagalog. Shown
 * before the onboarding carousel so the rest of first-run copy renders in
 * the picked language immediately. Pre-selects based on device language
 * (useStrings/resolveLocale already do this for 'system'); the user's
 * explicit pick is what gets saved, and it can be changed later in Settings.
 */
export function LanguageStep({ onContinue }: LanguageStepProps) {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const strings = useStrings();
  const language = useSettingsStore((s) => s.language);
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const [choice, setChoice] = useState<Locale>(() => resolveLocale(language));

  const confirm = () => {
    setLanguage(choice);
    onContinue();
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.textBlock}>
        <Text style={styles.title}>{strings.onboarding.language.title}</Text>
        <Text style={styles.body}>{strings.onboarding.language.body}</Text>
      </View>
      <View style={styles.cards}>
        <LanguageCard
          label={strings.onboarding.language.english}
          hint={strings.onboarding.language.englishHint}
          selected={choice === 'en'}
          onPress={() => setChoice('en')}
        />
        <LanguageCard
          label={strings.onboarding.language.tagalog}
          hint={strings.onboarding.language.tagalogHint}
          selected={choice === 'fil'}
          onPress={() => setChoice('fil')}
        />
      </View>
      <PrimaryButton label={strings.onboarding.language.continue} onPress={confirm} />
    </View>
  );
}
