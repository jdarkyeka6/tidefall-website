import { Tabs } from 'expo-router';
import { Text } from 'react-native';

const tabIcon = (icon: string) =>
  ({ color, size }: { color: string; size: number }) => (
    <Text style={{ color, fontSize: size }}>{icon}</Text>
  );

export default function RootLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#8DEBFF',
        tabBarInactiveTintColor: '#7B8B99',
        tabBarStyle: {
          backgroundColor: '#07131D',
          borderTopColor: '#183444',
          height: 82,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: tabIcon('🌊') }} />
      <Tabs.Screen name="academy" options={{ title: 'Academy', tabBarIcon: tabIcon('🏰') }} />
      <Tabs.Screen name="magic" options={{ title: 'Magic', tabBarIcon: tabIcon('✨') }} />
      <Tabs.Screen name="explore" options={{ title: 'Explore', tabBarIcon: tabIcon('🧭') }} />
      <Tabs.Screen name="profile" options={{ title: 'You', tabBarIcon: tabIcon('👤') }} />
    </Tabs>
  );
}
