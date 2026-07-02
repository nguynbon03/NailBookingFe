"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";

type Channel = "auto" | "whatsapp" | "sms";

function normalizePhoneForDisplay(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("0")) return "+84" + digits.slice(1);
  if (digits.startsWith("84")) return "+" + digits;
  if (value.trim().startsWith("+")) return value.trim();
  return value.trim();
}

export default function VerifyPhonePage() {
  const [phone, setPhone] = useState("0339351204");
  const [otp, setOtp] = useState("");
  const [channel, setChannel] = useState<Channel>("auto");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const normalizedPhone = useMemo(() => normalizePhoneForDisplay(phone), [phone]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setSending(true);
    try {
      const result = await api.otp.send(normalizedPhone, channel);
      setMessage(`OTP sent to ${result.phone || normalizedPhone} via ${result.channel || channel}. Check WhatsApp first, SMS fallback second.`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not send OTP");
    } finally {
      setSending(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setVerifying(true);
    try {
      const result = await api.otp.verify(normalizedPhone, otp);
      if (!result.success) throw new Error(result.message || "Invalid OTP");
      setMessage("Phone verified successfully. You can continue booking safely.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not verify OTP");
    } finally {
      setVerifying(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-white px-4 pt-24 pb-12">
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-2xl rounded-[2rem] border border-pink-100 bg-white p-6 shadow-xl shadow-pink-100/60 md:p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-200">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-3xl font-black text-gray-900">Secure Phone OTP</h1>
            <p className="mt-2 text-sm text-gray-500">WhatsApp is the primary channel. SMS is used only as a fallback. Codes expire after 5 minutes and are rate-limited to prevent spam.</p>
          </div>

          {message && <div className="mb-4 flex gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />{message}</div>}
          {error && <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

          <form onSubmit={handleSend} className="space-y-4 rounded-3xl border border-pink-100 bg-pink-50/40 p-4">
            <label className="block text-sm font-bold text-gray-700">Phone number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-pink-400" />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-2xl border border-pink-200 bg-white py-3.5 pl-12 pr-4 outline-none ring-pink-200 focus:ring-4" placeholder="0339351204 or +84339351204" required />
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              {(["auto", "whatsapp", "sms"] as Channel[]).map((item) => (
                <button key={item} type="button" onClick={() => setChannel(item)} className={`rounded-2xl border px-3 py-2 font-bold capitalize ${channel === item ? "border-pink-500 bg-pink-500 text-white" : "border-pink-100 bg-white text-gray-600"}`}>{item}</button>
              ))}
            </div>
            <button type="submit" disabled={sending} className="btn-primary w-full py-3.5">
              {sending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <MessageCircle className="mr-2 h-5 w-5" />}
              {sending ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>

          <form onSubmit={handleVerify} className="mt-5 space-y-4 rounded-3xl border border-gray-100 bg-white p-4">
            <label className="block text-sm font-bold text-gray-700">Enter 6-digit OTP</label>
            <input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" className="w-full rounded-2xl border border-pink-200 bg-white p-4 text-center text-3xl font-black tracking-[0.5em] outline-none ring-pink-200 focus:ring-4" placeholder="000000" required />
            <button type="submit" disabled={verifying || otp.length < 4} className="btn-primary w-full py-3.5">
              {verifying ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
              {verifying ? "Verifying..." : "Verify OTP"}
            </button>
          </form>

          <div className="mt-6 rounded-2xl bg-gray-50 p-4 text-xs leading-6 text-gray-500">
            <p><b>Security:</b> OTP is hashed server-side, expires in 5 minutes, max 5 attempts, max 3 sends per phone / 5 minutes.</p>
            <p><b>Next:</b> after verification, integrate this same endpoint into register/login/booking gates.</p>
          </div>
          <p className="mt-5 text-center text-sm text-gray-500"><Link href="/booking" className="font-bold text-pink-600 hover:underline">Back to booking</Link></p>
        </motion.section>
      </main>
    </>
  );
}
