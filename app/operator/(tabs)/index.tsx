import { useAuth } from "@/contexts/AuthContext";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, TouchableOpacity, View } from "react-native";

export default function OperatorDashboard() {
    const { logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        router.replace("/login");
    };

    return (
        <View className="flex-1 justify-center items-center bg-yellow-900">
            <Text className="text-white text-xl mb-4">Operator Dashboard</Text>
            <Text className="text-white">Handle daily operations</Text>
            <View className="absolute top-10 right-4">
                <TouchableOpacity className="p-2 bg-gray-800 rounded" onPress={handleLogout}>
                    <Text className="text-white">Logout</Text>
                </TouchableOpacity>
            </View>
            <StatusBar style="auto" />
        </View>
    );
}
