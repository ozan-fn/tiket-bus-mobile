import { router } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function Index() {
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            const primaryRole = user.roles[0] || "user";
            switch (primaryRole) {
                case "super_admin":
                    router.replace("/super_admin");
                    break;
                case "admin":
                    router.replace("/admin");
                    break;
                case "operator":
                    router.replace("/operator");
                    break;
                case "user":
                    router.replace("/user");
                    break;
                case "sopir":
                    router.replace("/sopir");
                    break;
                default:
                    router.replace("/user");
                    break;
            }
        } else {
            // @ts-ignore
            router.replace("/login");
        }
    }, [user]);

    return null; // Redirecting, no UI needed
}
