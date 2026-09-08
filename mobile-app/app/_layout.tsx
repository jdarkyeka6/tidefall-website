import { Tabs } from 'expo-router';
import { Text } from 'react-native';

const tabIcon = (icon: string) =>
  ({ color, size }: { color: string; size: number }) => (
    <Text accessibilityElementsHidden style={{ color, fontSize: Math.min(size, 22), fontWeight: '700' }}>{icon}</Text>
  );

export default function RootLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        lazy: true,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: '#C7F6FF',
        tabBarInactiveTintColor: '#708792',
        sceneStyle: { backgroundColor: '#041019' },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '800', marginTop: 1 },
        tabBarItemStyle: { paddingTop: 4 },
        tabBarStyle: {
          backgroundColor: '#07131D',
          borderTopColor: '#173746',
          borderTopWidth: 1,
          height: 88,
          paddingTop: 7,
          paddingBottom: 10,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarAccessibilityLabel: 'Home', tabBarIcon: tabIcon('⌂') }} />
      <Tabs.Screen name="academy" options={{ title: 'Academy', tabBarAccessibilityLabel: 'Academy', tabBarIcon: tabIcon('⌁') }} />
      <Tabs.Screen name="magic" options={{ title: 'Magic', tabBarAccessibilityLabel: 'Magic', tabBarIcon: tabIcon('✦') }} />
      <Tabs.Screen name="explore" options={{ title: 'Discover', tabBarAccessibilityLabel: 'Discover', tabBarIcon: tabIcon('◌') }} />
      <Tabs.Screen name="profile" options={{ title: 'You', tabBarAccessibilityLabel: 'Profile', tabBarIcon: tabIcon('◎') }} />
      <Tabs.Screen name="academy/[slug]" options={{ href: null }} />
      <Tabs.Screen name="books" options={{ href: null }} />
      <Tabs.Screen name="characters/index" options={{ href: null }} />
      <Tabs.Screen name="characters/[slug]" options={{ href: null }} />
    </Tabs>
  );
}
