import { MD3LightTheme, configureFonts } from "react-native-paper";
import { MD3Type } from "react-native-paper/lib/typescript/types";

const fontConfig: Record<string, MD3Type> = {
    displayLarge: {
        fontFamily: "System",
        fontSize: 57,
        fontWeight: "400",
        lineHeight: 64,
        letterSpacing: 0,
    },
    displayMedium: {
        fontFamily: "System",
        fontSize: 45,
        fontWeight: "400",
        lineHeight: 52,
        letterSpacing: 0,
    },
    displaySmall: {
        fontFamily: "System",
        fontSize: 36,
        fontWeight: "400",
        lineHeight: 44,
        letterSpacing: 0,
    },
    headlineLarge: {
        fontFamily: "System",
        fontSize: 32,
        fontWeight: "400",
        lineHeight: 40,
        letterSpacing: 0,
    },
    headlineMedium: {
        fontFamily: "System",
        fontSize: 28,
        fontWeight: "400",
        lineHeight: 36,
        letterSpacing: 0,
    },
    headlineSmall: {
        fontFamily: "System",
        fontSize: 24,
        fontWeight: "400",
        lineHeight: 32,
        letterSpacing: 0,
    },
    titleLarge: {
        fontFamily: "System",
        fontSize: 22,
        fontWeight: "500",
        lineHeight: 28,
        letterSpacing: 0,
    },
    titleMedium: {
        fontFamily: "System",
        fontSize: 16,
        fontWeight: "500",
        lineHeight: 24,
        letterSpacing: 0.15,
    },
    titleSmall: {
        fontFamily: "System",
        fontSize: 14,
        fontWeight: "500",
        lineHeight: 20,
        letterSpacing: 0.1,
    },
    labelLarge: {
        fontFamily: "System",
        fontSize: 14,
        fontWeight: "500",
        lineHeight: 20,
        letterSpacing: 0.1,
    },
    labelMedium: {
        fontFamily: "System",
        fontSize: 12,
        fontWeight: "500",
        lineHeight: 16,
        letterSpacing: 0.5,
    },
    labelSmall: {
        fontFamily: "System",
        fontSize: 11,
        fontWeight: "500",
        lineHeight: 16,
        letterSpacing: 0.5,
    },
    bodyLarge: {
        fontFamily: "System",
        fontSize: 16,
        fontWeight: "400",
        lineHeight: 24,
        letterSpacing: 0.15,
    },
    bodyMedium: {
        fontFamily: "System",
        fontSize: 14,
        fontWeight: "400",
        lineHeight: 20,
        letterSpacing: 0.25,
    },
    bodySmall: {
        fontFamily: "System",
        fontSize: 12,
        fontWeight: "400",
        lineHeight: 16,
        letterSpacing: 0.4,
    },
};

export const paperTheme = {
    ...MD3LightTheme,
    fonts: configureFonts({ config: fontConfig }),
    colors: {
        ...MD3LightTheme.colors,
        primary: "#16a34a", // green-600
        primaryContainer: "#dcfce7", // green-100
        secondary: "#dc2626", // red-600
        secondaryContainer: "#fef2f2", // red-50
        tertiary: "#7c3aed", // violet-600
        tertiaryContainer: "#f3e8ff", // violet-50
        surface: "#ffffff",
        surfaceVariant: "#f9fafb", // gray-50
        background: "#f9fafb", // gray-50
        error: "#dc2626", // red-600
        errorContainer: "#fef2f2", // red-50
        onPrimary: "#ffffff",
        onPrimaryContainer: "#166534", // green-800
        onSecondary: "#ffffff",
        onSecondaryContainer: "#991b1b", // red-800
        onTertiary: "#ffffff",
        onTertiaryContainer: "#581c87", // violet-800
        onSurface: "#111827", // gray-900
        onSurfaceVariant: "#374151", // gray-700
        onError: "#ffffff",
        onErrorContainer: "#991b1b", // red-800
        outline: "#d1d5db", // gray-300
    },
};
