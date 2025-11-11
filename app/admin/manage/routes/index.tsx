import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/utils/api";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Route {
    id: number;
    asal_terminal: { nama_terminal: string; nama_kota: string };
    tujuan_terminal: { nama_terminal: string; nama_kota: string };
    created_at: string;
    updated_at: string;
}

export default function RoutesScreen() {
    const { logout } = useAuth();
    const [routes, setRoutes] = useState<Route[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRoutes = async () => {
        try {
            setLoading(true);
            const response = await api.get("/rute?per_page=10");
            setRoutes(response.data.data || []);
        } catch (error: any) {
            console.error("Error fetching routes:", error);
            if (error.response?.status === 401) {
                Alert.alert("Error", "Unauthorized access");
                await logout();
                router.replace("/login");
            } else {
                Alert.alert("Error", "Failed to load routes");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoutes();
    }, []);

    const handleLogout = async () => {
        await logout();
        router.replace("/login");
    };

    return (
        <SafeAreaView style={{ flex: 1 }} className="bg-gray-100">
            <View className="bg-green-600 p-4 flex-row justify-between items-center">
                <TouchableOpacity onPress={() => router.back()}>
                    <Text className="text-white text-lg">← Back</Text>
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold">Routes</Text>
                <TouchableOpacity className="bg-white px-3 py-1 rounded">
                    <Text className="text-green-600 font-semibold">+ Add</Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-4">
                {loading ? (
                    <View className="flex-1 justify-center items-center py-10">
                        <ActivityIndicator size="large" color="#16a34a" />
                        <Text className="text-gray-600 mt-2">Loading routes...</Text>
                    </View>
                ) : routes.length === 0 ? (
                    <View className="flex-1 justify-center items-center py-10">
                        <Text className="text-gray-500 text-lg">No routes found</Text>
                        <Text className="text-gray-400 text-sm mt-1">Add your first route</Text>
                    </View>
                ) : (
                    <View className="space-y-3">
                        {routes.map((route) => (
                            <View key={route.id} className="bg-white p-4 rounded-lg shadow-sm">
                                <View className="flex-row justify-between items-start">
                                    <View className="flex-1">
                                        <Text className="text-lg font-semibold text-gray-800">
                                            {route.asal_terminal.nama_terminal} → {route.tujuan_terminal.nama_terminal}
                                        </Text>
                                        <Text className="text-gray-600">
                                            {route.asal_terminal.nama_kota} to {route.tujuan_terminal.nama_kota}
                                        </Text>
                                    </View>
                                    <View className="flex-row space-x-2">
                                        <TouchableOpacity className="bg-blue-500 px-3 py-1 rounded">
                                            <Text className="text-white text-sm">Edit</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity className="bg-red-500 px-3 py-1 rounded">
                                            <Text className="text-white text-sm">Delete</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

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
