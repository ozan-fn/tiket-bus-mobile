import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/utils/api";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface BusClass {
    id: number;
    bus_id: number;
    nama_kelas: string;
    posisi: string;
    jumlah_kursi: number;
    created_at: string;
    updated_at: string;
}

export default function EditBusClassScreen() {
    const { logout } = useAuth();
    const { id } = useLocalSearchParams();
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [formData, setFormData] = useState({
        bus_id: "",
        nama_kelas: "",
        posisi: "",
        jumlah_kursi: "",
    });

    const fetchBusClass = async () => {
        try {
            setFetchLoading(true);
            console.log("Fetching bus class data...");
            const response = await api.get(`/kelas-bus/${id}`);
            console.log("Bus class data:", response.data);
            const busClass: BusClass = response.data;

            setFormData({
                bus_id: busClass.bus_id.toString(),
                nama_kelas: busClass.nama_kelas,
                posisi: busClass.posisi,
                jumlah_kursi: busClass.jumlah_kursi.toString(),
            });
        } catch (error: any) {
            console.error("Error fetching bus class:", error);
            console.error("Error response:", error.response);
            if (error.response?.status === 401) {
                Alert.alert("Error", "Akses tidak diizinkan");
                await logout();
                router.replace("/login");
            } else {
                Alert.alert("Error", "Gagal memuat data kelas bus");
                router.back();
            }
        } finally {
            setFetchLoading(false);
        }
    };

    useEffect(() => {
        fetchBusClass();
    }, [id]);

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
            await api.put(`/kelas-bus/${id}`, submitData);
            Alert.alert("Berhasil", "Data kelas bus berhasil diperbarui", [{ text: "OK", onPress: () => router.back() }]);
        } catch (error: any) {
            console.error("Error updating bus class:", error);
            if (error.response?.status === 422) {
                Alert.alert("Error Validasi", "Periksa kembali data yang Anda masukkan");
            } else if (error.response?.status === 401) {
                Alert.alert("Error", "Akses tidak diizinkan");
                await logout();
                router.replace("/login");
            } else {
                Alert.alert("Error", `Gagal memperbarui kelas bus: ${error.response?.data?.message || error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        router.replace("/login");
    };

    if (fetchLoading) {
        return (
            <SafeAreaView style={{ flex: 1 }} className="justify-center items-center bg-gray-100">
                <ActivityIndicator size="large" color="#9333ea" />
                <Text className="text-gray-600 mt-2">Memuat data kelas bus...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1 }} className="bg-gray-100">
            <View className="bg-purple-600 p-4 flex-row justify-between items-center">
                <TouchableOpacity onPress={() => router.back()}>
                    <Text className="text-white text-lg">← Kembali</Text>
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold">Edit Kelas Bus</Text>
                <View className="w-12" />
            </View>

            <ScrollView className="flex-1 p-4">
                <View className="bg-white p-6 rounded-lg shadow-sm">
                    <View className="mb-4">
                        <Text className="text-gray-700 font-semibold mb-2">ID Bus *</Text>
                        <TextInput
                            className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
                            placeholder="Masukkan ID bus"
                            keyboardType="numeric"
                            value={formData.bus_id}
                            onChangeText={(text) => setFormData((prev) => ({ ...prev, bus_id: text }))}
                        />
                    </View>

                    <View className="mb-4">
                        <Text className="text-gray-700 font-semibold mb-2">Nama Kelas *</Text>
                        <TextInput
                            className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
                            placeholder="Masukkan nama kelas (contoh: Ekonomi, VIP)"
                            value={formData.nama_kelas}
                            onChangeText={(text) => setFormData((prev) => ({ ...prev, nama_kelas: text }))}
                        />
                    </View>

                    <View className="mb-4">
                        <Text className="text-gray-700 font-semibold mb-2">Posisi *</Text>
                        <TextInput
                            className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
                            placeholder="Masukkan posisi (contoh: depan, belakang)"
                            value={formData.posisi}
                            onChangeText={(text) => setFormData((prev) => ({ ...prev, posisi: text }))}
                        />
                    </View>

                    <View className="mb-6">
                        <Text className="text-gray-700 font-semibold mb-2">Jumlah Kursi *</Text>
                        <TextInput
                            className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
                            placeholder="Masukkan jumlah kursi"
                            keyboardType="numeric"
                            value={formData.jumlah_kursi}
                            onChangeText={(text) => setFormData((prev) => ({ ...prev, jumlah_kursi: text }))}
                        />
                    </View>

                    <TouchableOpacity
                        className={`p-4 rounded-lg ${loading ? "bg-gray-400" : "bg-purple-500"}`}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <View className="flex-row justify-center items-center">
                                <ActivityIndicator size="small" color="#ffffff" />
                                <Text className="text-white font-semibold ml-2">Memperbarui...</Text>
                            </View>
                        ) : (
                            <Text className="text-white text-center font-semibold">Perbarui Kelas Bus</Text>
                        )}
                    </TouchableOpacity>
                </View>

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