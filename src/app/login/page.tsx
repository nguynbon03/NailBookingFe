"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import BrandLogo from "@/components/BrandLogo";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "928600457960-ajp1em91uke0u58d6sugd2p7uqam19d1.apps.googleusercontent.com";

declare global {
  interface Window {
    google?: any;
  }
}

function redirectForRole(role: string) {
  const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const next = params.get("next");
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return role === "STAFF" ? "/staff" : ["ADMIN", "MANAGER"].includes(role) ? "/admin" : "/";
}

function googleStartUrl() {
  if (typeof window === "undefined") return "/api/auth/google";
  const params = new URLSearchParams(window.location.search);
  const next = params.get("next") || "/";
  return `/api/auth/google?next=${encodeURIComponent(next)}`;
}

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(true);
  const [googleRendered, setGoogleRendered] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const googleHref = useMemo(() => googleStartUrl(), []);
  const googleError = useMemo(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("google_error") || "";
  }, []);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      setGoogleLoading(false);
      return;
    }

    let cancelled = false;

    const renderGoogleButton = () => {
      if (cancelled || !window.google?.accounts?.id || !googleButtonRef.current) return;
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          ux_mode: "popup",
          callback: async (response: { credential?: string }) => {
            if (!response?.credential) {
              setError("Google did not return a sign-in credential. Please try again.");
              return;
            }
            setError("");
            setLoading(true);
            try {
              const user = await loginWithGoogle(response.credential);
              window.location.href = redirectForRole(user.role);
            } catch (err: any) {
              setError(err?.message || "Google login failed");
            } finally {
              setLoading(false);
            }
          },
        });
        googleButtonRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: "outline",
          size: "large",
          type: "standard",
          shape: "rectangular",
          text: "continue_with",
          logo_alignment: "left",
          width: Math.min(360, googleButtonRef.current.clientWidth || 360),
        });
        setGoogleRendered(true);
      } catch (err: any) {
        setError(err?.message || "Google button could not load. Please use username/email + password for now.");
      } finally {
        setGoogleLoading(false);
      }
    };

    if (window.google?.accounts?.id) {
      renderGoogleButton();
      return () => { cancelled = true; };
    }

    const existing = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]');
    const script = existing || document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = renderGoogleButton;
    script.onerror = () => {
      if (!cancelled) {
        setGoogleLoading(false);
        setError("Could not load Google sign-in. Please check the network and try again.");
      }
    };
    if (!existing) document.head.appendChild(script);

    return () => { cancelled = true; };
  }, [loginWithGoogle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      window.location.href = redirectForRole(user.role);
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <><Navbar />
    <main className="pt-16 min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-4">
        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-pink-100/50 border border-pink-100">
          <div className="text-center mb-7">
            <div className="mb-5 flex justify-center">
              <BrandLogo variant="auth" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in before booking. Customer booking email must match this account.</p>
          </div>
          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>}
          {googleError && <div className="mb-4 p-3 bg-amber-50 text-amber-700 rounded-xl text-sm">{decodeURIComponent(googleError)}</div>}

          <div className="mb-4 w-full rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
            <div ref={googleButtonRef} className="flex min-h-11 w-full items-center justify-center" />
            {googleLoading && <div className="py-2 text-center text-sm font-semibold text-gray-500">Loading Google sign-in...</div>}
            {!googleLoading && !googleRendered && (
              <a href={googleHref} className="w-full rounded-xl bg-white hover:bg-gray-50 text-gray-800 font-bold py-3 px-4 flex items-center justify-center gap-3 transition-colors">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-sm font-black text-blue-600">G</span>
                Continue with Google
              </a>
            )}
          </div>
          <div className="flex items-center gap-3 mb-4"><div className="h-px bg-gray-100 flex-1" /><span className="text-xs text-gray-400 font-bold">or username/email + password</span><div className="h-px bg-gray-100 flex-1" /></div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative"><Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" value={email} onChange={e => setEmail(e.target.value)} placeholder="Username or email" required className="w-full pl-10 p-3.5 rounded-xl border border-pink-200 focus:ring-2 focus:ring-pink-300 outline-none" /></div>
            <div className="relative"><Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="w-full pl-10 p-3.5 rounded-xl border border-pink-200 focus:ring-2 focus:ring-pink-300 outline-none" /></div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5"><LogIn size={18} className="mr-2 inline" />{loading ? "Signing in..." : "Sign In"}</button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">Don&apos;t have an account? <Link href="/register" className="text-pink-600 font-semibold hover:underline">Register</Link></p>
        </div>
      </motion.div>
    </main></>
  );
}
