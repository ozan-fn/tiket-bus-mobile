import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Stack, useRouter } from 'expo-router';
import { UserIcon, CheckCircleIcon, XCircleIcon, CameraIcon } from 'lucide-react-native';
import * as React from 'react';
import {
  View,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert as RNAlert,
  Image,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Icon } from '@/components/ui/icon';
import { apiUpdateProfile, apiGetProfile, apiUploadPhoto, apiUpdatePassword } from '@/lib/api';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

interface EditProfileData {
  name: string;
  email: string;
  photo?: string; // URI of selected photo
}

interface PasswordData {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export default function EditProfileScreen() {
  const { user, userName } = useAuth();
  const router = useRouter();
  const [editData, setEditData] = React.useState<EditProfileData>({
    name: '',
    email: '',
    photo: '',
  });

  const [passwordData, setPasswordData] = React.useState<PasswordData>({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [isUpdatingPassword, setIsUpdatingPassword] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [passwordMessage, setPasswordMessage] = React.useState('');
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [isPasswordSuccess, setIsPasswordSuccess] = React.useState(false);

  React.useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    const response = await apiGetProfile();
    console.log('API Response:', response);
    console.log('jenis_kelamin from API:', response.jenis_kelamin);
    if (response && !response.error) {
      const formattedTanggalLahir = response.tanggal_lahir
        ? new Date(response.tanggal_lahir).toISOString().split('T')[0]
        : '';
      setEditData({
        name: response.name || '',
        email: response.email || '',
        photo: response.photo || '',
      });
    }
    setIsLoading(false);
  };
  const updateEditData = (field: keyof EditProfileData, value: string) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      RNAlert.alert('Permission needed', 'Please grant permission to access photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const croppedImage = await manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 300, height: 300 } }],
        { compress: 0.8, format: SaveFormat.JPEG }
      );
      setEditData((prev) => ({ ...prev, photo: croppedImage.uri }));
    }
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    setMessage('');
    setIsSuccess(false);

    console.log('Sending editData:', editData);

    // Upload photo if selected
    let photoUrl = '';
    if (editData.photo) {
      const uploadResponse = await apiUploadPhoto(editData.photo);
      if (uploadResponse.error) {
        setMessage(uploadResponse.error);
        setIsLoading(false);
        return;
      }
      photoUrl = uploadResponse.url || ''; // Assuming response has url
    }

    // Update profile with photo if uploaded
    const profileData: any = { name: editData.name, email: editData.email };
    if (photoUrl) {
      profileData.photo = photoUrl;
    }

    const response = await apiUpdateProfile(profileData);
    if (response.error) {
      setMessage(response.error);
      setIsSuccess(false);
    } else {
      setMessage('Profile updated successfully!');
      setIsSuccess(true);
      // Update form with latest data from API
      if (response.user) {
        setEditData({
          name: response.user.name || '',
          email: response.user.email || '',
          photo: response.user.photo || '',
        });
      }
    }
    setIsLoading(false);
  };

  const handleUpdatePassword = async () => {
    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      setPasswordMessage('Password baru dan konfirmasi tidak cocok');
      setIsPasswordSuccess(false);
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordMessage('');
    setIsPasswordSuccess(false);

    const response = await apiUpdatePassword(passwordData);
    if (response.error) {
      setPasswordMessage(response.error);
      setIsPasswordSuccess(false);
    } else {
      setPasswordMessage('Password berhasil diupdate!');
      setIsPasswordSuccess(true);
      setPasswordData({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      });
    }
    setIsUpdatingPassword(false);
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
        <Text className="mt-4">Memuat profil...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Edit Profil' }} />
      <ScrollView className="flex-1 bg-background">
        <View className="gap-6 p-6">
          {/* Header */}
          <View className="items-center gap-4">
            <TouchableOpacity onPress={pickImage} className="relative">
              {editData.photo ? (
                <Image source={{ uri: editData.photo }} className="size-24 rounded-full" />
              ) : (
                <View className="rounded-full bg-primary p-6">
                  <Icon as={UserIcon} className="size-12 text-primary-foreground" />
                </View>
              )}
              <View className="absolute bottom-0 right-0 rounded-full bg-secondary p-2">
                <Icon as={CameraIcon} className="size-4 text-secondary-foreground" />
              </View>
            </TouchableOpacity>
            <Text className="text-sm text-muted-foreground">Ketuk avatar untuk mengubah foto</Text>
          </View>

          {/* Form */}
          <View className="gap-4">
            <View className="gap-2">
              <Label>Nama Lengkap</Label>
              <Input
                value={editData.name}
                onChangeText={(value) => updateEditData('name', value)}
                placeholder="Masukkan nama lengkap"
              />
            </View>

            <View className="gap-2">
              <Label>Alamat Email</Label>
              <Input
                value={editData.email}
                onChangeText={(value) => updateEditData('email', value)}
                placeholder="Masukkan alamat email"
                keyboardType="email-address"
              />
            </View>
          </View>

          {/* Password Update Section */}
          <View className="gap-4">
            <Text className="text-lg font-semibold">Ubah Password</Text>

            <View className="gap-2">
              <Label>Password Lama</Label>
              <Input
                value={passwordData.current_password}
                onChangeText={(value) =>
                  setPasswordData((prev) => ({ ...prev, current_password: value }))
                }
                placeholder="Masukkan password lama"
                secureTextEntry
              />
            </View>

            <View className="gap-2">
              <Label>Password Baru</Label>
              <Input
                value={passwordData.new_password}
                onChangeText={(value) =>
                  setPasswordData((prev) => ({ ...prev, new_password: value }))
                }
                placeholder="Masukkan password baru"
                secureTextEntry
              />
            </View>

            <View className="gap-2">
              <Label>Konfirmasi Password Baru</Label>
              <Input
                value={passwordData.new_password_confirmation}
                onChangeText={(value) =>
                  setPasswordData((prev) => ({ ...prev, new_password_confirmation: value }))
                }
                placeholder="Konfirmasi password baru"
                secureTextEntry
              />
            </View>

            {/* Password Message */}
            {passwordMessage && (
              <Alert
                icon={isPasswordSuccess ? CheckCircleIcon : XCircleIcon}
                variant={isPasswordSuccess ? 'default' : 'destructive'}>
                <AlertTitle>{isPasswordSuccess ? 'Berhasil' : 'Kesalahan'}</AlertTitle>
                <AlertDescription>{passwordMessage}</AlertDescription>
              </Alert>
            )}

            <Button className="w-full" onPress={handleUpdatePassword} disabled={isUpdatingPassword}>
              {isUpdatingPassword ? (
                <View className="flex-row items-center gap-2">
                  <ActivityIndicator size="small" color="white" />
                  <Text>Mengupdate...</Text>
                </View>
              ) : (
                <Text>Update Password</Text>
              )}
            </Button>
          </View>

          {/* Message */}
          {message && (
            <Alert
              icon={isSuccess ? CheckCircleIcon : XCircleIcon}
              variant={isSuccess ? 'default' : 'destructive'}>
              <AlertTitle>{isSuccess ? 'Berhasil' : 'Kesalahan'}</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <View className="gap-3">
            <Button className="w-full" onPress={handleSaveProfile} disabled={isLoading}>
              {isLoading ? (
                <View className="flex-row items-center gap-2">
                  <ActivityIndicator size="small" color="white" />
                  <Text>Menyimpan...</Text>
                </View>
              ) : (
                <Text>Simpan Perubahan</Text>
              )}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onPress={() => router.back()}
              disabled={isLoading}>
              <Text>Batal</Text>
            </Button>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
