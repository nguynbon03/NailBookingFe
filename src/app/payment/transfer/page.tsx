"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";
import { AlertCircle, CheckCircle2, Clock3, Copy, Loader2, PoundSterling, ShieldCheck } from "lucide-react";
import { formatPrice } from "@/lib/service-utils";

type HoldState = "loading" | "locked" | "error";

function secondsLeft(value?: string | null) {
  if (!value) return 0;
  return Math.max(0, Math.floor((new Date(value).getTime() - Date.now()) / 1000));
}

export default function TransferPaymentPage() {
  const [state, setState] = useState<HoldState>("loading");
  const [error, setError] = useState("");
  const [result, setResult] = useState<any | null>(null);
  const [left, setLeft] = useState(0);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token") || "";
    if (!token) {
      setState("error");
      setError("Transfer token is missing.");
      return;
    }
    api.payments.hold(token)
      .then((data: any) => {
        setResult(data);
        setLeft(secondsLeft(data.expiresAt));
        setState("locked");
      })
      .catch((err: any) => {
        setError(err.message || "Could not lock staff slot.");
        setState("error");
      });
  }, []);

  useEffect(() => {
    if (state !== "locked") return;
    const t = setInterval(() => setLeft(secondsLeft(result?.expiresAt)), 1000);
    return () => clearInterval(t);
  }, [state, result?.expiresAt]);

  const booking = result?.booking;
  const bank = result?.bank || {};
  const reference = result?.reference || booking?.paymentReference || (booking?.id ? `NL-${booking.id.slice(-8).toUpperCase()}` : "");
  const services = useMemo(() => (booking?.services || []).map((item: any) => item.service?.name).filter(Boolean).join(", "), [booking]);
  const copy = async (value: string) => { try { await navigator.clipboard.writeText(value); } catch {} };

  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen bg-gradient-to-b from-pink-50 to-white px-4 py-10">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-pink-100 shadow-xl shadow-pink-100/50 p-5 sm:p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center mx-auto mb-4">
              {state === "loading" ? <Loader2 className="animate-spin" size={30} /> : state === "locked" ? <ShieldCheck size={32} /> : <AlertCircle size={32} />}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Secure Bank Transfer</h1>
            <p className="text-sm text-gray-500 mt-2">Opening this page locks one staff member for your selected date/time for 3 minutes.</p>
          </div>

          {state === "loading" && <div className="rounded-2xl bg-gray-50 p-6 text-center text-gray-500">Locking staff slot...</div>}

          {state === "error" && (
            <div className="rounded-2xl bg-red-50 border border-red-100 p-5 text-red-700 text-sm">
              <b>Cannot continue:</b> {error}
              <div className="mt-4"><Link href="/booking" className="btn-primary inline-flex">Choose another slot</Link></div>
            </div>
          )}

          {state === "locked" && booking && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 flex gap-3 text-emerald-800">
                <CheckCircle2 size={22} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-black">Staff slot locked</p>
                  <p className="text-sm">Transfer within this window. Admin will confirm payment before this appears on staff schedule.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-2xl bg-gray-50 p-4"><p className="text-xs text-gray-400 font-black uppercase">Reference</p><button onClick={() => copy(reference)} className="mt-1 font-black text-gray-900 inline-flex items-center gap-1">{reference}<Copy size={14} /></button></div>
                <div className="rounded-2xl bg-gray-50 p-4"><p className="text-xs text-gray-400 font-black uppercase">Amount</p><p className="mt-1 font-black text-pink-600"><PoundSterling size={15} className="inline" /> {formatPrice(booking.totalPrice)}</p></div>
                <div className="rounded-2xl bg-gray-50 p-4"><p className="text-xs text-gray-400 font-black uppercase">Lock timer</p><p className="mt-1 font-black text-orange-600"><Clock3 size={15} className="inline" /> {left}s</p></div>
              </div>

              <div className="rounded-2xl border border-pink-100 p-4 text-sm text-gray-700 space-y-2">
                <p><b>Name:</b> {booking.customerName}</p>
                <p><b>Service:</b> {services || "Selected service"}</p>
                <p><b>Date/time:</b> {String(booking.date).slice(0, 10)} at {booking.time}</p>
                <p><b>Assigned staff hold:</b> {booking.staff?.name || "Locked staff"}</p>
              </div>

              <div className="rounded-2xl bg-gray-900 text-white p-5 space-y-3">
                <h2 className="text-lg font-black">Bank details</h2>
                <p><span className="text-gray-400">Account name:</span> <b>{bank.accountName || "The Nail Lounge @ Stokesley"}</b></p>
                {bank.bankName && <p><span className="text-gray-400">Bank:</span> <b>{bank.bankName}</b></p>}
                {bank.sortCode && <p><span className="text-gray-400">Sort code:</span> <button onClick={() => copy(bank.sortCode)} className="font-black underline">{bank.sortCode}</button></p>}
                {bank.accountNumber && <p><span className="text-gray-400">Account number:</span> <button onClick={() => copy(bank.accountNumber)} className="font-black underline">{bank.accountNumber}</button></p>}
                <p><span className="text-gray-400">Transfer reference:</span> <button onClick={() => copy(reference)} className="font-black underline">{reference}</button></p>
                <p className="text-xs text-gray-300">{bank.instructions}</p>
              </div>

              {left <= 0 && <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4 text-sm text-amber-800">The 3-minute lock has expired. Do not transfer until you create a new lock or contact the shop.</div>}
              <Link href="/my-bookings" className="btn-secondary inline-flex">View my bookings</Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
