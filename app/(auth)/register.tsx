import { router } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";

export default function RegisterScreen() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const { register } = useAuth();

    const handleRegister = async () => {
        if (!name || !email || !password || !confirmPassword) {
            setErrorMessage("Please fill in all fields.");
            return;
        }
        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match.");
            return;
        }

        setLoading(true);
        setErrorMessage("");

        const success = await register(name, email, password);
        setLoading(false);

        if (success) {
            router.replace("/");
        } else {
            setErrorMessage("Registration failed. Please try again.");
        }
    };

    return (
        <>
            <View className="absolute inset-0">
                <Image source={require("../../assets/images/onboarding.jpg")} className="w-full h-full" resizeMode="cover" blurRadius={3} />
            </View>

            <SafeAreaView style={{ flex: 1 }}>
                <View className="flex-1 px-6 pt-8">
                    <TouchableOpacity onPress={() => router.replace("/landing")} className="p-2 self-start mb-6 rounded-lg bg-white/80 dark:bg-black/30 shadow-md">
                        <Text className="text-lg">←</Text>
                    </TouchableOpacity>

                    <Text className="text-3xl font-bold text-white mb-2">Create Account</Text>
                    <Text className="text-sm text-white/80 mb-10">Sign up to enjoy seamless scheduling and ride features.</Text>

                    <View className=" dark:bg-white/10 border border-white/30 dark:border-white/10 rounded-4xl p-6 space-y-4 shadow-lg">
                        <View className="flex-row justify-between items-center">
                            <Text className="text-xs font-semibold tracking-[0.3em] text-slate-500">Register</Text>
                            <Image source={require("../../assets/images/icon.png")} style={{ width: 40, height: 40 }} />
                        </View>

                        {errorMessage ? <Text className="text-sm text-rose-500">{errorMessage}</Text> : null}

                        <TextInput className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-3xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white" placeholder="Full name" placeholderTextColor="#9ca3af" value={name} onChangeText={setName} />

                        <TextInput className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-3xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white" placeholder="Email address" placeholderTextColor="#9ca3af" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                        <TextInput className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-3xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white" placeholder="Password" placeholderTextColor="#9ca3af" value={password} onChangeText={setPassword} secureTextEntry />
                        <TextInput className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-3xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white" placeholder="Confirm password" placeholderTextColor="#9ca3af" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

                        {loading ? (
                            <ActivityIndicator size="large" color="#1d4ed8" className="mt-2" />
                        ) : (
                            <TouchableOpacity onPress={handleRegister} className="w-full py-3 bg-sky-600 rounded-2xl shadow-lg">
                                <Text className="text-center text-white text-base font-semibold">Sign Up</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <TouchableOpacity className="mt-6" onPress={() => router.push("/login")}>
                        <Text className="text-center text-sm text-white/80">Already have an account? Login</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </>
    );
}
