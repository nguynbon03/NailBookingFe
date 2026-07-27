"use client";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/lib/translations";
import Navbar from "@/components/Navbar";
import BrandLogo from "@/components/BrandLogo";

function redirectForRole(role: string) {
  const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const next = params.get("next");
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return role === "STAFF" ? "/staff" : ["ADMIN", "MANAGER"].includes(role) ? "/admin" : "/";
}

function googleStartUrl() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
  const path = "/api/auth/google";
  if (typeof window === "undefined") return `${apiBase}${path}`;
  const params = new URLSearchParams(window.location.search);
  const next = params.get("next") || "/";
  return `${apiBase}${path}?next=${encodeURIComponent(next)}`;
}

export default function LoginPage() {
  const { login } = useAuth();
  const { lang } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const googleHref = useMemo(() => googleStartUrl(), []);
  const googleError = useMemo(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("google_error") || "";
  }, []);

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
            <h1 className="text-2xl font-bold text-gray-900">{t("login.welcomeBack", lang)}</h1>
            <p className="text-gray-500 text-sm mt-1">{t("login.signInDesc", lang)}</p>
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>}
          {googleError && <div className="mb-4 p-3 bg-amber-50 text-amber-700 rounded-xl text-sm">{decodeURIComponent(googleError)}</div>}

          {/* GOOGLE_REDIRECT_LOGIN_NO_GSI_20260701 */}
          <a href={googleHref} className="mb-4 w-full rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 font-bold py-3.5 px-4 flex items-center justify-center gap-3 transition-colors shadow-sm">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-sm font-black text-blue-600">G</span>
            {t("login.googleSignIn", lang)}
          </a>
          <div className="flex items-center gap-3 mb-4"><div className="h-px bg-gray-100 flex-1" /><span className="text-xs text-gray-400 font-bold">{t("login.orDivider", lang)}</span><div className="h-px bg-gray-100 flex-1" /></div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative"><Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" value={email} onChange={e => setEmail(e.target.value)} placeholder={t("login.usernamePlaceholder", lang)} required className="w-full pl-10 p-3.5 rounded-xl border border-pink-200 focus:ring-2 focus:ring-pink-300 outline-none" /></div>
            <div className="relative"><Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={t("login.passwordPlaceholder", lang)} required className="w-full pl-10 p-3.5 rounded-xl border border-pink-200 focus:ring-2 focus:ring-pink-300 outline-none" /></div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5"><LogIn size={18} className="mr-2 inline" />{loading ? t("login.signingIn", lang) : t("login.signIn", lang)}</button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">{t("login.noAccount", lang)} <Link href="/register" className="text-pink-600 font-semibold hover:underline">{t("login.register", lang)}</Link></p>
        </div>
      </motion.div>
    </main></>
  );
}
