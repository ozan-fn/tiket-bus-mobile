import React from "react";
import { Text, TouchableOpacity } from "react-native";

type ShadcnButtonProps = {
    label: string;
    variant?: "solid" | "ghost";
    onPress: () => void;
};

export default function ShadcnButton({ label, variant = "solid", onPress }: ShadcnButtonProps) {
    const solidStyles = "rounded-2xl bg-blue-600 dark:bg-blue-500 px-6 py-3";
    const ghostStyles = "rounded-2xl border border-blue-600/40 px-6 py-3 bg-transparent";

    return (
        <TouchableOpacity activeOpacity={0.9} onPress={onPress} className={`flex-row justify-center items-center ${variant === "solid" ? solidStyles : ghostStyles}`}>
            <Text className={`text-base font-semibold ${variant === "solid" ? "text-white" : "text-blue-600"}`}>{label}</Text>
        </TouchableOpacity>
    );
}
