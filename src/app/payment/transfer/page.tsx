"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";
import { AlertCircle, CheckCircle2, Clock3, Loader2, PoundSterling, ShieldCheck } from "lucide-react";
import { formatPrice } from "@/lib/service-utils";

type PaymentState = "loading" | "success" | "resolution" | "error";

export default function TransferPaymentPage() {
  const [state, setState] = useState<PaymentState>("loading");
  const [error, setError] = useState("");
  const [result, setResult] = useState<any | null>(null);

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
        setState(data.needsAdminResolution ? "resolution" : "success");
      })
      .catch((err: any) => {
        setError(err.message || "Could not confirm secure transfer.");
        setState("error");
      });
  }, []);

  const booking = result?.booking;
  const reference = result?.reference || booking?.paymentReference || (booking?.id ? `NL-${booking.id.slice(-8).toUpperCase()}` : "");
  const services = useMemo(() => (booking?.services || []).map((item: any) => item.service?.name).filter(Boolean).join(", "), [booking]);
  const assignedStaff = booking?.staff?.name || booking?.requestedStaff?.name || "Shop team";

  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen bg-gradient-to-b from-pink-50 to-white px-4 py-10">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-pink-100 shadow-xl shadow-pink-100/50 p-5 sm:p-8">
          <div className="text-center mb-6">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${state === "resolution" ? "bg-amber-50 text-amber-600" : state === "error" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}>
              {state === "loading" ? <Loader2 className="animate-spin" size={30} /> : state === "error" ? <AlertCircle size={32} /> : state === "resolution" ? <Clock3 size={32} /> : <ShieldCheck size={32} />}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Secure Bank Transfer</h1>
            <p className="text-sm text-gray-500 mt-2">Opening your secure link now records the payment. No extra transfer confirmation button is needed.</p>
          </div>

          {state === "loading" && <div className="rounded-2xl bg-gray-50 p-6 text-center text-gray-500">Confirming your secure transfer...</div>}

          {state === "error" && (
            <div className="rounded-2xl bg-red-50 border border-red-100 p-5 text-red-700 text-sm">
              <b>Cannot continue:</b> {error}
              <div className="mt-4"><Link href="/booking" className="btn-primary inline-flex">Choose another slot</Link></div>
            </div>
          )}

          {(state === "success" || state === "resolution") && booking && (
            <div className="space-y-5">
              {state === "success" ? (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 flex gap-3 text-emerald-800">
                  <CheckCircle2 size={22} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="font-black">Payment recorded — booking confirmed</p>
                    <p className="text-sm">Your booking is confirmed and assigned to {assignedStaff}. The shop has been notified.</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 flex gap-3 text-amber-800">
                  <Clock3 size={22} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="font-black">Payment recorded — shop will resolve staff/time</p>
                    <p className="text-sm">No staff was free at this exact time. Admin will contact you to move the booking, find a replacement staff member, or arrange a refund if needed.</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-2xl bg-gray-50 p-4"><p className="text-xs text-gray-400 font-black uppercase">Reference</p><p className="mt-1 font-black text-gray-900">{reference}</p></div>
                <div className="rounded-2xl bg-gray-50 p-4"><p className="text-xs text-gray-400 font-black uppercase">Amount</p><p className="mt-1 font-black text-pink-600"><PoundSterling size={15} className="inline" /> {formatPrice(booking.totalPrice)}</p></div>
                <div className="rounded-2xl bg-gray-50 p-4"><p className="text-xs text-gray-400 font-black uppercase">Status</p><p className={`mt-1 font-black ${state === "success" ? "text-emerald-600" : "text-amber-600"}`}>{state === "success" ? "Confirmed" : "Admin review"}</p></div>
              </div>

              <div className="rounded-2xl border border-pink-100 p-4 text-sm text-gray-700 space-y-2">
                <p><b>Name:</b> {booking.customerName}</p>
                <p><b>Service:</b> {services || "Selected service"}</p>
                <p><b>Date/time:</b> {String(booking.date).slice(0, 10)} at {booking.time}</p>
                <p><b>Staff:</b> {state === "success" ? assignedStaff : "Pending admin arrangement"}</p>
              </div>

              <div className="rounded-3xl border border-pink-100 bg-gradient-to-r from-pink-50 to-rose-50 p-5">
                <h3 className="font-black text-gray-900 mb-2">What happens next?</h3>
                <p className="text-sm text-gray-600">{result?.message || (state === "success" ? "You can view your confirmed appointment in My Bookings." : "The Nail Lounge team will contact you if they need to change staff or time.")}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link href="/my-bookings" className="btn-primary inline-flex">View my bookings</Link>
                <Link href="/booking" className="btn-secondary inline-flex">Book another slot</Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
