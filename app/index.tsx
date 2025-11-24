import { router } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function Index() {
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            switch (user.role) {
                // case "super_admin":
                //     router.replace("/super_admin");
                //     break;
                // case "admin":
                //     router.replace("/admin");
                //     break;
                case "user":
                    router.replace("/user");
                    break;
                // case "sopir":
                //     router.replace("/sopir");
                //     break;
                default:
                    router.replace("/user");
                    break;
            }
        } else {
            router.replace("/landing");
        }
    }, [user]);

    return null;
}
