import { log } from '@/lib/log';
import type { TutorialConfig } from './types';

/**
 * Tutorial registry — configs self-register from configs/index.ts. Adding a
 * tutorial = one config file + one register call; the engine and Help screen
 * iterate this map, so nothing else changes.
 */

const tutorials = new Map<string, TutorialConfig>();

export function registerTutorial(config: TutorialConfig): void {
  if (tutorials.has(config.id)) {
    log.warn('tutorial.registry.duplicate', { id: config.id });
  }
  tutorials.set(config.id, config);
}

export function getTutorial(id: string): TutorialConfig | undefined {
  return tutorials.get(id);
}

/** Guided tours, in registration order (drives the Help & Tutorials list). */
export function listTours(): TutorialConfig[] {
  return [...tutorials.values()].filter((t) => t.kind === 'tour');
}

/** One-shot contextual tips (feature discovery). */
export function listTips(): TutorialConfig[] {
  return [...tutorials.values()].filter((t) => t.kind === 'tip');
}
