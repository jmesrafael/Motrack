import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { HealthRing } from '@/components/HealthRing';
import { Icon } from '@/components/Icon';
import { SecondaryButton } from '@/components/SecondaryButton';
import { interpolate, strings } from '@/i18n/strings';
import { formatKm, formatMonthDay } from '@/lib/format';
import { makeStyles, typeStyle } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';
import { TutorialAnchor } from '@/tutorial/ui/TutorialAnchor';
import type { HealthBandId, MotorcycleVm } from '@/types/domain';

export interface BikeHeroCardProps {
  bike: MotorcycleVm;
  /** null before the score is displayable (no anchored schedules yet). */
  score: number | null;
  /** null = finish-setup state (bandLabel carries the CTA copy). */
  bandId: HealthBandId | null;
  bandLabel: string;
  onSwitchBike: () => void;
  onHealthPress: () => void;
  onUpdateOdometer: () => void;
  /** Tutorial anchor ids for the dashboard tour's three hero steps. */
  bikeChipAnchorId?: string;
  healthAnchorId?: string;
  odometerAnchorId?: string;
}

/** Wraps a region as a tutorial target when an anchor id is supplied; inert otherwise. */
function Anchored({ id, children }: { id: string | undefined; children: ReactNode }) {
  return id !== undefined ? <TutorialAnchor id={id}>{children}</TutorialAnchor> : <>{children}</>;
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
    // The hero sits one surface step above ordinary cards (bg.raised).
    card: {
      backgroundColor: t.bg.raised,
      gap: t.space.s4,
    },
    identity: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.s3,
      minHeight: 44,
    },
    // Photo placeholder until Motorcycle Profile photos land (S-06).
    avatar: {
      width: 48,
      height: 48,
      borderRadius: t.radius.md,
      backgroundColor: t.bg.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
    },
    identityBody: {
      flex: 1,
      gap: 2,
    },
    nickname: typeStyle(t.type.h2, t.text.primary),
    bikeMeta: typeStyle(t.type.caption, t.text.secondary),
    healthBlock: {
      alignItems: 'center',
      gap: t.space.s2,
    },
    breakdownHint: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.s1,
    },
    breakdownText: typeStyle(t.type.caption, t.text.tertiary),
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: t.border.divider,
    },
    odoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.s3,
    },
    odoBody: {
      flex: 1,
      gap: 2,
    },
    odoLabel: typeStyle(t.type.label, t.text.tertiary),
    odoValue: {
      ...typeStyle(t.type.h1, t.text.primary),
      fontVariant: ['tabular-nums'],
    },
    odoAsOf: typeStyle(t.type.caption, t.text.tertiary),
  }),
);

/**
 * Dashboard hero: active bike identity + Health Score gauge + odometer in one
 * surface — the bike's state at a glance (S-04). Three tap regions, each with
 * its own target: identity → switcher, gauge → breakdown, Update → S-25.
 */
export function BikeHeroCard({
  bike,
  score,
  bandId,
  bandLabel,
  onSwitchBike,
  onHealthPress,
  onUpdateOdometer,
  bikeChipAnchorId,
  healthAnchorId,
  odometerAnchorId,
}: BikeHeroCardProps) {
  const styles = useStyles();
  const { tokens } = useTheme();

  // Finish-setup state (no displayable score): neutral gauge tint, no numeric a11y.
  const ringColor = bandId !== null ? tokens.health[bandId] : tokens.icon.secondary;
  const ringBg = bandId !== null ? tokens.status[BAND_TINT[bandId]].bg : tokens.bg.surfaceVariant;
  const healthA11y = interpolate(strings.dashboard.health.a11y, {
    score: score ?? '—',
    band: bandLabel,
  });

  return (
    <Card style={styles.card}>
      <Anchored id={bikeChipAnchorId}>
        <Pressable
          onPress={onSwitchBike}
          accessibilityRole="button"
          accessibilityLabel={`${bike.nickname}, ${bike.brand} ${bike.model}. ${strings.dashboard.bikeChipA11y}`}
          style={({ pressed }) => [styles.identity, pressed && { opacity: 0.7 }]}>
          <View style={styles.avatar}>
            <Icon name="motorcycle" size={tokens.iconSize.md} />
          </View>
          <View style={styles.identityBody}>
            <Text style={styles.nickname} numberOfLines={1}>
              {bike.nickname}
            </Text>
            <Text style={styles.bikeMeta} numberOfLines={1}>
              {`${bike.brand} ${bike.model} · ${bike.plate}`}
            </Text>
          </View>
          <Icon name="chevronDown" size={tokens.iconSize.inline} color={tokens.icon.secondary} />
        </Pressable>
      </Anchored>
      <Anchored id={healthAnchorId}>
        <Pressable
          onPress={onHealthPress}
          accessibilityRole="button"
          accessibilityLabel={healthA11y}
          style={({ pressed }) => [styles.healthBlock, pressed && { opacity: 0.7 }]}>
          <HealthRing
            score={score}
            bandLabel={bandLabel}
            color={ringColor}
            colorBg={ringBg}
            scoreSuffix={strings.dashboard.health.scoreOf}
          />
          <View style={styles.breakdownHint}>
            <Text style={styles.breakdownText}>{strings.dashboard.health.caption}</Text>
            <Icon name="chevronRight" size={tokens.iconSize.inline} color={tokens.icon.secondary} />
          </View>
        </Pressable>
      </Anchored>
      <View style={styles.divider} />
      <Anchored id={odometerAnchorId}>
        <View style={styles.odoRow}>
          <View style={styles.odoBody}>
            <Text style={styles.odoLabel}>{strings.dashboard.odometer.title}</Text>
            <Text style={styles.odoValue}>{formatKm(bike.odometerKm)}</Text>
            <Text style={styles.odoAsOf}>
              {interpolate(strings.dashboard.odometer.asOf, {
                date: formatMonthDay(bike.odometerAsOf),
              })}
            </Text>
          </View>
          <SecondaryButton label={strings.dashboard.odometer.update} onPress={onUpdateOdometer} />
        </View>
      </Anchored>
    </Card>
  );
}
