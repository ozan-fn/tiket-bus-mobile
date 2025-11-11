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
    created_at: string;
    updated_at: string;
}

export default function CreateRouteScreen() {
    const [terminals, setTerminals] = useState<Terminal[]>([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        asal_terminal_id: "",
        tujuan_terminal_id: "",
    });

    const fetchTerminals = async () => {
        try {
            const response = await api.get("/terminal");
            setTerminals(response.data.data || []);
        } catch (error: any) {
            Alert.alert("Error", "Gagal memuat terminal");
        }
    };

    useEffect(() => {
        fetchTerminals();
    }, []);

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
            const response = await api.post("/rute", {
                asal_terminal_id: parseInt(formData.asal_terminal_id),
                tujuan_terminal_id: parseInt(formData.tujuan_terminal_id),
            });

            Alert.alert("Berhasil", "Rute berhasil ditambahkan");
            router.back();
        } catch (error: any) {
            Alert.alert("Error", "Gagal menambahkan rute");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1 }} className="bg-gray-100">
            <View className="bg-green-600 p-4 flex-row justify-between items-center">
                <TouchableOpacity onPress={() => router.back()}>
                    <Text className="text-white text-lg">← Kembali</Text>
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold">Tambah Rute</Text>
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
                        {loading ? <ActivityIndicator color="white" /> : <Text className="text-white text-center font-semibold">Simpan Rute</Text>}
                    </TouchableOpacity>
                </View>

                <StatusBar style="auto" />
            </ScrollView>
        </SafeAreaView>
    );
}
