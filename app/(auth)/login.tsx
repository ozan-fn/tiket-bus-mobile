import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../contexts/AuthContext";

export default function LoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }
        const success = await login(email, password);
        if (success) {
            router.replace("/");
        } else {
            Alert.alert("Error", "Invalid credentials");
        }
    };

    return (
        <View className="flex-1 justify-center items-center bg-gray-100 p-6">
            <Text className="text-2xl font-bold mb-6">Login</Text>
            <TextInput className="w-full p-3 mb-4 border border-gray-300 rounded" placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <TextInput className="w-full p-3 mb-4 border border-gray-300 rounded" placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
            <TouchableOpacity className="w-full p-3 bg-blue-500 rounded mb-4" onPress={handleLogin}>
                <Text className="text-white text-center font-bold">Login</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/register")}>
                <Text className="text-blue-500">Don't have an account? Register</Text>
            </TouchableOpacity>
        </View>
    );
}
