import { create } from 'zustand';

interface TabBarState {
  /** True once the active tab-root screen has scrolled its content to the end. */
  hidden: boolean;
  setHidden: (hidden: boolean) => void;
}

/**
 * Cross-component scroll signal: the floating TabBar and each tab-root
 * Screen are siblings (expo-router mounts the bar at the navigator level),
 * so a screen's scroll position can only reach the bar through shared state.
 */
export const useTabBarStore = create<TabBarState>((set) => ({
  hidden: false,
  setHidden: (hidden) => set((s) => (s.hidden === hidden ? s : { hidden })),
}));
