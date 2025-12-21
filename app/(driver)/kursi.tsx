import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { BusIcon, MapPinIcon, ClockIcon, CalendarIcon, UsersIcon } from 'lucide-react-native';
import * as React from 'react';
import { View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiGetDriverSeats, apiGetDriverSchedules } from '@/lib/api';

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
  tanggal_berangkat: string;
  jam_berangkat: string;
  status: string;
  bus: {
    nama: string;
    plat_nomor: string;
    kapasitas: number;
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
}

interface SeatsData {
  jadwal: {
    id: number;
    tanggal_berangkat: string;
    jam_berangkat: string;
    status: string;
    bus: {
      nama: string;
      plat_nomor: string;
      kapasitas: number;
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
  };
  kursi: Seat[];
}

export default function DriverSeatsScreen() {
  const insets = useSafeAreaInsets();
  const [data, setData] = React.useState<SeatsData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showModal, setShowModal] = React.useState(false);
  const [selectedSeat, setSelectedSeat] = React.useState<Seat | null>(null);
  const [schedules, setSchedules] = React.useState<Schedule[]>([]);
  const [isLoadingSchedules, setIsLoadingSchedules] = React.useState(true);
  const [schedulesError, setSchedulesError] = React.useState<string | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);

  const fetchSchedules = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setIsLoadingSchedules(true);
    }
    setSchedulesError(null);
    const result = await apiGetDriverSchedules();
    if (isRefresh) {
      setRefreshing(false);
    } else {
      setIsLoadingSchedules(false);
    }
    if (result.success && result.data) {
      setSchedules(result.data);
    } else {
      setSchedulesError(result.error || 'Failed to load schedules');
    }
  };

  React.useEffect(() => {
    fetchSchedules();
  }, []);

  const onRefresh = () => {
    fetchSchedules(true);
    if (jadwalId) {
      fetchSeats(true);
    }
  };

  // Pilih jadwal paling terbaru berdasarkan tanggal + jam berangkat,
  // tanpa memfilter hanya yang berstatus 'aktif'. Ini memastikan halaman
  // kursi selalu mengambil jadwal paling baru yang tersedia.
  const jadwalId = React.useMemo(() => {
    if (!schedules || schedules.length === 0) return null;
    const latest = schedules.reduce((latestSoFar, s) => {
      const latestDate = new Date(latestSoFar.tanggal_berangkat + 'T' + latestSoFar.jam_berangkat);
      const sDate = new Date(s.tanggal_berangkat + 'T' + s.jam_berangkat);
      return sDate > latestDate ? s : latestSoFar;
    }, schedules[0]);
    return latest.id;
  }, [schedules]);

  const fetchSeats = async (isRefresh = false) => {
    if (!jadwalId) return;
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    const result = await apiGetDriverSeats(jadwalId);
    if (isRefresh) {
      setRefreshing(false);
    } else {
      setIsLoading(false);
    }
    if (result.success && result.data) {
      setData(result.data);
    } else {
      setError(result.error || 'Failed to load seats');
    }
  };

  React.useEffect(() => {
    if (jadwalId) {
      fetchSeats();
    }
  }, [jadwalId]);

  const getSeatColor = (status: string) => {
    switch (status) {
      case 'kosong':
        return '#10B981'; // green
      case 'terisi':
        return '#EF4444'; // red
      case 'batal':
        return '#6B7280'; // gray
      case 'hadir':
        return '#3B82F6'; // blue
      default:
        return '#6B7280';
    }
  };

  const getSeatText = (status: string) => {
    switch (status) {
      case 'kosong':
        return 'Tersedia';
      case 'terisi':
        return 'Terisi';
      case 'batal':
        return 'Dibatalkan';
      case 'hadir':
        return 'Hadir';
      default:
        return 'Tidak Diketahui';
    }
  };

  if (isLoadingSchedules) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Icon as={BusIcon} className="mb-4 size-16 text-muted-foreground" />
        <Text className="text-muted-foreground">Memuat jadwal...</Text>
      </View>
    );
  }

  if (schedulesError) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-6">
        <Icon as={BusIcon} className="mb-4 size-16 text-muted-foreground" />
        <Text className="text-center text-lg font-semibold">Kesalahan</Text>
        <Text className="mb-4 text-center text-sm text-muted-foreground">{schedulesError}</Text>
        <Button onPress={() => fetchSchedules()}>
          <Text>Coba Lagi</Text>
        </Button>
      </View>
    );
  }

  if (schedules.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-6">
        <Icon as={BusIcon} className="mb-4 size-16 text-muted-foreground" />
        <Text className="text-center text-lg font-semibold">Tidak Ada Jadwal</Text>
        <Text className="text-center text-sm text-muted-foreground">
          Tidak ditemukan jadwal apapun. Kursi tidak dapat ditampilkan.
        </Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Icon as={BusIcon} className="mb-4 size-16 text-muted-foreground" />
        <Text className="text-muted-foreground">Memuat kursi...</Text>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-6">
        <Icon as={BusIcon} className="mb-4 size-16 text-muted-foreground" />
        <Text className="text-center text-lg font-semibold">Kesalahan</Text>
        <Text className="mb-4 text-center text-sm text-muted-foreground">{error}</Text>
        <Button onPress={() => fetchSeats()}>
          <Text>Coba Lagi</Text>
        </Button>
      </View>
    );
  }

  const { jadwal, kursi } = data;

  return (
    <View className="flex-1">
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        className="flex-1 bg-background"
        style={{ marginTop: insets.top }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View className="gap-6 p-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-xl font-bold">Kursi Bus</Text>
            <Text className="text-sm text-muted-foreground">
              {jadwal.bus.nama} - {jadwal.bus.plat_nomor}
            </Text>
          </View>

          {/* Schedule Info */}
          <View className="gap-3 rounded-xl border border-border bg-card p-4">
            <View className="flex-row items-center gap-2">
              <Icon as={MapPinIcon} className="size-4 text-primary" />
              <Text className="font-semibold">
                {jadwal.rute.asal_terminal.nama_terminal} →{' '}
                {jadwal.rute.tujuan_terminal.nama_terminal}
              </Text>
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Icon as={CalendarIcon} className="size-4 text-muted-foreground" />
                <Text className="text-sm text-muted-foreground">
                  {new Date(jadwal.tanggal_berangkat).toLocaleDateString('id-ID')}
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Icon as={ClockIcon} className="size-4 text-muted-foreground" />
                <Text className="text-sm text-muted-foreground">
                  {new Date(jadwal.jam_berangkat).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center justify-between">
              <Badge variant={jadwal.status === 'aktif' ? 'default' : 'secondary'}>
                <Text className="text-xs capitalize">{jadwal.status}</Text>
              </Badge>
              <View className="flex-row items-center gap-2">
                <Icon as={UsersIcon} className="size-4 text-muted-foreground" />
                <Text className="text-sm text-muted-foreground">
                  Kapasitas: {jadwal.bus.kapasitas}
                </Text>
              </View>
            </View>
          </View>

          {/* Legend */}
          <View className="gap-2">
            <Text className="text-lg font-semibold">Legenda</Text>
            <View className="flex-row flex-wrap gap-4">
              <View className="flex-row items-center gap-2">
                <View className="h-4 w-4 rounded" style={{ backgroundColor: '#10B981' }} />
                <Text className="text-sm">Tersedia</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <View className="h-4 w-4 rounded" style={{ backgroundColor: '#EF4444' }} />
                <Text className="text-sm">Terisi</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <View className="h-4 w-4 rounded" style={{ backgroundColor: '#6B7280' }} />
                <Text className="text-sm">Dibatalkan</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <View className="h-4 w-4 rounded" style={{ backgroundColor: '#3B82F6' }} />
                <Text className="text-sm">Hadir</Text>
              </View>
            </View>
          </View>

          {/* Seats Grid */}
          <View className="gap-4">
            <Text className="text-lg font-semibold">Tata Letak Kursi</Text>
            <View className="gap-2">
              {kursi
                .reduce<Seat[][]>((rows, seat, idx) => {
                  const rowLen = 5; // 2 kursi + 1 spacer + 2 kursi
                  if (idx % rowLen === 0) rows.push([]);
                  rows[rows.length - 1].push(seat);
                  return rows;
                }, [])
                .map((row, rIdx) => (
                  <View key={rIdx} className="flex-row items-center justify-between gap-2">
                    {/* KIRI (2 kursi) */}
                    {row.slice(0, 2).map((seat) => (
                      <TouchableOpacity
                        key={seat.id}
                        style={{ backgroundColor: getSeatColor(seat.status) }}
                        className="aspect-square flex-1 items-center justify-center rounded-lg shadow-sm"
                        onPress={() => {
                          setSelectedSeat(seat);
                          setShowModal(true);
                        }}>
                        <Text className="text-xs font-bold text-white">{seat.nomor_kursi}</Text>
                        <Text className="text-xs text-white/80">{getSeatText(seat.status)}</Text>
                      </TouchableOpacity>
                    ))}

                    {/* SPACER tengah */}
                    <View className="w-9" />

                    {/* KANAN (2 kursi) */}
                    {row.slice(2, 4).map((seat) => (
                      <TouchableOpacity
                        key={seat.id}
                        style={{ backgroundColor: getSeatColor(seat.status) }}
                        className="aspect-square flex-1 items-center justify-center rounded-lg shadow-sm"
                        onPress={() => {
                          setSelectedSeat(seat);
                          setShowModal(true);
                        }}>
                        <Text className="text-xs font-bold text-white">{seat.nomor_kursi}</Text>
                        <Text className="text-xs text-white/80">{getSeatText(seat.status)}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ))}
            </View>
          </View>

          {/* Stats */}
          <View className="gap-3 rounded-xl border border-border bg-card p-4">
            <Text className="text-lg font-semibold">Statistik Kursi</Text>
            <View className="flex-row flex-wrap justify-between">
              <Text className="text-sm">
                Tersedia: {kursi.filter((s) => s.status === 'kosong').length}
              </Text>
              <Text className="text-sm">
                Terisi: {kursi.filter((s) => s.status === 'terisi').length}
              </Text>
              <Text className="text-sm">
                Dibatalkan: {kursi.filter((s) => s.status === 'batal').length}
              </Text>
              <Text className="text-sm">
                Hadir: {kursi.filter((s) => s.status === 'hadir').length}
              </Text>
            </View>
          </View>

          {/* Passenger Info Modal */}
          <AlertDialog open={showModal} onOpenChange={setShowModal}>
            <AlertDialogContent className="w-full max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-center text-2xl">
                  Info Kursi {selectedSeat?.nomor_kursi}
                </AlertDialogTitle>
                <AlertDialogDescription className="text-center">
                  Status: {selectedSeat ? getSeatText(selectedSeat.status) : ''}
                </AlertDialogDescription>
              </AlertDialogHeader>

              {selectedSeat?.penumpang ? (
                <ScrollView className="max-h-96" showsVerticalScrollIndicator={false}>
                  <View className="gap-4 py-4">
                    <View className="gap-2 rounded-lg border border-border bg-card p-4">
                      <Text className="mb-2 font-semibold">Informasi Penumpang</Text>
                      <View className="gap-1">
                        <Text className="text-sm">
                          <Text className="text-muted-foreground">Nama: </Text>
                          <Text className="font-medium">{selectedSeat.penumpang.nama}</Text>
                        </Text>
                        <Text className="text-sm">
                          <Text className="text-muted-foreground">NIK: </Text>
                          <Text className="font-medium">{selectedSeat.penumpang.nik}</Text>
                        </Text>
                        <Text className="text-sm">
                          <Text className="text-muted-foreground">Jenis Kelamin: </Text>
                          <Text className="font-medium">
                            {selectedSeat.penumpang.jenis_kelamin === 'L'
                              ? 'Laki-laki'
                              : 'Perempuan'}
                          </Text>
                        </Text>
                        <Text className="text-sm">
                          <Text className="text-muted-foreground">Telepon: </Text>
                          <Text className="font-medium">
                            {selectedSeat.penumpang.nomor_telepon}
                          </Text>
                        </Text>
                        <Text className="text-sm">
                          <Text className="text-muted-foreground">Email: </Text>
                          <Text className="font-medium">{selectedSeat.penumpang.email}</Text>
                        </Text>
                      </View>
                    </View>
                  </View>
                </ScrollView>
              ) : (
                <View className="py-4">
                  <Text className="text-center text-muted-foreground">
                    Tidak ada informasi penumpang untuk kursi ini.
                  </Text>
                </View>
              )}

              <AlertDialogFooter>
                <AlertDialogAction onPress={() => setShowModal(false)}>
                  <Text>Tutup</Text>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </View>
      </ScrollView>
    </View>
  );
}
