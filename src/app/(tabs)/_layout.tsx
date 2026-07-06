import { Tabs } from 'expo-router/js-tabs';

import { TabBar } from '@/components/TabBar';
import { strings } from '@/i18n/strings';

export default function TabsLayout() {
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
