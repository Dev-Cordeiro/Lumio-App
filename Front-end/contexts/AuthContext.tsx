import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config/config";

// ✅ 1. Definir a tipagem completa para user_metadata
type UserMetadata = {
  full_name?: string;
  displayName?: string;
  phone_number?: string;
  avatar_url?: string; // Adicionado para armazenar a URL do avatar
};

type User = {
  id: string;
  email: string;
  user_metadata?: UserMetadata;
};

type AuthContextType = {
  isAuthenticated: boolean;
  loading: boolean;
  user: User | null;
  token: string | null;
  logout: () => Promise<void>;
  checkToken: () => Promise<void>;
  refreshUser: () => Promise<void>; // ✅ 2. Adicionar refreshUser
};

const AuthContext = createContext<AuthContextType>({} as any);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const fetchUser = async (t: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.ok) {
        const json = await res.json();
        setUser(json.user); // A API já retorna o formato correto
        setIsAuthenticated(true);
      } else {
        await logout(); // Se o token for inválido, faz logout
      }
    } catch {
      await logout();
    }
  };

  const checkToken = async () => {
    setLoading(true);
    const t = await AsyncStorage.getItem("access_token");
    setToken(t);
    if (t) {
      await fetchUser(t);
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
    setLoading(false);
  };

  // ✅ 3. Implementar a função refreshUser
  const refreshUser = async () => {
    setLoading(true);
    const t = await AsyncStorage.getItem("access_token");
    if (t) {
      await fetchUser(t);
    }
    setLoading(false);
  };

  const logout = async () => {
    await AsyncStorage.removeItem("access_token");
    setToken(null);
    setIsAuthenticated(false);
    setUser(null);
  };

  useEffect(() => {
    checkToken();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        loading,
        user,
        token,
        logout,
        checkToken,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
