import { create } from 'zustand';

import type { DocumentRow } from '@/db/schema';

interface DocumentState {
  documents: DocumentRow[];
  status: 'idle' | 'ready';
  load: () => void;
}

/** Web preview store: document data is native SQLite data. */
export const useDocumentStore = create<DocumentState>((set) => ({
  documents: [],
  status: 'idle',
  load: () => set({ documents: [], status: 'ready' }),
}));
