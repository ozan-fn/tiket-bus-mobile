import * as React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { BusIcon, MapPinIcon, CalendarIcon } from 'lucide-react-native';

export function QuickInfo() {
  return (
    <View className="gap-3">
      <Text className="text-lg font-semibold">Mengapa Memilih Kami?</Text>

      <View className="gap-3">
        <View className="flex-row gap-3 rounded-lg border border-border bg-card p-4">
          <View className="h-12 rounded-full bg-primary/10 p-3">
            <Icon as={BusIcon} className="size-6 text-primary" />
          </View>
          <View className="flex-1">
            <Text className="font-semibold">Bus Nyaman</Text>
            <Text className="text-sm text-muted-foreground">
              Bus modern dengan AC dan kursi yang nyaman
            </Text>
          </View>
        </View>

        <View className="flex-row gap-3 rounded-lg border border-border bg-card p-4">
          <View className="rounded-full bg-primary/10 p-3">
            <Icon as={MapPinIcon} className="size-6 text-primary" />
          </View>
          <View className="flex-1">
            <Text className="font-semibold">Rute Beragam</Text>
            <Text className="text-sm text-muted-foreground">
              Jaringan luas meliputi kota-kota besar
            </Text>
          </View>
        </View>

        <View className="flex-row gap-3 rounded-lg border border-border bg-card p-4">
          <View className="h-12 rounded-full bg-primary/10 p-3">
            <Icon as={CalendarIcon} className="size-6 text-primary" />
          </View>
          <View className="flex-1">
            <Text className="font-semibold">Pemesanan Mudah</Text>
            <Text className="text-sm text-muted-foreground">
              Pesan tiket Anda hanya dengan beberapa ketukan
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
