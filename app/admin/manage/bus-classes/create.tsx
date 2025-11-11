import { api } from "@/utils/api";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreateBusClassScreen() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        bus_id: "",
        nama_kelas: "",
        posisi: "",
        jumlah_kursi: "",
    });

    const handleSubmit = async () => {
        if (!formData.bus_id.trim() || !formData.nama_kelas.trim() || !formData.posisi.trim() || !formData.jumlah_kursi.trim()) {
            Alert.alert("Error", "Semua field wajib diisi");
            return;
        }

        try {
            setLoading(true);
            const submitData = {
                ...formData,
                bus_id: parseInt(formData.bus_id),
                jumlah_kursi: parseInt(formData.jumlah_kursi),
            };
            await api.post("/kelas-bus", submitData);
            Alert.alert("Berhasil", "Kelas bus berhasil ditambahkan", [{ text: "OK", onPress: () => router.back() }]);
        } catch (error: any) {
            if (error.response?.status === 422) {
                Alert.alert("Error Validasi", "Periksa kembali data yang Anda masukkan");
            } else if (error.response?.status === 401) {
                Alert.alert("Error", "Akses tidak diizinkan");
            } else {
                Alert.alert("Error", `Gagal menambahkan kelas bus: ${error.response?.data?.message || error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1 }} className="bg-gray-100">
            <View className="bg-purple-600 p-4 flex-row justify-between items-center">
                <TouchableOpacity onPress={() => router.back()}>
                    <Text className="text-white text-lg">← Kembali</Text>
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold">Tambah Kelas Bus</Text>
                <View className="w-12" />
            </View>

            <ScrollView className="flex-1 p-4">
                <View className="bg-white p-6 rounded-lg shadow-sm">
                    <View className="mb-4">
                        <Text className="text-gray-700 font-semibold mb-2">ID Bus *</Text>
                        <TextInput className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800" placeholder="Masukkan ID bus" keyboardType="numeric" value={formData.bus_id} onChangeText={(text) => setFormData((prev) => ({ ...prev, bus_id: text }))} />
                    </View>

                    <View className="mb-4">
                        <Text className="text-gray-700 font-semibold mb-2">Nama Kelas *</Text>
                        <TextInput className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800" placeholder="Masukkan nama kelas (contoh: Ekonomi, VIP)" value={formData.nama_kelas} onChangeText={(text) => setFormData((prev) => ({ ...prev, nama_kelas: text }))} />
                    </View>

                    <View className="mb-4">
                        <Text className="text-gray-700 font-semibold mb-2">Posisi *</Text>
                        <TextInput className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800" placeholder="Masukkan posisi (contoh: depan, belakang)" value={formData.posisi} onChangeText={(text) => setFormData((prev) => ({ ...prev, posisi: text }))} />
                    </View>

                    <View className="mb-6">
                        <Text className="text-gray-700 font-semibold mb-2">Jumlah Kursi *</Text>
                        <TextInput className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800" placeholder="Masukkan jumlah kursi" keyboardType="numeric" value={formData.jumlah_kursi} onChangeText={(text) => setFormData((prev) => ({ ...prev, jumlah_kursi: text }))} />
                    </View>

                    <TouchableOpacity className={`p-4 rounded-lg ${loading ? "bg-gray-400" : "bg-purple-500"}`} onPress={handleSubmit} disabled={loading}>
                        {loading ? (
                            <View className="flex-row justify-center items-center">
                                <ActivityIndicator size="small" color="#ffffff" />
                                <Text className="text-white font-semibold ml-2">Menyimpan...</Text>
                            </View>
                        ) : (
                            <Text className="text-white text-center font-semibold">Tambah Kelas Bus</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <StatusBar style="auto" />
        </SafeAreaView>
    );
}
