import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { PressableScale } from '@/components/PressableScale';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SecondaryButton } from '@/components/SecondaryButton';
import { showToast } from '@/components/Toast';
import { useActiveBike } from '@/hooks/useActiveBike';
import { formatKm } from '@/lib/format';
import { MotorcycleService } from '@/services/MotorcycleService';
import { makeStyles, typeStyle } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';
import { TutorialAnchor } from '@/tutorial/ui/TutorialAnchor';

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    sectionTitle: { ...typeStyle(t.type.h2, t.text.primary), marginTop: t.space.s4, paddingHorizontal: t.space.s1 },
    // Two tiles per row instead of one full-width row each — a short list no
    // longer reads as starting mid-page with a wall of space beneath it.
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: t.space.s3 },
    tile: { width: '47%' },
    tileCard: { alignItems: 'center', gap: 2 },
    iconWell: {
      width: 64,
      height: 64,
      borderRadius: t.radius.full,
      backgroundColor: t.bg.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: t.space.s2,
    },
    nickname: { ...typeStyle(t.type.bodyStrong, t.text.primary), textAlign: 'center' },
    detail: { ...typeStyle(t.type.caption, t.text.secondary), textAlign: 'center' },
    footer: { width: '100%', marginTop: t.space.s3 },
    activeBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: t.space.s1,
      backgroundColor: t.primary.bg,
      borderRadius: t.radius.full,
      paddingVertical: 6,
    },
    activeBadgeText: typeStyle(t.type.captionStrong, t.primary.text),
  }),
);

/** S-01 Garage — bike list, switcher, add/edit entry (R-02). */
export default function GarageRoute() {
  const styles = useStyles();
  const router = useRouter();
  const { tokens } = useTheme();
  const { activeBike, bikes } = useActiveBike();

  const active = bikes.filter((b) => b.isArchived === 0);
  const archived = bikes.filter((b) => b.isArchived === 1);

  const renderBike = (bike: (typeof bikes)[number]) => {
    const isActive = activeBike?.id === bike.id;
    return (
      <View key={bike.id} style={styles.tile}>
        <Card style={styles.tileCard}>
          <PressableScale
            containerStyle={{ alignItems: 'center' }}
            onPress={() => router.push(`/bike/${bike.id}/edit`)}
            accessibilityRole="button"
            accessibilityLabel={`Edit ${bike.nickname}`}>
            <View style={styles.iconWell}>
              <Icon name="motorcycle" size={tokens.iconSize.md} color={tokens.primary.text} />
            </View>
            <Text style={styles.nickname} numberOfLines={1}>
              {bike.nickname}
            </Text>
            <Text style={styles.detail} numberOfLines={2}>
              {bike.brand} {bike.model} · {formatKm(bike.currentOdometerKm)}
              {bike.plateNumber !== null ? ` · ${bike.plateNumber}` : ''}
            </Text>
          </PressableScale>
          <View style={styles.footer}>
            {isActive ? (
              <View style={styles.activeBadge}>
                <Icon name="checkCircle" size={tokens.iconSize.inline} color={tokens.primary.text} />
                <Text style={styles.activeBadgeText}>Active</Text>
              </View>
            ) : (
              <SecondaryButton
                label="Switch"
                size="sm"
                block
                onPress={() => {
                  MotorcycleService.setActiveBike(bike.id);
                  showToast(`Switched to ${bike.nickname}`);
                  router.back();
                }}
              />
            )}
          </View>
        </Card>
      </View>
    );
  };

  return (
    <Screen tutorialScrollId="garage">
      <ScreenHeader title="Garage" />
      <View style={styles.grid}>{active.map(renderBike)}</View>
      {archived.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>Archived</Text>
          <View style={styles.grid}>{archived.map(renderBike)}</View>
        </>
      ) : null}
      <TutorialAnchor id="garage.addBike">
        <PrimaryButton label="Add motorcycle" icon="plus" onPress={() => router.push('/bike/new')} />
      </TutorialAnchor>
    </Screen>
  );
}
