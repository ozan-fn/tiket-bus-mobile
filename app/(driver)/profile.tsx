import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { UserIcon, MailIcon, ShieldIcon, LogOutIcon } from 'lucide-react-native';
import * as React from 'react';
import { View, ScrollView } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Icon } from '@/components/ui/icon';

export default function DriverProfileScreen() {
  const { user, userName, userRole, signOut } = useAuth();

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="gap-6 p-6">
        {/* Profile Card */}
        <View className="gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
          <View className="items-center gap-4">
            <View className="rounded-full bg-primary p-6">
              <Icon as={UserIcon} className="size-12 text-primary-foreground" />
            </View>
            <View className="items-center gap-1">
              <Text className="text-2xl font-bold">{userName || 'Driver'}</Text>
              <Text className="text-sm text-muted-foreground">{user || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* Account Information */}
        <View className="gap-3">
          <Text className="text-lg font-semibold">Account Information</Text>

          <View className="gap-3 rounded-xl border border-border bg-card p-4">
            <View className="flex-row items-center gap-3 border-b border-border pb-3">
              <Icon as={UserIcon} className="size-5 text-muted-foreground" />
              <View className="flex-1">
                <Text className="text-xs text-muted-foreground">Full Name</Text>
                <Text className="font-medium">{userName || 'N/A'}</Text>
              </View>
            </View>

            <View className="flex-row items-center gap-3 border-b border-border pb-3">
              <Icon as={MailIcon} className="size-5 text-muted-foreground" />
              <View className="flex-1">
                <Text className="text-xs text-muted-foreground">Email Address</Text>
                <Text className="font-medium">{user || 'N/A'}</Text>
              </View>
            </View>

            <View className="flex-row items-center gap-3">
              <Icon as={ShieldIcon} className="size-5 text-muted-foreground" />
              <View className="flex-1">
                <Text className="text-xs text-muted-foreground">Role</Text>
                <Text className="font-medium capitalize">{userRole || 'Driver'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View className="gap-3">
          <Text className="text-lg font-semibold">Actions</Text>

          <Button variant="outline" className="h-14 w-full flex-row justify-start gap-3">
            <Icon as={UserIcon} className="size-5" />
            <View className="flex-1 items-start">
              <Text className="font-semibold">Edit Profile</Text>
              <Text className="text-xs text-muted-foreground">Update your information</Text>
            </View>
          </Button>

          <Button
            variant="destructive"
            className="h-14 w-full flex-row justify-start gap-3"
            onPress={() => signOut()}>
            <Icon as={LogOutIcon} className="size-5" />
            <View className="flex-1 items-start">
              <Text className="font-semibold">Logout</Text>
              <Text className="text-xs text-muted-foreground">Sign out from your account</Text>
            </View>
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}
