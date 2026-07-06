import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { SecondaryButton } from '@/components/SecondaryButton';
import { interpolate, strings } from '@/i18n/strings';
import { formatKm, formatMonthDay } from '@/lib/format';
import { makeStyles, typeStyle } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';

export interface OdometerCardProps {
  odometerKm: number;
  asOfIso: string;
  onUpdate: () => void;
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.s3,
    },
    iconWell: {
      width: 44,
      height: 44,
      borderRadius: t.radius.full,
      backgroundColor: t.bg.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
    },
    body: {
      flex: 1,
      gap: 2,
    },
    label: typeStyle(t.type.caption, t.text.secondary),
    value: {
      ...typeStyle(t.type.h1, t.text.primary),
      fontVariant: ['tabular-nums'],
    },
    asOf: typeStyle(t.type.caption, t.text.tertiary),
  }),
);

export function OdometerCard({ odometerKm, asOfIso, onUpdate }: OdometerCardProps) {
  const styles = useStyles();
  const { tokens } = useTheme();

  return (
    <Card>
      <View style={styles.row}>
        <View style={styles.iconWell}>
          <Icon name="odometer" size={tokens.iconSize.md} />
        </View>
        <View style={styles.body}>
          <Text style={styles.label}>{strings.dashboard.odometer.title}</Text>
          <Text style={styles.value}>{formatKm(odometerKm)}</Text>
          <Text style={styles.asOf}>
            {interpolate(strings.dashboard.odometer.asOf, { date: formatMonthDay(asOfIso) })}
          </Text>
        </View>
        <SecondaryButton label={strings.dashboard.odometer.update} onPress={onUpdate} />
      </View>
    </Card>
  );
}
