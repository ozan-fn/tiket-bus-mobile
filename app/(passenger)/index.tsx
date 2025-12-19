import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AutocompleteInput } from '@/components/ui/autocomplete-input';
import {
  BusIcon,
  MapPinIcon,
  CalendarIcon,
  SearchIcon,
  ClockIcon,
  ArrowRightIcon,
  RefreshCwIcon,
} from 'lucide-react-native';
import * as React from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { apiGetJadwal, apiGetRutes } from '@/lib/api';

interface Jadwal {
  id: number;
  tanggal_berangkat: string;
  jam_berangkat: string;
  status: string;
  bus: {
    id: number;
    nama: string;
    plat_nomor: string;
    kapasitas: number;
  };
  rute: {
    id: number;
    asal: string;
    tujuan: string;
  };
  kelas_tersedia: Array<{
    id: number;
    kelas_bus_id: number;
    nama_kelas: string;
    harga: number;
    kursi_tersedia: number;
    total_kursi: number;
  }>;
}

interface Terminal {
  id: number;
  nama_terminal: string;
  nama_kota: string;
  alamat: string;
}

interface Rute {
  id: number;
  asal_terminal_id: number;
  tujuan_terminal_id: number;
  asal_terminal: Terminal;
  tujuan_terminal: Terminal;
}

export default function PassengerHomeScreen() {
  const { userName } = useAuth();
  const router = useRouter();
  const [asal, setAsal] = React.useState('');
  const [tujuan, setTujuan] = React.useState('');
  const [tanggal, setTanggal] = React.useState('');
  const [availableSchedules, setAvailableSchedules] = React.useState<Jadwal[]>([]);
  const [isLoadingSchedules, setIsLoadingSchedules] = React.useState(true);
  const [schedulesError, setSchedulesError] = React.useState('');

  const [asalOptions, setAsalOptions] = React.useState<any[]>([]);
  const [tujuanOptions, setTujuanOptions] = React.useState<any[]>([]);
  const [isLoadingAsal, setIsLoadingAsal] = React.useState(false);
  const [isLoadingTujuan, setIsLoadingTujuan] = React.useState(false);

  React.useEffect(() => {
    fetchAvailableSchedules();
    loadInitialTerminals();
  }, []);

  React.useEffect(() => {
    if (asal.length >= 2) {
      fetchAsalOptions(asal);
    }
  }, [asal]);

  React.useEffect(() => {
    if (tujuan.length >= 2) {
      fetchTujuanOptions(tujuan);
    }
  }, [tujuan]);

  const loadInitialTerminals = async () => {
    const response = await apiGetRutes(1, undefined, undefined, 50);
    if (response.success && response.data) {
      const uniqueAsal = new Map();
      const uniqueTujuan = new Map();

      response.data.forEach((rute: Rute) => {
        uniqueAsal.set(rute.asal_terminal.nama_kota, {
          value: rute.asal_terminal.nama_kota,
          label: rute.asal_terminal.nama_kota,
          sublabel: rute.asal_terminal.nama_terminal,
        });
        uniqueTujuan.set(rute.tujuan_terminal.nama_kota, {
          value: rute.tujuan_terminal.nama_kota,
          label: rute.tujuan_terminal.nama_kota,
          sublabel: rute.tujuan_terminal.nama_terminal,
        });
      });

      setAsalOptions(Array.from(uniqueAsal.values()));
      setTujuanOptions(Array.from(uniqueTujuan.values()));
    }
  };

  const fetchAsalOptions = async (searchQuery: string) => {
    setIsLoadingAsal(true);
    const response = await apiGetRutes(1, searchQuery, undefined, 20);

    if (response.success && response.data) {
      const uniqueOptions = new Map();
      response.data.forEach((rute: Rute) => {
        const key = rute.asal_terminal.nama_kota;
        if (!uniqueOptions.has(key)) {
          uniqueOptions.set(key, {
            value: key,
            label: key,
            sublabel: rute.asal_terminal.nama_terminal,
          });
        }
      });
      setAsalOptions(Array.from(uniqueOptions.values()));
    }
    setIsLoadingAsal(false);
  };

  const fetchTujuanOptions = async (searchQuery: string) => {
    setIsLoadingTujuan(true);
    const response = await apiGetRutes(1, undefined, searchQuery, 20);

    if (response.success && response.data) {
      const uniqueOptions = new Map();
      response.data.forEach((rute: Rute) => {
        const key = rute.tujuan_terminal.nama_kota;
        if (!uniqueOptions.has(key)) {
          uniqueOptions.set(key, {
            value: key,
            label: key,
            sublabel: rute.tujuan_terminal.nama_terminal,
          });
        }
      });
      setTujuanOptions(Array.from(uniqueOptions.values()));
    }
    setIsLoadingTujuan(false);
  };

  const fetchAvailableSchedules = async () => {
    setIsLoadingSchedules(true);
    setSchedulesError('');

    const response = await apiGetJadwal();

    if (response.error) {
      setSchedulesError(response.error);
      setAvailableSchedules([]);
    } else if (response.success && response.data) {
      setAvailableSchedules(response.data.slice(0, 5)); // Show only 5 latest
    } else {
      setAvailableSchedules([]);
    }

    setIsLoadingSchedules(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleSearch = () => {
    // Allow search with at least one parameter
    if (!asal && !tujuan) {
      return;
    }

    router.push({
      pathname: '/(passenger)/search-results',
      params: {
        asal: asal || '',
        tujuan: tujuan || '',
        tanggal: tanggal || '',
      },
    } as any);
  };

  const setToday = () => {
    const today = new Date();
    const formatted = today.toISOString().split('T')[0];
    setTanggal(formatted);
  };

  const setTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formatted = tomorrow.toISOString().split('T')[0];
    setTanggal(formatted);
  };

  const handleSelectJadwal = (jadwal: Jadwal) => {
    router.push({
      pathname: '/(passenger)/select-class',
      params: {
        jadwalId: jadwal.id,
        jadwalData: JSON.stringify(jadwal),
      },
    } as any);
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="gap-6 p-6">
        {/* Welcome Section */}
        <View className="gap-2">
          <Text className="text-2xl font-bold">
            Selamat Datang Kembali, {userName || 'Penumpang'}!
          </Text>
          <Text className="text-muted-foreground">Pesan tiket bus Anda dengan mudah</Text>
        </View>

        {/* Search Card */}
        <View className="gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
          <Text className="text-lg font-semibold">Cari Tiket Bus</Text>

          <View className="gap-4">
            {/* Departure City */}
            <View className="gap-1.5">
              <AutocompleteInput
                label="Kota Asal"
                value={asal}
                onChangeText={setAsal}
                onSelect={(option) => setAsal(option.label)}
                options={asalOptions}
                placeholder="Ketik kota asal (opsional)"
                isLoading={isLoadingAsal}
              />
            </View>

            {/* Destination City */}
            <View className="gap-1.5">
              <AutocompleteInput
                label="Kota Tujuan"
                value={tujuan}
                onChangeText={setTujuan}
                onSelect={(option) => setTujuan(option.label)}
                options={tujuanOptions}
                placeholder="Ketik kota tujuan (opsional)"
                isLoading={isLoadingTujuan}
              />
            </View>

            {/* Date */}
            <View className="gap-1.5">
              <Label>Tanggal Perjalanan</Label>
              <View className="relative">
                <View className="absolute left-3 top-3.5 z-10">
                  <Icon as={CalendarIcon} className="size-5 text-muted-foreground" />
                </View>
                <Input
                  placeholder="YYYY-MM-DD"
                  value={tanggal}
                  onChangeText={setTanggal}
                  className="pl-10"
                />
              </View>
              <View className="flex-row gap-2">
                <Button variant="outline" size="sm" onPress={setToday} className="flex-1">
                  <Text className="text-xs">Hari Ini</Text>
                </Button>
                <Button variant="outline" size="sm" onPress={setTomorrow} className="flex-1">
                  <Text className="text-xs">Besok</Text>
                </Button>
              </View>
            </View>
          </View>

          <Text className="mb-2 text-xs text-muted-foreground">
            * Anda bisa mencari dengan hanya mengisi salah satu (asal atau tujuan)
          </Text>

          <Button className="mt-2 w-full" onPress={handleSearch} disabled={!asal && !tujuan}>
            <Icon as={SearchIcon} className="mr-2 size-5" />
            <Text>Cari Bus</Text>
          </Button>
        </View>

        {/* Quick Info */}
        <View className="gap-3">
          <Text className="text-lg font-semibold">Mengapa Memilih Kami?</Text>

          <View className="gap-3">
            <View className="flex-row gap-3 rounded-lg border border-border bg-card p-4">
              <View className="h-12 rounded-full bg-primary/10 p-3">
                <Icon as={BusIcon} className="size-6 text-primary" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold">Bus Nyaman</Text>
                <Text className="text-sm text-muted-foreground">
                  Bus modern dengan AC dan kursi yang nyaman
                </Text>
              </View>
            </View>

            <View className="flex-row gap-3 rounded-lg border border-border bg-card p-4">
              <View className="rounded-full bg-primary/10 p-3">
                <Icon as={MapPinIcon} className="size-6 text-primary" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold">Rute Beragam</Text>
                <Text className="text-sm text-muted-foreground">
                  Jaringan luas meliputi kota-kota besar
                </Text>
              </View>
            </View>

            <View className="flex-row gap-3 rounded-lg border border-border bg-card p-4">
              <View className="h-12 rounded-full bg-primary/10 p-3">
                <Icon as={CalendarIcon} className="size-6 text-primary" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold">Pemesanan Mudah</Text>
                <Text className="text-sm text-muted-foreground">
                  Pesan tiket Anda hanya dengan beberapa ketukan
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Available Schedules */}
        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-semibold">Jadwal Tersedia</Text>
            {!isLoadingSchedules && !schedulesError && (
              <Button variant="ghost" size="sm" onPress={fetchAvailableSchedules}>
                <Icon as={RefreshCwIcon} className="size-4" />
              </Button>
            )}
          </View>

          {/* Loading State */}
          {isLoadingSchedules && (
            <View className="items-center justify-center rounded-xl border border-border bg-card p-8">
              <ActivityIndicator size="large" />
              <Text className="mt-4 text-sm text-muted-foreground">Memuat jadwal...</Text>
            </View>
          )}

          {/* Error State */}
          {!isLoadingSchedules && schedulesError && (
            <View className="items-center justify-center gap-4 rounded-xl border border-border bg-card p-6">
              <Icon as={BusIcon} className="size-8 text-muted-foreground" />
              <Text className="text-center text-sm text-muted-foreground">{schedulesError}</Text>
              <Button size="sm" variant="outline" onPress={fetchAvailableSchedules}>
                <Icon as={RefreshCwIcon} className="mr-2 size-4" />
                <Text className="text-xs">Coba Lagi</Text>
              </Button>
            </View>
          )}

          {/* Empty State */}
          {!isLoadingSchedules && !schedulesError && availableSchedules.length === 0 && (
            <View className="items-center justify-center rounded-xl border border-border bg-card p-6">
              <Icon as={BusIcon} className="size-8 text-muted-foreground" />
              <Text className="mt-2 text-center text-sm text-muted-foreground">
                Tidak ada jadwal tersedia saat ini
              </Text>
            </View>
          )}

          {/* Schedules List */}
          {!isLoadingSchedules &&
            !schedulesError &&
            availableSchedules.length > 0 &&
            availableSchedules.map((jadwal) => (
              <View key={jadwal.id} className="gap-3 rounded-xl border border-border bg-card p-4">
                {/* Header */}
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 gap-1">
                    <View className="flex-row items-center gap-2">
                      <Icon as={BusIcon} className="size-4 text-primary" />
                      <Text className="font-semibold">{jadwal.bus.nama}</Text>
                    </View>
                    <Text className="text-xs text-muted-foreground">{jadwal.bus.plat_nomor}</Text>
                  </View>
                  <Badge variant={jadwal.status === 'tersedia' ? 'default' : 'outline'}>
                    <Text className="text-xs capitalize">{jadwal.status}</Text>
                  </Badge>
                </View>

                {/* Route */}
                <View className="flex-row items-center gap-2 border-t border-border pt-3">
                  <Icon as={MapPinIcon} className="size-4 text-muted-foreground" />
                  <Text className="flex-1 text-sm">{jadwal.rute.asal}</Text>
                  <Icon as={ArrowRightIcon} className="size-4 text-muted-foreground" />
                  <Text className="flex-1 text-right text-sm">{jadwal.rute.tujuan}</Text>
                </View>

                {/* Date & Time */}
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <Icon as={CalendarIcon} className="size-4 text-muted-foreground" />
                    <Text className="text-sm text-muted-foreground">
                      {formatDate(jadwal.tanggal_berangkat)}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Icon as={ClockIcon} className="size-4 text-muted-foreground" />
                    <Text className="text-sm text-muted-foreground">
                      {jadwal.jam_berangkat.substring(0, 5)}
                    </Text>
                  </View>
                </View>

                {/* Price Range */}
                {jadwal.kelas_tersedia.length > 0 && (
                  <View className="flex-row items-center justify-between border-t border-border pt-3">
                    <Text className="text-xs text-muted-foreground">
                      {jadwal.kelas_tersedia.length} kelas tersedia
                    </Text>
                    <Text className="font-semibold text-primary">
                      Mulai Rp{' '}
                      {Math.min(...jadwal.kelas_tersedia.map((k) => k.harga)).toLocaleString(
                        'id-ID'
                      )}
                    </Text>
                  </View>
                )}

                {/* Book Button */}
                <Button
                  className="mt-2 w-full"
                  size="sm"
                  onPress={() => handleSelectJadwal(jadwal)}>
                  <Text className="text-xs">Pesan Sekarang</Text>
                </Button>
              </View>
            ))}

          {/* View All Button */}
          {!isLoadingSchedules && !schedulesError && availableSchedules.length > 0 && (
            <Button
              variant="outline"
              onPress={() =>
                router.push({
                  pathname: '/(passenger)/search-results',
                  params: { asal: '', tujuan: '', tanggal: '' },
                } as any)
              }>
              <Text>Lihat Semua Jadwal</Text>
            </Button>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
