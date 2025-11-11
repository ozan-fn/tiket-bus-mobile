import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminDashboard() {
    const { logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        router.replace("/login");
    };

    return (
        <View className="flex-1 justify-center items-center bg-green-900">
            <Text className="text-white text-xl mb-4">Admin Dashboard</Text>
            <Text className="text-white">Manage users and operations</Text>
            <View className="absolute top-10 right-4">
                <TouchableOpacity className="p-2 bg-gray-800 rounded" onPress={handleLogout}>
                    <Text className="text-white">Logout</Text>
                </TouchableOpacity>
            </View>
            <StatusBar style="auto" />
        </View>
    );
}
