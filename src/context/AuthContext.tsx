"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "@/lib/api";

interface User { id: string; email: string; name: string; role: string; }
interface AuthCtx { user: User | null; login: (email: string, password: string) => Promise<User>; register: (data: any) => Promise<void>; logout: () => void; loading: boolean; }

const AuthContext = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
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

  const register = async (data: any) => {
    await api.auth.register(data);
  };

  const logout = () => { localStorage.removeItem("token"); setUser(null); window.location.href = "/"; };

  return <AuthContext.Provider value={{ user, login, register, logout, loading }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => { const ctx = useContext(AuthContext); if (!ctx) throw new Error("useAuth must be in AuthProvider"); return ctx; };
