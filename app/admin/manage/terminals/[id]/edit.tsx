import { api } from "@/utils/api";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Terminal {
    id: number;
    nama_terminal: string;
    nama_kota: string;
    alamat: string;
    created_at: string;
    updated_at: string;
}

export default function EditTerminalScreen() {
    const { id } = useLocalSearchParams();
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [formData, setFormData] = useState({
        nama_terminal: "",
        nama_kota: "",
        alamat: "",
    });

    const fetchTerminal = async () => {
        try {
            const response = await api.get(`/terminal/${id}`);
            const terminal: Terminal = response.data.data;
            setFormData({
                nama_terminal: terminal.nama_terminal,
                nama_kota: terminal.nama_kota,
                alamat: terminal.alamat,
            });
        } catch (error: any) {
            Alert.alert("Error", "Gagal memuat terminal");
        } finally {
            setFetchLoading(false);
        }
    };

    useEffect(() => {
        fetchTerminal();
    }, [id]);

    const handleSubmit = async () => {
        if (!formData.nama_terminal || !formData.nama_kota || !formData.alamat) {
            Alert.alert("Error", "Semua field harus diisi");
            return;
        }

        setLoading(true);
        try {
            const response = await api.put(`/terminal/${id}`, formData);
            Alert.alert("Berhasil", "Terminal berhasil diperbarui");
            router.back();
        } catch (error: any) {
            Alert.alert("Error", "Gagal memperbarui terminal");
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) {
        return (
            <SafeAreaView style={{ flex: 1 }} className="bg-gray-100">
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#d97706" />
                    <Text className="text-gray-600 mt-2">Memuat data...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1 }} className="bg-gray-100">
            <View className="bg-yellow-600 p-4 flex-row justify-between items-center">
                <TouchableOpacity onPress={() => router.back()}>
                    <Text className="text-white text-lg">← Kembali</Text>
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold">Ubah Terminal</Text>
                <View style={{ width: 50 }} />
            </View>

            <ScrollView className="flex-1 p-4">
                <View className="bg-white p-6 rounded-lg shadow-sm">
                    <Text className="text-lg font-semibold text-gray-800 mb-4">Informasi Terminal</Text>

                    <View className="mb-4">
                        <Text className="text-gray-700 mb-2">Nama Terminal</Text>
                        <TextInput className="border border-gray-300 rounded-lg p-3" placeholder="Masukkan nama terminal" value={formData.nama_terminal} onChangeText={(text) => setFormData({ ...formData, nama_terminal: text })} />
                    </View>

                    <View className="mb-4">
                        <Text className="text-gray-700 mb-2">Nama Kota</Text>
                        <TextInput className="border border-gray-300 rounded-lg p-3" placeholder="Masukkan nama kota" value={formData.nama_kota} onChangeText={(text) => setFormData({ ...formData, nama_kota: text })} />
                    </View>

                    <View className="mb-6">
                        <Text className="text-gray-700 mb-2">Alamat</Text>
                        <TextInput className="border border-gray-300 rounded-lg p-3" placeholder="Masukkan alamat lengkap" multiline numberOfLines={3} value={formData.alamat} onChangeText={(text) => setFormData({ ...formData, alamat: text })} />
                    </View>

                    <TouchableOpacity className="bg-yellow-600 p-4 rounded-lg" onPress={handleSubmit} disabled={loading}>
                        {loading ? <ActivityIndicator color="white" /> : <Text className="text-white text-center font-semibold">Perbarui Terminal</Text>}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <StatusBar style="auto" />
        </SafeAreaView>
    );
}
