"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "@/lib/api";

interface AuthUser { 
  id: string; 
  email: string; 
  name: string; 
  role: string; 
  phone?: string | null; 
  emailVerifiedAt?: string | null; 
  phoneVerifiedAt?: string | null; 
}

interface AuthCtx { 
  user: AuthUser | null; 
  login: (email: string, password: string) => Promise<AuthUser>; 
  loginWithGoogle: (credential: string) => Promise<AuthUser>; 
  register: (data: any) => Promise<void>; 
  logout: () => void; 
  loading: boolean; 
}

const AuthContext = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.auth.me()
        .then((d: any) => { if (d.user) setUser(d.user); })
        .catch(() => { localStorage.removeItem("token"); setUser(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const d = await api.auth.login(email, password);
    localStorage.setItem("token", d.token);
    setUser(d.user);
    return d.user;
  };

  const loginWithGoogle = async (credential: string) => {
    const d = await api.auth.google(credential);
    localStorage.setItem("token", d.token);
    setUser(d.user);
    return d.user;
  };

  const register = async (data: any) => {
    await api.auth.register(data);
  };

  const logout = () => { localStorage.removeItem("token"); setUser(null); window.location.href = "/"; };

  return <AuthContext.Provider value={{ user, login, loginWithGoogle, register, logout, loading }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => { 
  const ctx = useContext(AuthContext); 
  if (!ctx) throw new Error("useAuth must be in AuthProvider"); 
  return ctx; 
};
