import { SocialConnections } from '@/components/social-connections';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { Pressable, TextInput, View, ActivityIndicator } from 'react-native';
import { apiRegister } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export function SignUpForm() {
  const router = useRouter();
  const { signIn } = useAuth();
  const passwordInputRef = React.useRef<TextInput>(null);

  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  function onEmailSubmitEditing() {
    passwordInputRef.current?.focus();
  }

  async function onSubmit() {
    setMessage(null);

    if (!name.trim() || !email.trim() || !password) {
      setMessage('Mohon lengkapi semua field.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Call backend register
      const registerResponse: any = await apiRegister(email.trim(), password, name.trim());

      if (registerResponse && !registerResponse.error) {
        // After successful register, sign in via AuthContext to set token and user
        const loginResponse: any = await signIn(email.trim(), password);
        if (loginResponse && !loginResponse.error) {
          // Successful login -> navigate to root (index will redirect based on role)
          router.replace('/');
        } else {
          setMessage(loginResponse.error || 'Gagal login setelah registrasi.');
        }
      } else {
        setMessage(registerResponse.error || 'Registrasi gagal.');
      }
    } catch (err: any) {
      setMessage(err?.message || 'Terjadi kesalahan saat registrasi.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View className="gap-6">
      <Card className="border-border/0 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5">
        <CardHeader>
          <CardTitle className="text-center text-xl sm:text-left">Create your account</CardTitle>
          <CardDescription className="text-center sm:text-left">
            Welcome! Please fill in the details to get started.
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-6">
          <View className="gap-6">
            <View className="gap-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                autoCapitalize="words"
                value={name}
                onChangeText={(t) => setName(t)}
                returnKeyType="next"
                onSubmitEditing={() => {
                  // focus email by moving to next (no ref on email input, so focus password)
                  passwordInputRef.current?.focus();
                }}
              />
            </View>

            <View className="gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="m@example.com"
                keyboardType="email-address"
                autoComplete="email"
                autoCapitalize="none"
                value={email}
                onChangeText={(t) => setEmail(t)}
                onSubmitEditing={onEmailSubmitEditing}
                returnKeyType="next"
                submitBehavior="submit"
              />
            </View>

            <View className="gap-1.5">
              <View className="flex-row items-center">
                <Label htmlFor="password">Password</Label>
              </View>
              <Input
                ref={passwordInputRef}
                id="password"
                secureTextEntry
                returnKeyType="send"
                onSubmitEditing={onSubmit}
                value={password}
                onChangeText={(t) => setPassword(t)}
              />
            </View>

            {message ? <Text className="text-sm text-destructive">{message}</Text> : null}

            <Button className="w-full" onPress={onSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <View className="flex-row items-center gap-2">
                  <ActivityIndicator size="small" />
                  <Text>Membuat...</Text>
                </View>
              ) : (
                <Text>Continue</Text>
              )}
            </Button>
          </View>

          <View className="flex flex-row justify-center gap-1">
            <Text className="text-center text-sm">Already have an account? </Text>
            <Pressable
              onPress={() => {
                router.replace('/(auth)/sign-in');
              }}>
              <Text className="text-sm underline underline-offset-4">Sign in</Text>
            </Pressable>
          </View>
          {/*<View className="flex-row items-center">
            <Separator className="flex-1" />
            <Text className="px-4 text-sm text-muted-foreground">or</Text>
            <Separator className="flex-1" />
          </View>*/}
          {/*<SocialConnections />*/}
        </CardContent>
      </Card>
    </View>
  );
}
