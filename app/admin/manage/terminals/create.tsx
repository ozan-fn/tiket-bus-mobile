import { api } from "@/utils/api";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreateTerminalScreen() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nama_terminal: "",
        nama_kota: "",
        alamat: "",
    });

    const handleSubmit = async () => {
        if (!formData.nama_terminal || !formData.nama_kota || !formData.alamat) {
            Alert.alert("Error", "Semua field harus diisi");
            return;
        }

        setLoading(true);
        try {
            const response = await api.post("/api/terminal", formData);
            Alert.alert("Berhasil", "Terminal berhasil ditambahkan");
            router.back();
        } catch (error: any) {
            Alert.alert("Error", "Gagal menambahkan terminal");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1 }} className="bg-gray-100">
            <View className="bg-yellow-600 p-4 flex-row justify-between items-center">
                <TouchableOpacity onPress={() => router.back()}>
                    <Text className="text-white text-lg">← Kembali</Text>
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold">Tambah Terminal</Text>
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
                        {loading ? <ActivityIndicator color="white" /> : <Text className="text-white text-center font-semibold">Simpan Terminal</Text>}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <StatusBar style="auto" />
        </SafeAreaView>
    );
}
