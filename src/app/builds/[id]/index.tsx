import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EmptyState } from '@/components/EmptyState';
import { Icon } from '@/components/Icon';
import { IconButton } from '@/components/IconButton';
import { PressableScale } from '@/components/PressableScale';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SegmentedControl } from '@/components/SegmentedControl';
import { TimelineItem } from '@/components/TimelineItem';
import { showToast } from '@/components/Toast';
import { BuildPlanItemRepository } from '@/db/repositories/BuildPlanItemRepository';
import { BuildRepository } from '@/db/repositories/BuildRepository';
import { ExpenseRepository } from '@/db/repositories/ExpenseRepository';
import type { BuildPlanItemRow } from '@/db/schema';
import { formatCategoryName, formatMoney, formatMonthDay } from '@/lib/format';
import { ImageStorage } from '@/services/imageStorage';
import { BuildService } from '@/services/BuildService';
import { makeStyles, typeStyle } from '@/theme/styles';
import { useTheme } from '@/theme/useTheme';

type Tab = 'spent' | 'plan';

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    title: typeStyle(t.type.h1, t.text.primary),
    cover: { width: '100%', height: 160, borderRadius: t.radius.lg, marginBottom: t.space.s2 },
    description: { ...typeStyle(t.type.body, t.text.secondary), marginBottom: t.space.s2 },
    budgetRow: { flexDirection: 'row', justifyContent: 'space-between' },
    caption: typeStyle(t.type.caption, t.text.secondary),
    progressTrack: {
      height: 8,
      borderRadius: 4,
      backgroundColor: t.bg.surfaceVariant,
      marginTop: t.space.s1,
      marginBottom: t.space.s4,
      overflow: 'hidden',
    },
    progressFill: { height: 8, borderRadius: 4, backgroundColor: t.primary.base },
    progressFillOver: { backgroundColor: t.feedback.error.base },
    statsRow: { flexDirection: 'row', gap: t.space.s3, marginBottom: t.space.s3 },
    statCard: { flex: 1 },
    statLabel: typeStyle(t.type.caption, t.text.secondary),
    statValue: { ...typeStyle(t.type.h2, t.text.primary), marginTop: 2 },
    planCard: { marginBottom: t.space.s2 },
    planRow: { flexDirection: 'row', alignItems: 'center', gap: t.space.s3 },
    planBody: { flex: 1, gap: 2 },
    planName: typeStyle(t.type.bodyStrong, t.text.primary),
    planActions: { flexDirection: 'row', gap: t.space.s2, marginTop: t.space.s4 },
  }),
);

function PlanItemCard({
  item,
  onAcquireChoice,
  onEdit,
  onDelete,
}: {
  item: BuildPlanItemRow;
  onAcquireChoice: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const styles = useStyles();
  const { tokens } = useTheme();
  return (
    <Card style={styles.planCard}>
      <PressableScale containerStyle={{ width: '100%' }} onPress={onEdit} accessibilityRole="button">
        <View style={styles.planRow}>
          <Icon
            name={item.isAcquired === 1 ? 'checkCircle' : 'statusNeutral'}
            size={tokens.iconSize.listLeading}
            color={item.isAcquired === 1 ? tokens.feedback.success.base : tokens.icon.secondary}
          />
          <View style={styles.planBody}>
            <Text style={styles.planName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.caption}>
              {item.estimatedPriceCentavos !== null ? formatMoney(item.estimatedPriceCentavos) : 'No price yet'} ·{' '}
              {item.priority} priority{item.isAcquired === 1 ? ' · Acquired' : ''}
            </Text>
          </View>
        </View>
      </PressableScale>
      <View style={styles.planActions}>
        {item.isAcquired === 0 ? (
          <PrimaryButton label="Mark acquired" size="sm" onPress={onAcquireChoice} />
        ) : null}
        <IconButton icon="minus" variant="ghost" accessibilityLabel="Delete planned item" onPress={onDelete} />
      </View>
    </Card>
  );
}

/** Build detail (item 18-19): Spent/Plan tabs, budget progress, planned-item acquire flow. */
export default function BuildDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const styles = useStyles();
  const [tab, setTab] = useState<Tab>('spent');
  const [refreshKey, setRefreshKey] = useState(0);
  const [acquiringItem, setAcquiringItem] = useState<BuildPlanItemRow | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  void refreshKey;

  const build = BuildRepository.getById(id);
  if (build === undefined) {
    return (
      <Screen>
        <ScreenHeader title="Not found" />
      </Screen>
    );
  }

  const totals = BuildService.totals(id);
  const expenses = ExpenseRepository.listByBuild(id);
  const planItems = BuildPlanItemRepository.listByBuild(id);
  const budgetRatio =
    totals.budgetCentavos !== null && totals.budgetCentavos > 0
      ? totals.spentCentavos / totals.budgetCentavos
      : null;

  const startAcquire = (item: BuildPlanItemRow) => {
    if (item.estimatedPriceCentavos === null) {
      // Nothing meaningful to log as an expense amount — just check it off.
      const result = BuildService.setAcquired(item.id, true);
      if (result.ok) {
        setRefreshKey((k) => k + 1);
        showToast('Marked acquired');
      }
      return;
    }
    setAcquiringItem(item);
  };

  const confirmAcquireAsExpense = () => {
    if (acquiringItem === null) {
      return;
    }
    const result = BuildService.acquireAsExpense(
      acquiringItem.id,
      new Date().toISOString().slice(0, 10),
      'accessories',
    );
    setAcquiringItem(null);
    if (result.ok) {
      setRefreshKey((k) => k + 1);
      showToast('Logged as an expense');
    }
  };

  const handleDelete = () => {
    if (deletingItemId === null) {
      return;
    }
    BuildService.deletePlanItem(deletingItemId);
    setDeletingItemId(null);
    setRefreshKey((k) => k + 1);
  };

  return (
    <Screen>
      <ScreenHeader
        title={build.name}
        trailing={
          <IconButton
            icon="settings"
            variant="ghost"
            accessibilityLabel="Edit Build"
            onPress={() => router.push(`/builds/${id}/edit` as never)}
          />
        }
      />
      {build.coverPhoto !== null ? (
        <Image source={{ uri: ImageStorage.uriFor(build.coverPhoto) }} style={styles.cover} resizeMode="cover" />
      ) : null}
      {build.description !== null ? <Text style={styles.description}>{build.description}</Text> : null}

      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Spent</Text>
          <Text style={styles.statValue}>{formatMoney(totals.spentCentavos)}</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Budget</Text>
          <Text style={styles.statValue}>
            {totals.budgetCentavos !== null ? formatMoney(totals.budgetCentavos) : 'Not set'}
          </Text>
        </Card>
      </View>
      {budgetRatio !== null ? (
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              budgetRatio > 1 && styles.progressFillOver,
              { width: `${Math.min(budgetRatio, 1) * 100}%` },
            ]}
          />
        </View>
      ) : null}

      <SegmentedControl
        segments={[
          { value: 'spent', label: 'Spent' },
          { value: 'plan', label: 'Plan' },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === 'spent' ? (
        <>
          <PrimaryButton
            label="+ Add expense"
            onPress={() => router.push(`/expense/log?buildId=${id}` as never)}
          />
          {expenses.length === 0 ? (
            <EmptyState icon="expense" title="No expenses yet" body="Expenses you assign to this Build show up here." />
          ) : (
            expenses.map((expense) => (
              <TimelineItem
                key={expense.id}
                icon="expense"
                title={expense.notes ?? formatCategoryName(expense.category)}
                caption={formatMonthDay(expense.expenseDate)}
                amount={formatMoney(expense.amountCentavos)}
                onPress={() => router.push(`/expense/log?expenseId=${expense.id}` as never)}
              />
            ))
          )}
        </>
      ) : (
        <>
          <View style={styles.budgetRow}>
            <Text style={styles.caption}>Planned: {formatMoney(totals.plannedCentavos)}</Text>
            <Text style={styles.caption}>Acquired: {formatMoney(totals.acquiredCentavos)}</Text>
          </View>
          <PrimaryButton
            label="+ Add planned item"
            onPress={() => router.push(`/builds/${id}/plan-new` as never)}
          />
          {planItems.length === 0 ? (
            <EmptyState
              icon="bikeSetup"
              title="Nothing planned yet"
              body="Save an item you want to buy later: price, photo, product link, whatever helps you remember."
            />
          ) : (
            planItems.map((item) => (
              <PlanItemCard
                key={item.id}
                item={item}
                onAcquireChoice={() => startAcquire(item)}
                onEdit={() => router.push(`/builds/${id}/plan-new?itemId=${item.id}` as never)}
                onDelete={() => setDeletingItemId(item.id)}
              />
            ))
          )}
        </>
      )}

      <ConfirmDialog
        visible={acquiringItem !== null}
        title="Log as expense?"
        body={`Add "${acquiringItem?.name ?? ''}" to Spent using its saved price? You can change the category afterward. Choosing Cancel just marks it acquired without adding an expense.`}
        confirmLabel="Log as expense"
        destructive={false}
        onConfirm={confirmAcquireAsExpense}
        onCancel={() => {
          if (acquiringItem !== null) {
            BuildService.setAcquired(acquiringItem.id, true);
            setRefreshKey((k) => k + 1);
          }
          setAcquiringItem(null);
        }}
      />
      <ConfirmDialog
        visible={deletingItemId !== null}
        title="Delete this planned item?"
        body="This removes it from your Build plan."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeletingItemId(null)}
      />
    </Screen>
  );
}
