import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { CheckCircleIcon, XCircleIcon, ClockIcon, LoaderIcon } from 'lucide-react-native';
import * as React from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { apiGetMyTickets } from '@/lib/api';

export default function PaymentCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [status, setStatus] = React.useState<'loading' | 'success' | 'failed' | 'pending'>(
    'loading'
  );
  const [message, setMessage] = React.useState('Memverifikasi pembayaran...');
  const [ticketCode, setTicketCode] = React.useState<string>('');

  React.useEffect(() => {
    handlePaymentCallback();
  }, [params]);

  const handlePaymentCallback = async () => {
    try {
      const { status: paymentStatus, invoice_id, external_id } = params;

      console.log('Payment callback params:', { paymentStatus, invoice_id, external_id });

      if (paymentStatus === 'success' || paymentStatus === 'PAID') {
        setStatus('success');
        setMessage('Pembayaran berhasil! Tiket Anda telah dikonfirmasi.');
        if (external_id) {
          setTicketCode(external_id as string);
        }
      } else if (paymentStatus === 'failed' || paymentStatus === 'EXPIRED') {
        setStatus('failed');
        setMessage('Pembayaran gagal atau dibatalkan. Silakan coba lagi.');
      } else if (paymentStatus === 'pending' || paymentStatus === 'PENDING') {
        setStatus('pending');
        setMessage('Pembayaran sedang diproses. Silakan tunggu konfirmasi.');
      } else {
        setStatus('pending');
        setMessage('Status pembayaran sedang diverifikasi...');
      }

      setTimeout(async () => {
        await refreshTickets();
      }, 2000);
    } catch (error) {
      console.log('Payment callback error:', error);
      setStatus('failed');
      setMessage('Terjadi kesalahan saat memverifikasi pembayaran.');
    }
  };

  const refreshTickets = async () => {
    try {
      await apiGetMyTickets();
    } catch (error) {
      console.log('Error refreshing tickets:', error);
    }
  };

  const handleGoToTickets = () => {
    router.replace('/(passenger)/tickets' as any);
  };

  const handleGoHome = () => {
    router.replace('/(passenger)/' as any);
  };

  const getIconComponent = () => {
    switch (status) {
      case 'loading':
        return LoaderIcon;
      case 'success':
        return CheckCircleIcon;
      case 'failed':
        return XCircleIcon;
      case 'pending':
        return ClockIcon;
      default:
        return LoaderIcon;
    }
  };

  const getIconClassName = () => {
    switch (status) {
      case 'loading':
        return 'size-16 animate-spin text-primary';
      case 'success':
        return 'size-16 text-green-500';
      case 'failed':
        return 'size-16 text-red-500';
      case 'pending':
        return 'size-16 text-amber-500';
      default:
        return 'size-16 animate-spin text-primary';
    }
  };

  const renderTitle = () => {
    switch (status) {
      case 'loading':
        return 'Memverifikasi Pembayaran...';
      case 'success':
        return 'Pembayaran Berhasil!';
      case 'failed':
        return 'Pembayaran Gagal';
      case 'pending':
        return 'Pembayaran Pending';
      default:
        return 'Memproses...';
    }
  };

  const renderBackgroundColor = () => {
    switch (status) {
      case 'loading':
        return 'bg-primary/20';
      case 'success':
        return 'bg-green-500/20';
      case 'failed':
        return 'bg-red-500/20';
      case 'pending':
        return 'bg-amber-500/20';
      default:
        return 'bg-primary/20';
    }
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="min-h-screen items-center justify-center gap-6 p-6">
        {/* Status Icon */}
        <View className={`rounded-full p-6 ${renderBackgroundColor()}`}>
          <Icon as={getIconComponent()} className={getIconClassName()} />
        </View>

        {/* Title & Message */}
        <View className="items-center gap-3">
          <Text className="text-center text-2xl font-bold">{renderTitle()}</Text>
          <Text className="text-center text-muted-foreground">{message}</Text>
        </View>

        {/* Ticket Code (if available) */}
        {ticketCode && status === 'success' && (
          <View className="w-full rounded-xl border border-border bg-card p-4">
            <Text className="text-center text-sm text-muted-foreground">Kode Tiket</Text>
            <Text className="text-center text-xl font-bold tracking-wider">{ticketCode}</Text>
          </View>
        )}

        {/* Loading Indicator */}
        {status === 'loading' && <ActivityIndicator size="large" className="text-primary" />}

        {/* Additional Info */}
        {status === 'success' && (
          <View className="gap-3 rounded-xl border border-green-500/50 bg-green-500/10 p-4">
            <Text className="font-semibold text-green-900 dark:text-green-100">
              Pembayaran Dikonfirmasi
            </Text>
            <Text className="text-sm text-green-900/80 dark:text-green-100/80">
              Tiket Anda telah dikonfirmasi dan siap digunakan. Anda dapat melihat detail tiket di
              halaman "Tiket Saya".
            </Text>
          </View>
        )}

        {status === 'failed' && (
          <View className="gap-3 rounded-xl border border-red-500/50 bg-red-500/10 p-4">
            <Text className="font-semibold text-red-900 dark:text-red-100">
              Pembayaran Tidak Berhasil
            </Text>
            <Text className="text-sm text-red-900/80 dark:text-red-100/80">
              Pembayaran Anda gagal atau dibatalkan. Silakan coba lagi atau hubungi customer service
              jika masalah berlanjut.
            </Text>
          </View>
        )}

        {status === 'pending' && (
          <View className="gap-3 rounded-xl border border-amber-500/50 bg-amber-500/10 p-4">
            <Text className="font-semibold text-amber-900 dark:text-amber-100">
              Menunggu Konfirmasi
            </Text>
            <Text className="text-sm text-amber-900/80 dark:text-amber-100/80">
              Pembayaran Anda sedang diproses. Status akan diperbarui setelah pembayaran
              dikonfirmasi oleh sistem.
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        {status !== 'loading' && (
          <View className="w-full gap-2 pt-4">
            <Button className="w-full" onPress={handleGoToTickets}>
              <Text>Lihat Tiket Saya</Text>
            </Button>
            <Button variant="outline" onPress={handleGoHome}>
              <Text>Kembali ke Beranda</Text>
            </Button>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
