import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/** OS reduce-motion setting — all animations must honor it (ANIMATION_GUIDE.md §5). */
export function useReducedMotion(): boolean {
  const [isReduced, setIsReduced] = useState(false);

  useEffect(() => {
    let isMounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (isMounted) {
        setIsReduced(value);
      }
    });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setIsReduced);
    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  return isReduced;
}
