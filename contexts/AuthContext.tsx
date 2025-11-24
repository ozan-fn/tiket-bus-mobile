import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../utils/api";

interface User {
    id: number;
    name: string;
    email: string;
    photo: string | null;
    roles: string[];
    role: string;
}

interface AuthResponse {
    access_token: string;
    token_type: string;
    user: User;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<boolean>;
    register: (name: string, email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in on app start
        const checkAuth = async () => {
            try {
                const storedToken = await SecureStore.getItemAsync("token");
                const storedUser = await SecureStore.getItemAsync("user");
                if (storedToken && storedUser) {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));
                }
            } catch (error) {
                console.error("Error checking auth:", error);
            } finally {
                setIsLoading(false);
            }
        };
        checkAuth();
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const response = await api.post("/api/login", { email, password });
            const data: AuthResponse = response.data;
            setUser(data.user);
            setToken(data.access_token);
            await SecureStore.setItemAsync("token", data.access_token);
            await SecureStore.setItemAsync("user", JSON.stringify(data.user));
            return true;
        } catch (error) {
            console.log("Login error:", error);
            return false;
        }
    };

    const register = async (name: string, email: string, password: string): Promise<boolean> => {
        try {
            const response = await api.post("/api/register", { name, email, password });
            const data: AuthResponse = response.data;
            setUser(data.user);
            setToken(data.access_token);
            await SecureStore.setItemAsync("token", data.access_token);
            await SecureStore.setItemAsync("user", JSON.stringify(data.user));
            return true;
        } catch (error) {
            console.error("Register error:", error);
            return false;
        }
    };

    const logout = async () => {
        setUser(null);
        setToken(null);
        await SecureStore.deleteItemAsync("token");
        await SecureStore.deleteItemAsync("user");
    };

    return <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>{children}</AuthContext.Provider>;
};
