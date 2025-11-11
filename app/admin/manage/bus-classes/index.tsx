import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/utils/api";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface BusClass {
    id: number;
    bus_id: number;
    nama_kelas: string;
    posisi: string;
    jumlah_kursi: number;
    created_at: string;
    updated_at: string;
    // Optional bus object if API includes it
    bus?: { nama_bus?: string; nomor_polisi?: string };
}

export default function BusClassesScreen() {
    const { logout } = useAuth();
    const [busClasses, setBusClasses] = useState<BusClass[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchBusClasses = async (page = 1) => {
        try {
            setLoading(true);
            console.log("Fetching bus classes from API...");
            const response = await api.get(`/kelas-bus?page=${page}&per_page=10`);
            console.log("Bus classes API response:", response.data);
            setBusClasses(response.data.data || []);
            setTotalPages(response.data.last_page || 1);
            setCurrentPage(page);
        } catch (error: any) {
            console.error("Error fetching bus classes:", error);
            console.error("Error response:", error.response);
            if (error.response?.status === 401) {
                Alert.alert("Error", "Akses tidak diizinkan");
                await logout();
                router.replace("/login");
            } else {
                Alert.alert("Error", `Gagal memuat kelas bus: ${error.response?.data?.message || error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBusClasses();
    }, []);

    const handleDelete = async (id: number) => {
        Alert.alert("Hapus Kelas Bus", "Apakah Anda yakin ingin menghapus kelas bus ini?", [
            { text: "Batal", style: "cancel" },
            {
                text: "Hapus",
                style: "destructive",
                onPress: async () => {
                    try {
                        await api.delete(`/kelas-bus/${id}`);
                        Alert.alert("Berhasil", "Kelas bus berhasil dihapus");
                        fetchBusClasses(currentPage);
                    } catch (error: any) {
                        console.error("Error deleting bus class:", error);
                        Alert.alert("Error", "Gagal menghapus kelas bus");
                    }
                },
            },
        ]);
    };

    const handleLogout = async () => {
        await logout();
        router.replace("/login");
    };

    return (
        <SafeAreaView style={{ flex: 1 }} className="bg-gray-100">
            <View className="bg-purple-600 p-4 flex-row justify-between items-center">
                <TouchableOpacity onPress={() => router.back()}>
                    <Text className="text-white text-lg">← Back</Text>
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold">Kelas Bus</Text>
                <TouchableOpacity
                    className="bg-white px-3 py-1 rounded"
                    onPress={() => {
                        router.push("/admin/manage/bus-classes/create");
                    }}
                >
                    <Text className="text-purple-600 font-semibold">+ Tambah</Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-4">
                {loading ? (
                    <View className="flex-1 justify-center items-center py-10">
                        <ActivityIndicator size="large" color="#9333ea" />
                        <Text className="text-gray-600 mt-2">Memuat kelas bus...</Text>
                    </View>
                ) : busClasses.length === 0 ? (
                    <View className="flex-1 justify-center items-center py-10">
                        <Text className="text-gray-500 text-lg">No bus classes found</Text>
                        <Text className="text-gray-400 text-sm mt-1">Add your first bus class</Text>
                    </View>
                ) : (
                    <View className="space-y-3">
                        {busClasses.map((busClass) => (
                            <View key={busClass.id} className="bg-white p-4 rounded-lg shadow-sm">
                                <View className="flex-row justify-between items-start">
                                    <View className="flex-1">
                                        <Text className="text-lg font-semibold text-gray-800">{busClass.nama_kelas}</Text>
                                        <Text className="text-gray-600">{busClass.bus?.nama_bus || `Bus ${busClass.bus_id}`}</Text>
                                        <Text className="text-gray-500 text-sm">
                                            {busClass.posisi} - {busClass.jumlah_kursi} seats
                                        </Text>
                                    </View>
                                    <View className="flex-row space-x-2">
                                        <TouchableOpacity
                                            className="bg-blue-500 px-3 py-1 rounded"
                                            onPress={() => {
                                                router.push(`/admin/manage/bus-classes/${busClass.id}/edit` as any);
                                            }}
                                        >
                                            <Text className="text-white text-sm">Edit</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            className="bg-red-500 px-3 py-1 rounded"
                                            onPress={() => handleDelete(busClass.id)}
                                        >
                                            <Text className="text-white text-sm">Hapus</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <View className="flex-row justify-center items-center mt-6 space-x-2">
                        <TouchableOpacity
                            className={`px-4 py-2 rounded ${currentPage === 1 ? "bg-gray-300" : "bg-purple-500"}`}
                            disabled={currentPage === 1}
                            onPress={() => fetchBusClasses(currentPage - 1)}
                        >
                            <Text className={`text-sm ${currentPage === 1 ? "text-gray-500" : "text-white"}`}>Sebelumnya</Text>
                        </TouchableOpacity>

                        <Text className="text-gray-600">
                            Halaman {currentPage} dari {totalPages}
                        </Text>

                        <TouchableOpacity
                            className={`px-4 py-2 rounded ${currentPage === totalPages ? "bg-gray-300" : "bg-purple-500"}`}
                            disabled={currentPage === totalPages}
                            onPress={() => fetchBusClasses(currentPage + 1)}
                        >
                            <Text className={`text-sm ${currentPage === totalPages ? "text-gray-500" : "text-white"}`}>Selanjutnya</Text>
                        </TouchableOpacity>
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
