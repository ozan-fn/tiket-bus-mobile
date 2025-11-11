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
    const [busSchedules, setBusSchedules] = useState<BusSchedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchBusSchedules = async (page = 1) => {
        try {
            setLoading(true);
            const response = await api.get(`/jadwal-kelas-bus?page=${page}&per_page=10`);
            setBusSchedules(response.data.data || []);
            setTotalPages(response.data.last_page || 1);
            setCurrentPage(page);
        } catch (error: any) {
            if (error.response?.status === 401) {
                Alert.alert("Error", "Akses tidak diizinkan");
            } else {
                Alert.alert("Error", `Gagal memuat jadwal bus: ${error.response?.data?.message || error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBusSchedules();
    }, []);

    const handleDelete = async (id: number) => {
        Alert.alert("Hapus Jadwal Bus", "Apakah Anda yakin ingin menghapus jadwal bus ini?", [
            { text: "Batal", style: "cancel" },
            {
                text: "Hapus",
                style: "destructive",
                onPress: async () => {
                    try {
                        await api.delete(`/jadwal-kelas-bus/${id}`);
                        Alert.alert("Berhasil", "Jadwal bus berhasil dihapus");
                        fetchBusSchedules(currentPage);
                    } catch (error: any) {
                        Alert.alert("Error", "Gagal menghapus jadwal bus");
                    }
                },
            },
        ]);
    };

    return (
        <SafeAreaView style={{ flex: 1 }} className="bg-gray-100">
            <View className="bg-indigo-600 p-4 flex-row justify-between items-center">
                <TouchableOpacity onPress={() => router.back()}>
                    <Text className="text-white text-lg">← Kembali</Text>
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold">Jadwal Bus</Text>
                <TouchableOpacity
                    className="bg-white px-3 py-1 rounded"
                    onPress={() => {
                        router.push("/admin/manage/bus-schedules/create" as any);
                    }}
                >
                    <Text className="text-indigo-600 font-semibold">+ Tambah</Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-4">
                {loading ? (
                    <View className="flex-1 justify-center items-center py-10">
                        <ActivityIndicator size="large" color="#4f46e5" />
                        <Text className="text-gray-600 mt-2">Memuat jadwal bus...</Text>
                    </View>
                ) : busSchedules.length === 0 ? (
                    <View className="flex-1 justify-center items-center py-10">
                        <Text className="text-gray-500 text-lg">Tidak ada jadwal bus ditemukan</Text>
                        <Text className="text-gray-400 text-sm mt-1">Tambahkan jadwal bus pertama Anda</Text>
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
                                        <TouchableOpacity
                                            className="bg-blue-500 px-3 py-1 rounded"
                                            onPress={() => {
                                                router.push(`/admin/manage/bus-schedules/${schedule.id}/edit` as any);
                                            }}
                                        >
                                            <Text className="text-white text-sm">Ubah</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity className="bg-red-500 px-3 py-1 rounded" onPress={() => handleDelete(schedule.id)}>
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
                        <TouchableOpacity className={`px-4 py-2 rounded ${currentPage === 1 ? "bg-gray-300" : "bg-indigo-500"}`} disabled={currentPage === 1} onPress={() => fetchBusSchedules(currentPage - 1)}>
                            <Text className={`text-sm ${currentPage === 1 ? "text-gray-500" : "text-white"}`}>Sebelumnya</Text>
                        </TouchableOpacity>

                        <Text className="text-gray-600">
                            Halaman {currentPage} dari {totalPages}
                        </Text>

                        <TouchableOpacity className={`px-4 py-2 rounded ${currentPage === totalPages ? "bg-gray-300" : "bg-indigo-500"}`} disabled={currentPage === totalPages} onPress={() => fetchBusSchedules(currentPage + 1)}>
                            <Text className={`text-sm ${currentPage === totalPages ? "text-gray-500" : "text-white"}`}>Selanjutnya</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <StatusBar style="auto" />
            </ScrollView>
        </SafeAreaView>
    );
}
