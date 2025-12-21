import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  BusIcon,
  MapPinIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
} from 'lucide-react-native';
import * as React from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { apiGetKursi, apiCreateTiket, apiGetProfile } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Kursi {
  id: number;
  nomor_kursi: string;
  posisi: string;
  index: number;
  tersedia: boolean;
}

interface KursiData {
  jadwal_id: number;
  jadwal_kelas_bus_id: number;
  bus: {
    id: number;
    nama: string;
    plat_nomor: string;
  };
  kelas_bus: {
    id: number;
    nama_kelas: string;
    deskripsi: string;
    jumlah_kursi: number;
  };
  harga: number;
  kursi: Kursi[];
}

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
  bus: {
    nama: string;
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
}

interface Passenger {
  nama: string;
  nik: string;
  jenis_kelamin: { value: string; label: string } | null;
  nomor_telepon: string;
}

export default function SelectSeatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { jadwalId, jadwalKelasBusId, classData, jadwalData } = params as {
    jadwalId: string;
    jadwalKelasBusId: string;
    classData: string;
    jadwalData: string;
  };

  const { user, userName } = useAuth();

  const kelas: KelasBus = React.useMemo(() => JSON.parse(classData), [classData]);
  const jadwal: Jadwal = React.useMemo(() => JSON.parse(jadwalData), [jadwalData]);

  const [kursiData, setKursiData] = React.useState<KursiData | null>(null);
  const [selectedSeat, setSelectedSeat] = React.useState<Kursi | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isBooking, setIsBooking] = React.useState(false);
  const [error, setError] = React.useState('');
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [showProfileDialog, setShowProfileDialog] = React.useState(false);
  const [missingFields, setMissingFields] = React.useState<any>(null);
  const [showPassengerForm, setShowPassengerForm] = React.useState(false);
  const [showNIKAlert, setShowNIKAlert] = React.useState(false);
  const [passenger, setPassenger] = React.useState<Passenger>({
    nama: '',
    nik: '',
    jenis_kelamin: null,
    nomor_telepon: '',
  });

  React.useEffect(() => {
    fetchKursi();
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const response = await apiGetProfile();
    if (response && !response.error) {
      const formattedTanggalLahir = response.tanggal_lahir
        ? new Date(response.tanggal_lahir).toISOString().split('T')[0]
        : '';
      setPassenger({
        nama: response.name || '',
        nik: response.nik || '',
        jenis_kelamin: response.jenis_kelamin
          ? {
              value: response.jenis_kelamin,
              label: response.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan',
            }
          : null,
        nomor_telepon: response.nomor_telepon || '',
      });
    }
  };

  const fetchKursi = async () => {
    setIsLoading(true);
    setError('');

    const response = await apiGetKursi(parseInt(jadwalId), parseInt(jadwalKelasBusId));

    if (response.error) {
      setError('Gagal memuat kursi');
      setKursiData(null);
    } else if (response.success && response.data) {
      setKursiData(response.data);
    } else {
      setError('Gagal memuat kursi');
    }

    setIsLoading(false);
  };

  const handleSelectSeat = (kursi: Kursi) => {
    if (!kursi.tersedia) return;

    if (selectedSeat?.id === kursi.id) {
      setSelectedSeat(null);
    } else {
      setSelectedSeat(kursi);
    }
  };

  const updatePassenger = (
    field: keyof Passenger,
    value: string | { value: string; label: string } | null
  ) => {
    setPassenger((prev) => ({ ...prev, [field]: value }));
  };

  const handleBookTicket = () => {
    setShowPassengerForm(true);
  };

  const handleConfirmPassengerInfo = () => {
    // Validate passenger
    if (!passenger.nama || !passenger.nik || !passenger.jenis_kelamin || !passenger.nomor_telepon) {
      setError('Silakan lengkapi semua informasi penumpang.');
      return;
    }
    setShowPassengerForm(false);
    setShowConfirmDialog(true);
  };

  const confirmBooking = async () => {
    if (!selectedSeat) return;

    setShowConfirmDialog(false);
    setIsBooking(true);

    // Assuming API accepts passengers array - adjust as needed
    const response = await apiCreateTiket(parseInt(jadwalKelasBusId), selectedSeat.id);

    if (response.success) {
      // Success, navigate to ticket detail or my tickets
      router.replace({
        pathname: '/(passenger)/booking-success',
        params: {
          ticketData: JSON.stringify(response.data),
        },
      } as any);
    } else {
      setError(response.error || 'Gagal memesan tiket');
    }

    setIsBooking(false);
  };

  // Removed goToProfile as per user request

  // Group seats by rows (assuming 4 seats per row: 2 left, aisle, 2 right)
  const seatRows = React.useMemo(() => {
    if (!kursiData?.kursi) return [];

    const rows: Kursi[][] = [];
    for (let i = 0; i < kursiData.kursi.length; i += 4) {
      rows.push(kursiData.kursi.slice(i, i + 4));
    }
    return rows;
  }, [kursiData]);

  const renderPassengerForm = () => (
    <View className="gap-4">
      <View className="flex-row items-center gap-2">
        <Icon as={UserIcon} className="size-4 text-primary" />
        <Text className="font-semibold">Informasi Penumpang</Text>
      </View>

      <View className="gap-3 rounded-lg border border-border p-4">
        <Text className="font-medium">Informasi Penumpang</Text>

        <View className="gap-2">
          <Label>Nama</Label>
          <Input
            value={passenger.nama}
            onChangeText={(value) => updatePassenger('nama', value)}
            placeholder="Masukkan nama lengkap"
          />
        </View>

        <View className="gap-2">
          <Label>NIK</Label>
          <Input
            value={passenger.nik}
            onChangeText={(value) => updatePassenger('nik', value)}
            placeholder="Masukkan NIK"
            keyboardType="numeric"
          />
        </View>

        <View className="gap-2">
          <Label>Jenis Kelamin</Label>
          <Select
            value={passenger.jenis_kelamin as any}
            onValueChange={(option) => updatePassenger('jenis_kelamin', option as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih jenis kelamin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="L" label="Laki-laki">
                Laki-laki
              </SelectItem>
              <SelectItem value="P" label="Perempuan">
                Perempuan
              </SelectItem>
            </SelectContent>
          </Select>
        </View>

        <View className="gap-2">
          <Label>Nomor Telepon</Label>
          <Input
            value={passenger.nomor_telepon}
            onChangeText={(value) => updatePassenger('nomor_telepon', value)}
            placeholder="Masukkan nomor telepon"
            keyboardType="phone-pad"
          />
        </View>
      </View>
    </View>
  );

  const renderSeat = (kursi: Kursi) => {
    const isSelected = selectedSeat?.id === kursi.id;
    const isAvailable = kursi.tersedia;

    return (
      <TouchableOpacity
        key={kursi.id}
        onPress={() => handleSelectSeat(kursi)}
        disabled={!isAvailable}
        activeOpacity={0.7}
        className="flex-1">
        <View
          className={`items-center justify-center rounded-lg border-2 p-3 ${
            isSelected
              ? 'border-primary bg-primary'
              : isAvailable
                ? 'border-border bg-card'
                : 'border-muted bg-muted'
          }`}>
          <Text
            className={`text-xs font-semibold ${
              isSelected ? 'text-primary-foreground' : isAvailable ? '' : 'text-muted-foreground'
            }`}>
            {kursi.nomor_kursi}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="gap-6 p-6">
        {/* Ringkasan Perjalanan */}
        <View className="gap-3 rounded-xl border border-border bg-card p-4">
          <View className="flex-row items-center gap-2">
            <Icon as={BusIcon} className="size-4 text-primary" />
            <Text className="font-semibold">{jadwal.bus.nama}</Text>
            <Text className="text-sm text-muted-foreground">• {kelas.nama_kelas}</Text>
          </View>

          <View className="flex-row items-center gap-2">
            <Icon as={MapPinIcon} className="size-4 text-muted-foreground" />
            <Text className="flex-1 text-sm">{jadwal.rute.asal.nama}</Text>
            <Icon as={ArrowRightIcon} className="size-4 text-muted-foreground" />
            <Text className="flex-1 text-right text-sm">{jadwal.rute.tujuan.nama}</Text>
          </View>
        </View>

        {/* Loading State */}
        {isLoading && (
          <View className="items-center justify-center py-12">
            <ActivityIndicator size="large" />
            <Text className="mt-4 text-muted-foreground">Memuat tata letak kursi...</Text>
          </View>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <View className="items-center justify-center gap-4 rounded-xl border border-border bg-card p-8">
            <Icon as={XCircleIcon} className="size-12 text-destructive" />
            <Text className="text-center text-sm text-muted-foreground">{error}</Text>
            <Button onPress={fetchKursi}>
              <Text>Coba Lagi</Text>
            </Button>
          </View>
        )}

        {/* Seat Layout */}
        {!isLoading && !error && kursiData && (
          <>
            {/* Legend */}
            <View className="gap-3">
              <Text className="text-lg font-semibold">Pilih Kursi Anda</Text>

              <View className="flex-row items-center justify-around rounded-lg bg-muted p-3">
                <View className="flex-row items-center gap-2">
                  <View className="h-6 w-6 rounded border-2 border-border bg-card" />
                  <Text className="text-xs">Tersedia</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <View className="h-6 w-6 rounded border-2 border-primary bg-primary" />
                  <Text className="text-xs">Terpilih</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <View className="h-6 w-6 rounded border-2 border-muted bg-muted" />
                  <Text className="text-xs">Terisi</Text>
                </View>
              </View>
            </View>

            {/* Bus Layout */}
            <View className="gap-4 rounded-xl border border-border bg-card p-4">
              {/* Driver Section */}
              <View className="items-center rounded-lg bg-muted p-3">
                <Text className="text-xs font-semibold text-muted-foreground">SOPIR</Text>
              </View>

              {/* Seats */}
              <View className="gap-3">
                {seatRows.map((row, rowIndex) => (
                  <View key={rowIndex} className="flex-row gap-2">
                    {/* Left side (2 seats) */}
                    <View className="flex-1 flex-row gap-2">
                      {row.slice(0, 2).map((kursi) => renderSeat(kursi))}
                    </View>

                    {/* Aisle */}
                    <View className="w-4" />

                    {/* Right side (2 seats) */}
                    <View className="flex-1 flex-row gap-2">
                      {row.slice(2, 4).map((kursi) => renderSeat(kursi))}
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Selected Seat Info */}
            {selectedSeat && (
              <View className="gap-3 rounded-xl border border-primary bg-primary/5 p-4">
                <View className="flex-row items-center gap-2">
                  <Icon as={CheckCircleIcon} className="size-5 text-primary" />
                  <Text className="text-lg font-semibold">Kursi Terpilih</Text>
                </View>

                <View className="gap-2">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm text-muted-foreground">Nomor Kursi</Text>
                    <Text className="text-sm font-semibold">{selectedSeat.nomor_kursi}</Text>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm text-muted-foreground">Posisi</Text>
                    <Text className="text-sm font-semibold capitalize">{selectedSeat.posisi}</Text>
                  </View>
                  <View className="flex-row items-center justify-between border-t border-border pt-2">
                    <Text className="font-semibold">Total Harga</Text>
                    <Text className="text-xl font-bold text-primary">
                      Rp {kursiData.harga.toLocaleString('id-ID')}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Passenger Form */}
            {selectedSeat && renderPassengerForm()}

            {/* Action Buttons */}
            <View className="gap-2 pb-6">
              <Button
                className="w-full"
                onPress={handleConfirmPassengerInfo}
                disabled={!selectedSeat || isBooking}>
                <Text>{isBooking ? 'Memproses...' : 'Lanjut ke Konfirmasi'}</Text>
              </Button>
              <Button variant="outline" onPress={() => router.back()} disabled={isBooking}>
                <Text>Kembali ke Pilih Kelas</Text>
              </Button>
            </View>
          </>
        )}
      </View>

      {/* Passenger Form Dialog */}
      <Dialog open={showPassengerForm} onOpenChange={setShowPassengerForm}>
        <DialogContent className="max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Masukkan Detail Penumpang</DialogTitle>
            <DialogDescription>Silakan isi informasi penumpang.</DialogDescription>
          </DialogHeader>
          <ScrollView className="flex-1">{renderPassengerForm()}</ScrollView>
          <DialogFooter>
            <Button variant="outline" onPress={() => setShowPassengerForm(false)}>
              <Text>Batal</Text>
            </Button>
            <Button onPress={handleConfirmPassengerInfo}>
              <Text>Konfirmasi</Text>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Pemesanan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin memesan tiket ini?{'\n\n'}
              <Text className="font-semibold">
                Nomor Kursi: {selectedSeat?.nomor_kursi}
                {'\n'}
                Harga: Rp {kursiData?.harga.toLocaleString('id-ID')}
                {'\n\n'}
                Penumpang: {passenger.nama}
              </Text>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              <Text>Batal</Text>
            </AlertDialogCancel>
            <AlertDialogAction onPress={confirmBooking}>
              <Text>Konfirmasi</Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* NIK Alert Dialog */}
      <AlertDialog open={showNIKAlert} onOpenChange={setShowNIKAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Info</AlertDialogTitle>
            <AlertDialogDescription>
              Harap update profil untuk mengisi NIK secara otomatis.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onPress={() => setShowNIKAlert(false)}>
              <Text>OK</Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ScrollView>
  );
}
