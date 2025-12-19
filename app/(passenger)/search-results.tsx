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
import { View, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
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

export default function SearchResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { asal, tujuan, tanggal } = params as { asal: string; tujuan: string; tanggal: string };

  const [jadwals, setJadwals] = React.useState<Jadwal[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    fetchJadwal();
  }, [asal, tujuan, tanggal]);

  const fetchJadwal = async () => {
    setIsLoading(true);
    setError('');

    const response = await apiGetJadwal(asal, tujuan, tanggal);

    if (response.error) {
      setError(response.error);
      setJadwals([]);
    } else if (response.success && response.data) {
      setJadwals(response.data);
    } else {
      setJadwals([]);
    }

    setIsLoading(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
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
          <View className="flex-row items-center gap-2">
            <Icon as={CalendarIcon} className="size-4 text-muted-foreground" />
            <Text className="text-sm text-muted-foreground">{formatDate(tanggal)}</Text>
          </View>
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
                No available buses for this route on the selected date.{'\n'}Try a different date
                or route.
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
              <View className="gap-4 rounded-xl border border-border bg-card p-4">
                {/* Bus Info */}
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

                {/* Route Info */}
                <View className="flex-row items-center gap-2 border-t border-border pt-3">
                  <Icon as={ClockIcon} className="size-4 text-muted-foreground" />
                  <Text className="text-sm">{jadwal.jam_berangkat.substring(0, 5)}</Text>
                </View>

                {/* Available Classes */}
                <View className="gap-2 border-t border-border pt-3">
                  <Text className="text-xs font-semibold text-muted-foreground">
                    Available Classes:
                  </Text>
                  <View className="gap-2">
                    {jadwal.kelas_tersedia.map((kelas) => (
                      <View
                        key={kelas.id}
                        className="flex-row items-center justify-between rounded-lg bg-muted p-2">
                        <View className="flex-1">
                          <Text className="text-sm font-medium">{kelas.nama_kelas}</Text>
                          <Text className="text-xs text-muted-foreground">
                            {kelas.kursi_tersedia} / {kelas.total_kursi} seats available
                          </Text>
                        </View>
                        <Text className="font-semibold text-primary">
                          Rp {kelas.harga.toLocaleString('id-ID')}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Select Button */}
                <Button className="mt-2 w-full">
                  <Text>Select This Bus</Text>
                </Button>
              </View>
            </TouchableOpacity>
          ))}
      </View>
    </ScrollView>
  );
}
