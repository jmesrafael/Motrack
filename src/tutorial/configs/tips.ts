import { strings } from '@/i18n/strings';
import type { TutorialConfig } from '../types';

/**
 * Feature-discovery tips: one-step, one-time coach marks fired by
 * useFeatureTip on a screen's first visit. Tutorial Mode re-enables them.
 */

function tip(id: string, route: string, copy: { title: string; body: string }): TutorialConfig {
  return {
    id: `tip:${id}`,
    kind: 'tip',
    version: 1,
    title: copy.title,
    entryRoute: route,
    steps: [
      {
        id: 'tip',
        route,
        title: copy.title,
        body: copy.body,
        icon: 'lightbulb',
        advance: { type: 'next' },
      },
    ],
  };
}

export const statisticsTip = tip('statistics', '/statistics', strings.tips.statistics);
export const searchTip = tip('search', '/search', strings.tips.search);
export const documentsTip = tip('documents', '/documents', strings.tips.documents);
