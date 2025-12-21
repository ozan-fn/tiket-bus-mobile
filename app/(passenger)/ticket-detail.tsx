import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  TicketIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  BusIcon,
  UserIcon,
  ArrowRightIcon,
  PhoneIcon,
  MailIcon,
  CreditCardIcon,
  RefreshCwIcon,
  XCircleIcon,
  AlertCircleIcon,
  TicketIcon as TicketSvg,
} from 'lucide-react-native';
import * as React from 'react';
import {
  View,
  ScrollView,
  ActivityIndicator,
  Linking,
  Alert,
  Pressable,
  Image,
} from 'react-native';
import { Icon } from '@/components/ui/icon';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { apiGetTicketDetail, apiCreatePayment } from '@/lib/api';
import QRCode from 'react-native-qrcode-svg';

interface TicketDetail {
  id: number;
  kode_tiket: string;
  nama_penumpang: string;
  nik: string;
  jenis_kelamin: string;
  tanggal_lahir: string;
  nomor_telepon: string;
  email: string;
  photo: string;
  bus: {
    id: number;
    nama: string;
    plat_nomor: string;
    kapasitas: number;
    photos: string[];
  };
  sopir: {
    id: number;
    nama: string;
  };
  rute: {
    id: number;
    asal: {
      id: number;
      nama: string;
      kota: string;
      alamat: string;
    };
    tujuan: {
      id: number;
      nama: string;
      kota: string;
      alamat: string;
    };
  };
  jadwal: {
    id: number;
    tanggal_berangkat: string;
    jam_berangkat: string;
    status: string;
  };
  kelas: {
    id: number;
    nama: string;
    deskripsi: string;
  };
  kursi: {
    id: number;
    nomor: string;
    posisi: string | null;
  };
  harga: number;
  status: string;
  waktu_pesan: string;
  pembayaran: {
    id: number;
    metode: string;
    status: string;
    total_bayar: number | null;
    waktu_bayar: string;
    bukti_pembayaran: string | null;
  } | null;
}

export default function TicketDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { ticketId } = params as { ticketId: string };

  const [ticket, setTicket] = React.useState<TicketDetail | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [isCreatingPayment, setIsCreatingPayment] = React.useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = React.useState(false);

  // Fetch ticket detail
  const fetchTicketDetail = React.useCallback(async () => {
    if (!ticketId) return;
    setIsLoading(true);
    setError('');

    try {
      const response = await apiGetTicketDetail(parseInt(ticketId));

      if (response.error) {
        setError(response.error);
        setTicket(null);
      } else if (response.success && response.data) {
        setTicket(response.data);
      } else {
        setError('Failed to load ticket detail');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load ticket detail');
      setTicket(null);
    } finally {
      setIsLoading(false);
    }
  }, [ticketId]);

  // Ensure ticket detail refreshes whenever the screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      fetchTicketDetail();
      // no cleanup needed here
    }, [fetchTicketDetail])
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'dibayar':
        return 'default';
      case 'dipesan':
        return 'outline';
      case 'selesai':
        return 'secondary';
      case 'batal':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'berhasil':
        return 'default';
      case 'pending':
        return 'outline';
      case 'gagal':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'dibayar':
        return 'Sudah Dibayar';
      case 'dipesan':
        return 'Belum Dibayar';
      case 'selesai':
        return 'Selesai';
      case 'batal':
        return 'Batal';
      default:
        return status;
    }
  };

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case 'berhasil':
        return 'Berhasil';
      case 'pending':
        return 'Menunggu';
      case 'gagal':
        return 'Gagal';
      default:
        return status;
    }
  };

  const handleCreatePayment = async (metode: 'xendit' | 'tunai') => {
    if (!ticket) return;

    setIsCreatingPayment(true);

    const successUrl = 'tiketbus://payment-callback?status=success';
    const failureUrl = 'tiketbus://payment-callback?status=failed';

    try {
      const response = await apiCreatePayment(
        ticket.id,
        metode,
        metode === 'xendit' ? successUrl : undefined,
        metode === 'xendit' ? failureUrl : undefined
      );

      if (response.success && response.data) {
        if (metode === 'xendit' && response.data.invoice_url) {
          try {
            const supported = await Linking.canOpenURL(response.data.invoice_url);
            if (supported) {
              await Linking.openURL(response.data.invoice_url);
            } else {
              Alert.alert('Error', 'Tidak dapat membuka link pembayaran');
            }
          } catch (error) {
            console.log('Error opening payment URL:', error);
            Alert.alert('Error', 'Gagal membuka halaman pembayaran');
          }
        } else {
          Alert.alert(
            'Pembayaran Dibuat',
            `Pembayaran dengan metode ${metode} berhasil dibuat. ${
              metode === 'tunai'
                ? 'Silakan lakukan pembayaran dan tunggu konfirmasi dari admin.'
                : ''
            }`,
            [
              {
                text: 'OK',
                onPress: () => fetchTicketDetail(),
              },
            ]
          );
        }
      } else {
        Alert.alert('Error', response.error || 'Gagal membuat pembayaran');
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Gagal membuat pembayaran');
    } finally {
      setIsCreatingPayment(false);
    }
  };

  const showPaymentMethodDialog = () => {
    setShowPaymentDialog(true);
  };

  const handlePaymentMethodSelect = async (metode: 'xendit' | 'tunai') => {
    setShowPaymentDialog(false);
    await handleCreatePayment(metode);
  };

  const isPending = ticket?.status === 'dipesan';
  const hasPayment = ticket?.pembayaran !== null;
  const paymentPending = ticket?.pembayaran?.status === 'pending';

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="gap-6 p-6">
        {/* Loading State */}
        {isLoading && (
          <View className="items-center justify-center py-12">
            <ActivityIndicator size="large" />
            <Text className="mt-4 text-muted-foreground">Loading ticket details...</Text>
          </View>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <View className="items-center justify-center gap-4 rounded-xl border border-border bg-card p-8">
            <Icon as={XCircleIcon} className="size-12 text-destructive" />
            <View className="items-center gap-2">
              <Text className="text-center text-lg font-semibold">Error</Text>
              <Text className="text-center text-sm text-muted-foreground">{error}</Text>
            </View>
            <Button onPress={fetchTicketDetail}>
              <Icon as={RefreshCwIcon} className="mr-2 size-4" />
              <Text>Try Again</Text>
            </Button>
          </View>
        )}

        {/* Ticket Detail */}
        {!isLoading && !error && ticket && (
          <>
            {/* Ticket Code Header with QR Code */}
            <View className="items-center gap-3 rounded-xl border border-border bg-card p-6">
              {/* QR Code */}
              <View className="rounded-xl bg-white p-4">
                <QRCode value={ticket.kode_tiket} size={200} />
              </View>

              {/* Ticket Info */}
              <Icon as={TicketIcon} className="size-12 text-primary" />
              <View className="items-center gap-1">
                <Text className="text-sm text-muted-foreground">Kode Tiket</Text>
                <Text className="text-2xl font-bold tracking-wider">{ticket.kode_tiket}</Text>
              </View>
              <Badge variant={getStatusColor(ticket.status)}>
                <Text className="text-xs">{getStatusLabel(ticket.status)}</Text>
              </Badge>
              {isPending && (
                <View className="mt-2 flex-row items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-2">
                  <Icon
                    as={AlertCircleIcon}
                    className="size-4 text-amber-600 dark:text-amber-400"
                  />
                  <Text className="flex-1 text-xs text-amber-900 dark:text-amber-100">
                    Menunggu Pembayaran
                  </Text>
                </View>
              )}

              {/* QR Code Instructions */}
              <View className="mt-2 rounded-lg bg-muted p-3">
                <Text className="text-center text-xs text-muted-foreground">
                  Tunjukkan QR Code ini kepada petugas untuk verifikasi dan check-in
                </Text>
              </View>
            </View>

            {/* Journey Information */}
            <View className="gap-4 rounded-xl border border-border bg-card p-4">
              <View className="mb-2 flex-row items-center gap-2">
                <Icon as={MapPinIcon} className="size-4 text-primary" />
                <Text className="font-semibold">Journey Information</Text>
              </View>

              {/* From */}
              <View className="gap-2 rounded-lg bg-muted p-3">
                <View className="flex-row items-center gap-2">
                  <Icon as={MapPinIcon} className="size-4 text-muted-foreground" />
                  <Text className="text-xs font-semibold text-muted-foreground">FROM</Text>
                </View>
                <Text className="font-semibold">{ticket.rute.asal.nama}</Text>
                <Text className="text-sm text-muted-foreground">{ticket.rute.asal.kota}</Text>
                <Text className="text-xs text-muted-foreground">{ticket.rute.asal.alamat}</Text>
              </View>

              {/* Arrow */}
              <View className="items-center">
                <Icon as={ArrowRightIcon} className="size-6 text-primary" />
              </View>

              {/* To */}
              <View className="gap-2 rounded-lg bg-muted p-3">
                <View className="flex-row items-center gap-2">
                  <Icon as={MapPinIcon} className="size-4 text-muted-foreground" />
                  <Text className="text-xs font-semibold text-muted-foreground">TO</Text>
                </View>
                <Text className="font-semibold">{ticket.rute.tujuan.nama}</Text>
                <Text className="text-sm text-muted-foreground">{ticket.rute.tujuan.kota}</Text>
                <Text className="text-xs text-muted-foreground">{ticket.rute.tujuan.alamat}</Text>
              </View>
            </View>

            {/* Bus & Schedule Information */}
            <View className="gap-3 rounded-xl border border-border bg-card p-4">
              <View className="mb-2 flex-row items-center gap-2">
                <Icon as={BusIcon} className="size-4 text-primary" />
                <Text className="font-semibold">Bus & Jadwal</Text>
              </View>

              {/* Bus Image */}
              {ticket.bus.photos && ticket.bus.photos.length > 0 && (
                <View className="mb-3 items-center">
                  <Image
                    source={{ uri: ticket.bus.photos[0] }}
                    className="h-32 w-full rounded-lg"
                    resizeMode="cover"
                  />
                </View>
              )}

              <View className="gap-2">
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-muted-foreground">Nama Bus</Text>
                  <Text className="text-sm font-medium">{ticket.bus.nama}</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-muted-foreground">Nomor Plat</Text>
                  <Text className="text-sm font-medium">{ticket.bus.plat_nomor}</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-muted-foreground">Sopir</Text>
                  <Text className="text-sm font-medium">{ticket.sopir.nama}</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-muted-foreground">Kelas</Text>
                  <Text className="text-sm font-medium">{ticket.kelas.nama}</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-muted-foreground">Kursi</Text>
                  <Text className="text-sm font-medium">
                    {ticket.kursi.nomor}
                    {ticket.kursi.posisi ? ` (${ticket.kursi.posisi})` : ''}
                  </Text>
                </View>
              </View>

              <View className="gap-2 border-t border-border pt-3">
                <View className="flex-row items-center gap-2">
                  <Icon as={CalendarIcon} className="size-4 text-muted-foreground" />
                  <Text className="text-sm text-muted-foreground">
                    {formatDate(ticket.jadwal.tanggal_berangkat)}
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Icon as={ClockIcon} className="size-4 text-muted-foreground" />
                  <Text className="text-sm text-muted-foreground">
                    {new Date(ticket.jadwal.jam_berangkat).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              </View>
            </View>

            {/* Passenger Information */}
            <View className="gap-3 rounded-xl border border-border bg-card p-4">
              <View className="mb-2 flex-row items-center gap-2">
                <Icon as={UserIcon} className="size-4 text-primary" />
                <Text className="font-semibold">Informasi Penumpang</Text>
              </View>

              <View className="gap-2">
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-muted-foreground">Nama</Text>
                  <Text className="text-sm font-medium">{ticket.nama_penumpang}</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-muted-foreground">NIK</Text>
                  <Text className="text-sm font-medium">{ticket.nik}</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-muted-foreground">Jenis Kelamin</Text>
                  <Text className="text-sm font-medium">
                    {ticket.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-muted-foreground">Tanggal Lahir</Text>
                  <Text className="text-sm font-medium">{formatDate(ticket.tanggal_lahir)}</Text>
                </View>
              </View>

              <View className="gap-2 border-t border-border pt-3">
                <View className="flex-row items-center gap-2">
                  <Icon as={PhoneIcon} className="size-4 text-muted-foreground" />
                  <Text className="text-sm">{ticket.nomor_telepon}</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Icon as={MailIcon} className="size-4 text-muted-foreground" />
                  <Text className="text-sm">{ticket.email}</Text>
                </View>
              </View>
            </View>

            {/* Payment Information */}
            {hasPayment ? (
              <View className="gap-3 rounded-xl border border-border bg-card p-4">
                <View className="mb-2 flex-row items-center gap-2">
                  <Icon as={CreditCardIcon} className="size-4 text-primary" />
                  <Text className="font-semibold">Informasi Pembayaran</Text>
                </View>

                <View className="gap-2">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm text-muted-foreground">Metode Pembayaran</Text>
                    <Text className="text-sm font-medium capitalize">
                      {ticket.pembayaran!.metode}
                    </Text>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm text-muted-foreground">Status Pembayaran</Text>
                    <Badge variant={getPaymentStatusColor(ticket.pembayaran!.status)}>
                      <Text className="text-xs">
                        {getPaymentStatusLabel(ticket.pembayaran!.status)}
                      </Text>
                    </Badge>
                  </View>
                  {ticket.pembayaran!.waktu_bayar && (
                    <View className="flex-row items-center justify-between">
                      <Text className="text-sm text-muted-foreground">Waktu Bayar</Text>
                      <Text className="text-sm font-medium">
                        {formatDateTime(ticket.pembayaran!.waktu_bayar)}
                      </Text>
                    </View>
                  )}
                  <View className="flex-row items-center justify-between border-t border-border pt-2">
                    <Text className="font-semibold">Total Pembayaran</Text>
                    <Text className="text-xl font-bold text-primary">
                      Rp {ticket.harga.toLocaleString('id-ID')}
                    </Text>
                  </View>
                </View>

                {paymentPending && (
                  <View className="rounded-lg bg-amber-500/10 p-3">
                    <Text className="text-xs text-amber-900 dark:text-amber-100">
                      {ticket.pembayaran!.metode === 'xendit'
                        ? 'Pembayaran sedang menunggu konfirmasi dari Xendit'
                        : 'Pembayaran sedang menunggu verifikasi dari admin'}
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <View className="gap-3 rounded-xl border border-amber-500 bg-amber-500/5 p-4">
                <View className="mb-2 flex-row items-center gap-2">
                  <Icon
                    as={AlertCircleIcon}
                    className="size-4 text-amber-600 dark:text-amber-400"
                  />
                  <Text className="font-semibold text-amber-900 dark:text-amber-100">
                    Belum Ada Pembayaran
                  </Text>
                </View>
                <Text className="text-sm text-amber-900/80 dark:text-amber-100/80">
                  Tiket ini belum memiliki pembayaran. Silakan buat pembayaran untuk mengkonfirmasi
                  tiket Anda.
                </Text>
                <View className="flex-row items-center justify-between border-t border-amber-500/30 pt-3">
                  <Text className="font-semibold text-amber-900 dark:text-amber-100">
                    Total Pembayaran
                  </Text>
                  <Text className="text-xl font-bold text-amber-600 dark:text-amber-400">
                    Rp {ticket.harga.toLocaleString('id-ID')}
                  </Text>
                </View>
              </View>
            )}

            {/* Booking Time */}
            <View className="rounded-lg bg-muted p-3">
              <Text className="text-center text-xs text-muted-foreground">
                Dipesan pada {formatDateTime(ticket.waktu_pesan)}
              </Text>
            </View>

            {/* Action Buttons */}
            <View className="gap-2 pb-6">
              {isPending && !hasPayment && (
                <Button
                  className="bg-amber-600"
                  onPress={showPaymentMethodDialog}
                  disabled={isCreatingPayment}>
                  <Icon as={CreditCardIcon} className="mr-2 size-4 text-white" />
                  <Text className="text-white">
                    {isCreatingPayment ? 'Memproses...' : 'Bayar Sekarang'}
                  </Text>
                </Button>
              )}
              <Button variant="outline" onPress={() => router.back()}>
                <Text>Kembali ke Tiket Saya</Text>
              </Button>
            </View>

            {/* Payment Method Dialog */}
            <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Pilih Metode Pembayaran</DialogTitle>
                  <DialogDescription>
                    Pilih metode pembayaran yang ingin Anda gunakan untuk menyelesaikan transaksi
                  </DialogDescription>
                </DialogHeader>

                <View className="gap-3 py-4">
                  {/* Xendit Option */}
                  <Pressable
                    onPress={() => handlePaymentMethodSelect('xendit')}
                    disabled={isCreatingPayment}
                    className="flex-row items-center gap-3 rounded-lg border border-border bg-card p-4 active:bg-accent web:hover:bg-accent">
                    <View className="rounded-full bg-primary/10 p-3">
                      <Icon as={CreditCardIcon} className="size-5 text-primary" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-semibold">Xendit (Online)</Text>
                      <Text className="text-sm text-muted-foreground">
                        Pembayaran otomatis via gateway
                      </Text>
                    </View>
                    <Icon as={ArrowRightIcon} className="size-5 text-muted-foreground" />
                  </Pressable>

                  {/* Tunai Option */}
                  <Pressable
                    onPress={() => handlePaymentMethodSelect('tunai')}
                    disabled={isCreatingPayment}
                    className="flex-row items-center gap-3 rounded-lg border border-border bg-card p-4 active:bg-accent web:hover:bg-accent">
                    <View className="rounded-full bg-primary/10 p-3">
                      <Icon as={TicketSvg} className="size-5 text-primary" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-semibold">Tunai di Loket</Text>
                      <Text className="text-sm text-muted-foreground">
                        Bayar langsung di loket terminal
                      </Text>
                    </View>
                    <Icon as={ArrowRightIcon} className="size-5 text-muted-foreground" />
                  </Pressable>
                </View>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onPress={() => setShowPaymentDialog(false)}
                    disabled={isCreatingPayment}>
                    <Text>Batal</Text>
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </View>
    </ScrollView>
  );
}
