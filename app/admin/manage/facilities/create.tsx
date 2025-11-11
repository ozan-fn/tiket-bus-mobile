import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/utils/api";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreateFacilityScreen() {
    const { logout } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nama: "",
        deskripsi: "",
    });

    const handleSubmit = async () => {
        if (!formData.nama.trim()) {
            Alert.alert("Error", "Facility name is required");
            return;
        }

        try {
            setLoading(true);
            await api.post("/fasilitas", formData);
            Alert.alert("Success", "Facility created successfully", [{ text: "OK", onPress: () => router.back() }]);
        } catch (error: any) {
            console.error("Error creating facility:", error);
            if (error.response?.status === 422) {
                Alert.alert("Validation Error", "Please check your input data");
            } else if (error.response?.status === 401) {
                Alert.alert("Error", "Unauthorized access");
                await logout();
                router.replace("/login");
            } else {
                Alert.alert("Error", "Failed to create facility");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        router.replace("/login");
    };

    return (
        <SafeAreaView style={{ flex: 1 }} className="bg-gray-100">
            <View className="bg-blue-600 p-4 flex-row justify-between items-center">
                <TouchableOpacity onPress={() => router.back()}>
                    <Text className="text-white text-lg">← Back</Text>
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold">Add Facility</Text>
                <View className="w-12" />
            </View>

            <ScrollView className="flex-1 p-4">
                <View className="bg-white p-6 rounded-lg shadow-sm">
                    <View className="mb-4">
                        <Text className="text-gray-700 font-semibold mb-2">Facility Name *</Text>
                        <TextInput className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800" placeholder="Enter facility name" value={formData.nama} onChangeText={(text) => setFormData((prev) => ({ ...prev, nama: text }))} />
                    </View>

                    <View className="mb-6">
                        <Text className="text-gray-700 font-semibold mb-2">Description</Text>
                        <TextInput className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800" placeholder="Enter facility description" multiline numberOfLines={3} textAlignVertical="top" value={formData.deskripsi} onChangeText={(text) => setFormData((prev) => ({ ...prev, deskripsi: text }))} />
                    </View>

                    <TouchableOpacity className={`p-4 rounded-lg ${loading ? "bg-gray-400" : "bg-blue-500"}`} onPress={handleSubmit} disabled={loading}>
                        {loading ? (
                            <View className="flex-row justify-center items-center">
                                <ActivityIndicator size="small" color="#ffffff" />
                                <Text className="text-white font-semibold ml-2">Creating...</Text>
                            </View>
                        ) : (
                            <Text className="text-white text-center font-semibold">Create Facility</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View className="mt-6">
                    <TouchableOpacity className="bg-gray-800 p-4 rounded-lg" onPress={handleLogout}>
                        <Text className="text-white text-center font-semibold">Logout</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <StatusBar style="auto" />
        </SafeAreaView>
    );
}
