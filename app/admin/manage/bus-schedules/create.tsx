import { api } from "@/utils/api";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Schedule {
    id: number;
    bus_id: number;
    sopir_id: number;
    rute_id: number;
    tanggal_berangkat: string;
    jam_berangkat: string;
    status: string;
}

interface BusClass {
    id: number;
    bus_id: number;
    nama_kelas: string;
    posisi: string;
    jumlah_kursi: number;
}

export default function CreateBusScheduleScreen() {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [busClasses, setBusClasses] = useState<BusClass[]>([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        jadwal_id: "",
        kelas_bus_id: "",
        harga: "",
    });

    const fetchSchedules = async () => {
        try {
            const response = await api.get("/jadwal");
            setSchedules(response.data.data || []);
        } catch (error: any) {
            Alert.alert("Error", "Gagal memuat jadwal");
        }
    };

    const fetchBusClasses = async () => {
        try {
            const response = await api.get("/kelas-bus");
            setBusClasses(response.data.data || []);
        } catch (error: any) {
            Alert.alert("Error", "Gagal memuat kelas bus");
        }
    };

    useEffect(() => {
        fetchSchedules();
        fetchBusClasses();
    }, []);

    const handleSubmit = async () => {
        if (!formData.jadwal_id || !formData.kelas_bus_id || !formData.harga) {
            Alert.alert("Error", "Semua field harus diisi");
            return;
        }

        setLoading(true);
        try {
            const response = await api.post("/jadwal-kelas-bus", {
                jadwal_id: parseInt(formData.jadwal_id),
                kelas_bus_id: parseInt(formData.kelas_bus_id),
                harga: parseInt(formData.harga),
            });

            Alert.alert("Berhasil", "Jadwal bus berhasil ditambahkan");
            router.back();
        } catch (error: any) {
            Alert.alert("Error", "Gagal menambahkan jadwal bus");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1 }} className="bg-gray-100">
            <View className="bg-indigo-600 p-4 flex-row justify-between items-center">
                <TouchableOpacity onPress={() => router.back()}>
                    <Text className="text-white text-lg">← Kembali</Text>
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold">Tambah Jadwal Bus</Text>
                <View style={{ width: 50 }} />
            </View>

            <ScrollView className="flex-1 p-4">
                <View className="bg-white p-6 rounded-lg shadow-sm">
                    <Text className="text-lg font-semibold text-gray-800 mb-4">Informasi Jadwal Bus</Text>

                    <View className="mb-4">
                        <Text className="text-gray-700 mb-2">Jadwal</Text>
                        <View className="border border-gray-300 rounded-lg">
                            {schedules.map((schedule) => (
                                <TouchableOpacity key={schedule.id} className={`p-3 border-b border-gray-200 ${formData.jadwal_id === schedule.id.toString() ? "bg-indigo-50" : ""}`} onPress={() => setFormData({ ...formData, jadwal_id: schedule.id.toString() })}>
                                    <Text className="text-gray-800">
                                        Bus {schedule.bus_id} - {new Date(schedule.tanggal_berangkat).toLocaleDateString()} {schedule.jam_berangkat.substring(11, 16)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View className="mb-4">
                        <Text className="text-gray-700 mb-2">Kelas Bus</Text>
                        <View className="border border-gray-300 rounded-lg">
                            {busClasses.map((busClass) => (
                                <TouchableOpacity key={busClass.id} className={`p-3 border-b border-gray-200 ${formData.kelas_bus_id === busClass.id.toString() ? "bg-indigo-50" : ""}`} onPress={() => setFormData({ ...formData, kelas_bus_id: busClass.id.toString() })}>
                                    <Text className="text-gray-800">
                                        {busClass.nama_kelas} - {busClass.posisi} ({busClass.jumlah_kursi} kursi)
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View className="mb-6">
                        <Text className="text-gray-700 mb-2">Harga (Rp)</Text>
                        <TextInput className="border border-gray-300 rounded-lg p-3" placeholder="Masukkan harga" keyboardType="numeric" value={formData.harga} onChangeText={(text) => setFormData({ ...formData, harga: text })} />
                    </View>

                    <TouchableOpacity className="bg-indigo-600 p-4 rounded-lg" onPress={handleSubmit} disabled={loading}>
                        {loading ? <ActivityIndicator color="white" /> : <Text className="text-white text-center font-semibold">Simpan Jadwal Bus</Text>}
                    </TouchableOpacity>
                </View>

                <StatusBar style="auto" />
            </ScrollView>
        </SafeAreaView>
    );
}
