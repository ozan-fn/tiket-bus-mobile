import { useAuth } from "@/contexts/AuthContext";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function ProfileScreen() {
    const { user, logout } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");

    const handleLogout = async () => {
        Alert.alert("Logout", "Apakah Anda yakin ingin logout?", [
            {
                text: "Batal",
                style: "cancel",
            },
            {
                text: "Logout",
                onPress: async () => {
                    await logout();
                    router.replace("/landing");
                },
                style: "destructive",
            },
        ]);
    };

    const handleSave = () => {
        // TODO: Implement update profile API call
        Alert.alert("Success", "Profile berhasil diupdate");
        setIsEditing(false);
    };

    const handleChangePassword = () => {
        // TODO: Navigate to change password screen
        Alert.alert("Info", "Fitur ganti password akan segera tersedia");
    };

    const handleChangePhoto = () => {
        // TODO: Implement upload photo
        Alert.alert("Info", "Fitur ganti foto akan segera tersedia");
    };

    return (
        <ScrollView className="flex-1 bg-white">
            <StatusBar style="dark" />

            {/* Header */}
            <View className="bg-purple-600 pt-12 pb-8 px-6">
                <Text className="text-white text-2xl font-bold mb-2">Profile</Text>
                <Text className="text-purple-200">Kelola informasi akun Anda</Text>
            </View>

            {/* Profile Photo */}
            <View className="items-center -mt-16 mb-6">
                <View className="bg-white rounded-full p-2 shadow-lg">
                    {user?.photo ? (
                        <Image source={{ uri: user.photo }} className="w-32 h-32 rounded-full" />
                    ) : (
                        <View className="w-32 h-32 rounded-full bg-purple-200 items-center justify-center">
                            <Text className="text-purple-600 text-4xl font-bold">{user?.name?.charAt(0).toUpperCase()}</Text>
                        </View>
                    )}
                </View>
                <TouchableOpacity onPress={handleChangePhoto} className="mt-3 px-4 py-2 bg-purple-100 rounded-full">
                    <Text className="text-purple-600 font-semibold">Ganti Foto</Text>
                </TouchableOpacity>
            </View>

            {/* Profile Information */}
            <View className="px-6">
                {/* Name Field */}
                <View className="mb-4">
                    <Text className="text-gray-600 mb-2 font-semibold">Nama Lengkap</Text>
                    {isEditing ? (
                        <TextInput value={name} onChangeText={setName} className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3" placeholder="Masukkan nama lengkap" />
                    ) : (
                        <View className="bg-gray-50 rounded-lg px-4 py-3">
                            <Text className="text-gray-800">{user?.name}</Text>
                        </View>
                    )}
                </View>

                {/* Email Field */}
                <View className="mb-4">
                    <Text className="text-gray-600 mb-2 font-semibold">Email</Text>
                    {isEditing ? (
                        <TextInput value={email} onChangeText={setEmail} className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3" placeholder="Masukkan email" keyboardType="email-address" autoCapitalize="none" />
                    ) : (
                        <View className="bg-gray-50 rounded-lg px-4 py-3">
                            <Text className="text-gray-800">{user?.email}</Text>
                        </View>
                    )}
                </View>

                {/* Role Field */}
                <View className="mb-6">
                    <Text className="text-gray-600 mb-2 font-semibold">Role</Text>
                    <View className="bg-gray-50 rounded-lg px-4 py-3">
                        <Text className="text-gray-800 capitalize">{user?.role}</Text>
                    </View>
                </View>

                {/* Action Buttons */}
                {isEditing ? (
                    <View className="flex-row gap-3 mb-4">
                        <TouchableOpacity
                            onPress={() => {
                                setName(user?.name || "");
                                setEmail(user?.email || "");
                                setIsEditing(false);
                            }}
                            className="flex-1 bg-gray-200 py-3 rounded-lg"
                        >
                            <Text className="text-gray-700 text-center font-semibold">Batal</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleSave} className="flex-1 bg-purple-600 py-3 rounded-lg">
                            <Text className="text-white text-center font-semibold">Simpan</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity onPress={() => setIsEditing(true)} className="bg-purple-600 py-3 rounded-lg mb-4">
                        <Text className="text-white text-center font-semibold">Edit Profile</Text>
                    </TouchableOpacity>
                )}

                {/* Change Password Button */}
                {!isEditing && (
                    <TouchableOpacity onPress={handleChangePassword} className="bg-white border border-purple-600 py-3 rounded-lg mb-4">
                        <Text className="text-purple-600 text-center font-semibold">Ganti Password</Text>
                    </TouchableOpacity>
                )}

                {/* Logout Button */}
                {!isEditing && (
                    <TouchableOpacity onPress={handleLogout} className="bg-red-500 py-3 rounded-lg mb-8">
                        <Text className="text-white text-center font-semibold">Logout</Text>
                    </TouchableOpacity>
                )}
            </View>
        </ScrollView>
    );
}
