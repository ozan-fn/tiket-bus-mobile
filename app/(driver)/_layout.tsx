import { Stack, Tabs } from 'expo-router';
import {
  HomeIcon,
  BusIcon,
  ClipboardListIcon,
  UserIcon,
  ScanIcon,
  MoonStarIcon,
  SunIcon,
  CreditCardIcon,
} from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';

export default function DriverLayout() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const iconColor = colorScheme === 'dark' ? '#fff' : '#000';

  const THEME_ICONS = {
    light: SunIcon,
    dark: MoonStarIcon,
  };

  function ThemeToggle() {
    return (
      <Button
        onPressIn={toggleColorScheme}
        size="icon"
        variant="ghost"
        className="ios:size-9 rounded-full web:mx-4">
        <Icon as={THEME_ICONS[colorScheme ?? 'light']} className="size-5" />
      </Button>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colorScheme === 'dark' ? '#fff' : '#000',
          headerShown: true,
          headerStyle: {
            backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
          },
          headerTintColor: colorScheme === 'dark' ? '#fff' : '#000',
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            headerTitle: 'Driver Dashboard',
            tabBarIcon: ({ color }) => <HomeIcon size={24} color={color} />,
          }}
        />

        <Tabs.Screen
          name="scan"
          options={{
            title: 'Scan QR',
            headerTitle: 'Scan Ticket',
            tabBarIcon: ({ color }) => <ScanIcon size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="kursi"
          options={{
            title: 'Seats',
            headerTitle: 'Bus Seats',
            tabBarIcon: ({ color }) => <ClipboardListIcon size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            headerTitle: 'Profile',
            tabBarIcon: ({ color }) => <UserIcon size={24} color={color} />,
            headerRight: () => <ThemeToggle />,
          }}
        />
      </Tabs>
    </>
  );
}
