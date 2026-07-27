"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/lib/translations";
import Navbar from "@/components/Navbar";

const API = process.env.NEXT_PUBLIC_API_URL || "";

export default function ForgotPasswordPage() {
  const { lang } = useLanguage();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      await res.json();
      setSuccess(true);
    } catch {
      setSuccess(true); // Always show success to prevent enumeration
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
            <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-pink-50 flex items-center justify-center">
              <Mail size={28} className="text-pink-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{t("forgot.title", lang)}</h1>
            <p className="text-gray-500 text-sm mt-2">{t("forgot.desc", lang)}</p>
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>}

          {success ? (
            <div className="text-center">
              <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-xl text-sm">{t("forgot.success", lang)}</div>
              <Link href="/login" className="inline-flex items-center gap-2 text-pink-600 font-semibold hover:underline">
                <ArrowLeft size={16} />{t("forgot.backToLogin", lang)}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t("forgot.emailPlaceholder", lang)} required className="w-full pl-10 p-3.5 rounded-xl border border-pink-200 focus:ring-2 focus:ring-pink-300 outline-none" />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
                <Send size={18} className="mr-2 inline" />{loading ? t("forgot.sending", lang) : t("forgot.sendLink", lang)}
              </button>
              <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-pink-600">
                <ArrowLeft size={14} />{t("forgot.backToLogin", lang)}
              </Link>
            </form>
          )}
        </div>
      </motion.div>
    </main></>
  );
}
