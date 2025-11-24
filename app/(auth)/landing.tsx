import { router } from "expo-router";
import { Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ShadcnButton from "../components/ui/ShadcnButton";

export default function Landing() {
    const handleLogin = () => {
        router.push("/login");
    };

    const handleRegister = () => {
        router.push("/register");
    };

    return (
        <>
            {/* Background Image with Blur Effect */}
            <View className="absolute inset-0 ">
                <Image source={require("../../assets/images/onboarding.jpg")} className="w-full h-full" resizeMode="cover" blurRadius={3} />
            </View>

            <SafeAreaView style={{ flex: 1 }} className="bg-blue-900">
                <View className="flex-1 relative">
                    {/* Content Container */}
                    <View className="flex-1 px-6 justify-between py-8">
                        {/* Welcome Section */}
                        <View className="mt-16">
                            <Text className="text-4xl font-bold  mb-3">Selamat Datang</Text>
                            <Text className="text-lg text-black/70 leading-6">Masuk atau daftar untuk melanjutkan dan nikmati semua fitur kami.</Text>
                        </View>

                        {/* Buttons Section */}
                        <View className="mb-8 space-y-3">
                            <ShadcnButton label="Masuk" variant="solid" onPress={handleLogin} />
                            <View className="mb-3" />
                            <ShadcnButton label="Daftar Sekarang" variant="ghost" onPress={handleRegister} />

                            {/* Additional Info Text */}
                            <Text className="text-blue-100 text-center mt-6 text-sm">
                                Dengan melanjutkan, Anda menyetujui{"\n"}
                                <Text className="text-white font-semibold">Syarat & Ketentuan</Text> kami
                            </Text>
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        </>
    );
}
