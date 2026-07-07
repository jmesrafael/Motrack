import type { TargetRect } from './types';

/**
 * Pure tooltip placement geometry — kept free of React/RN so it is fully unit
 * testable. Prefers below the target, flips above when it would clip the
 * bottom, clamps to the horizontal gutters, and keeps the arrow pointing at
 * the target's center without escaping the card's rounded corners.
 */

export interface PlacementInput {
  target: TargetRect | null;
  tooltipWidth: number;
  tooltipHeight: number;
  windowWidth: number;
  windowHeight: number;
  insetTop: number;
  insetBottom: number;
  /** Horizontal screen gutter (theme space.s4). */
  gutter: number;
  /** Gap between the spotlight edge and the tooltip. */
  gap: number;
  /** Card corner radius — the arrow must stay clear of the rounded corners. */
  cornerRadius: number;
  preferred: 'auto' | 'above' | 'below';
}

export interface Placement {
  x: number;
  y: number;
  side: 'above' | 'below' | 'center';
  /** Arrow center X relative to the tooltip's left edge; null = no arrow. */
  arrowX: number | null;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max < min ? min : max);
}

export function placeTooltip(input: PlacementInput): Placement {
  const {
    target,
    tooltipWidth,
    tooltipHeight,
    windowWidth,
    windowHeight,
    insetTop,
    insetBottom,
    gutter,
    gap,
    cornerRadius,
    preferred,
  } = input;

  const minY = insetTop + gutter;
  const maxY = windowHeight - insetBottom - gutter - tooltipHeight;

  if (target === null) {
    return {
      x: clamp((windowWidth - tooltipWidth) / 2, gutter, windowWidth - gutter - tooltipWidth),
      y: clamp((windowHeight - tooltipHeight) / 2, minY, maxY),
      side: 'center',
      arrowX: null,
    };
  }

  const belowY = target.y + target.height + gap;
  const aboveY = target.y - gap - tooltipHeight;
  const fitsBelow = belowY + tooltipHeight <= windowHeight - insetBottom - gutter;
  const fitsAbove = aboveY >= minY;

  let side: 'above' | 'below';
  if (preferred === 'above') {
    side = fitsAbove || !fitsBelow ? 'above' : 'below';
  } else if (preferred === 'below') {
    side = fitsBelow || !fitsAbove ? 'below' : 'above';
  } else {
    side = fitsBelow ? 'below' : fitsAbove ? 'above' : 'below';
  }

  const y = clamp(side === 'below' ? belowY : aboveY, minY, maxY);
  const targetCenterX = target.x + target.width / 2;
  const x = clamp(
    targetCenterX - tooltipWidth / 2,
    gutter,
    windowWidth - gutter - tooltipWidth,
  );
  const arrowX = clamp(
    targetCenterX - x,
    cornerRadius + 8,
    tooltipWidth - cornerRadius - 8,
  );

  return { x, y, side, arrowX };
}
