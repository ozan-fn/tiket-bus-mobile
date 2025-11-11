import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../contexts/AuthContext";

export default function ProfileScreen() {
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        router.replace("/login");
    };

    return (
        <View className="flex-1 justify-center items-center bg-gray-100">
            <Text className="text-xl font-bold mb-4">Profile</Text>
            <Text>Name: {user?.name}</Text>
            <Text>Email: {user?.email}</Text>
            <Text>Role: {user?.roles[0]}</Text>
            <TouchableOpacity className="mt-4 p-3 bg-red-500 rounded" onPress={handleLogout}>
                <Text className="text-white font-bold">Logout</Text>
            </TouchableOpacity>
        </View>
    );
}
