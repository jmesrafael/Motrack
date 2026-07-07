import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { HealthRing } from '@/components/HealthRing';
import { interpolate, strings } from '@/i18n/strings';
import { makeStyles, typeStyle } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';
import type { HealthBandId } from '@/types/domain';

export interface HealthHeroProps {
  score: number | null;
  bandId: HealthBandId | null;
  bandLabel: string;
  onPress: () => void;
}

/** Band → status-ramp tint pairing for the chip background (DESIGN_SYSTEM.md §2.2). */
const BAND_TINT: Record<HealthBandId, 'excellent' | 'good' | 'dueSoon' | 'overdue' | 'critical'> =
  {
    excellent: 'excellent',
    good: 'good',
    fair: 'dueSoon',
    poor: 'overdue',
    critical: 'critical',
  };

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    inner: {
      alignItems: 'center',
      gap: t.space.s2,
      paddingVertical: t.space.s2,
    },
    caption: typeStyle(t.type.caption, t.text.tertiary),
  }),
);

export function HealthHero({ score, bandId, bandLabel, onPress }: HealthHeroProps) {
  const styles = useStyles();
  const { tokens } = useTheme();
  const a11yLabel = interpolate(strings.dashboard.health.a11y, { score: score ?? '—', band: bandLabel });

  return (
    <Card onPress={onPress} accessibilityLabel={a11yLabel}>
      <View style={styles.inner}>
        <HealthRing
          score={score}
          bandLabel={bandLabel}
          color={bandId !== null ? tokens.health[bandId] : tokens.status.neutral.base}
          colorBg={bandId !== null ? tokens.status[BAND_TINT[bandId]].bg : tokens.status.neutral.bg}
          scoreSuffix={strings.dashboard.health.scoreOf}
          accessibilityLabel={a11yLabel}
        />
        <Text style={styles.caption}>{strings.dashboard.health.caption}</Text>
      </View>
    </Card>
  );
}
