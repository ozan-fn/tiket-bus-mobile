import * as React from 'react';
import { View, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import {
  BusIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  ArrowRightIcon,
  RefreshCwIcon,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

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

interface AvailableSchedulesProps {
  availableSchedules: Jadwal[];
  isLoadingSchedules: boolean;
  schedulesError: string;
  fetchAvailableSchedules: () => void;
  formatDate: (dateStr: string) => string;
  handleSelectJadwal: (jadwal: Jadwal) => void;
}

export function AvailableSchedules({
  availableSchedules,
  isLoadingSchedules,
  schedulesError,
  fetchAvailableSchedules,
  formatDate,
  handleSelectJadwal,
}: AvailableSchedulesProps) {
  const router = useRouter();

  return (
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
                  {Math.min(...jadwal.kelas_tersedia.map((k) => k.harga)).toLocaleString('id-ID')}
                </Text>
              </View>
            )}

            {/* Book Button */}
            <Button className="mt-2 w-full" size="sm" onPress={() => handleSelectJadwal(jadwal)}>
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
  );
}
