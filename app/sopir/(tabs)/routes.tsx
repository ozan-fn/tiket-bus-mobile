import { useAuth } from "@/contexts/AuthContext";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, TouchableOpacity, View } from "react-native";

export default function RoutesScreen() {
    const { logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        router.replace("/login");
    };

    return (
        <View className="flex-1 justify-center items-center bg-red-800">
            <Text className="text-white text-xl mb-4">My Routes</Text>
            <Text className="text-white">Manage your assigned routes and schedules</Text>
            <View className="absolute top-10 right-4">
                <TouchableOpacity className="p-2 bg-gray-800 rounded" onPress={handleLogout}>
                    <Text className="text-white">Logout</Text>
                </TouchableOpacity>
            </View>
            <StatusBar style="auto" />
        </View>
    );
}
