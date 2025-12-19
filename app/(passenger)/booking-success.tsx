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
  CheckCircleIcon,
  TicketIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  BusIcon,
  ArrowRightIcon,
  UserIcon,
  AlertCircleIcon,
  CreditCardIcon,
} from 'lucide-react-native';
import * as React from 'react';
import { View, ScrollView, Linking, Alert, Pressable } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { apiCreatePayment } from '@/lib/api';

interface TicketData {
  id: number;
  kode_tiket: string;
  nama_penumpang: string;
  nik: string;
  email: string;
  nomor_telepon: string;
  jadwal: {
    tanggal_berangkat: string;
    jam_berangkat: string;
  };
  rute: {
    asal: string;
    tujuan: string;
  };
  bus: {
    nama: string;
    plat_nomor: string;
  };
  kelas: string;
  kursi: {
    nomor: string;
    posisi: string;
  };
  harga: number;
  status: string;
  waktu_pesan: string;
  payment_url?: string;
}

export default function BookingSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { ticketData } = params as { ticketData: string };

  const ticket: TicketData = React.useMemo(() => JSON.parse(ticketData), [ticketData]);
  const [isCreatingPayment, setIsCreatingPayment] = React.useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = React.useState(false);

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

  const handleCreatePayment = async (metode: 'xendit' | 'transfer' | 'tunai') => {
    setIsCreatingPayment(true);

    const successUrl = 'tiketbus://payment-callback?status=success';
    const failureUrl = 'tiketbus://payment-callback?status=failed';

    const response = await apiCreatePayment(
      ticket.id,
      metode,
      metode === 'xendit' ? successUrl : undefined,
      metode === 'xendit' ? failureUrl : undefined
    );

    setIsCreatingPayment(false);

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
            metode === 'transfer' || metode === 'tunai'
              ? 'Silakan lakukan pembayaran dan tunggu konfirmasi dari admin.'
              : ''
          }`,
          [
            {
              text: 'OK',
              onPress: () => handleGoToTickets(),
            },
          ]
        );
      }
    } else {
      Alert.alert('Error', response.error || 'Gagal membuat pembayaran');
    }
  };

  const showPaymentMethodDialog = () => {
    setShowPaymentDialog(true);
  };

  const handlePaymentMethodSelect = async (metode: 'xendit' | 'transfer' | 'tunai') => {
    setShowPaymentDialog(false);
    await handleCreatePayment(metode);
  };

  const handleGoToTickets = () => {
    router.replace('/(passenger)/tickets' as any);
  };

  const handleGoHome = () => {
    router.replace('/(passenger)/' as any);
  };

  const isPending = ticket.status === 'dipesan';

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="gap-6 p-6">
        {/* Success Header */}
        <View className="items-center justify-center gap-4 py-6">
          <View className={`rounded-full p-6 ${isPending ? 'bg-amber-500/20' : 'bg-green-500/20'}`}>
            <Icon
              as={isPending ? AlertCircleIcon : CheckCircleIcon}
              className={`size-16 ${isPending ? 'text-amber-500' : 'text-green-500'}`}
            />
          </View>
          <View className="items-center gap-2">
            <Text className="text-2xl font-bold">
              {isPending ? 'Tiket Menunggu Pembayaran' : 'Pemesanan Berhasil!'}
            </Text>
            <Text className="text-center text-muted-foreground">
              {isPending
                ? 'Silakan selesaikan pembayaran untuk konfirmasi tiket Anda'
                : 'Tiket Anda telah berhasil dipesan'}
            </Text>
          </View>
        </View>

        {/* Ticket Code */}
        <View className="items-center gap-3 rounded-xl border border-border bg-card p-6">
          <Icon as={TicketIcon} className="size-12 text-primary" />
          <View className="items-center gap-1">
            <Text className="text-sm text-muted-foreground">Kode Tiket</Text>
            <Text className="text-2xl font-bold tracking-wider">{ticket.kode_tiket}</Text>
          </View>
          <Badge
            variant={
              ticket.status === 'dibayar'
                ? 'default'
                : ticket.status === 'dipesan'
                  ? 'outline'
                  : 'secondary'
            }>
            <Text className="text-xs">
              {ticket.status === 'dipesan'
                ? 'Belum Dibayar'
                : ticket.status === 'dibayar'
                  ? 'Sudah Dibayar'
                  : ticket.status}
            </Text>
          </Badge>
        </View>

        {/* Payment Alert for Pending */}
        {isPending && (
          <View className="gap-3 rounded-xl border border-amber-500 bg-amber-500/10 p-4">
            <View className="flex-row items-center gap-2">
              <Icon as={CreditCardIcon} className="size-5 text-amber-600 dark:text-amber-400" />
              <Text className="flex-1 font-semibold text-amber-900 dark:text-amber-100">
                Selesaikan Pembayaran
              </Text>
            </View>
            <Text className="text-sm text-amber-900/80 dark:text-amber-100/80">
              Tiket Anda telah dibuat dan belum dibayar. Silakan klik tombol "Bayar Sekarang" untuk
              melanjutkan pembayaran.
            </Text>
            <Button
              className="mt-2 w-full bg-amber-600"
              onPress={showPaymentMethodDialog}
              disabled={isCreatingPayment}>
              <Icon as={CreditCardIcon} className="mr-2 size-4 text-white" />
              <Text className="text-white">
                {isCreatingPayment ? 'Memproses...' : 'Bayar Sekarang'}
              </Text>
            </Button>
          </View>
        )}

        {/* Ticket Details */}
        <View className="gap-4">
          {/* Journey Info */}
          <View className="gap-3 rounded-xl border border-border bg-card p-4">
            <View className="mb-2 flex-row items-center gap-2">
              <Icon as={MapPinIcon} className="size-4 text-primary" />
              <Text className="font-semibold">Informasi Perjalanan</Text>
            </View>

            <View className="gap-3">
              <View className="flex-row items-center gap-2">
                <Text className="flex-1 text-muted-foreground">Dari</Text>
                <Text className="flex-1 text-right font-medium">{ticket.rute.asal}</Text>
              </View>
              <View className="flex-row items-center justify-center">
                <Icon as={ArrowRightIcon} className="size-4 text-muted-foreground" />
              </View>
              <View className="flex-row items-center gap-2">
                <Text className="flex-1 text-muted-foreground">Ke</Text>
                <Text className="flex-1 text-right font-medium">{ticket.rute.tujuan}</Text>
              </View>
            </View>
          </View>

          {/* Bus & Schedule */}
          <View className="gap-3 rounded-xl border border-border bg-card p-4">
            <View className="mb-2 flex-row items-center gap-2">
              <Icon as={BusIcon} className="size-4 text-primary" />
              <Text className="font-semibold">Bus & Jadwal</Text>
            </View>

            <View className="gap-2">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-muted-foreground">Bus</Text>
                <Text className="text-sm font-medium">{ticket.bus.nama}</Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-muted-foreground">Nomor Plat</Text>
                <Text className="text-sm font-medium">{ticket.bus.plat_nomor}</Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-muted-foreground">Kelas</Text>
                <Text className="text-sm font-medium">{ticket.kelas}</Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-muted-foreground">Kursi</Text>
                <Text className="text-sm font-medium">
                  {ticket.kursi.nomor} ({ticket.kursi.posisi})
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
                  {ticket.jadwal.jam_berangkat.substring(0, 5)}
                </Text>
              </View>
            </View>
          </View>

          {/* Passenger Info */}
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
                <Text className="text-sm text-muted-foreground">Telepon</Text>
                <Text className="text-sm font-medium">{ticket.nomor_telepon}</Text>
              </View>
            </View>
          </View>

          {/* Payment Info */}
          <View className="gap-3 rounded-xl border border-border bg-card p-4">
            <Text className="mb-2 font-semibold">Informasi Pembayaran</Text>

            <View className="gap-2">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-muted-foreground">Harga Tiket</Text>
                <Text className="text-sm font-medium">
                  Rp {ticket.harga.toLocaleString('id-ID')}
                </Text>
              </View>
              <View className="flex-row items-center justify-between border-t border-border pt-2">
                <Text className="font-semibold">Total Pembayaran</Text>
                <Text className="text-xl font-bold text-primary">
                  Rp {ticket.harga.toLocaleString('id-ID')}
                </Text>
              </View>
            </View>
          </View>

          {/* Booking Time */}
          <View className="rounded-lg bg-muted p-3">
            <Text className="text-center text-xs text-muted-foreground">
              Dipesan pada {formatDateTime(ticket.waktu_pesan)}
            </Text>
          </View>
        </View>

        {/* Important Notes */}
        <View className="gap-3 rounded-xl border border-amber-500/50 bg-amber-500/10 p-4">
          <Text className="font-semibold text-amber-900 dark:text-amber-100">Catatan Penting:</Text>
          <View className="gap-1">
            {isPending && (
              <Text className="text-sm text-amber-900/80 dark:text-amber-100/80">
                • Segera selesaikan pembayaran untuk mengkonfirmasi tiket Anda
              </Text>
            )}
            <Text className="text-sm text-amber-900/80 dark:text-amber-100/80">
              • Harap tiba di terminal 30 menit sebelum keberangkatan
            </Text>
            <Text className="text-sm text-amber-900/80 dark:text-amber-100/80">
              • Bawa KTP Anda untuk verifikasi
            </Text>
            <Text className="text-sm text-amber-900/80 dark:text-amber-100/80">
              • Tunjukkan kode tiket Anda kepada petugas sebelum naik bus
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="gap-2 pb-6">
          {isPending && (
            <Button
              className="w-full bg-amber-600"
              onPress={showPaymentMethodDialog}
              disabled={isCreatingPayment}>
              <Icon as={CreditCardIcon} className="mr-2 size-4 text-white" />
              <Text className="text-white">
                {isCreatingPayment ? 'Memproses...' : 'Bayar Sekarang'}
              </Text>
            </Button>
          )}
          <Button
            className="w-full"
            variant={isPending ? 'outline' : 'default'}
            onPress={handleGoToTickets}>
            <Text>Lihat Tiket Saya</Text>
          </Button>
          <Button variant="outline" onPress={handleGoHome}>
            <Text>Kembali ke Beranda</Text>
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

              {/* Transfer Option */}
              <Pressable
                onPress={() => handlePaymentMethodSelect('transfer')}
                disabled={isCreatingPayment}
                className="flex-row items-center gap-3 rounded-lg border border-border bg-card p-4 active:bg-accent web:hover:bg-accent">
                <View className="rounded-full bg-primary/10 p-3">
                  <Icon as={CreditCardIcon} className="size-5 text-primary" />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold">Transfer Bank</Text>
                  <Text className="text-sm text-muted-foreground">
                    Transfer manual, perlu verifikasi admin
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
                  <Icon as={TicketIcon} className="size-5 text-primary" />
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
      </View>
    </ScrollView>
  );
}
