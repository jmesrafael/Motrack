import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { TimelineItem } from '@/components/TimelineItem';
import { searchAll, type SearchResultKind } from '@/services/SearchService';
import { makeStyles, typeStyle } from '@/theme/styles';
import { useFeatureTip } from '@/tutorial/hooks/useFeatureTip';
import type { IconName } from '@/components/Icon';

const useStyles = makeStyles((t) => ({
  title: typeStyle(t.type.h1, t.text.primary),
}));

const KIND_ICON: Record<SearchResultKind, IconName> = {
  motorcycle: 'motorcycle',
  maintenance: 'maintenance',
  repair: 'repair',
  fuel: 'fuel',
  expense: 'expense',
  document: 'documents',
};

const KIND_ROUTE: Record<SearchResultKind, (id: string) => string> = {
  motorcycle: (id) => `/bike/${id}/edit`,
  maintenance: (id) => `/maintenance/log?recordId=${id}`,
  repair: (id) => `/repair/log?repairId=${id}`,
  fuel: (id) => `/fuel/log?fuelLogId=${id}`,
  expense: (id) => `/expense/log?expenseId=${id}`,
  document: (id) => `/documents/${id}`,
};

/** Global search — motorcycle/maintenance/document/expense/fuel/notes (FEATURE_SPECIFICATIONS.md). */
export default function SearchRoute() {
  const styles = useStyles();
  useFeatureTip('search');
  const router = useRouter();
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchAll(query), [query]);

  return (
    <Screen>
      <Text style={styles.title}>Search</Text>
      <TextField value={query} onChangeText={setQuery} placeholder="Search everything…" autoFocus />
      {query.trim().length >= 2 && results.length === 0 ? (
        <EmptyState icon="documents" title="No results" body="Try a different search term." />
      ) : (
        results.map((r) => (
          <TimelineItem
            key={`${r.kind}-${r.id}`}
            icon={KIND_ICON[r.kind]}
            title={r.title}
            caption={r.subtitle ?? r.date}
            amount=""
            onPress={() => router.push(KIND_ROUTE[r.kind](r.id) as never)}
          />
        ))
      )}
    </Screen>
  );
}
