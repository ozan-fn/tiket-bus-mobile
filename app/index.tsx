import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { View, ActivityIndicator } from 'react-native';

export default function RootIndex() {
  const { user, userRole, isLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading) {
      console.log(userRole);
      if (!user) {
        router.replace('/(auth)/sign-in');
      } else if (userRole === 'driver') {
        router.replace({ pathname: '/(driver)/' } as any);
      } else {
        router.replace({ pathname: '/(passenger)/' } as any);
      }
    }
  }, [user, userRole, isLoading]);

  return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" />
    </View>
  );
}
