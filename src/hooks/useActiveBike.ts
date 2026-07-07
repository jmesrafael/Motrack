import { useEffect } from 'react';

import { useGarageStore } from '@/stores/useGarageStore';

/**
 * Ensures the garage store is loaded and returns the active bike + full list.
 * Shared across features (FOLDER_STRUCTURE.md §1 — cross-feature hooks live here).
 */
export function useActiveBike() {
  const status = useGarageStore((s) => s.status);
  const load = useGarageStore((s) => s.load);
  const activeBike = useGarageStore((s) => s.activeBike);
  const bikes = useGarageStore((s) => s.bikes);

  useEffect(() => {
    if (status === 'idle') {
      load();
    }
  }, [status, load]);

  return { activeBike, bikes, ready: status === 'ready' };
}
