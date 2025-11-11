import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { PaperProvider } from "react-native-paper";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { paperTheme } from "../utils/paperTheme";

import "../global.css";

function RootLayoutNav() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (!user) {
        return <Stack screenOptions={{ headerShown: false }} />;
    }

    return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
    return (
        <PaperProvider theme={paperTheme}>
            <AuthProvider>
                <RootLayoutNav />
            </AuthProvider>
        </PaperProvider>
    );
}
