import { create } from 'zustand';

import { DocumentRepository } from '@/db/repositories/DocumentRepository';
import type { DocumentRow } from '@/db/schema';
import { onDomainEvents } from '@/lib/events';

interface DocumentState {
  documents: DocumentRow[];
  status: 'idle' | 'ready';
  load: () => void;
}

/** All documents grouped by bike then type in the UI layer (S-26). */
export const useDocumentStore = create<DocumentState>((set) => ({
  documents: [],
  status: 'idle',
  load: () => set({ documents: DocumentRepository.listAll(), status: 'ready' }),
}));

onDomainEvents(['document:changed', 'bike:changed'], () => {
  if (useDocumentStore.getState().status === 'ready') {
    useDocumentStore.getState().load();
  }
});
