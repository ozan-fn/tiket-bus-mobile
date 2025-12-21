import * as React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';

interface WelcomeSectionProps {
  userName?: string | null;
}

export function WelcomeSection({ userName }: WelcomeSectionProps) {
  return (
    <View className="gap-2">
      <Text className="text-2xl font-bold">Selamat Datang Kembali, {userName || 'Penumpang'}!</Text>
      <Text className="text-muted-foreground">Pesan tiket bus Anda dengan mudah</Text>
    </View>
  );
}
