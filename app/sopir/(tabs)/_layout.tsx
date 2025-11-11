import { Tabs } from "expo-router";
import React from "react";

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Dashboard",
                    headerShown: false,
                }}
            />
            <Tabs.Screen
                name="routes"
                options={{
                    title: "Routes",
                    headerShown: false,
                }}
            />
        </Tabs>
    );
}
