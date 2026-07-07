import type { IconName } from '@/components/Icon';
import type { DomainEventName } from '@/lib/events';

/**
 * Tutorial framework contracts. Tutorials are declarative configs registered
 * with the engine (registry.ts); the engine never imports content, so new
 * screens add tutorials without touching engine code.
 */

/** Window-coordinate rectangle produced by anchor measurement. */
export interface TargetRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Spotlight cutout geometry around the highlighted element. */
export interface SpotlightShape {
  kind: 'circle' | 'rect' | 'pill';
  /** Corner radius for `rect` (defaults to the theme's radius.md). */
  radius?: number;
  /** Extra breathing room around the measured rect (defaults to 8). */
  padding?: number;
}

/**
 * How a step advances. `next` is passive (button); the rest are interactive —
 * the engine waits for the real user action and then continues automatically.
 */
export type AdvanceTrigger =
  | { type: 'next' }
  | { type: 'tap-anchor'; anchorId?: string }
  | { type: 'long-press-anchor'; anchorId?: string; minMs?: number }
  | { type: 'navigate'; route: string }
  | { type: 'event'; event: DomainEventName }
  | { type: 'delay'; ms: number };

/** App-state snapshot for smart conditions (conditions.ts builds it). */
export interface ConditionCtx {
  bikeCount: number;
  hasActiveBike: boolean;
  hasMaintenanceHistory: boolean;
  hasFuelLogs: boolean;
  pathname: string;
}

export type TutorialCondition = (ctx: ConditionCtx) => boolean;

export interface TutorialStep {
  id: string;
  /** Registered anchor to spotlight; omitted = centered card, no spotlight. */
  anchorId?: string;
  /** Expected pathname prefix; the engine waits for it before showing. */
  route?: string;
  shape?: SpotlightShape;
  title: string;
  body: string;
  icon?: IconName;
  /** Tooltip position relative to the target (default auto). */
  placement?: 'auto' | 'above' | 'below';
  advance: AdvanceTrigger;
  /** False at start time → step silently dropped (smart conditions). */
  condition?: TutorialCondition;
  /** Auto-scroll the anchor into view first (default true when anchored). */
  scrollIntoView?: boolean;
}

export interface TutorialConfig {
  /** Stable id; tips use the `tip:` prefix (e.g. `tip:statistics`). */
  id: string;
  kind: 'tour' | 'tip';
  /** Bump to invalidate saved mid-tutorial progress after content changes. */
  version: number;
  /** Display name for the Help & Tutorials list. */
  title: string;
  /** Route replay navigates to before starting. */
  entryRoute: string;
  /** Whole-tutorial gate evaluated at start (e.g. requires an active bike). */
  condition?: TutorialCondition;
  steps: TutorialStep[];
}
