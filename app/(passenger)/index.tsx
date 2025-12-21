import * as React from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { WelcomeSection } from '@/components/passenger/welcome-section';
import { SearchCard } from '@/components/passenger/search-card';
import { QuickInfo } from '@/components/passenger/quick-info';
import { AvailableSchedules } from '@/components/passenger/available-schedules';
import { Banner } from '@/components/passenger/Banner';
import { usePassengerStore } from '@/store/passenger';

export default function PassengerHomeScreen() {
  const { userName } = useAuth();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const insets = useSafeAreaInsets();
  const {
    asal,
    tujuan,
    tanggal,
    asalOptions,
    tujuanOptions,
    isLoadingAsal,
    isLoadingTujuan,
    availableSchedules,
    isLoadingSchedules,
    schedulesError,
    refreshing,
    setAsal,
    setTujuan,
    setTanggal,
    loadInitialTerminals,
    fetchAsalOptions,
    fetchTujuanOptions,
    fetchAvailableSchedules,
    onRefresh,
  } = usePassengerStore();

  React.useEffect(() => {
    const init = async () => {
      await fetchAvailableSchedules();
      await loadInitialTerminals();
    };
    init();
  }, []);

  React.useEffect(() => {
    if (asal.length >= 2) {
      fetchAsalOptions(asal);
    }
  }, [asal]);

  React.useEffect(() => {
    if (tujuan.length >= 2) {
      fetchTujuanOptions(tujuan);
    }
  }, [tujuan]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleSearch = () => {
    // Allow search with at least one parameter
    if (!asal && !tujuan) {
      return;
    }

    router.push({
      pathname: '/(passenger)/search-results',
      params: {
        asal: asal || '',
        tujuan: tujuan || '',
        tanggal: tanggal || '',
      },
    } as any);
  };

  const setToday = () => {
    const today = new Date();
    const formatted = today.toISOString().split('T')[0];
    setTanggal(formatted);
  };

  const setTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formatted = tomorrow.toISOString().split('T')[0];
    setTanggal(formatted);
  };

  const handleSelectJadwal = (jadwal: any) => {
    router.push({
      pathname: '/(passenger)/select-class',
      params: {
        jadwalId: jadwal.id,
        jadwalData: JSON.stringify(jadwal),
      },
    } as any);
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        style={{ marginTop: insets.top }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        nestedScrollEnabled={true}>
        <View className="gap-6 p-6">
          <WelcomeSection userName={userName} />

          <Banner />

          <SearchCard
            asal={asal}
            setAsal={setAsal}
            tujuan={tujuan}
            setTujuan={setTujuan}
            tanggal={tanggal}
            setTanggal={setTanggal}
            asalOptions={asalOptions}
            tujuanOptions={tujuanOptions}
            isLoadingAsal={isLoadingAsal}
            isLoadingTujuan={isLoadingTujuan}
            handleSearch={handleSearch}
            setToday={setToday}
            setTomorrow={setTomorrow}
          />

          <QuickInfo />

          <AvailableSchedules
            availableSchedules={availableSchedules}
            isLoadingSchedules={isLoadingSchedules}
            schedulesError={schedulesError}
            fetchAvailableSchedules={fetchAvailableSchedules}
            formatDate={formatDate}
            handleSelectJadwal={handleSelectJadwal}
          />
        </View>
      </ScrollView>
    </View>
  );
}
