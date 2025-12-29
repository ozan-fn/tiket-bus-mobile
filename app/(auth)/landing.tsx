import { Stack, useRouter } from 'expo-router';
import * as React from 'react';
import { View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

export default function LandingScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1 items-center justify-center bg-background p-6">
        <View className="mb-8 items-center">
          <Text className="text-3xl font-extrabold">Tiket Bus</Text>
          <Text className="mt-2 text-center text-sm text-muted-foreground">
            Pesan tiket bus dengan mudah dan cepat
          </Text>
        </View>

        <View className="w-full max-w-sm gap-4 space-y-3">
          <Button className="w-full" onPress={() => router.push('/(auth)/sign-in')}>
            <Text>Login</Text>
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onPress={() => router.push('/(auth)/sign-up')}>
            <Text>Register</Text>
          </Button>
        </View>
      </View>
    </>
  );
}
