import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";

export default function Index() {
    return (
        <View className="flex-1 justify-center items-center bg-black">
            <Text className="text-red-500">Edit app/index.tsx to edit this screen.</Text>
            <StatusBar style="auto" />
        </View>
    );
}
