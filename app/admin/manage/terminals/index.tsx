import { api } from "@/utils/api";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Terminal {
    id: number;
    nama_terminal: string;
    nama_kota: string;
    alamat: string;
    created_at: string;
    updated_at: string;
}

export default function TerminalsScreen() {
    const [terminals, setTerminals] = useState<Terminal[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchTerminals = async (page = 1) => {
        try {
            setLoading(true);
            const response = await api.get(`/api/terminal?page=${page}&per_page=10`);
            setTerminals(response.data.data || []);
            setTotalPages(response.data.last_page || 1);
            setCurrentPage(page);
        } catch (error: any) {
            if (error.response?.status === 401) {
                Alert.alert("Error", "Akses tidak diizinkan");
            } else {
                Alert.alert("Error", `Gagal memuat terminal: ${error.response?.data?.message || error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTerminals();
    }, []);

    const handleDelete = async (id: number) => {
        Alert.alert("Hapus Terminal", "Apakah Anda yakin ingin menghapus terminal ini?", [
            { text: "Batal", style: "cancel" },
            {
                text: "Hapus",
                style: "destructive",
                onPress: async () => {
                    try {
                        await api.delete(`/api/terminal/${id}`);
                        Alert.alert("Berhasil", "Terminal berhasil dihapus");
                        fetchTerminals(currentPage);
                    } catch (error: any) {
                        Alert.alert("Error", "Gagal menghapus terminal");
                    }
                },
            },
        ]);
    };

    return (
        <SafeAreaView style={{ flex: 1 }} className="bg-gray-100">
            <View className="bg-yellow-600 p-4 flex-row justify-between items-center">
                <TouchableOpacity onPress={() => router.back()}>
                    <Text className="text-white text-lg">← Kembali</Text>
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold">Terminal</Text>
                <TouchableOpacity
                    className="bg-white px-3 py-1 rounded"
                    onPress={() => {
                        router.push("/admin/manage/terminals/create" as any);
                    }}
                >
                    <Text className="text-yellow-600 font-semibold">+ Tambah</Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-4">
                {loading ? (
                    <View className="flex-1 justify-center items-center py-10">
                        <ActivityIndicator size="large" color="#d97706" />
                        <Text className="text-gray-600 mt-2">Memuat terminal...</Text>
                    </View>
                ) : terminals.length === 0 ? (
                    <View className="flex-1 justify-center items-center py-10">
                        <Text className="text-gray-500 text-lg">Tidak ada terminal ditemukan</Text>
                        <Text className="text-gray-400 text-sm mt-1">Tambahkan terminal pertama Anda</Text>
                    </View>
                ) : (
                    <View className="space-y-3">
                        {terminals.map((terminal) => (
                            <View key={terminal.id} className="bg-white p-4 rounded-lg shadow-sm">
                                <View className="flex-row justify-between items-start">
                                    <View className="flex-1">
                                        <Text className="text-lg font-semibold text-gray-800">{terminal.nama_terminal}</Text>
                                        <Text className="text-gray-600">{terminal.nama_kota}</Text>
                                        <Text className="text-gray-500 text-sm mt-1">{terminal.alamat}</Text>
                                    </View>
                                    <View className="flex-row space-x-2">
                                        <TouchableOpacity
                                            className="bg-blue-500 px-3 py-1 rounded"
                                            onPress={() => {
                                                router.push(`/admin/manage/terminals/${terminal.id}/edit` as any);
                                            }}
                                        >
                                            <Text className="text-white text-sm">Ubah</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity className="bg-red-500 px-3 py-1 rounded" onPress={() => handleDelete(terminal.id)}>
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
                        <TouchableOpacity className={`px-4 py-2 rounded ${currentPage === 1 ? "bg-gray-300" : "bg-yellow-500"}`} disabled={currentPage === 1} onPress={() => fetchTerminals(currentPage - 1)}>
                            <Text className={`text-sm ${currentPage === 1 ? "text-gray-500" : "text-white"}`}>Sebelumnya</Text>
                        </TouchableOpacity>

                        <Text className="text-gray-600">
                            Halaman {currentPage} dari {totalPages}
                        </Text>

                        <TouchableOpacity className={`px-4 py-2 rounded ${currentPage === totalPages ? "bg-gray-300" : "bg-yellow-500"}`} disabled={currentPage === totalPages} onPress={() => fetchTerminals(currentPage + 1)}>
                            <Text className={`text-sm ${currentPage === totalPages ? "text-gray-500" : "text-white"}`}>Selanjutnya</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <StatusBar style="auto" />
            </ScrollView>
        </SafeAreaView>
    );
}
