import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { strings } from '@/i18n/strings';

/** Validation-phase stand-in for screens that ship after dashboard approval. */
export function PendingScreen() {
  return (
    <Screen scroll={false}>
      <EmptyState icon="hourglass" title={strings.pending.title} body={strings.pending.body} />
    </Screen>
  );
}
