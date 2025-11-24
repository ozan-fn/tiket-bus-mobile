import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/utils/api";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Facility {
    id: number;
    nama: string;
    deskripsi: string;
}

export default function EditFacilityScreen() {
    const { logout } = useAuth();
    const { id } = useLocalSearchParams();
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [formData, setFormData] = useState({
        nama: "",
        deskripsi: "",
    });

    const fetchFacility = async () => {
        try {
            setFetchLoading(true);
            const response = await api.get(`/api/fasilitas/${id}`);
            const facility: Facility = response.data;
            setFormData({
                nama: facility.nama,
                deskripsi: facility.deskripsi,
            });
        } catch (error: any) {
            console.error("Error fetching facility:", error);
            if (error.response?.status === 401) {
                Alert.alert("Error", "Unauthorized access");
                await logout();
                router.replace("/login");
            } else {
                Alert.alert("Error", "Failed to load facility");
                router.back();
            }
        } finally {
            setFetchLoading(false);
        }
    };

    useEffect(() => {
        fetchFacility();
    }, [id]);

    const handleSubmit = async () => {
        if (!formData.nama.trim()) {
            Alert.alert("Error", "Facility name is required");
            return;
        }

        try {
            setLoading(true);
            await api.put(`/api/fasilitas/${id}`, formData);
            Alert.alert("Success", "Facility updated successfully", [{ text: "OK", onPress: () => router.back() }]);
        } catch (error: any) {
            console.error("Error updating facility:", error);
            if (error.response?.status === 422) {
                Alert.alert("Validation Error", "Please check your input data");
            } else if (error.response?.status === 401) {
                Alert.alert("Error", "Unauthorized access");
                await logout();
                router.replace("/login");
            } else {
                Alert.alert("Error", "Failed to update facility");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        router.replace("/login");
    };

    if (fetchLoading) {
        return (
            <SafeAreaView style={{ flex: 1 }} className="justify-center items-center bg-gray-100">
                <ActivityIndicator size="large" color="#2563eb" />
                <Text className="text-gray-600 mt-2">Loading facility...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1 }} className="bg-gray-100">
            <View className="bg-blue-600 p-4 flex-row justify-between items-center">
                <TouchableOpacity onPress={() => router.back()}>
                    <Text className="text-white text-lg">← Back</Text>
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold">Edit Facility</Text>
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
                                <Text className="text-white font-semibold ml-2">Updating...</Text>
                            </View>
                        ) : (
                            <Text className="text-white text-center font-semibold">Update Facility</Text>
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
