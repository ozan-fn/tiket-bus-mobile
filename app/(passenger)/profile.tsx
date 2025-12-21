import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { UserIcon, MailIcon, ShieldIcon, LogOutIcon } from 'lucide-react-native';
import * as React from 'react';
import { View, ScrollView, Image } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Icon } from '@/components/ui/icon';
import { apiGetProfile } from '@/lib/api';
import { useRouter, useFocusEffect } from 'expo-router';

interface EditProfileData {
  nama: string;
  email: string;
  nik: string;
  jenis_kelamin: { value: string; label: string } | null;
  nomor_telepon: string;
}

export default function PassengerProfileScreen() {
  const { user, userName, userRole, signOut } = useAuth();
  const [profilePhoto, setProfilePhoto] = React.useState('');
  const [showLogoutDialog, setShowLogoutDialog] = React.useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchProfile();
    }, [])
  );

  const fetchProfile = async () => {
    const response = await apiGetProfile();
    console.log('Profile response:', response);
    if (response && !response.error) {
      setProfilePhoto(response.photo || '');
      console.log('Profile photo:', response.photo);
    }
  };
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="gap-6 p-6">
        {/* Profile Card */}
        <View className="gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
          <View className="items-center gap-4">
            {profilePhoto ? (
              <Image source={{ uri: profilePhoto }} className="size-24 rounded-full" />
            ) : (
              <View className="rounded-full bg-primary p-6">
                <Icon as={UserIcon} className="size-12 text-primary-foreground" />
              </View>
            )}
            <View className="items-center gap-1">
              <Text className="text-2xl font-bold">{userName || 'Penumpang'}</Text>
              <Text className="text-sm text-muted-foreground">{user || 'Tidak Tersedia'}</Text>
            </View>
          </View>
        </View>

        {/* Account Information */}
        <View className="gap-3">
          <Text className="text-lg font-semibold">Informasi Akun</Text>

          <View className="gap-3 rounded-xl border border-border bg-card p-4">
            <View className="flex-row items-center gap-3 border-b border-border pb-3">
              <Icon as={UserIcon} className="size-5 text-muted-foreground" />
              <View className="flex-1">
                <Text className="text-xs text-muted-foreground">Nama Lengkap</Text>
                <Text className="font-medium">{userName || 'Tidak Tersedia'}</Text>
              </View>
            </View>

            <View className="flex-row items-center gap-3 border-b border-border pb-3">
              <Icon as={MailIcon} className="size-5 text-muted-foreground" />
              <View className="flex-1">
                <Text className="text-xs text-muted-foreground">Alamat Email</Text>
                <Text className="font-medium">{user || 'Tidak Tersedia'}</Text>
              </View>
            </View>

            <View className="flex-row items-center gap-3">
              <Icon as={ShieldIcon} className="size-5 text-muted-foreground" />
              <View className="flex-1">
                <Text className="text-xs text-muted-foreground">Peran</Text>
                <Text className="font-medium capitalize">{userRole || 'Penumpang'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View className="gap-3">
          <Text className="text-lg font-semibold">Aksi</Text>

          <Button
            variant="outline"
            className="h-14 w-full flex-row justify-start gap-3"
            onPress={() => router.push('/(passenger)/edit-profile' as any)}>
            <Icon as={UserIcon} className="size-5" />
            <View className="flex-1 items-start">
              <Text className="font-semibold">Ubah Profil</Text>
              <Text className="text-xs text-muted-foreground">Perbarui informasi Anda</Text>
            </View>
          </Button>

          <Button
            variant="destructive"
            className="h-14 w-full flex-row justify-start gap-3"
            onPress={() => setShowLogoutDialog(true)}>
            <Icon as={LogOutIcon} className="size-5 text-primary-foreground" />
            <View className="flex-1 items-start">
              <Text className="font-semibold">Keluar</Text>
              <Text className="text-xs text-muted-foreground">Keluar dari akun Anda</Text>
            </View>
          </Button>
        </View>

        {/* Logout Confirmation Dialog */}
        <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
          <AlertDialogContent className="w-full max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-center text-2xl">
                Konfirmasi Keluar
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center">
                Apakah Anda yakin ingin keluar dari akun Anda?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                <Text>Batal</Text>
              </AlertDialogCancel>
              <AlertDialogAction onPress={signOut}>
                <Text>Keluar</Text>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </View>
    </ScrollView>
  );
}
