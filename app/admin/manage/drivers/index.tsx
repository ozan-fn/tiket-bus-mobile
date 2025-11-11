import { api } from "@/utils/api";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Driver {
    id: number;
    user?: { name?: string; email?: string };
    nik?: string;
    nomor_sim?: string;
    alamat?: string;
    telepon?: string;
    tanggal_lahir?: string;
    status?: string;
    created_at?: string;
    updated_at?: string;
    // Alternative flat structure
    name?: string;
    email?: string;
}

export default function DriversScreen() {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchDrivers = async (page = 1) => {
        try {
            setLoading(true);
            const response = await api.get(`/sopir?page=${page}&per_page=10`);
            setDrivers(response.data.data || []);
            setTotalPages(response.data.last_page || 1);
            setCurrentPage(page);
        } catch (error: any) {
            if (error.response?.status === 401) {
                Alert.alert("Error", "Akses tidak diizinkan");
            } else {
                Alert.alert("Error", `Gagal memuat sopir: ${error.response?.data?.message || error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDrivers();
    }, []);

    const handleDelete = async (id: number) => {
        Alert.alert("Hapus Sopir", "Apakah Anda yakin ingin menghapus sopir ini?", [
            { text: "Batal", style: "cancel" },
            {
                text: "Hapus",
                style: "destructive",
                onPress: async () => {
                    try {
                        await api.delete(`/sopir/${id}`);
                        Alert.alert("Berhasil", "Sopir berhasil dihapus");
                        fetchDrivers(currentPage);
                    } catch (error: any) {
                        Alert.alert("Error", "Gagal menghapus sopir");
                    }
                },
            },
        ]);
    };

    return (
        <SafeAreaView style={{ flex: 1 }} className="bg-gray-100">
            <View className="bg-red-600 p-4 flex-row justify-between items-center">
                <TouchableOpacity onPress={() => router.back()}>
                    <Text className="text-white text-lg">← Back</Text>
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold">Sopir</Text>
                <TouchableOpacity
                    className="bg-white px-3 py-1 rounded"
                    onPress={() => {
                        router.push("/admin/manage/drivers/create");
                    }}
                >
                    <Text className="text-red-600 font-semibold">+ Tambah</Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-4">
                {loading ? (
                    <View className="flex-1 justify-center items-center py-10">
                        <ActivityIndicator size="large" color="#dc2626" />
                        <Text className="text-gray-600 mt-2">Memuat sopir...</Text>
                    </View>
                ) : drivers.length === 0 ? (
                    <View className="flex-1 justify-center items-center py-10">
                        <Text className="text-gray-500 text-lg">Tidak ada sopir ditemukan</Text>
                        <Text className="text-gray-400 text-sm mt-1">Tambah sopir pertama Anda</Text>
                    </View>
                ) : (
                    <View className="space-y-3">
                        {drivers.map((driver) => (
                            <View key={driver.id} className="bg-white p-4 rounded-lg shadow-sm">
                                <View className="flex-row justify-between items-start">
                                    <View className="flex-1">
                                        <Text className="text-lg font-semibold text-gray-800">{driver.user?.name || driver.name || "Unknown Driver"}</Text>
                                        <Text className="text-gray-600">{driver.nik || "No NIK"}</Text>
                                        <Text className="text-gray-500 text-sm">SIM: {driver.nomor_sim || "No SIM"}</Text>
                                        <Text className="text-gray-500 text-sm">Status: {driver.status || "Unknown"}</Text>
                                    </View>
                                    <View className="flex-row space-x-2">
                                        <TouchableOpacity
                                            className="bg-blue-500 px-3 py-1 rounded"
                                            onPress={() => {
                                                router.push(`/admin/manage/drivers/${driver.id}/edit` as any);
                                            }}
                                        >
                                            <Text className="text-white text-sm">Edit</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity className="bg-red-500 px-3 py-1 rounded" onPress={() => handleDelete(driver.id)}>
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
                        <TouchableOpacity className={`px-4 py-2 rounded ${currentPage === 1 ? "bg-gray-300" : "bg-red-500"}`} disabled={currentPage === 1} onPress={() => fetchDrivers(currentPage - 1)}>
                            <Text className={`text-sm ${currentPage === 1 ? "text-gray-500" : "text-white"}`}>Sebelumnya</Text>
                        </TouchableOpacity>

                        <Text className="text-gray-600">
                            Halaman {currentPage} dari {totalPages}
                        </Text>

                        <TouchableOpacity className={`px-4 py-2 rounded ${currentPage === totalPages ? "bg-gray-300" : "bg-red-500"}`} disabled={currentPage === totalPages} onPress={() => fetchDrivers(currentPage + 1)}>
                            <Text className={`text-sm ${currentPage === totalPages ? "text-gray-500" : "text-white"}`}>Selanjutnya</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <StatusBar style="auto" />
            </ScrollView>
        </SafeAreaView>
    );
}
