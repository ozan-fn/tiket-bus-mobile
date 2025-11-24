import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { AuthProvider, useAuth } from "../contexts/AuthContext";

import { StatusBar } from "expo-status-bar";
import "../global.css";

function RootLayoutNav() {
    const { isLoading } = useAuth();

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return <Stack screenOptions={{ headerShown: false }} />;
}

import "../global.css"

export default function RootLayout() {
    return (
        <AuthProvider>
            <RootLayoutNav />
            <StatusBar style="auto" />
        </AuthProvider>
    );
}
