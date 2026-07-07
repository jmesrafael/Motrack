import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { SecondaryButton } from '@/components/SecondaryButton';
import { useActiveBike } from '@/hooks/useActiveBike';
import { formatKm } from '@/lib/format';
import { MotorcycleService } from '@/services/MotorcycleService';
import { makeStyles, typeStyle } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';
import { TutorialAnchor } from '@/tutorial/ui/TutorialAnchor';

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    title: typeStyle(t.type.h1, t.text.primary),
    sectionTitle: { ...typeStyle(t.type.h2, t.text.primary), marginTop: t.space.s4 },
    row: { flexDirection: 'row', alignItems: 'center', gap: t.space.s3 },
    iconWell: {
      width: 48,
      height: 48,
      borderRadius: t.radius.full,
      backgroundColor: t.bg.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
    },
    body: { flex: 1, gap: 2 },
    nickname: typeStyle(t.type.bodyStrong, t.text.primary),
    detail: typeStyle(t.type.caption, t.text.secondary),
    activeBadge: {
      backgroundColor: t.primary.bg,
      borderRadius: t.radius.full,
      paddingHorizontal: t.space.s2,
      paddingVertical: 2,
    },
    activeBadgeText: typeStyle(t.type.caption, t.primary.base),
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

  const renderBike = (bike: (typeof bikes)[number]) => (
    <Card key={bike.id}>
      <View style={styles.row}>
        <Pressable
          style={styles.row}
          onPress={() => router.push(`/bike/${bike.id}/edit`)}
          accessibilityRole="button"
          accessibilityLabel={`Edit ${bike.nickname}`}>
          <View style={styles.iconWell}>
            <Icon name="motorcycle" size={tokens.iconSize.md} />
          </View>
          <View style={styles.body}>
            <Text style={styles.nickname}>{bike.nickname}</Text>
            <Text style={styles.detail}>
              {bike.brand} {bike.model} · {formatKm(bike.currentOdometerKm)}
              {bike.plateNumber !== null ? ` · ${bike.plateNumber}` : ''}
            </Text>
          </View>
        </Pressable>
        {activeBike?.id === bike.id ? (
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>Active</Text>
          </View>
        ) : (
          <SecondaryButton
            label="Switch"
            onPress={() => {
              MotorcycleService.setActiveBike(bike.id);
              router.back();
            }}
          />
        )}
      </View>
    </Card>
  );

  return (
    <Screen tutorialScrollId="garage">
      <Text style={styles.title}>Garage</Text>
      {active.map(renderBike)}
      {archived.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>Archived</Text>
          {archived.map(renderBike)}
        </>
      ) : null}
      <TutorialAnchor id="garage.addBike">
        <PrimaryButton label="Add motorcycle" onPress={() => router.push('/bike/new')} />
      </TutorialAnchor>
    </Screen>
  );
}
