import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { Icon, type IconName } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useStrings } from '@/i18n/useStrings';
import { makeStyles, typeStyle } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    row: { flexDirection: 'row', gap: t.space.s3 },
    iconWell: {
      width: 40,
      height: 40,
      borderRadius: t.radius.md,
      backgroundColor: t.primary.bg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textBlock: { flex: 1, gap: t.space.s1 },
    itemTitle: typeStyle(t.type.bodyStrong, t.text.primary),
    itemBody: typeStyle(t.type.body, t.text.secondary),
  }),
);

interface GuideItem {
  icon: IconName;
  title: string;
  body: string;
}

/**
 * Standalone explainer for the "when/how do maintenance dates work" concept
 * that used to be crammed into onboarding Step 3 (a toggle-per-component plus
 * a shared date). Reachable anytime from Help & Tutorials instead, since it's
 * reference material, not something a first-time user needs to decide during
 * setup.
 */
export function MaintenanceDatesGuide() {
  const styles = useStyles();
  const { tokens } = useTheme();
  const strings = useStrings();
  const s = strings.help.maintenanceDates;

  const items: GuideItem[] = [
    { icon: 'history', title: s.whenTitle, body: s.whenBody },
    { icon: 'calendarClock', title: s.datesTitle, body: s.datesBody },
    { icon: 'odometer', title: s.intervalsTitle, body: s.intervalsBody },
    { icon: 'reminder', title: s.remindersTitle, body: s.remindersBody },
  ];

  return (
    <Screen>
      <ScreenHeader title={s.title} />
      {items.map((item) => (
        <Card key={item.title}>
          <View style={styles.row}>
            <View style={styles.iconWell}>
              <Icon name={item.icon} size={tokens.iconSize.md} color={tokens.primary.text} />
            </View>
            <View style={styles.textBlock}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemBody}>{item.body}</Text>
            </View>
          </View>
        </Card>
      ))}
    </Screen>
  );
}
