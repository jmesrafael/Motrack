import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { Icon } from '@/components/Icon';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { BuildRepository } from '@/db/repositories/BuildRepository';
import { useActiveBike } from '@/hooks/useActiveBike';
import { formatMoney } from '@/lib/format';
import { BuildService } from '@/services/BuildService';
import { makeStyles, typeStyle } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    title: typeStyle(t.type.h1, t.text.primary),
    row: { flexDirection: 'row', alignItems: 'center', gap: t.space.s3 },
    iconWell: {
      width: t.size.iconWell,
      height: t.size.iconWell,
      borderRadius: t.radius.md,
      backgroundColor: t.bg.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
    },
    body: { flex: 1, gap: 2 },
    name: typeStyle(t.type.bodyStrong, t.text.primary),
    caption: typeStyle(t.type.caption, t.text.secondary),
    card: { marginBottom: t.space.s2 },
  }),
);

/**
 * Builds list (item 18). First-time empty state explains the concept:
 * grouping expenses for one project (a classic build, engine overhaul, wheel
 * set) and planning upgrades not bought yet.
 */
export default function BuildsListRoute() {
  const styles = useStyles();
  const router = useRouter();
  const { tokens } = useTheme();
  const { activeBike } = useActiveBike();

  if (activeBike === null) {
    return (
      <Screen>
        <Text style={styles.title}>No motorcycle selected</Text>
      </Screen>
    );
  }

  const builds = BuildRepository.listByBike(activeBike.id);

  return (
    <Screen>
      <ScreenHeader title="Builds" />
      {builds.length === 0 ? (
        <EmptyState
          icon="garage"
          title="Use Builds to keep a project together"
          body="Group all the spending for one project, like a classic build, engine overhaul, or wheel set. You can also plan upgrades you have not bought yet."
          ctaLabel="Start a Build"
          onCtaPress={() => router.push('/builds/new' as never)}
        />
      ) : (
        <>
          {builds.map((build) => {
            const totals = BuildService.totals(build.id);
            return (
              <Card
                key={build.id}
                style={styles.card}
                onPress={() => router.push(`/builds/${build.id}` as never)}>
                <View style={styles.row}>
                  <View style={styles.iconWell}>
                    <Icon name="garage" size={tokens.iconSize.listLeading} color={tokens.primary.text} />
                  </View>
                  <View style={styles.body}>
                    <Text style={styles.name}>{build.name}</Text>
                    <Text style={styles.caption}>
                      {formatMoney(totals.spentCentavos)} spent
                      {totals.budgetCentavos !== null ? ` of ${formatMoney(totals.budgetCentavos)} budget` : ''}
                    </Text>
                  </View>
                  <Icon name="chevronRight" size={tokens.iconSize.inline} color={tokens.icon.secondary} />
                </View>
              </Card>
            );
          })}
          <PrimaryButton label="+ New Build" onPress={() => router.push('/builds/new' as never)} />
        </>
      )}
    </Screen>
  );
}
