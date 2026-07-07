import { useContext, useEffect, useRef, type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useTutorialStore } from '@/stores/useTutorialStore';
import { registerAnchor, unregisterAnchor } from '../anchors';
import { notifyAnchorInteraction } from '../engine';
import { TutorialScrollContext } from './scrollContext';

/**
 * Marks a view as a tutorial target. Inert wrapper: no layout impact beyond
 * `collapsable={false}` (required so Android doesn't flatten the view away
 * from measureInWindow). While idle the store selector returns false, so the
 * wrapper never re-renders — near-zero overhead outside tutorials.
 */

function useAnchorRegistration(id: string) {
  const ref = useRef<View | null>(null);
  const scrollId = useContext(TutorialScrollContext);
  useEffect(() => {
    registerAnchor(id, ref, scrollId);
    return () => unregisterAnchor(id, ref);
  }, [id, scrollId]);
  return ref;
}

function useInteractionObserver(id: string) {
  const isTapTarget = useTutorialStore((s) => s.interactiveAnchorId === id);
  const touchStartedAt = useRef(0);
  if (!isTapTarget) {
    return {};
  }
  return {
    onTouchStart: () => {
      touchStartedAt.current = Date.now();
    },
    onTouchEnd: () => {
      notifyAnchorInteraction(id, Date.now() - touchStartedAt.current);
    },
  };
}

export interface TutorialAnchorProps {
  id: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function TutorialAnchor({ id, children, style }: TutorialAnchorProps) {
  const ref = useAnchorRegistration(id);
  const observers = useInteractionObserver(id);
  return (
    <View ref={ref} collapsable={false} style={style} {...observers}>
      {children}
    </View>
  );
}

/**
 * Ref-props variant for components that can't take a wrapper view (tab bar
 * items, header chips). Spread the returned props onto the target view.
 */
export function useTutorialAnchor(id: string) {
  const ref = useAnchorRegistration(id);
  const observers = useInteractionObserver(id);
  return { ref, collapsable: false as const, ...observers };
}
