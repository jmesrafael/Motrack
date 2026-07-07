import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { TimelineItem } from '@/components/TimelineItem';
import { MotorcycleRepository } from '@/db/repositories/MotorcycleRepository';
import { todayIso, addDays } from '@/lib/dates';
import { strings } from '@/i18n/strings';
import { useDocumentStore } from '@/stores/useDocumentStore';
import { makeStyles, typeStyle } from '@/theme/styles';
import { useFeatureTip } from '@/tutorial/hooks/useFeatureTip';

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    title: typeStyle(t.type.h1, t.text.primary),
    sectionTitle: { ...typeStyle(t.type.h2, t.text.primary), marginTop: t.space.s4 },
  }),
);

/** S-26 Documents list — grouped by bike then type, expiry badges. */
export default function DocumentsRoute() {
  const styles = useStyles();
  useFeatureTip('documents');
  const router = useRouter();
  const documents = useDocumentStore((s) => s.documents);
  const status = useDocumentStore((s) => s.status);
  const load = useDocumentStore((s) => s.load);

  useEffect(() => {
    if (status === 'idle') {
      load();
    }
  }, [status, load]);

  if (documents.length === 0) {
    return (
      <Screen scroll={false}>
        <EmptyState icon="documents" title="Keep OR/CR, insurance, receipts safe" body="Add your first document." />
        <PrimaryButton label="Add document" onPress={() => router.push('/documents/new')} />
      </Screen>
    );
  }

  const soon = addDays(todayIso(), 30);

  const groups = new Map<string, typeof documents>();
  for (const doc of documents) {
    const bike = doc.motorcycleId !== null ? MotorcycleRepository.getById(doc.motorcycleId) : undefined;
    const key = bike?.nickname ?? 'Rider';
    const list = groups.get(key) ?? [];
    list.push(doc);
    groups.set(key, list);
  }

  return (
    <Screen>
      <Text style={styles.title}>Documents</Text>
      <PrimaryButton label="+ Add document" onPress={() => router.push('/documents/new')} />
      {[...groups.entries()].map(([groupLabel, docs]) => (
        <>
          <Text style={styles.sectionTitle} key={`${groupLabel}-title`}>
            {groupLabel}
          </Text>
          {docs.map((doc) => {
            const expired = doc.expiryDate !== null && doc.expiryDate < todayIso();
            const expiringSoon = doc.expiryDate !== null && doc.expiryDate <= soon && !expired;
            return (
              <TimelineItem
                key={doc.id}
                icon="documents"
                title={doc.title}
                caption={
                  expired
                    ? 'Expired'
                    : expiringSoon
                      ? `Expires ${doc.expiryDate}`
                      : strings.docTypes[doc.docType as keyof typeof strings.docTypes]
                }
                amount=""
                onPress={() => router.push(`/documents/${doc.id}`)}
              />
            );
          })}
        </>
      ))}
    </Screen>
  );
}
