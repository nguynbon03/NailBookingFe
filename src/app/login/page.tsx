"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Mail, Lock, LogIn } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

declare global {
  interface Window {
    google?: any;
  }
}

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

function redirectForRole(role: string) {
  const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const next = params.get("next");
  if (next && next.startsWith("/")) return next;
  return role === "STAFF" ? "/staff" : ["ADMIN", "MANAGER"].includes(role) ? "/admin" : "/";
}

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);

  const finishLogin = (user: any) => {
    window.location.href = redirectForRole(user.role);
  };

  useEffect(() => {
    if (!googleClientId) return;
    const render = () => {
      if (!window.google || !googleButtonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response: any) => {
          setError("");
          setLoading(true);
          try {
            const user = await loginWithGoogle(response.credential);
            finishLogin(user);
          } catch (err: any) {
            setError(err.message || "Google login failed");
          } finally {
            setLoading(false);
          }
        },
      });
      googleButtonRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(googleButtonRef.current, { theme: "outline", size: "large", width: 360, text: "continue_with" });
      setGoogleReady(true);
    };

    if (window.google) {
      render();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = render;
    script.onerror = () => setError("Could not load Google login script");
    document.head.appendChild(script);
  }, [loginWithGoogle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const user = await login(email, password);
      finishLogin(user);
    }
    catch (err: any) { setError(err.message || "Login failed"); }
    finally { setLoading(false); }
  };

  return (
    <><Navbar />
    <main className="pt-16 min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-4">
        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-pink-100/50 border border-pink-100">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white mx-auto mb-4"><Sparkles size={28} /></div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in before booking. Customer booking email must match this account.</p>
          </div>
          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>}
          <div className="mb-4">
            {googleClientId ? (
              <div className="min-h-11 rounded-xl flex items-center justify-center" ref={googleButtonRef}>{!googleReady && <span className="text-sm text-gray-400">Loading Google...</span>}</div>
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">Google login is ready in code. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID and GOOGLE_CLIENT_ID in Coolify to enable the button.</div>
            )}
          </div>
          <div className="flex items-center gap-3 mb-4"><div className="h-px bg-gray-100 flex-1" /><span className="text-xs text-gray-400 font-bold">or email/password</span><div className="h-px bg-gray-100 flex-1" /></div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative"><Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" value={email} onChange={e => setEmail(e.target.value)} placeholder="Username or email" required className="w-full pl-10 p-3.5 rounded-xl border border-pink-200 focus:ring-2 focus:ring-pink-300 outline-none" /></div>
            <div className="relative"><Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="w-full pl-10 p-3.5 rounded-xl border border-pink-200 focus:ring-2 focus:ring-pink-300 outline-none" /></div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5"><LogIn size={18} className="mr-2 inline" />{loading ? "Signing in..." : "Sign In"}</button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">Don't have an account? <Link href="/register" className="text-pink-600 font-semibold hover:underline">Register</Link></p>
        </div>
      </motion.div>
    </main></>
  );
}
