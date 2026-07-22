"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Mail, Lock, User, Phone, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/lib/translations";
import Navbar from "@/components/Navbar";

export default function RegisterPage() {
  const { register } = useAuth();
  const { lang } = useLanguage();
  const [data, setData] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await register(data);
      setMessage(t("register.success", lang));
      setData({ name: "", email: "", phone: "", password: "" });
    }
    catch (err: any) { setError(err.message || "Registration failed"); }
    finally { setLoading(false); }
  };

  return (
    <><Navbar />
    <main className="pt-16 min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-4">
        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-pink-100/50 border border-pink-100">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white mx-auto mb-4"><Sparkles size={28} /></div>
            <h1 className="text-2xl font-bold text-gray-900">{t("register.createAccount", lang)}</h1>
            <p className="text-gray-500 text-sm mt-1">{t("register.desc", lang)}</p>
          </div>
          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>}
          {message && <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 rounded-xl text-sm flex gap-2"><ShieldCheck size={18} className="shrink-0 mt-0.5" />{message}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative"><User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={data.name} onChange={e => setData({ ...data, name: e.target.value })} placeholder={t("register.fullName", lang)} required className="w-full pl-10 p-3.5 rounded-xl border border-pink-200 focus:ring-2 focus:ring-pink-300 outline-none" /></div>
            <div className="relative"><Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="email" value={data.email} onChange={e => setData({ ...data, email: e.target.value })} placeholder={t("register.email", lang)} required className="w-full pl-10 p-3.5 rounded-xl border border-pink-200 focus:ring-2 focus:ring-pink-300 outline-none" /></div>
            <div className="relative"><Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="tel" inputMode="tel" value={data.phone} onChange={e => setData({ ...data, phone: e.target.value })} placeholder={t("register.phone", lang)} required className="w-full pl-10 p-3.5 rounded-xl border border-pink-200 focus:ring-2 focus:ring-pink-300 outline-none" /></div>
            <div className="relative"><Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="password" value={data.password} onChange={e => setData({ ...data, password: e.target.value })} placeholder={t("register.password", lang)} required minLength={6} className="w-full pl-10 p-3.5 rounded-xl border border-pink-200 focus:ring-2 focus:ring-pink-300 outline-none" /></div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">{loading ? t("register.creating", lang) : t("register.createBtn", lang)}</button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">{t("register.alreadyVerified", lang)} <Link href="/login" className="text-pink-600 font-semibold hover:underline">{t("register.signIn", lang)}</Link></p>
        </div>
      </motion.div>
    </main></>
  );
}
