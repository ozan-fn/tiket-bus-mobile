import { api } from "@/utils/api";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Check, Square } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

interface Facility {
    id: number;
    nama: string;
    deskripsi: string | null;
}

export default function CreateBusScreen() {
    const [nama, setNama] = useState("");
    const [platNomor, setPlatNomor] = useState("");
    const [kapasitas, setKapasitas] = useState("");
    const [status, setStatus] = useState("aktif");
    const [keterangan, setKeterangan] = useState("");
    const [selectedFacilities, setSelectedFacilities] = useState<number[]>([]);
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingFacilities, setLoadingFacilities] = useState(true);

    const fetchFacilities = async () => {
        try {
            const response = await api.get("/api/fasilitas");
            setFacilities(response.data.data || []);
        } catch (error: any) {
            Alert.alert("Error", "Gagal memuat fasilitas");
        } finally {
            setLoadingFacilities(false);
        }
    };

    useEffect(() => {
        fetchFacilities();
    }, []);

    const handleFacilityToggle = (facilityId: number) => {
        setSelectedFacilities((prev) => (prev.includes(facilityId) ? prev.filter((id) => id !== facilityId) : [...prev, facilityId]));
    };

    const handleSubmit = async () => {
        if (!nama.trim() || !platNomor.trim() || !kapasitas.trim()) {
            Alert.alert("Error", "Nama, plat nomor, dan kapasitas wajib diisi");
            return;
        }

        try {
            setLoading(true);
            const data = {
                nama: nama.trim(),
                plat_nomor: platNomor.trim(),
                kapasitas: parseInt(kapasitas),
                status,
                keterangan: keterangan.trim() || null,
                fasilitas: selectedFacilities,
            };

            await api.post("/api/bus", data);
            Alert.alert("Berhasil", "Bus berhasil ditambahkan", [{ text: "OK", onPress: () => router.back() }]);
        } catch (error: any) {
            Alert.alert("Error", `Gagal menambahkan bus: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1 }} className="bg-gray-100">
            <View className="bg-orange-600 p-4 flex-row justify-between items-center">
                <TouchableOpacity onPress={() => router.back()}>
                    <Text className="text-white text-lg">← Back</Text>
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold">Tambah Bus</Text>
                <View />
            </View>

            <ScrollView className="flex-1 p-4">
                <View className="space-y-4">
                    <TextInput label="Nama Bus" value={nama} onChangeText={setNama} mode="outlined" placeholder="Masukkan nama bus" />

                    <TextInput label="Plat Nomor" value={platNomor} onChangeText={setPlatNomor} mode="outlined" placeholder="Masukkan plat nomor" autoCapitalize="characters" />

                    <TextInput label="Kapasitas" value={kapasitas} onChangeText={setKapasitas} mode="outlined" placeholder="Masukkan kapasitas" keyboardType="numeric" />

                    <TextInput label="Status" value={status} onChangeText={setStatus} mode="outlined" placeholder="aktif/nonaktif" />

                    <TextInput label="Keterangan" value={keterangan} onChangeText={setKeterangan} mode="outlined" placeholder="Masukkan keterangan (opsional)" multiline numberOfLines={3} />

                    <View>
                        <Text className="text-lg font-semibold mb-2">Fasilitas</Text>
                        {loadingFacilities ? (
                            <View className="flex-row items-center py-4">
                                <ActivityIndicator size="small" color="#ea580c" />
                                <Text className="text-gray-600 ml-2">Memuat fasilitas...</Text>
                            </View>
                        ) : facilities.length === 0 ? (
                            <Text className="text-gray-500">Tidak ada fasilitas tersedia</Text>
                        ) : (
                            <View className="space-y-2">
                                {facilities.map((facility) => (
                                    <TouchableOpacity key={facility.id} className="flex-row items-center p-3 bg-white rounded-lg" onPress={() => handleFacilityToggle(facility.id)}>
                                        {selectedFacilities.includes(facility.id) ? <Check size={20} color="#ea580c" /> : <Square size={20} color="#6b7280" />}
                                        <View className="ml-2 flex-1">
                                            <Text className="font-semibold">{facility.nama}</Text>
                                            {facility.deskripsi && <Text className="text-gray-600 text-sm">{facility.deskripsi}</Text>}
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    <Button mode="contained" onPress={handleSubmit} loading={loading} disabled={loading} className="mt-6">
                        {loading ? "Menyimpan..." : "Simpan Bus"}
                    </Button>
                </View>

                <StatusBar style="auto" />
            </ScrollView>
        </SafeAreaView>
    );
}
