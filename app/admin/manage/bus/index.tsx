import { api } from "@/utils/api";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Bus {
    id: number;
    nama: string;
    plat_nomor: string;
    kapasitas: number;
    status: string;
    keterangan: string | null;
    created_at: string;
    updated_at: string;
    fasilitas: Array<{
        id: number;
        nama: string;
        deskripsi: string | null;
    }>;
    jadwals: Array<{
        id: number;
        tanggal_berangkat: string;
        jam_berangkat: string;
        status: string;
    }>;
}

export default function BusScreen() {
    const [buses, setBuses] = useState<Bus[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchBuses = async (page = 1) => {
        try {
            setLoading(true);
            const response = await api.get(`/api/bus?page=${page}&per_page=10`);
            setBuses(response.data.data || []);
            setTotalPages(response.data.last_page || 1);
            setCurrentPage(page);
        } catch (error: any) {
            if (error.response?.status === 401) {
                Alert.alert("Error", "Akses tidak diizinkan");
            } else {
                Alert.alert("Error", `Gagal memuat bus: ${error.response?.data?.message || error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBuses();
    }, []);

    const handleDelete = async (id: number) => {
        Alert.alert("Hapus Bus", "Apakah Anda yakin ingin menghapus bus ini?", [
            { text: "Batal", style: "cancel" },
            {
                text: "Hapus",
                style: "destructive",
                onPress: async () => {
                    try {
                        await api.delete(`/api/bus/${id}`);
                        Alert.alert("Berhasil", "Bus berhasil dihapus");
                        fetchBuses(currentPage);
                    } catch (error: any) {
                        Alert.alert("Error", "Gagal menghapus bus");
                    }
                },
            },
        ]);
    };

    return (
        <SafeAreaView style={{ flex: 1 }} className="bg-gray-100">
            <View className="bg-orange-600 p-4 flex-row justify-between items-center">
                <TouchableOpacity onPress={() => router.back()}>
                    <Text className="text-white text-lg">← Back</Text>
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold">Bus</Text>
                <TouchableOpacity
                    className="bg-white px-3 py-1 rounded"
                    onPress={() => {
                        router.push("/admin/manage/bus/create" as any);
                    }}
                >
                    <Text className="text-orange-600 font-semibold">+ Tambah</Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-4">
                {loading ? (
                    <View className="flex-1 justify-center items-center py-10">
                        <ActivityIndicator size="large" color="#ea580c" />
                        <Text className="text-gray-600 mt-2">Memuat bus...</Text>
                    </View>
                ) : buses.length === 0 ? (
                    <View className="flex-1 justify-center items-center py-10">
                        <Text className="text-gray-500 text-lg">Tidak ada bus ditemukan</Text>
                        <Text className="text-gray-400 text-sm mt-1">Tambahkan bus pertama Anda</Text>
                    </View>
                ) : (
                    <View className="space-y-3">
                        {buses.map((bus) => (
                            <View key={bus.id} className="bg-white p-4 rounded-lg shadow-sm">
                                <View className="flex-row justify-between items-start">
                                    <View className="flex-1">
                                        <Text className="text-lg font-semibold text-gray-800">{bus.nama}</Text>
                                        <Text className="text-gray-600">{bus.plat_nomor}</Text>
                                        <Text className="text-gray-500 text-sm">
                                            Kapasitas: {bus.kapasitas} | Status: {bus.status}
                                        </Text>
                                        {bus.fasilitas.length > 0 && <Text className="text-gray-500 text-sm">Fasilitas: {bus.fasilitas.map((f) => f.nama).join(", ")}</Text>}
                                        {bus.jadwals.length > 0 && <Text className="text-gray-500 text-sm">Jadwal: {bus.jadwals.length} tersedia</Text>}
                                    </View>
                                    <View className="flex-row space-x-2">
                                        <TouchableOpacity
                                            className="bg-blue-500 px-3 py-1 rounded"
                                            onPress={() => {
                                                router.push(`/admin/manage/bus/${bus.id}/edit` as any);
                                            }}
                                        >
                                            <Text className="text-white text-sm">Ubah</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity className="bg-red-500 px-3 py-1 rounded" onPress={() => handleDelete(bus.id)}>
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
                        <TouchableOpacity className={`px-4 py-2 rounded ${currentPage === 1 ? "bg-gray-300" : "bg-orange-500"}`} disabled={currentPage === 1} onPress={() => fetchBuses(currentPage - 1)}>
                            <Text className={`text-sm ${currentPage === 1 ? "text-gray-500" : "text-white"}`}>Sebelumnya</Text>
                        </TouchableOpacity>

                        <Text className="text-gray-600">
                            Halaman {currentPage} dari {totalPages}
                        </Text>

                        <TouchableOpacity className={`px-4 py-2 rounded ${currentPage === totalPages ? "bg-gray-300" : "bg-orange-500"}`} disabled={currentPage === totalPages} onPress={() => fetchBuses(currentPage + 1)}>
                            <Text className={`text-sm ${currentPage === totalPages ? "text-gray-500" : "text-white"}`}>Selanjutnya</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <StatusBar style="auto" />
            </ScrollView>
        </SafeAreaView>
    );
}
