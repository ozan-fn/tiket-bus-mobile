import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  TicketIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  RefreshCwIcon,
  ArrowRightIcon,
  CreditCardIcon,
  AlertCircleIcon,
} from 'lucide-react-native';
import * as React from 'react';
import { View, ScrollView, ActivityIndicator, Linking, Alert, Pressable } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Icon } from '@/components/ui/icon';
import { apiGetMyTickets, apiCreatePayment } from '@/lib/api';
import { useRouter } from 'expo-router';

interface Ticket {
  id: number;
  kode_tiket: string;
  nama_penumpang: string;
  rute: {
    asal: string;
    tujuan: string;
  };
  tanggal_berangkat: string;
  jam_berangkat: string;
  kelas: string;
  kursi: string;
  harga: number;
  status: string;
  waktu_pesan: string;
  payment_url?: string;
}

export default function PassengerTicketsScreen() {
  const { userName } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = React.useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [isCreatingPayment, setIsCreatingPayment] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('dipesan');
  const [showPaymentDialog, setShowPaymentDialog] = React.useState(false);
  const [selectedTicket, setSelectedTicket] = React.useState<Ticket | null>(null);

  React.useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setIsLoading(true);
    setError('');

    const response = await apiGetMyTickets();

    if (response.error) {
      setError(response.error);
      setTickets([]);
    } else if (response.success && response.data) {
      setTickets(response.data);
    } else {
      setTickets([]);
    }

    setIsLoading(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
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

  const handleTicketPress = (ticket: Ticket) => {
    router.push({
      pathname: '/(passenger)/ticket-detail',
      params: { ticketId: ticket.id.toString() },
    } as any);
  };

  const handleCreatePayment = async (ticket: Ticket, metode: 'xendit' | 'transfer' | 'tunai') => {
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
              onPress: () => fetchTickets(),
            },
          ]
        );
      }
    } else {
      Alert.alert('Error', response.error || 'Gagal membuat pembayaran');
    }
  };

  const showPaymentMethodDialog = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowPaymentDialog(true);
  };

  const handlePaymentMethodSelect = async (metode: 'xendit' | 'transfer' | 'tunai') => {
    if (selectedTicket) {
      setShowPaymentDialog(false);
      await handleCreatePayment(selectedTicket, metode);
    }
  };

  // Separate tickets by status
  const pendingTickets = tickets.filter((t) => t.status === 'dipesan');
  const upcomingTickets = tickets.filter((t) => t.status === 'dibayar');
  const pastTickets = tickets.filter((t) => t.status === 'selesai' || t.status === 'batal');

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="gap-6 p-6">
        {/* Loading State */}
        {isLoading && (
          <View className="items-center justify-center py-12">
            <ActivityIndicator size="large" />
            <Text className="mt-4 text-muted-foreground">Memuat tiket Anda...</Text>
          </View>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <View className="items-center justify-center gap-4 rounded-xl border border-border bg-card p-8">
            <Icon as={TicketIcon} className="size-12 text-muted-foreground" />
            <View className="items-center gap-2">
              <Text className="text-center text-lg font-semibold">Kesalahan</Text>
              <Text className="text-center text-sm text-muted-foreground">{error}</Text>
            </View>
            <Button onPress={fetchTickets}>
              <Icon as={RefreshCwIcon} className="mr-2 size-4" />
              <Text>Coba Lagi</Text>
            </Button>
          </View>
        )}

        {/* Empty State */}
        {!isLoading && !error && tickets.length === 0 && (
          <View className="mt-10 items-center justify-center gap-4 rounded-xl border border-border bg-card p-8">
            <View className="rounded-full bg-muted p-4">
              <Icon as={TicketIcon} className="size-12 text-muted-foreground" />
            </View>
            <View className="items-center gap-2">
              <Text className="text-center text-lg font-semibold">Belum Ada Tiket</Text>
              <Text className="text-center text-sm text-muted-foreground">
                Anda belum memesan tiket bus.{'\n'}Mulai cari perjalanan Anda berikutnya!
              </Text>
            </View>
            <Button className="mt-2" onPress={() => router.push('/(passenger)/' as any)}>
              <Text>Cari Bus</Text>
            </Button>
          </View>
        )}

        {/* Tickets List with Tabs */}
        {!isLoading && !error && tickets.length > 0 && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full flex-row">
              <TabsTrigger value="dipesan" className="flex-1">
                <Text>Belum Bayar</Text>
                {pendingTickets.length > 0 && (
                  <Badge variant="outline" className="ml-2">
                    <Text className="text-xs">{pendingTickets.length}</Text>
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="dibayar" className="flex-1">
                <Text>Sudah Bayar</Text>
                {upcomingTickets.length > 0 && (
                  <Badge variant="outline" className="ml-2">
                    <Text className="text-xs">{upcomingTickets.length}</Text>
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="past" className="flex-1">
                <Text>Riwayat</Text>
                {pastTickets.length > 0 && (
                  <Badge variant="outline" className="ml-2">
                    <Text className="text-xs">{pastTickets.length}</Text>
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Pending Payment Tab */}
            <TabsContent value="dipesan" className="gap-3 pt-4">
              {pendingTickets.length === 0 ? (
                <View className="items-center justify-center gap-4 rounded-xl border border-border bg-card p-8">
                  <Icon as={AlertCircleIcon} className="size-12 text-muted-foreground" />
                  <View className="items-center gap-2">
                    <Text className="text-center text-lg font-semibold">
                      Tidak Ada Tiket Belum Dibayar
                    </Text>
                    <Text className="text-center text-sm text-muted-foreground">
                      Semua tiket Anda sudah dibayar
                    </Text>
                  </View>
                </View>
              ) : (
                <>
                  {pendingTickets.map((ticket) => (
                    <View
                      key={ticket.id}
                      className="gap-3 rounded-xl border border-amber-500 bg-amber-500/5 p-4">
                      {/* Header */}
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1 gap-1">
                          <Text className="font-semibold">{ticket.kode_tiket}</Text>
                          <Text className="text-xs text-muted-foreground">
                            Dipesan pada {formatDate(ticket.waktu_pesan)}
                          </Text>
                        </View>
                        <Badge variant={getStatusColor(ticket.status)}>
                          <Text className="text-xs">{getStatusLabel(ticket.status)}</Text>
                        </Badge>
                      </View>

                      {/* Route */}
                      <View className="flex-row items-center gap-2 border-t border-border pt-3">
                        <Icon as={MapPinIcon} className="size-4 text-muted-foreground" />
                        <Text className="flex-1 text-sm">{ticket.rute.asal}</Text>
                        <Icon as={ArrowRightIcon} className="size-4 text-muted-foreground" />
                        <Text className="flex-1 text-right text-sm">{ticket.rute.tujuan}</Text>
                      </View>

                      {/* Schedule */}
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-2">
                          <Icon as={CalendarIcon} className="size-4 text-muted-foreground" />
                          <Text className="text-sm text-muted-foreground">
                            {formatDate(ticket.tanggal_berangkat)}
                          </Text>
                        </View>
                        <View className="flex-row items-center gap-2">
                          <Icon as={ClockIcon} className="size-4 text-muted-foreground" />
                          <Text className="text-sm text-muted-foreground">
                            {ticket.jam_berangkat.substring(0, 5)}
                          </Text>
                        </View>
                      </View>

                      {/* Details */}
                      <View className="flex-row items-center justify-between border-t border-border pt-3">
                        <View className="flex-1">
                          <Text className="text-sm">
                            <Text className="text-muted-foreground">Kelas: </Text>
                            <Text className="font-medium">{ticket.kelas}</Text>
                          </Text>
                          <Text className="text-sm">
                            <Text className="text-muted-foreground">Kursi: </Text>
                            <Text className="font-medium">{ticket.kursi}</Text>
                          </Text>
                        </View>
                        <Text className="text-lg font-bold text-primary">
                          Rp {ticket.harga.toLocaleString('id-ID')}
                        </Text>
                      </View>

                      {/* Payment Warning */}
                      <View className="rounded-lg bg-amber-500/10 p-3">
                        <Text className="text-xs text-amber-900 dark:text-amber-100">
                          Segera selesaikan pembayaran untuk mengkonfirmasi tiket Anda
                        </Text>
                      </View>

                      {/* Action Buttons */}
                      <View className="flex-row gap-2">
                        <Button
                          className="flex-1 bg-amber-600"
                          onPress={() => showPaymentMethodDialog(ticket)}
                          disabled={isCreatingPayment}>
                          <Icon as={CreditCardIcon} className="mr-2 size-4 text-white" />
                          <Text className="text-white">
                            {isCreatingPayment ? 'Memproses...' : 'Bayar'}
                          </Text>
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onPress={() => handleTicketPress(ticket)}>
                          <Text className="text-xs">Detail</Text>
                        </Button>
                      </View>
                    </View>
                  ))}
                </>
              )}
            </TabsContent>

            {/* Upcoming Tickets Tab */}
            <TabsContent value="dibayar" className="gap-3 pt-4">
              {upcomingTickets.length === 0 ? (
                <View className="items-center justify-center gap-4 rounded-xl border border-border bg-card p-8">
                  <Icon as={TicketIcon} className="size-12 text-muted-foreground" />
                  <View className="items-center gap-2">
                    <Text className="text-center text-lg font-semibold">
                      Tidak Ada Tiket Sudah Dibayar
                    </Text>
                    <Text className="text-center text-sm text-muted-foreground">
                      Anda belum memiliki tiket yang sudah dibayar
                    </Text>
                  </View>
                </View>
              ) : (
                <>
                  {upcomingTickets.map((ticket) => (
                    <View
                      key={ticket.id}
                      className="gap-3 rounded-xl border border-border bg-card p-4">
                      {/* Header */}
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1 gap-1">
                          <Text className="font-semibold">{ticket.kode_tiket}</Text>
                          <Text className="text-xs text-muted-foreground">
                            Dipesan pada {formatDate(ticket.waktu_pesan)}
                          </Text>
                        </View>
                        <Badge variant={getStatusColor(ticket.status)}>
                          <Text className="text-xs">{getStatusLabel(ticket.status)}</Text>
                        </Badge>
                      </View>

                      {/* Route */}
                      <View className="flex-row items-center gap-2 border-t border-border pt-3">
                        <Icon as={MapPinIcon} className="size-4 text-muted-foreground" />
                        <Text className="flex-1 text-sm">{ticket.rute.asal}</Text>
                        <Icon as={ArrowRightIcon} className="size-4 text-muted-foreground" />
                        <Text className="flex-1 text-right text-sm">{ticket.rute.tujuan}</Text>
                      </View>

                      {/* Schedule */}
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-2">
                          <Icon as={CalendarIcon} className="size-4 text-muted-foreground" />
                          <Text className="text-sm text-muted-foreground">
                            {formatDate(ticket.tanggal_berangkat)}
                          </Text>
                        </View>
                        <View className="flex-row items-center gap-2">
                          <Icon as={ClockIcon} className="size-4 text-muted-foreground" />
                          <Text className="text-sm text-muted-foreground">
                            {ticket.jam_berangkat.substring(0, 5)}
                          </Text>
                        </View>
                      </View>

                      {/* Details */}
                      <View className="flex-row items-center justify-between border-t border-border pt-3">
                        <View className="flex-1">
                          <Text className="text-sm">
                            <Text className="text-muted-foreground">Kelas: </Text>
                            <Text className="font-medium">{ticket.kelas}</Text>
                          </Text>
                          <Text className="text-sm">
                            <Text className="text-muted-foreground">Kursi: </Text>
                            <Text className="font-medium">{ticket.kursi}</Text>
                          </Text>
                        </View>
                        <Text className="text-lg font-bold text-primary">
                          Rp {ticket.harga.toLocaleString('id-ID')}
                        </Text>
                      </View>

                      {/* View Details Button */}
                      <Button
                        variant="outline"
                        className="mt-2"
                        onPress={() => handleTicketPress(ticket)}>
                        <Text className="text-xs">Lihat Detail</Text>
                      </Button>
                    </View>
                  ))}
                </>
              )}
            </TabsContent>

            {/* Past Tickets Tab */}
            <TabsContent value="past" className="gap-3 pt-4">
              {pastTickets.length === 0 ? (
                <View className="items-center justify-center gap-4 rounded-xl border border-border bg-card p-8">
                  <Icon as={TicketIcon} className="size-12 text-muted-foreground" />
                  <View className="items-center gap-2">
                    <Text className="text-center text-lg font-semibold">Tidak Ada Riwayat</Text>
                    <Text className="text-center text-sm text-muted-foreground">
                      Anda belum memiliki riwayat perjalanan
                    </Text>
                  </View>
                </View>
              ) : (
                <>
                  {pastTickets.map((ticket) => (
                    <View
                      key={ticket.id}
                      className="gap-3 rounded-xl border border-border bg-card p-4 opacity-75">
                      {/* Header */}
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1 gap-1">
                          <Text className="font-semibold">{ticket.kode_tiket}</Text>
                          <Text className="text-xs text-muted-foreground">
                            Dipesan pada {formatDate(ticket.waktu_pesan)}
                          </Text>
                        </View>
                        <Badge variant={getStatusColor(ticket.status)}>
                          <Text className="text-xs">{getStatusLabel(ticket.status)}</Text>
                        </Badge>
                      </View>

                      {/* Route */}
                      <View className="flex-row items-center gap-2 border-t border-border pt-3">
                        <Icon as={MapPinIcon} className="size-4 text-muted-foreground" />
                        <Text className="flex-1 text-sm">{ticket.rute.asal}</Text>
                        <Icon as={ArrowRightIcon} className="size-4 text-muted-foreground" />
                        <Text className="flex-1 text-right text-sm">{ticket.rute.tujuan}</Text>
                      </View>

                      {/* Schedule */}
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-2">
                          <Icon as={CalendarIcon} className="size-4 text-muted-foreground" />
                          <Text className="text-sm text-muted-foreground">
                            {formatDate(ticket.tanggal_berangkat)}
                          </Text>
                        </View>
                        <View className="flex-row items-center gap-2">
                          <Icon as={ClockIcon} className="size-4 text-muted-foreground" />
                          <Text className="text-sm text-muted-foreground">
                            {ticket.jam_berangkat.substring(0, 5)}
                          </Text>
                        </View>
                      </View>

                      {/* Details */}
                      <View className="flex-row items-center justify-between border-t border-border pt-3">
                        <View className="flex-1">
                          <Text className="text-sm">
                            <Text className="text-muted-foreground">Kelas: </Text>
                            <Text className="font-medium">{ticket.kelas}</Text>
                          </Text>
                          <Text className="text-sm">
                            <Text className="text-muted-foreground">Kursi: </Text>
                            <Text className="font-medium">{ticket.kursi}</Text>
                          </Text>
                        </View>
                        <Text className="text-lg font-bold text-muted-foreground">
                          Rp {ticket.harga.toLocaleString('id-ID')}
                        </Text>
                      </View>

                      {/* View Details Button */}
                      <Button
                        variant="outline"
                        className="mt-2"
                        onPress={() => handleTicketPress(ticket)}>
                        <Text className="text-xs">Lihat Detail</Text>
                      </Button>
                    </View>
                  ))}
                </>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Refresh Button */}
        {!isLoading && !error && tickets.length > 0 && (
          <Button variant="outline" onPress={fetchTickets}>
            <Icon as={RefreshCwIcon} className="mr-2 size-4" />
            <Text>Muat Ulang</Text>
          </Button>
        )}

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
