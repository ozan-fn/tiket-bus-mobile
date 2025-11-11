import { useAuth } from "@/contexts/AuthContext";
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
    alamat: string;
    created_at: string;
    updated_at: string;
}

export default function TerminalsScreen() {
    const { logout } = useAuth();
    const [terminals, setTerminals] = useState<Terminal[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchTerminals = async (page = 1) => {
        try {
            setLoading(true);
            const response = await api.get(`/terminal?page=${page}&per_page=10`);
            setTerminals(response.data.data || []);
            setTotalPages(response.data.last_page || 1);
            setCurrentPage(page);
        } catch (error: any) {
            console.error("Error fetching terminals:", error);
            if (error.response?.status === 401) {
                Alert.alert("Error", "Unauthorized access");
                await logout();
                router.replace("/login");
            } else {
                Alert.alert("Error", "Failed to load terminals");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTerminals();
    }, []);

    const handleDelete = async (id: number) => {
        Alert.alert("Delete Terminal", "Are you sure you want to delete this terminal?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        await api.delete(`/terminal/${id}`);
                        Alert.alert("Success", "Terminal deleted successfully");
                        fetchTerminals(currentPage);
                    } catch (error: any) {
                        console.error("Error deleting terminal:", error);
                        Alert.alert("Error", "Failed to delete terminal");
                    }
                },
            },
        ]);
    };

    const handleLogout = async () => {
        await logout();
        router.replace("/login");
    };

    return (
        <SafeAreaView style={{ flex: 1 }} className="bg-gray-100">
            <View className="bg-yellow-600 p-4 flex-row justify-between items-center">
                <TouchableOpacity onPress={() => router.back()}>
                    <Text className="text-white text-lg">← Back</Text>
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold">Terminals</Text>
                <TouchableOpacity
                    className="bg-white px-3 py-1 rounded"
                    onPress={() => {
                        // @ts-ignore
                        router.push("/admin/manage/terminals/create");
                    }}
                >
                    <Text className="text-yellow-600 font-semibold">+ Add</Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-4">
                {loading ? (
                    <View className="flex-1 justify-center items-center py-10">
                        <ActivityIndicator size="large" color="#d97706" />
                        <Text className="text-gray-600 mt-2">Loading terminals...</Text>
                    </View>
                ) : terminals.length === 0 ? (
                    <View className="flex-1 justify-center items-center py-10">
                        <Text className="text-gray-500 text-lg">No terminals found</Text>
                        <Text className="text-gray-400 text-sm mt-1">Add your first terminal</Text>
                    </View>
                ) : (
                    <View className="space-y-3">
                        {terminals.map((terminal) => (
                            <View key={terminal.id} className="bg-white p-4 rounded-lg shadow-sm">
                                <View className="flex-row justify-between items-start">
                                    <View className="flex-1">
                                        <Text className="text-lg font-semibold text-gray-800">{terminal.nama_terminal}</Text>
                                        <Text className="text-gray-600">{terminal.nama_kota}</Text>
                                        <Text className="text-gray-500 text-sm mt-1">{terminal.alamat}</Text>
                                    </View>
                                    <View className="flex-row space-x-2">
                                        <TouchableOpacity
                                            className="bg-blue-500 px-3 py-1 rounded"
                                            onPress={() => {
                                                // @ts-ignore
                                                router.push(`/admin/manage/terminals/${terminal.id}/edit`);
                                            }}
                                        >
                                            <Text className="text-white text-sm">Edit</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity className="bg-red-500 px-3 py-1 rounded" onPress={() => handleDelete(terminal.id)}>
                                            <Text className="text-white text-sm">Delete</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <View className="flex-row justify-center items-center mt-6 space-x-2">
                        <TouchableOpacity className={`px-4 py-2 rounded ${currentPage === 1 ? "bg-gray-300" : "bg-yellow-500"}`} disabled={currentPage === 1} onPress={() => fetchTerminals(currentPage - 1)}>
                            <Text className={`text-sm ${currentPage === 1 ? "text-gray-500" : "text-white"}`}>Previous</Text>
                        </TouchableOpacity>

                        <Text className="text-gray-600">
                            Page {currentPage} of {totalPages}
                        </Text>

                        <TouchableOpacity className={`px-4 py-2 rounded ${currentPage === totalPages ? "bg-gray-300" : "bg-yellow-500"}`} disabled={currentPage === totalPages} onPress={() => fetchTerminals(currentPage + 1)}>
                            <Text className={`text-sm ${currentPage === totalPages ? "text-gray-500" : "text-white"}`}>Next</Text>
                        </TouchableOpacity>
                    </View>
                )}

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
