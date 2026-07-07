import type { RefObject } from 'react';
import type { ScrollView, View } from 'react-native';

import type { TargetRect } from './types';

/**
 * Anchor + scroll-container registries. Plain module maps — zero React
 * overhead while no tutorial runs (PERFORMANCE requirement). Anchors register
 * on mount and unregister on unmount; `waitForAnchor` lets cross-screen steps
 * await the next screen's anchors with a timeout so the engine never hangs.
 */

interface AnchorEntry {
  ref: RefObject<View | null>;
  scrollId: string | undefined;
}

const anchors = new Map<string, AnchorEntry>();
const anchorWaiters = new Map<string, Set<(registered: boolean) => void>>();
const scrolls = new Map<string, RefObject<ScrollView | null>>();

export function registerAnchor(
  id: string,
  ref: RefObject<View | null>,
  scrollId: string | undefined,
): void {
  anchors.set(id, { ref, scrollId });
  const waiters = anchorWaiters.get(id);
  if (waiters !== undefined) {
    anchorWaiters.delete(id);
    for (const resolve of [...waiters]) {
      resolve(true);
    }
  }
}

export function unregisterAnchor(id: string, ref: RefObject<View | null>): void {
  // Only remove our own entry — a remounting screen may have re-registered first.
  if (anchors.get(id)?.ref === ref) {
    anchors.delete(id);
  }
}

export function isAnchorRegistered(id: string): boolean {
  return anchors.has(id);
}

/** Resolves true when the anchor registers, false on timeout (never rejects). */
export function waitForAnchor(id: string, timeoutMs = 3000): Promise<boolean> {
  if (anchors.has(id)) {
    return Promise.resolve(true);
  }
  return new Promise((resolve) => {
    let waiters = anchorWaiters.get(id);
    if (waiters === undefined) {
      waiters = new Set();
      anchorWaiters.set(id, waiters);
    }
    const timer = setTimeout(() => {
      waiters.delete(entry);
      resolve(false);
    }, timeoutMs);
    const entry = (registered: boolean) => {
      clearTimeout(timer);
      resolve(registered);
    };
    waiters.add(entry);
  });
}

function measureOnce(view: View): Promise<TargetRect> {
  return new Promise((resolve) => {
    view.measureInWindow((x, y, width, height) => resolve({ x, y, width, height }));
  });
}

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Window-coordinate rect; retries once because Android can report 0-size on the first frame. */
export async function measureAnchor(id: string): Promise<TargetRect | null> {
  const view = anchors.get(id)?.ref.current;
  if (view === null || view === undefined) {
    return null;
  }
  let rect = await measureOnce(view);
  if (rect.width === 0 || rect.height === 0) {
    await delay(64);
    const retryView = anchors.get(id)?.ref.current;
    if (retryView === null || retryView === undefined) {
      return null;
    }
    rect = await measureOnce(retryView);
  }
  return rect.width === 0 || rect.height === 0 ? null : rect;
}

export function registerScroll(id: string, ref: RefObject<ScrollView | null>): void {
  scrolls.set(id, ref);
}

export function unregisterScroll(id: string, ref: RefObject<ScrollView | null>): void {
  if (scrolls.get(id) === ref) {
    scrolls.delete(id);
  }
}

/**
 * Scrolls the anchor's container so the anchor sits comfortably in view, then
 * waits for the scroll to settle. No persistent onScroll listeners — position
 * is derived from measureLayout against the scroll content view.
 */
export async function scrollAnchorIntoView(id: string, reduceMotion: boolean): Promise<void> {
  const entry = anchors.get(id);
  const scrollRef = entry?.scrollId !== undefined ? scrolls.get(entry.scrollId) : undefined;
  const scrollView = scrollRef?.current;
  const view = entry?.ref.current;
  if (scrollView === null || scrollView === undefined || view === null || view === undefined) {
    return;
  }
  const contentY = await new Promise<number | null>((resolve) => {
    const inner = scrollView.getInnerViewNode() as unknown as View;
    view.measureLayout(
      inner,
      (_x, y) => resolve(y),
      () => resolve(null),
    );
  });
  if (contentY === null) {
    return;
  }
  scrollView.scrollTo({ y: Math.max(0, contentY - 120), animated: !reduceMotion });
  await delay(reduceMotion ? 64 : 420);
}
