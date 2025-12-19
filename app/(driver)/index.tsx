import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import {
  BusIcon,
  ClipboardListIcon,
  UsersIcon,
  TrendingUpIcon,
  MapPinIcon,
  ClockIcon,
  CalendarIcon,
} from 'lucide-react-native';
import * as React from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { apiGetDriverSchedules } from '@/lib/api';

interface Schedule {
  id: number;
  bus_id: number;
  sopir_id: number;
  conductor_id: number | null;
  rute_id: number;
  tanggal_berangkat: string;
  jam_berangkat: string;
  status: string;
  bus: {
    id: number;
    nama: string;
    plat_nomor: string;
    kapasitas: number;
    status: string;
    foto: string[];
  };
  rute: {
    asal_terminal: {
      nama_terminal: string;
      nama_kota: string;
    };
    tujuan_terminal: {
      nama_terminal: string;
      nama_kota: string;
    };
  };
  jadwal_kelas_bus: Array<{
    harga: number;
    kelas_bus: {
      nama_kelas: string;
    };
  }>;
}

export default function DriverHomeScreen() {
  const { userName } = useAuth();
  const [schedules, setSchedules] = React.useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchSchedules = async () => {
    setIsLoading(true);
    setError(null);
    const result = await apiGetDriverSchedules();
    setIsLoading(false);
    if (result.success && result.data) {
      setSchedules(result.data);
    } else {
      setError(result.error || 'Failed to load schedules');
    }
  };

  React.useEffect(() => {
    fetchSchedules();
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const todaysSchedules = schedules.filter((s) => s.tanggal_berangkat.startsWith(today));
  const activeSchedules = schedules.filter((s) => s.status === 'aktif');

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
        <Text className="mt-4 text-muted-foreground">Loading your schedules...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-6">
        <Icon as={BusIcon} className="mb-4 size-16 text-muted-foreground" />
        <Text className="text-center text-lg font-semibold">Error</Text>
        <Text className="mb-4 text-center text-sm text-muted-foreground">{error}</Text>
        <Button onPress={fetchSchedules}>
          <Text>Try Again</Text>
        </Button>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="gap-6 p-6">
        {/* Welcome Section */}
        <View className="gap-2">
          <Text className="text-2xl font-bold">Welcome, {userName || 'Driver'}!</Text>
          <Text className="text-muted-foreground">Manage your assigned bus and trips</Text>
        </View>

        {/* Stats Cards */}
        <View className="gap-3">
          <Text className="text-lg font-semibold">Overview</Text>

          <View className="flex-row gap-3">
            <View className="flex-1 gap-2 rounded-xl border border-border bg-card p-4">
              <Icon as={BusIcon} className="size-8 text-primary" />
              <Text className="text-2xl font-bold">{activeSchedules.length}</Text>
              <Text className="text-xs text-muted-foreground">Assigned Bus</Text>
            </View>

            <View className="flex-1 gap-2 rounded-xl border border-border bg-card p-4">
              <Icon as={ClipboardListIcon} className="size-8 text-primary" />
              <Text className="text-2xl font-bold">{todaysSchedules.length}</Text>
              <Text className="text-xs text-muted-foreground">Today's Trips</Text>
            </View>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1 gap-2 rounded-xl border border-border bg-card p-4">
              <Icon as={UsersIcon} className="size-8 text-primary" />
              <Text className="text-2xl font-bold">-</Text>
              <Text className="text-xs text-muted-foreground">Passengers Today</Text>
            </View>

            <View className="flex-1 gap-2 rounded-xl border border-border bg-card p-4">
              <Icon as={TrendingUpIcon} className="size-8 text-primary" />
              <Text className="text-2xl font-bold">-</Text>
              <Text className="text-xs text-muted-foreground">Earnings Today</Text>
            </View>
          </View>
        </View>

        {/* Today's Schedule */}
        {todaysSchedules.length > 0 && (
          <View className="gap-3">
            <Text className="text-lg font-semibold">Today's Schedule</Text>
            {todaysSchedules.map((schedule) => (
              <View key={schedule.id} className="gap-3 rounded-xl border border-border bg-card p-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 gap-1">
                    <Text className="font-semibold">{schedule.bus.nama}</Text>
                    <Text className="text-sm text-muted-foreground">{schedule.bus.plat_nomor}</Text>
                  </View>
                  <Badge variant={schedule.status === 'aktif' ? 'default' : 'secondary'}>
                    <Text className="text-xs capitalize">{schedule.status}</Text>
                  </Badge>
                </View>

                <View className="flex-row items-center gap-2">
                  <Icon as={MapPinIcon} className="size-4 text-muted-foreground" />
                  <Text className="flex-1 text-sm">
                    {schedule.rute.asal_terminal.nama_terminal} →{' '}
                    {schedule.rute.tujuan_terminal.nama_terminal}
                  </Text>
                </View>

                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <Icon as={CalendarIcon} className="size-4 text-muted-foreground" />
                    <Text className="text-sm text-muted-foreground">
                      {new Date(schedule.tanggal_berangkat).toLocaleDateString('id-ID')}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Icon as={ClockIcon} className="size-4 text-muted-foreground" />
                    <Text className="text-sm text-muted-foreground">
                      {new Date(schedule.jam_berangkat).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center justify-between border-t border-border pt-3">
                  <Text className="text-sm">
                    <Text className="text-muted-foreground">Class: </Text>
                    <Text className="font-medium">
                      {schedule.jadwal_kelas_bus.map((k) => k.kelas_bus.nama_kelas).join(', ')}
                    </Text>
                  </Text>
                  <Text className="text-sm font-bold text-primary">
                    Rp {schedule.jadwal_kelas_bus[0]?.harga.toLocaleString('id-ID') || '-'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* All Schedules */}
        {schedules.length > 0 && (
          <View className="gap-3">
            <Text className="text-lg font-semibold">All Assigned Schedules</Text>
            {schedules.map((schedule) => (
              <View key={schedule.id} className="gap-3 rounded-xl border border-border bg-card p-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 gap-1">
                    <Text className="font-semibold">{schedule.bus.nama}</Text>
                    <Text className="text-sm text-muted-foreground">{schedule.bus.plat_nomor}</Text>
                  </View>
                  <Badge variant={schedule.status === 'aktif' ? 'default' : 'secondary'}>
                    <Text className="text-xs capitalize">{schedule.status}</Text>
                  </Badge>
                </View>

                <View className="flex-row items-center gap-2">
                  <Icon as={MapPinIcon} className="size-4 text-muted-foreground" />
                  <Text className="flex-1 text-sm">
                    {schedule.rute.asal_terminal.nama_terminal} →{' '}
                    {schedule.rute.tujuan_terminal.nama_terminal}
                  </Text>
                </View>

                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <Icon as={CalendarIcon} className="size-4 text-muted-foreground" />
                    <Text className="text-sm text-muted-foreground">
                      {new Date(schedule.tanggal_berangkat).toLocaleDateString('id-ID')}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Icon as={ClockIcon} className="size-4 text-muted-foreground" />
                    <Text className="text-sm text-muted-foreground">
                      {new Date(schedule.jam_berangkat).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* No Schedules */}
        {schedules.length === 0 && (
          <View className="items-center justify-center gap-4 rounded-xl border border-border bg-card p-8">
            <Icon as={BusIcon} className="size-12 text-muted-foreground" />
            <View className="items-center gap-2">
              <Text className="text-center text-lg font-semibold">No Assigned Schedules</Text>
              <Text className="text-center text-sm text-muted-foreground">
                You don't have any bus schedules assigned yet
              </Text>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View className="gap-3">
          <Text className="text-lg font-semibold">Quick Actions</Text>

          <Button className="h-14 w-full flex-row justify-start gap-3" onPress={fetchSchedules}>
            <Icon as={BusIcon} className="size-5" />
            <View className="flex-1 items-start">
              <Text className="font-semibold">Refresh Schedules</Text>
              <Text className="text-xs">Update your schedule list</Text>
            </View>
          </Button>

          <Button variant="outline" className="h-14 w-full flex-row justify-start gap-3">
            <Icon as={ClipboardListIcon} className="size-5" />
            <View className="flex-1 items-start">
              <Text className="font-semibold">Scan Tickets</Text>
              <Text className="text-xs text-muted-foreground">Scan passenger tickets</Text>
            </View>
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}
