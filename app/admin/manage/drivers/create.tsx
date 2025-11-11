import { api } from "@/utils/api";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DatePicker, SelectPicker } from "../../../components/ui";

export default function CreateDriverScreen() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        nik: "",
        nomor_sim: "",
        alamat: "",
        telepon: "",
        tanggal_lahir: null as Date | null,
        status: "aktif",
    });

    const handleSubmit = async () => {
        if (!formData.name.trim() || !formData.nik.trim() || !formData.nomor_sim.trim()) {
            Alert.alert("Error", "Nama, NIK, dan Nomor SIM wajib diisi");
            return;
        }

        try {
            setLoading(true);
            const submitData = {
                ...formData,
                tanggal_lahir: formData.tanggal_lahir ? formData.tanggal_lahir.toISOString().split("T")[0] : "",
            };
            await api.post("/sopir", submitData);
            Alert.alert("Berhasil", "Sopir berhasil ditambahkan", [{ text: "OK", onPress: () => router.back() }]);
        } catch (error: any) {
            if (error.response?.status === 422) {
                Alert.alert("Error Validasi", "Periksa kembali data yang Anda masukkan");
            } else if (error.response?.status === 401) {
                Alert.alert("Error", "Akses tidak diizinkan");
            } else {
                Alert.alert("Error", `Gagal menambahkan sopir: ${error.response?.data?.message || error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1 }} className="bg-gray-100">
            <View className="bg-red-600 p-4 flex-row justify-between items-center">
                <TouchableOpacity onPress={() => router.back()}>
                    <Text className="text-white text-lg">← Kembali</Text>
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold">Tambah Sopir</Text>
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
                        <DatePicker
                            label=""
                            value={formData.tanggal_lahir}
                            onChange={(date) => setFormData((prev) => ({ ...prev, tanggal_lahir: date }))}
                            placeholder="Pilih tanggal lahir"
                            maximumDate={new Date()} // Tidak boleh lahir di masa depan
                        />
                    </View>

                    <View className="mb-6">
                        <SelectPicker
                            label="Status"
                            value={formData.status}
                            onChange={(value) => setFormData((prev) => ({ ...prev, status: value as string }))}
                            options={[
                                { label: "Aktif", value: "aktif" },
                                { label: "Nonaktif", value: "nonaktif" },
                            ]}
                            placeholder="Pilih status"
                        />
                    </View>

                    <TouchableOpacity className={`p-4 rounded-lg ${loading ? "bg-gray-400" : "bg-red-500"}`} onPress={handleSubmit} disabled={loading}>
                        {loading ? (
                            <View className="flex-row justify-center items-center">
                                <ActivityIndicator size="small" color="#ffffff" />
                                <Text className="text-white font-semibold ml-2">Menyimpan...</Text>
                            </View>
                        ) : (
                            <Text className="text-white text-center font-semibold">Tambah Sopir</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <StatusBar style="auto" />
        </SafeAreaView>
    );
}
