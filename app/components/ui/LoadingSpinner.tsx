import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

interface LoadingSpinnerProps {
    size?: "small" | "large";
    color?: string;
    text?: string;
    fullScreen?: boolean;
}

export default function LoadingSpinner({
    size = "large",
    color = "#16a34a", // green-600
    text,
    fullScreen = false,
}: LoadingSpinnerProps) {
    const containerClasses = fullScreen ? "flex-1 justify-center items-center bg-white" : "justify-center items-center py-4";

    return (
        <View className={containerClasses}>
            <ActivityIndicator size={size} color={color} />
            {text && <Text className="text-gray-600 mt-2 text-center">{text}</Text>}
        </View>
    );
}
