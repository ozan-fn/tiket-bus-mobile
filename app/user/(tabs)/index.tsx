import { useAuth } from "@/contexts/AuthContext";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, TouchableOpacity, View } from "react-native";

export default function UserDashboard() {
    const { logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        router.replace("/login");
    };

    return (
        <View className="flex-1 justify-center items-center bg-purple-900">
            <Text className="text-white text-xl mb-4">User Dashboard</Text>
            <Text className="text-white">View and book tickets</Text>
            <View className="flex-row mt-4">
                <TouchableOpacity className="p-2 bg-white rounded mr-2" onPress={() => router.push("/explore")}>
                    <Text className="text-purple-900">Explore</Text>
                </TouchableOpacity>
                <TouchableOpacity className="p-2 bg-white rounded" onPress={() => router.push("/profile")}>
                    <Text className="text-purple-900">Profile</Text>
                </TouchableOpacity>
            </View>
            <View className="absolute top-10 right-4">
                <TouchableOpacity className="p-2 bg-gray-800 rounded" onPress={handleLogout}>
                    <Text className="text-white">Logout</Text>
                </TouchableOpacity>
            </View>
            <StatusBar style="auto" />
        </View>
    );
}
