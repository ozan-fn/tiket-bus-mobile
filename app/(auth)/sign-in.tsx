import { SignInForm } from '@/components/sign-in-form';
import { Stack } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

export default function SignInScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="sm:flex-1 items-center justify-center p-4 py-8 sm:py-4 sm:p-6 mt-safe"
        keyboardDismissMode="interactive">
        <View className="w-full max-w-sm">
          <SignInForm />
        </View>
      </ScrollView>
    </>
  );
}
