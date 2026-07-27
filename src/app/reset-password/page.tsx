"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/lib/translations";
import Navbar from "@/components/Navbar";

const API = process.env.NEXT_PUBLIC_API_URL || "";

export default function ResetPasswordPage() {
  const { lang } = useLanguage();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get("token") || "");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!token) {
      setError(t("reset.invalid", lang));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("reset.invalid", lang));
        return;
      }
      setSuccess(true);
      setTimeout(() => { window.location.href = "/login"; }, 2000);
    } catch {
      setError(t("reset.invalid", lang));
    } finally {
      setLoading(false);
    }
  };

  if (!token && typeof window !== "undefined") {
    return (
      <><Navbar />
      <main className="pt-16 min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white">
        <div className="bg-white rounded-3xl p-8 shadow-xl max-w-md mx-4 text-center">
          <p className="text-red-600 mb-4">{t("reset.invalid", lang)}</p>
          <Link href="/forgot-password" className="text-pink-600 font-semibold hover:underline">{t("forgot.title", lang)}</Link>
        </div>
      </main></>
    );
  }

  return (
    <><Navbar />
    <main className="pt-16 min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-4">
        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-pink-100/50 border border-pink-100">
          <div className="text-center mb-7">
            <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-pink-50 flex items-center justify-center">
              <Lock size={28} className="text-pink-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{t("reset.title", lang)}</h1>
            <p className="text-gray-500 text-sm mt-2">{t("reset.desc", lang)}</p>
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>}

          {success ? (
            <div className="text-center">
              <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-xl flex items-center justify-center gap-2">
                <CheckCircle size={20} />{t("reset.success", lang)}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder={t("reset.newPassword", lang)} required className="w-full pl-10 pr-10 p-3.5 rounded-xl border border-pink-200 focus:ring-2 focus:ring-pink-300 outline-none" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder={t("reset.confirmPassword", lang)} required className="w-full pl-10 p-3.5 rounded-xl border border-pink-200 focus:ring-2 focus:ring-pink-300 outline-none" />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">{loading ? "..." : t("reset.submit", lang)}</button>
            </form>
          )}
        </div>
      </motion.div>
    </main></>
  );
}
