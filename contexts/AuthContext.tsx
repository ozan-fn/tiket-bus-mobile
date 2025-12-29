import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiLogin } from '@/lib/api';

interface User {
  id: number;
  name: string;
  email: string;
  photo: string | null;
  roles: string[];
  role: string;
}

interface ApiResponse {
  error?: string;
  access_token?: string;
  token_type?: string;
  user?: User;
  [key: string]: any;
}

interface AuthContextType {
  user: string | null;
  userRole: string | null;
  userName: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<ApiResponse>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';

    if (!isLoading) {
      if (!user && !inAuthGroup) {
        // Redirect unauthenticated users to the auth landing page instead of sign-in
        router.replace('/(auth)/landing');
      } else if (user && inAuthGroup) {
        // Redirect to root, let index.tsx handle role-based routing
        router.replace('/');
      }
    }
  }, [user, segments, isLoading, userRole]);

  const loadUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('token');

      if (storedUser && token) {
        const userData = JSON.parse(storedUser);
        setUser(userData.email || storedUser);
        setUserRole(userData.role || null);
        setUserName(userData.name || null);
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    // Call API login
    const response: ApiResponse = await apiLogin(email, password);

    if (response.error) {
      console.log('Sign in failed:', response.error);
      return response;
    }

    // Save user data and token
    await AsyncStorage.setItem('user', JSON.stringify(response.user || { email }));
    if (response.access_token) {
      await AsyncStorage.setItem('token', response.access_token);
    }

    setUser(response.user?.email || email);
    setUserRole(response.user?.role || null);
    setUserName(response.user?.name || null);
    return response;
  };

  const signOut = async () => {
    // Clear local storage
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('token');
    setUser(null);
    setUserRole(null);
    setUserName(null);
  };

  return (
    <AuthContext.Provider value={{ user, userRole, userName, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
