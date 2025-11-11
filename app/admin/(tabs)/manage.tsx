import { useAuth } from "@/contexts/AuthContext";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ManageScreen() {
    const { logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        router.replace("/login");
    };

    const masterDataItems = [
        { title: "Fasilitas", route: "/admin/manage/facilities", color: "bg-blue-500" },
        { title: "Rute", route: "/admin/manage/routes", color: "bg-green-500" },
        { title: "Terminal", route: "/admin/manage/terminals", color: "bg-yellow-500" },
        { title: "Sopir", route: "/admin/manage/drivers", color: "bg-red-500" },
        { title: "Kelas Bus", route: "/admin/manage/bus-classes", color: "bg-purple-500" },
        { title: "Jadwal Kelas Bus", route: "/admin/manage/bus-schedules", color: "bg-indigo-500" },
    ];

    return (
        <SafeAreaView style={{ flex: 1 }} className="bg-gray-100">
            <View className="bg-green-900 p-4">
                <Text className="text-white text-xl font-bold text-center">Admin Management</Text>
                <Text className="text-white text-center mt-1">Manage system master data</Text>
            </View>

            <ScrollView className="flex-1 p-4">
                <Text className="text-lg font-semibold mb-4 text-gray-800">Master Data</Text>

                <View className="space-y-3">
                    {masterDataItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            className={`${item.color} p-4 rounded-lg shadow-sm`}
                            onPress={() => {
                                // @ts-ignore
                                router.push(item.route);
                            }}
                        >
                            <Text className="text-white text-lg font-semibold">{item.title}</Text>
                            <Text className="text-white text-sm opacity-90">Manage {item.title.toLowerCase()}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View className="mt-8">
                    <TouchableOpacity className="bg-gray-800 p-4 rounded-lg" onPress={handleLogout}>
                        <Text className="text-white text-center font-semibold">Logout</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <StatusBar style="auto" />
        </SafeAreaView>
    );
}
