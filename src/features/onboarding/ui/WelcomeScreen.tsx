import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { SecondaryButton } from '@/components/SecondaryButton';
import { strings } from '@/i18n/strings';
import { useTutorialStore } from '@/stores/useTutorialStore';
import { makeStyles, typeStyle } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    hero: {
      alignItems: 'center',
      gap: t.space.s4,
      marginTop: t.space.s10,
    },
    iconWell: {
      width: 96,
      height: 96,
      borderRadius: t.radius.full,
      backgroundColor: t.primary.bg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      ...typeStyle(t.type.display, t.text.primary),
      textAlign: 'center',
    },
    body: {
      ...typeStyle(t.type.body, t.text.secondary),
      textAlign: 'center',
    },
    bullets: {
      gap: t.space.s4,
      marginTop: t.space.s6,
    },
    bulletRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.s3,
    },
    bulletText: {
      ...typeStyle(t.type.body, t.text.primary),
      flex: 1,
    },
    spacer: { flex: 1 },
    actions: {
      gap: t.space.s3,
      marginBottom: t.space.s6,
    },
  }),
);

const BULLETS: { icon: IconName; text: string }[] = [
  { icon: 'maintenance', text: strings.onboarding.welcome.bulletMaintenance },
  { icon: 'expense', text: strings.onboarding.welcome.bulletMoney },
  { icon: 'documents', text: strings.onboarding.welcome.bulletDocuments },
];

/**
 * First-launch welcome. Never a wall: both actions mark welcome completed and
 * move on — Get Started into the optional wizard, Skip straight to the app.
 */
export function WelcomeScreen() {
  const styles = useStyles();
  const router = useRouter();
  const { tokens } = useTheme();
  const markWelcomeCompleted = useTutorialStore((s) => s.markWelcomeCompleted);
  const markSetup = useTutorialStore((s) => s.markSetup);

  const getStarted = () => {
    markWelcomeCompleted();
    router.replace('/onboarding/setup');
  };
  const skipSetup = () => {
    markWelcomeCompleted();
    markSetup('skipped');
    router.replace('/(tabs)');
  };

  return (
    <Screen scroll={false}>
      <View style={styles.hero}>
        <View style={styles.iconWell}>
          <Icon name="motorcycle" size={48} color={tokens.primary.base} />
        </View>
        <Text style={styles.title}>{strings.onboarding.welcome.title}</Text>
        <Text style={styles.body}>{strings.onboarding.welcome.body}</Text>
      </View>
      <View style={styles.bullets}>
        {BULLETS.map((bullet) => (
          <View key={bullet.icon} style={styles.bulletRow}>
            <Icon name={bullet.icon} size={tokens.iconSize.md} color={tokens.primary.base} />
            <Text style={styles.bulletText}>{bullet.text}</Text>
          </View>
        ))}
      </View>
      <View style={styles.spacer} />
      <View style={styles.actions}>
        <PrimaryButton label={strings.onboarding.welcome.getStarted} onPress={getStarted} />
        <SecondaryButton label={strings.onboarding.welcome.skipSetup} onPress={skipSetup} />
      </View>
    </Screen>
  );
}
