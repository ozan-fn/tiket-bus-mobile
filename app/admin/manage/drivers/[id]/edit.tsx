import { api } from "@/utils/api";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
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

export default function EditDriverScreen() {
    const { id } = useLocalSearchParams();
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        nik: "",
        nomor_sim: "",
        alamat: "",
        telepon: "",
        tanggal_lahir: "",
        status: "aktif",
    });

    const fetchDriver = async () => {
        try {
            setFetchLoading(true);
            const response = await api.get(`/api/sopir/${id}`);
            const driver: Driver = response.data;

            setFormData({
                name: driver.user?.name || driver.name || "",
                email: driver.user?.email || driver.email || "",
                nik: driver.nik || "",
                nomor_sim: driver.nomor_sim || "",
                alamat: driver.alamat || "",
                telepon: driver.telepon || "",
                tanggal_lahir: driver.tanggal_lahir || "",
                status: driver.status || "aktif",
            });
        } catch (error: any) {
            if (error.response?.status === 401) {
                Alert.alert("Error", "Akses tidak diizinkan");
            } else {
                Alert.alert("Error", "Gagal memuat data sopir");
                router.back();
            }
        } finally {
            setFetchLoading(false);
        }
    };

    useEffect(() => {
        fetchDriver();
    }, [id]);

    const handleSubmit = async () => {
        if (!formData.name.trim() || !formData.nik.trim() || !formData.nomor_sim.trim()) {
            Alert.alert("Error", "Nama, NIK, dan Nomor SIM wajib diisi");
            return;
        }

        try {
            setLoading(true);
            await api.put(`/api/sopir/${id}`, formData);
            Alert.alert("Berhasil", "Data sopir berhasil diperbarui", [{ text: "OK", onPress: () => router.back() }]);
        } catch (error: any) {
            if (error.response?.status === 422) {
                Alert.alert("Error Validasi", "Periksa kembali data yang Anda masukkan");
            } else if (error.response?.status === 401) {
                Alert.alert("Error", "Akses tidak diizinkan");
            } else {
                Alert.alert("Error", `Gagal memperbarui sopir: ${error.response?.data?.message || error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) {
        return (
            <SafeAreaView style={{ flex: 1 }} className="justify-center items-center bg-gray-100">
                <ActivityIndicator size="large" color="#dc2626" />
                <Text className="text-gray-600 mt-2">Memuat data sopir...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1 }} className="bg-gray-100">
            <View className="bg-red-600 p-4 flex-row justify-between items-center">
                <TouchableOpacity onPress={() => router.back()}>
                    <Text className="text-white text-lg">← Kembali</Text>
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold">Edit Sopir</Text>
                <View className="w-12" />
            </View>

            <ScrollView className="flex-1 p-4">
                <View className="bg-white p-6 rounded-lg shadow-sm">
                    <View className="mb-4">
                        <Text className="text-gray-700 font-semibold mb-2">Nama Lengkap *</Text>
                        <TextInput className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800" placeholder="Masukkan nama lengkap" value={formData.name} onChangeText={(text) => setFormData((prev) => ({ ...prev, name: text }))} />
                    </View>

                    <View className="mb-4">
                        <Text className="text-gray-700 font-semibold mb-2">Email</Text>
                        <TextInput className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800" placeholder="Masukkan email" keyboardType="email-address" autoCapitalize="none" value={formData.email} onChangeText={(text) => setFormData((prev) => ({ ...prev, email: text }))} />
                    </View>

                    <View className="mb-4">
                        <Text className="text-gray-700 font-semibold mb-2">NIK *</Text>
                        <TextInput className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800" placeholder="Masukkan NIK" keyboardType="numeric" value={formData.nik} onChangeText={(text) => setFormData((prev) => ({ ...prev, nik: text }))} />
                    </View>

                    <View className="mb-4">
                        <Text className="text-gray-700 font-semibold mb-2">Nomor SIM *</Text>
                        <TextInput className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800" placeholder="Masukkan nomor SIM" value={formData.nomor_sim} onChangeText={(text) => setFormData((prev) => ({ ...prev, nomor_sim: text }))} />
                    </View>

                    <View className="mb-4">
                        <Text className="text-gray-700 font-semibold mb-2">Alamat</Text>
                        <TextInput className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800" placeholder="Masukkan alamat lengkap" multiline numberOfLines={2} textAlignVertical="top" value={formData.alamat} onChangeText={(text) => setFormData((prev) => ({ ...prev, alamat: text }))} />
                    </View>

                    <View className="mb-4">
                        <Text className="text-gray-700 font-semibold mb-2">Nomor Telepon</Text>
                        <TextInput className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800" placeholder="Masukkan nomor telepon" keyboardType="phone-pad" value={formData.telepon} onChangeText={(text) => setFormData((prev) => ({ ...prev, telepon: text }))} />
                    </View>

                    <View className="mb-4">
                        <Text className="text-gray-700 font-semibold mb-2">Tanggal Lahir</Text>
                        <TextInput className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800" placeholder="YYYY-MM-DD" value={formData.tanggal_lahir} onChangeText={(text) => setFormData((prev) => ({ ...prev, tanggal_lahir: text }))} />
                    </View>

                    <View className="mb-6">
                        <Text className="text-gray-700 font-semibold mb-2">Status</Text>
                        <View className="flex-row space-x-4">
                            <TouchableOpacity className={`px-4 py-2 rounded-lg ${formData.status === "aktif" ? "bg-green-500" : "bg-gray-200"}`} onPress={() => setFormData((prev) => ({ ...prev, status: "aktif" }))}>
                                <Text className={formData.status === "aktif" ? "text-white" : "text-gray-700"}>Aktif</Text>
                            </TouchableOpacity>
                            <TouchableOpacity className={`px-4 py-2 rounded-lg ${formData.status === "nonaktif" ? "bg-red-500" : "bg-gray-200"}`} onPress={() => setFormData((prev) => ({ ...prev, status: "nonaktif" }))}>
                                <Text className={formData.status === "nonaktif" ? "text-white" : "text-gray-700"}>Nonaktif</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity className={`p-4 rounded-lg ${loading ? "bg-gray-400" : "bg-red-500"}`} onPress={handleSubmit} disabled={loading}>
                        {loading ? (
                            <View className="flex-row justify-center items-center">
                                <ActivityIndicator size="small" color="#ffffff" />
                                <Text className="text-white font-semibold ml-2">Memperbarui...</Text>
                            </View>
                        ) : (
                            <Text className="text-white text-center font-semibold">Perbarui Sopir</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <StatusBar style="auto" />
        </SafeAreaView>
    );
}
