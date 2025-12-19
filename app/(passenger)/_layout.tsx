import { Stack, Tabs } from 'expo-router';
import { HomeIcon, TicketIcon, UserIcon, MoonStarIcon, SunIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';

export default function PassengerLayout() {
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
            headerTitle: 'Home',
            tabBarIcon: ({ color }) => <HomeIcon size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="tickets"
          options={{
            title: 'My Tickets',
            headerTitle: 'My Tickets',
            tabBarIcon: ({ color }) => <TicketIcon size={24} color={color} />,
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

        {/* Hidden screens - not shown in tab bar */}
        <Tabs.Screen
          name="search-results"
          options={{
            href: null,
            headerShown: true,
            headerTitle: 'Search Results',
          }}
        />
        <Tabs.Screen
          name="select-class"
          options={{
            href: null,
            headerShown: true,
            headerTitle: 'Select Class',
          }}
        />
        <Tabs.Screen
          name="select-seat"
          options={{
            href: null,
            headerShown: true,
            headerTitle: 'Select Seat',
          }}
        />
        <Tabs.Screen
          name="booking-success"
          options={{
            href: null,
            headerShown: true,
            headerTitle: 'Booking Confirmed',
          }}
        />
        <Tabs.Screen
          name="ticket-detail"
          options={{
            href: null,
            headerShown: true,
            headerTitle: 'Ticket Detail',
          }}
        />
        <Tabs.Screen
          name="payment-callback"
          options={{
            href: null,
            headerShown: true,
            headerTitle: 'Payment Callback',
          }}
        />
        <Tabs.Screen
          name="edit-profile"
          options={{
            href: null,
            headerShown: true,
            headerTitle: 'Edit Profile',
          }}
        />
      </Tabs>
    </>
  );
}
