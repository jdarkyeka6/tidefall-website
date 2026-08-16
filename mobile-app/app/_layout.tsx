import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const tabIcon = (name: keyof typeof Ionicons.glyphMap) =>
  ({ color, size }: { color: string; size: number }) => (
    <Ionicons name={name} color={color} size={size} />
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
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: tabIcon('water-outline') }} />
      <Tabs.Screen name="academy" options={{ title: 'Academy', tabBarIcon: tabIcon('business-outline') }} />
      <Tabs.Screen name="magic" options={{ title: 'Magic', tabBarIcon: tabIcon('sparkles-outline') }} />
      <Tabs.Screen name="explore" options={{ title: 'Explore', tabBarIcon: tabIcon('compass-outline') }} />
      <Tabs.Screen name="profile" options={{ title: 'You', tabBarIcon: tabIcon('person-outline') }} />
    </Tabs>
  );
}
