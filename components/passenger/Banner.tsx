import * as React from 'react';
import { View, Text, Image, Dimensions } from 'react-native';
import Swiper from 'react-native-swiper';
import { apiGetBanners } from '@/lib/api';

interface BannerData {
  id: number;
  title: string;
  description: string;
  image: string | null;
  owner_id: number;
  order: number;
  created_at: string;
  updated_at: string;
}

const { width } = Dimensions.get('window');

export function Banner() {
  const [banners, setBanners] = React.useState<BannerData[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchBanners = async () => {
      const response = await apiGetBanners();
      if (response && !response.error) {
        setBanners(Array.isArray(response) ? response : response.data || []);
      }
      setLoading(false);
    };
    fetchBanners();
  }, []);

  if (loading) {
    return (
      <View className="h-32 items-center justify-center rounded-lg bg-muted">
        <Text>Loading banners...</Text>
      </View>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <View className="mb-4 h-48">
      <Swiper
        autoplay
        autoplayTimeout={3}
        loop
        showsPagination={false}
        showsButtons={false}
        containerStyle={{ height: 192 }}>
        {banners.map((item) => (
          <View key={item.id}>
            <View className="relative h-full overflow-hidden rounded-lg">
              {item.image ? (
                <Image source={{ uri: item.image }} className="h-full w-full" resizeMode="cover" />
              ) : (
                <View className="h-full w-full items-center justify-center bg-muted">
                  <Text className="text-muted-foreground">No Image</Text>
                </View>
              )}
              <View className="absolute bottom-0 left-0 right-0 bg-black/50 p-4">
                <Text className="text-lg font-semibold text-white">{item.title}</Text>
                <Text className="text-sm text-white/80">{item.description || ''}</Text>
              </View>
            </View>
          </View>
        ))}
      </Swiper>
    </View>
  );
}
