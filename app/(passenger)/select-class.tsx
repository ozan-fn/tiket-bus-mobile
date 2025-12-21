import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import {
  BusIcon,
  MapPinIcon,
  ClockIcon,
  CalendarIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from 'lucide-react-native';
import * as React from 'react';
import { View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { useRouter, useLocalSearchParams } from 'expo-router';

interface KelasBus {
  id: number;
  kelas_bus_id: number;
  nama_kelas: string;
  harga: number;
  kursi_tersedia: number;
  total_kursi: number;
}

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
  kelas_tersedia: KelasBus[];
}

export default function SelectClassScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { jadwalId, jadwalData } = params as { jadwalId: string; jadwalData: string };

  const [selectedClass, setSelectedClass] = React.useState<KelasBus | null>(null);
  const jadwal: Jadwal = React.useMemo(() => JSON.parse(jadwalData), [jadwalData]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleSelectClass = (kelas: KelasBus) => {
    setSelectedClass(kelas);
  };

  const handleContinue = () => {
    if (!selectedClass) return;

    router.push({
      pathname: '/(passenger)/select-seat',
      params: {
        jadwalId: jadwalId,
        jadwalKelasBusId: selectedClass.id,
        classData: JSON.stringify(selectedClass),
        jadwalData: jadwalData,
      },
    } as any);
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="gap-6 p-6">
        {/* Kartu Foto Bus */}
        <View className="items-center rounded-xl border border-border bg-card">
          {jadwal.bus.photos && jadwal.bus.photos.length > 0 ? (
            <Image
              source={{ uri: jadwal.bus.photos[0] }}
              className="h-32 w-full rounded-lg"
              resizeMode="cover"
            />
          ) : (
            <Icon as={BusIcon} className="size-12 text-primary" />
          )}
        </View>

        {/* Ringkasan Perjalanan */}
        <View className="gap-4 rounded-xl border border-border bg-card p-4">
          <View className="flex-row items-center gap-2">
            <Icon as={BusIcon} className="size-5 text-primary" />
            <Text className="text-lg font-semibold">{jadwal.bus.nama}</Text>
          </View>

          <View className="gap-2 border-t border-border pt-3">
            <View className="flex-row items-center gap-2">
              <Icon as={MapPinIcon} className="size-4 text-muted-foreground" />
              <Text className="flex-1 text-sm">{jadwal.rute.asal.nama}</Text>
              <Icon as={ArrowRightIcon} className="size-4 text-muted-foreground" />
              <Text className="flex-1 text-right text-sm">{jadwal.rute.tujuan.nama}</Text>
            </View>

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
        </View>

        {/* Bagian Pilih Kelas */}
        <View className="gap-3">
          <Text className="text-lg font-semibold">Pilih Kelas Bus</Text>

          <View className="gap-3">
            {jadwal.kelas_tersedia.map((kelas) => (
              <TouchableOpacity
                key={kelas.id}
                onPress={() => handleSelectClass(kelas)}
                activeOpacity={0.7}>
                <View
                  className={`gap-4 rounded-xl border p-4 ${
                    selectedClass?.id === kelas.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card'
                  }`}>
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1 gap-2">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-lg font-semibold">{kelas.nama_kelas}</Text>
                        {selectedClass?.id === kelas.id && (
                          <Icon as={CheckCircleIcon} className="size-5 text-primary" />
                        )}
                      </View>

                      <View className="flex-row items-center gap-2">
                        <Badge variant={kelas.kursi_tersedia > 10 ? 'default' : 'destructive'}>
                          <Text className="text-xs">{kelas.kursi_tersedia} kursi tersedia</Text>
                        </Badge>
                      </View>

                      <Text className="text-xs text-muted-foreground">
                        Kapasitas total: {kelas.total_kursi} kursi
                      </Text>
                    </View>

                    <View className="items-end gap-1">
                      <Text className="text-2xl font-bold text-primary">
                        Rp {Math.floor(kelas.harga / 1000)}K
                      </Text>
                      <Text className="text-xs text-muted-foreground">per orang</Text>
                    </View>
                  </View>

                  {kelas.kursi_tersedia === 0 && (
                    <View className="rounded-lg bg-destructive/10 p-3">
                      <Text className="text-center text-sm text-destructive">
                        Habis Terjual - Tidak ada kursi tersedia
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Rincian Harga (jika kelas dipilih) */}
        {selectedClass && (
          <View className="gap-3 rounded-xl border border-border bg-card p-4">
            <Text className="font-semibold">Ringkasan Harga</Text>
            <View className="gap-2">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-muted-foreground">Kelas</Text>
                <Text className="text-sm font-medium">{selectedClass.nama_kelas}</Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-muted-foreground">Harga per tiket</Text>
                <Text className="text-sm font-medium">
                  Rp {selectedClass.harga.toLocaleString('id-ID')}
                </Text>
              </View>
              <View className="border-t border-border pt-2">
                <View className="flex-row items-center justify-between">
                  <Text className="font-semibold">Total</Text>
                  <Text className="text-lg font-bold text-primary">
                    Rp {selectedClass.harga.toLocaleString('id-ID')}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Tombol Lanjut */}
        <View className="gap-2 pb-6">
          <Button
            className="w-full"
            onPress={handleContinue}
            disabled={!selectedClass || selectedClass.kursi_tersedia === 0}>
            <Text>Lanjut ke Pilih Kursi</Text>
          </Button>
          <Button variant="outline" onPress={() => router.back()}>
            <Text>Kembali ke Hasil Pencarian</Text>
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}
