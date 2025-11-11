import { api } from "@/utils/api";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Terminal {
    id: number;
    nama_terminal: string;
    nama_kota: string;
    created_at: string;
    updated_at: string;
}

interface Route {
    id: number;
    asal_terminal_id: number;
    tujuan_terminal_id: number;
    asal_terminal: Terminal;
    tujuan_terminal: Terminal;
}

export default function EditRouteScreen() {
    const { id } = useLocalSearchParams();
    const [terminals, setTerminals] = useState<Terminal[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [formData, setFormData] = useState({
        asal_terminal_id: "",
        tujuan_terminal_id: "",
    });

    const fetchRoute = async () => {
        try {
            const response = await api.get(`/rute/${id}`);
            const route: Route = response.data.data;
            setFormData({
                asal_terminal_id: route.asal_terminal_id.toString(),
                tujuan_terminal_id: route.tujuan_terminal_id.toString(),
            });
        } catch (error: any) {
            Alert.alert("Error", "Gagal memuat rute");
        } finally {
            setFetchLoading(false);
        }
    };

    const fetchTerminals = async () => {
        try {
            const response = await api.get("/terminal");
            setTerminals(response.data.data || []);
        } catch (error: any) {
            Alert.alert("Error", "Gagal memuat terminal");
        }
    };

    useEffect(() => {
        fetchRoute();
        fetchTerminals();
    }, [id]);

    const handleSubmit = async () => {
        if (!formData.asal_terminal_id || !formData.tujuan_terminal_id) {
            Alert.alert("Error", "Terminal asal dan tujuan harus dipilih");
            return;
        }

        if (formData.asal_terminal_id === formData.tujuan_terminal_id) {
            Alert.alert("Error", "Terminal asal dan tujuan tidak boleh sama");
            return;
        }

        setLoading(true);
        try {
            const response = await api.put(`/rute/${id}`, {
                asal_terminal_id: parseInt(formData.asal_terminal_id),
                tujuan_terminal_id: parseInt(formData.tujuan_terminal_id),
            });

            Alert.alert("Berhasil", "Rute berhasil diperbarui");
            router.back();
        } catch (error: any) {
            Alert.alert("Error", "Gagal memperbarui rute");
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) {
        return (
            <SafeAreaView style={{ flex: 1 }} className="bg-gray-100">
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#16a34a" />
                    <Text className="text-gray-600 mt-2">Memuat data...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1 }} className="bg-gray-100">
            <View className="bg-green-600 p-4 flex-row justify-between items-center">
                <TouchableOpacity onPress={() => router.back()}>
                    <Text className="text-white text-lg">← Kembali</Text>
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold">Ubah Rute</Text>
                <View style={{ width: 50 }} />
            </View>

            <ScrollView className="flex-1 p-4">
                <View className="bg-white p-6 rounded-lg shadow-sm">
                    <Text className="text-lg font-semibold text-gray-800 mb-4">Informasi Rute</Text>

                    <View className="mb-4">
                        <Text className="text-gray-700 mb-2">Terminal Asal</Text>
                        <View className="border border-gray-300 rounded-lg">
                            {terminals.map((terminal) => (
                                <TouchableOpacity key={terminal.id} className={`p-3 border-b border-gray-200 ${formData.asal_terminal_id === terminal.id.toString() ? "bg-green-50" : ""}`} onPress={() => setFormData({ ...formData, asal_terminal_id: terminal.id.toString() })}>
                                    <Text className="text-gray-800">
                                        {terminal.nama_terminal} - {terminal.nama_kota}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View className="mb-6">
                        <Text className="text-gray-700 mb-2">Terminal Tujuan</Text>
                        <View className="border border-gray-300 rounded-lg">
                            {terminals.map((terminal) => (
                                <TouchableOpacity key={terminal.id} className={`p-3 border-b border-gray-200 ${formData.tujuan_terminal_id === terminal.id.toString() ? "bg-green-50" : ""}`} onPress={() => setFormData({ ...formData, tujuan_terminal_id: terminal.id.toString() })}>
                                    <Text className="text-gray-800">
                                        {terminal.nama_terminal} - {terminal.nama_kota}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <TouchableOpacity className="bg-green-600 p-4 rounded-lg" onPress={handleSubmit} disabled={loading}>
                        {loading ? <ActivityIndicator color="white" /> : <Text className="text-white text-center font-semibold">Perbarui Rute</Text>}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <StatusBar style="auto" />
        </SafeAreaView>
    );
}
