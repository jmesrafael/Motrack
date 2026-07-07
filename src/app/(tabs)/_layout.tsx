import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';

import { TabBar } from '@/components/TabBar';
import { strings } from '@/i18n/strings';
import { useTutorialStore } from '@/stores/useTutorialStore';

export default function TabsLayout() {
  const hydrated = useTutorialStore((s) => s.hydrated);
  const welcome = useTutorialStore((s) => s.progress.welcome);

  // First launch only: route through the welcome screen. Once completed the
  // flag is persisted and this gate never fires again.
  if (hydrated && welcome === 'pending') {
    return <Redirect href="/onboarding/welcome" />;
  }

  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: strings.tabs.home }} />
      <Tabs.Screen name="maintenance" options={{ title: strings.tabs.maintenance }} />
      <Tabs.Screen name="log" options={{ title: strings.tabs.log }} />
      <Tabs.Screen name="money" options={{ title: strings.tabs.money }} />
      <Tabs.Screen name="more" options={{ title: strings.tabs.more }} />
    </Tabs>
  );
}
