import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/utils/api";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface BusSchedule {
    id: number;
    jadwal_id: number;
    kelas_bus_id: number;
    harga: number;
    created_at: string;
    updated_at: string;
    jadwal: {
        id: number;
        bus_id: number;
        sopir_id: number;
        rute_id: number;
        tanggal_berangkat: string;
        jam_berangkat: string;
        status: string;
        created_at: string;
        updated_at: string;
    };
    kelas_bus: {
        id: number;
        bus_id: number;
        nama_kelas: string;
        posisi: string;
        jumlah_kursi: number;
        created_at: string;
        updated_at: string;
    };
}

export default function BusSchedulesScreen() {
    const { logout } = useAuth();
    const [busSchedules, setBusSchedules] = useState<BusSchedule[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchBusSchedules = async () => {
        try {
            setLoading(true);
            const response = await api.get("/jadwal-kelas-bus?per_page=10");
            setBusSchedules(response.data.data || []);
        } catch (error: any) {
            console.error("Error fetching bus schedules:", error);
            if (error.response?.status === 401) {
                Alert.alert("Error", "Unauthorized access");
                await logout();
                router.replace("/login");
            } else {
                Alert.alert("Error", "Failed to load bus schedules");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBusSchedules();
    }, []);

    const handleLogout = async () => {
        await logout();
        router.replace("/login");
    };

    return (
        <SafeAreaView style={{ flex: 1 }} className="bg-gray-100">
            <View className="bg-indigo-600 p-4 flex-row justify-between items-center">
                <TouchableOpacity onPress={() => router.back()}>
                    <Text className="text-white text-lg">← Back</Text>
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold">Bus Schedules</Text>
                <TouchableOpacity className="bg-white px-3 py-1 rounded">
                    <Text className="text-indigo-600 font-semibold">+ Add</Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-4">
                {loading ? (
                    <View className="flex-1 justify-center items-center py-10">
                        <ActivityIndicator size="large" color="#4f46e5" />
                        <Text className="text-gray-600 mt-2">Loading bus schedules...</Text>
                    </View>
                ) : busSchedules.length === 0 ? (
                    <View className="flex-1 justify-center items-center py-10">
                        <Text className="text-gray-500 text-lg">No bus schedules found</Text>
                        <Text className="text-gray-400 text-sm mt-1">Add your first bus schedule</Text>
                    </View>
                ) : (
                    <View className="space-y-3">
                        {busSchedules.map((schedule) => (
                            <View key={schedule.id} className="bg-white p-4 rounded-lg shadow-sm">
                                <View className="flex-row justify-between items-start">
                                    <View className="flex-1">
                                        <Text className="text-lg font-semibold text-gray-800">
                                            Bus {schedule.kelas_bus.bus_id} - {schedule.kelas_bus.nama_kelas}
                                        </Text>
                                        <Text className="text-gray-600">
                                            {new Date(schedule.jadwal.tanggal_berangkat).toLocaleDateString()} | {schedule.jadwal.jam_berangkat.substring(11, 16)}
                                        </Text>
                                        <Text className="text-green-600 font-semibold">Rp {schedule.harga.toLocaleString()}</Text>
                                        <Text className="text-sm text-gray-500">Status: {schedule.jadwal.status}</Text>
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
