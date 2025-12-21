import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import {
  BusIcon,
  ClipboardListIcon,
  UsersIcon,
  MapPinIcon,
  ClockIcon,
  CalendarIcon,
} from 'lucide-react-native';
import * as React from 'react';
import { View, ScrollView, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { apiGetDriverSchedules, apiGetDriverSeats } from '@/lib/api';

interface Seat {
  id: number;
  nomor_kursi: string;
  kelas: string;
  status: 'kosong' | 'terisi' | 'batal' | 'hadir';
  penumpang?: {
    nama: string;
    nik: string;
    jenis_kelamin: string;
    nomor_telepon: string;
    email: string;
  };
}

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
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [totalPassengersToday, setTotalPassengersToday] = React.useState(0);

  const fetchSchedules = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    const result = await apiGetDriverSchedules();
    if (isRefresh) {
      setRefreshing(false);
    } else {
      setIsLoading(false);
    }
    if (result.success && result.data) {
      console.log('Fetched schedules data:', result.data);
      setSchedules(result.data);
      const today = new Date().toISOString().split('T')[0];
      const todaysSchedules = result.data.filter((s: Schedule) =>
        s.tanggal_berangkat.startsWith(today)
      );
      await calculatePassengersToday(todaysSchedules);
    } else {
      setError(result.error || 'Failed to load schedules');
    }
  };

  const calculatePassengersToday = async (todaysSchedules: Schedule[]) => {
    let total = 0;
    for (const schedule of todaysSchedules) {
      const result = await apiGetDriverSeats(schedule.id);
      if (result.success && result.data) {
        console.log('Fetched seats data for schedule', schedule.id, ':', result.data);
        const occupiedSeats = result.data.kursi.filter(
          (seat: Seat) => seat.status === 'terisi' || seat.status === 'hadir'
        );
        total += occupiedSeats.length;
      }
    }
    console.log('Total passengers today:', total);
    setTotalPassengersToday(total);
  };

  React.useEffect(() => {
    fetchSchedules();
  }, []);

  // Pilih jadwal paling terbaru berdasarkan tanggal + jam berangkat
  const latestSchedule =
    schedules && schedules.length > 0
      ? schedules
          .slice()
          .sort(
            (a, b) =>
              new Date(b.tanggal_berangkat + 'T' + b.jam_berangkat).getTime() -
              new Date(a.tanggal_berangkat + 'T' + a.jam_berangkat).getTime()
          )[0]
      : null;

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
        <Text className="mt-4 text-muted-foreground">Memuat jadwal Anda...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-6">
        <Icon as={BusIcon} className="mb-4 size-16 text-muted-foreground" />
        <Text className="text-center text-lg font-semibold">Kesalahan</Text>
        <Text className="mb-4 text-center text-sm text-muted-foreground">{error}</Text>
        <Button onPress={() => fetchSchedules()}>
          <Text>Coba Lagi</Text>
        </Button>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => fetchSchedules(true)} />
      }>
      <View className="gap-6 p-6">
        {/* Welcome Section */}
        <View className="gap-2">
          <Text className="text-2xl font-bold">Selamat datang, {userName || 'Supir'}!</Text>
          <Text className="text-muted-foreground">Kelola bus dan perjalanan yang ditugaskan</Text>
        </View>

        {/* Stats Cards */}
        <View className="gap-3">
          <Text className="text-lg font-semibold">Ringkasan</Text>

          <View className="flex-row gap-3">
            <View className="flex-1 gap-2 rounded-xl border border-border bg-card p-4">
              <Icon as={BusIcon} className="size-8 text-primary" />
              <Text className="text-2xl font-bold">{schedules.length}</Text>
              <Text className="text-xs text-muted-foreground">Jadwal Ditugaskan</Text>
            </View>

            <View className="flex-1 gap-2 rounded-xl border border-border bg-card p-4">
              <Icon as={ClipboardListIcon} className="size-8 text-primary" />
              <Text className="text-2xl font-bold">{latestSchedule ? 1 : 0}</Text>
              <Text className="text-xs text-muted-foreground">Jadwal Terbaru</Text>
            </View>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1 gap-2 rounded-xl border border-border bg-card p-4">
              <Icon as={UsersIcon} className="size-8 text-primary" />
              <Text className="text-2xl font-bold">{totalPassengersToday}</Text>
              <Text className="text-xs text-muted-foreground">Penumpang Hari Ini</Text>
            </View>
          </View>
        </View>

        {/* Latest Schedule */}
        {latestSchedule && (
          <View className="gap-3">
            <Text className="text-lg font-semibold">Jadwal Terbaru</Text>
            {[latestSchedule].map((schedule: Schedule) => (
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

                {/* Bus Image */}
                {schedule.bus.foto && schedule.bus.foto.length > 0 && (
                  <View className="items-center">
                    <Image
                      source={{ uri: schedule.bus.foto[0] }}
                      className="h-20 w-full rounded-lg"
                      resizeMode="cover"
                    />
                  </View>
                )}

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
                    <Text className="text-muted-foreground">Kelas: </Text>
                    <Text className="font-medium">
                      {schedule.jadwal_kelas_bus.map((k: any) => k.kelas_bus.nama_kelas).join(', ')}
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

        {/* No Schedules */}
        {schedules.length === 0 && (
          <View className="items-center justify-center gap-4 rounded-xl border border-border bg-card p-8">
            <Icon as={BusIcon} className="size-12 text-muted-foreground" />
            <View className="items-center gap-2">
              <Text className="text-center text-lg font-semibold">Tidak Ada Jadwal Ditugaskan</Text>
              <Text className="text-center text-sm text-muted-foreground">
                Anda belum memiliki jadwal bus yang ditugaskan
              </Text>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View className="gap-3">
          <Text className="text-lg font-semibold">Aksi Cepat</Text>

          <Button variant="outline" className="h-14 w-full flex-row justify-start gap-3">
            <Icon as={ClipboardListIcon} className="size-5" />
            <View className="flex-1 items-start">
              <Text className="font-semibold">Pindai Tiket</Text>
              <Text className="text-xs text-muted-foreground">Pindai tiket penumpang</Text>
            </View>
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}
