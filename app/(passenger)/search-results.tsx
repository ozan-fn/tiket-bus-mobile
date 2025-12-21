import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import {
  BusIcon,
  MapPinIcon,
  ClockIcon,
  CalendarIcon,
  ArrowRightIcon,
  RefreshCwIcon,
} from 'lucide-react-native';
import * as React from 'react';
import { View, ScrollView, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { apiGetJadwal } from '@/lib/api';

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
    photos: string[];
  };
  rute: {
    id: number;
    asal: {
      nama: string;
      photos: string[];
    };
    tujuan: {
      nama: string;
      photos: string[];
    };
  };
  kelas_tersedia: Array<{
    id: number;
    bus_kelas_bus_id: number;
    nama_kelas: string;
    harga: number;
    kursi_tersedia: number;
    total_kursi: number;
  }>;
}

export default function SearchResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { asal, tujuan, tanggal } = params as {
    asal: string;
    tujuan: string;
    tanggal: string;
  };

  const [jadwals, setJadwals] = React.useState<Jadwal[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string>('');

  React.useEffect(() => {
    fetchJadwal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asal, tujuan, tanggal]);

  const fetchJadwal = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await apiGetJadwal(asal, tujuan, tanggal);

      if (response?.error) {
        setError(response.error);
        setJadwals([]);
      } else if (response?.success && response?.data) {
        setJadwals(response.data);
      } else {
        setJadwals([]);
      }
    } catch (err: any) {
      setError(err?.message || 'Terjadi kesalahan saat mengambil jadwal');
      setJadwals([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Tanggal tidak tersedia';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Tanggal tidak tersedia';
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
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
      <View className="gap-4 p-6">
        {/* Search Summary */}
        <View className="gap-3 rounded-xl border border-border bg-card p-4">
          <View className="flex-row items-center gap-2">
            <Icon as={MapPinIcon} className="size-4 text-primary" />
            <Text className="flex-1 font-semibold">{asal}</Text>
            <Icon as={ArrowRightIcon} className="size-4 text-muted-foreground" />
            <Text className="flex-1 text-right font-semibold">{tujuan}</Text>
          </View>
          {/*<View className="flex-row items-center gap-2">
            <Icon as={CalendarIcon} className="size-4 text-muted-foreground" />
            <Text className="text-sm text-muted-foreground">{formatDate(tanggal)}</Text>
          </View>*/}
        </View>

        {/* Loading State */}
        {isLoading && (
          <View className="items-center justify-center py-12">
            <ActivityIndicator size="large" />
            <Text className="mt-4 text-muted-foreground">Searching for available buses...</Text>
          </View>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <View className="items-center justify-center gap-4 rounded-xl border border-border bg-card p-8">
            <Icon as={BusIcon} className="size-12 text-muted-foreground" />
            <View className="items-center gap-2">
              <Text className="text-center text-lg font-semibold">Error</Text>
              <Text className="text-center text-sm text-muted-foreground">{error}</Text>
            </View>
            <Button onPress={fetchJadwal}>
              <Icon as={RefreshCwIcon} className="mr-2 size-4" />
              <Text>Try Again</Text>
            </Button>
          </View>
        )}

        {/* Empty State */}
        {!isLoading && !error && jadwals.length === 0 && (
          <View className="items-center justify-center gap-4 rounded-xl border border-border bg-card p-8">
            <Icon as={BusIcon} className="size-12 text-muted-foreground" />
            <View className="items-center gap-2">
              <Text className="text-center text-lg font-semibold">No Buses Found</Text>
              <Text className="text-center text-sm text-muted-foreground">
                No available buses for this route on the selected date.{'\n'}Try a different date or
                route.
              </Text>
            </View>
            <Button variant="outline" onPress={() => router.back()}>
              <Text>Change Search</Text>
            </Button>
          </View>
        )}

        {/* Results List */}
        {!isLoading &&
          !error &&
          jadwals.length > 0 &&
          jadwals.map((jadwal) => (
            <TouchableOpacity
              key={jadwal.id}
              onPress={() => handleSelectJadwal(jadwal)}
              activeOpacity={0.7}>
              <View className="gap-3 rounded-xl border border-border bg-card p-4">
                {/* Header */}
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 gap-1">
                    <View className="flex-row items-center gap-2">
                      {jadwal.bus.photos && jadwal.bus.photos.length > 0 ? (
                        <Image
                          source={{ uri: jadwal.bus.photos[0] }}
                          className="size-8 rounded"
                          resizeMode="cover"
                        />
                      ) : (
                        <Icon as={BusIcon} className="size-4 text-primary" />
                      )}
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
                  <Text className="flex-1 text-sm">{jadwal.rute.asal.nama}</Text>
                  <Icon as={ArrowRightIcon} className="size-4 text-muted-foreground" />
                  <Text className="flex-1 text-right text-sm">{jadwal.rute.tujuan.nama}</Text>
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
                      {new Date(jadwal.jam_berangkat).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
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
                <Button className="mt-2 w-full" onPress={() => handleSelectJadwal(jadwal)}>
                  <Text className="text-xs">Pesan Sekarang</Text>
                </Button>
              </View>
            </TouchableOpacity>
          ))}
      </View>
    </ScrollView>
  );
}
