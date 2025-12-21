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
import { ScanIcon, CheckCircleIcon, XCircleIcon, UserIcon, BusIcon } from 'lucide-react-native';
import * as React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { apiVerifyTicket, apiGetDriverSchedules } from '@/lib/api';
import { Stack } from 'expo-router';

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

interface TicketData {
  kode_tiket: string;
  status: string;
  penumpang: {
    nama: string;
    nik: string;
    jenis_kelamin: string;
    nomor_telepon: string;
  };
  jadwal: {
    tanggal_berangkat: string;
    jam_berangkat: string;
  };
  bus: {
    nama: string;
    plat_nomor: string;
  };
  rute: {
    asal: string;
    tujuan: string;
  };
  kelas: string;
  kursi: {
    nomor: string;
    posisi: string | null;
  };
  harga: number;
  pembayaran: {
    metode: string;
    waktu_bayar: string;
  };
}

interface VerifyResponse {
  success: boolean;
  message: string;
  data?: TicketData;
  error?: string;
}

export default function DriverScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = React.useState(true);
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [showDialog, setShowDialog] = React.useState(false);
  const [verifyResult, setVerifyResult] = React.useState<VerifyResponse | null>(null);
  const [schedules, setSchedules] = React.useState<Schedule[]>([]);
  const [isLoadingSchedules, setIsLoadingSchedules] = React.useState(true);
  const [schedulesError, setSchedulesError] = React.useState<string | null>(null);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (!isScanning || isVerifying) return;

    setIsScanning(false);
    setIsVerifying(true);

    // Verify ticket
    const result = await apiVerifyTicket(data);
    setVerifyResult(result);
    console.log('verifyResult:', verifyResult);
    console.log('result.message:', result.message);
    console.log('result.error:', result.error);
    if (result.success && result.data) {
      console.log('bus data:', result.data.bus);
      console.log('bus.nama:', result.data.bus.nama, 'type:', typeof result.data.bus.nama);
      console.log('bus.photos:', result.data.bus.photos, 'type:', typeof result.data.bus.photos);
    }
    setShowDialog(true);
    setIsVerifying(false);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setVerifyResult(null);
    // Resume scanning after a short delay
    setTimeout(() => {
      setIsScanning(true);
    }, 500);
  };

  const fetchSchedules = async () => {
    setIsLoadingSchedules(true);
    setSchedulesError(null);
    const result = await apiGetDriverSchedules();
    setIsLoadingSchedules(false);
    if (result.success && result.data) {
      setSchedules(result.data);
    } else {
      setSchedulesError(result.error || 'Failed to load schedules');
    }
  };

  React.useEffect(() => {
    fetchSchedules();
  }, []);

  const isFocused = useIsFocused();

  // Ensure camera is completely disabled when screen is not focused
  React.useEffect(() => {
    if (!isFocused) {
      setIsScanning(false);
    }
  }, [isFocused]);

  useFocusEffect(
    React.useCallback(() => {
      if (isFocused) {
        setIsScanning(true);
      }
      return () => {
        setIsScanning(false);
      };
    }, [isFocused])
  );

  // Pilih jadwal paling terbaru berdasarkan tanggal + jam berangkat,
  // tanpa memfilter hanya yang berstatus 'aktif'. Ini memastikan layar scan
  // dapat bekerja dengan jadwal paling baru yang tersedia.
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

  if (isLoadingSchedules) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Icon as={ScanIcon} className="mb-4 size-16 text-muted-foreground" />
        <Text className="text-muted-foreground">Memuat jadwal...</Text>
      </View>
    );
  }

  if (schedulesError) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-6">
        <Icon as={ScanIcon} className="mb-4 size-16 text-muted-foreground" />
        <Text className="text-center text-lg font-semibold">Kesalahan</Text>
        <Text className="mb-4 text-center text-sm text-muted-foreground">{schedulesError}</Text>
        <Button onPress={() => fetchSchedules()}>
          <Text>Coba Lagi</Text>
        </Button>
      </View>
    );
  }

  if (!latestSchedule) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-6">
        <Icon as={ScanIcon} className="mb-4 size-16 text-muted-foreground" />
        <Text className="text-center text-lg font-semibold">Tidak Ada Jadwal</Text>
        <Text className="text-center text-sm text-muted-foreground">
          Tidak ditemukan jadwal apapun. Scan QR tidak dapat dilakukan.
        </Text>
      </View>
    );
  }

  if (!permission) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-6">
        <Icon as={ScanIcon} className="mb-4 size-16 text-muted-foreground" />
        <Text className="text-center text-muted-foreground">Meminta izin kamera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-6">
        <Icon as={ScanIcon} className="mb-4 size-16 text-muted-foreground" />
        <Text className="mb-2 text-center text-xl font-bold">Izin Kamera Diperlukan</Text>
        <Text className="mb-6 text-center text-muted-foreground">
          Kami memerlukan akses kamera untuk memindai kode QR pada tiket
        </Text>
        <Button onPress={requestPermission}>
          <Text>Berikan Izin</Text>
        </Button>
      </View>
    );
  }

  return (
    <>
      {/*<Stack.Screen options={{ headerShown: false }} />*/}
      <View className="flex-1 bg-background">
        {/* Camera View */}
        <View className="flex-1">
          {isFocused && (
            <CameraView
              style={StyleSheet.absoluteFillObject}
              facing="back"
              onBarcodeScanned={isScanning ? handleBarCodeScanned : undefined}
              barcodeScannerSettings={{
                barcodeTypes: ['qr'],
              }}
            />
          )}

          {/* Overlay */}
          <View className="flex-1 items-center justify-center">
            <View className="relative h-64 w-64 rounded-3xl border-4 border-white">
              <View className="absolute -left-1 -top-1 h-8 w-8 border-l-4 border-t-4 border-primary" />
              <View className="absolute -right-1 -top-1 h-8 w-8 border-r-4 border-t-4 border-primary" />
              <View className="absolute -bottom-1 -left-1 h-8 w-8 border-b-4 border-l-4 border-primary" />
              <View className="absolute -bottom-1 -right-1 h-8 w-8 border-b-4 border-r-4 border-primary" />
            </View>
            {!isFocused && (
              <View className="absolute inset-0 items-center justify-center rounded-3xl bg-black/50">
                <Text className="text-center font-semibold text-white">
                  Kamera dinonaktifkan.{'\n'}Kembali ke halaman ini untuk mengaktifkan kamera.
                </Text>
              </View>
            )}
          </View>

          {/* Instructions */}
          <View className="absolute bottom-0 left-0 right-0 bg-black/70 p-6">
            <Text className="mb-2 text-center text-xl font-bold text-white">
              {isVerifying ? 'Memverifikasi Tiket...' : 'Pindai Kode QR'}
            </Text>
            <Text className="text-center text-sm text-white/80">
              {isVerifying
                ? 'Harap tunggu sementara kami memverifikasi tiket'
                : 'Posisikan kode QR di dalam bingkai'}
            </Text>
          </View>
        </View>

        {/* Result Dialog */}
        <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
          <AlertDialogContent className="w-full max-w-md">
            <AlertDialogHeader>
              <View className="mb-4 items-center">
                {verifyResult?.success ? (
                  <View className="rounded-full bg-green-500/20 p-4">
                    <Icon as={CheckCircleIcon} className="size-12 text-green-500" />
                  </View>
                ) : (
                  <View className="rounded-full bg-red-500/20 p-4">
                    <Icon as={XCircleIcon} className="size-12 text-red-500" />
                  </View>
                )}
              </View>
              <AlertDialogTitle className="text-center text-2xl">
                {verifyResult?.success ? 'Tiket Valid' : 'Tiket Tidak Valid'}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center">
                {String(verifyResult?.message) || String(verifyResult?.error)}
              </AlertDialogDescription>
            </AlertDialogHeader>

            {verifyResult?.success && verifyResult?.data && (
              <ScrollView className="max-h-96" showsVerticalScrollIndicator={false}>
                <View className="gap-4 py-4">
                  {/* Ticket Code */}
                  <View className="items-center gap-2 rounded-lg bg-muted p-4">
                    <Text className="text-xs text-muted-foreground">Kode Tiket</Text>
                    <Text className="text-lg font-bold">{verifyResult.data.kode_tiket}</Text>
                    <Badge variant={verifyResult.data.status === 'dibayar' ? 'default' : 'outline'}>
                      <Text className="text-xs capitalize">{verifyResult.data.status}</Text>
                    </Badge>
                  </View>

                  {/* Passenger Info */}
                  <View className="gap-2 rounded-lg border border-border bg-card p-4">
                    <View className="mb-2 flex-row items-center gap-2">
                      <Icon as={UserIcon} className="size-4 text-primary" />
                      <Text className="font-semibold">Informasi Penumpang</Text>
                    </View>
                    <View className="gap-1">
                      <Text className="text-sm">
                        <Text className="text-muted-foreground">Nama: </Text>
                        <Text className="font-medium">
                          {String(verifyResult.data.penumpang.nama)}
                        </Text>
                      </Text>
                      <Text className="text-sm">
                        <Text className="text-muted-foreground">NIK: </Text>
                        <Text className="font-medium">
                          {String(verifyResult.data.penumpang.nik)}
                        </Text>
                      </Text>
                      <Text className="text-sm">
                        <Text className="text-muted-foreground">Jenis Kelamin: </Text>
                        <Text className="font-medium">
                          {String(verifyResult.data.penumpang.jenis_kelamin)}
                        </Text>
                      </Text>
                      <Text className="text-sm">
                        <Text className="text-muted-foreground">Telepon: </Text>
                        <Text className="font-medium">
                          {String(verifyResult.data.penumpang.nomor_telepon)}
                        </Text>
                      </Text>
                    </View>
                  </View>

                  {/* Bus & Route Info */}
                  <View className="gap-2 rounded-lg border border-border bg-card p-4">
                    <View className="mb-2 flex-row items-center gap-2">
                      <Icon as={BusIcon} className="size-4 text-primary" />
                      <Text className="font-semibold">Informasi Perjalanan</Text>
                    </View>
                    <View className="gap-1">
                      <Text className="text-sm">
                        <Text className="text-muted-foreground">Bus: </Text>
                        <Text className="font-medium">{String(verifyResult.data.bus.nama)}</Text>
                      </Text>
                      <Text className="text-sm">
                        <Text className="text-muted-foreground">Plat Nomor: </Text>
                        <Text className="font-medium">
                          {String(verifyResult.data.bus.plat_nomor)}
                        </Text>
                      </Text>
                      <Text className="text-sm">
                        <Text className="text-muted-foreground">Rute: </Text>
                        <Text className="font-medium">
                          {String(verifyResult.data.rute.asal)} →{' '}
                          {String(verifyResult.data.rute.tujuan)}
                        </Text>
                      </Text>
                      <Text className="text-sm">
                        <Text className="text-muted-foreground">Kelas: </Text>
                        <Text className="font-medium">{String(verifyResult.data.kelas)}</Text>
                      </Text>
                      <Text className="text-sm">
                        <Text className="text-muted-foreground">Kursi: </Text>
                        <Text className="font-medium">
                          No. {String(verifyResult.data.kursi.nomor)}
                        </Text>
                      </Text>
                      <Text className="text-sm">
                        <Text className="text-muted-foreground">Harga: </Text>
                        <Text className="font-medium">
                          Rp {Number(verifyResult.data.harga).toLocaleString('id-ID')}
                        </Text>
                      </Text>
                    </View>
                  </View>

                  {/* Schedule */}
                  <View className="gap-2 rounded-lg border border-border bg-card p-4">
                    <Text className="mb-2 font-semibold">Jadwal Keberangkatan</Text>
                    <View className="gap-1">
                      <Text className="text-sm">
                        <Text className="text-muted-foreground">Tanggal: </Text>
                        <Text className="font-medium">
                          {new Date(
                            String(verifyResult.data.jadwal.tanggal_berangkat)
                          ).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </Text>
                      </Text>
                      <Text className="text-sm">
                        <Text className="text-muted-foreground">Jam: </Text>
                        <Text className="font-medium">
                          {new Date(
                            String(verifyResult.data.jadwal.jam_berangkat)
                          ).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                      </Text>
                    </View>
                  </View>

                  {/* Payment */}
                  <View className="gap-2 rounded-lg border border-border bg-card p-4">
                    <Text className="mb-2 font-semibold">Informasi Pembayaran</Text>
                    <View className="gap-1">
                      <Text className="text-sm">
                        <Text className="text-muted-foreground">Metode: </Text>
                        <Text className="font-medium capitalize">
                          {String(verifyResult.data.pembayaran.metode)}
                        </Text>
                      </Text>
                      <Text className="text-sm">
                        <Text className="text-muted-foreground">Waktu Bayar: </Text>
                        <Text className="font-medium">
                          {new Date(
                            String(verifyResult.data.pembayaran.waktu_bayar)
                          ).toLocaleString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                      </Text>
                    </View>
                  </View>
                </View>
              </ScrollView>
            )}

            <AlertDialogFooter>
              <AlertDialogAction onPress={handleCloseDialog}>
                <Text>Pindai Tiket Berikutnya</Text>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </View>
    </>
  );
}
