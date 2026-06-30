"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { AlertCircle, CalendarDays, Clock, MessageCircle, Phone, Scissors, Tag, XCircle } from "lucide-react";

function money(value: number) {
  return `£${Number(value || 0).toFixed(2)}`;
}

function staffDisplay(booking: Booking) {
  if (booking.staff?.name) return booking.staff.name;
  if (booking.requestedStaff?.name) return `Requested: ${booking.requestedStaff.name}`;
  return "Any Staff";
}

function statusMeta(booking: Booking) {
  if (booking.status === "CONFIRMED") return { label: "Confirmed", tone: "bg-emerald-50 text-emerald-700", note: "Your appointment is confirmed. Show this page when you arrive." };
  if (booking.status === "PENDING" && booking.depositRequired) return { label: "Deposit needed", tone: "bg-orange-50 text-orange-700", note: `A deposit${booking.depositAmount ? ` of ${money(booking.depositAmount)}` : ""} is required before staff assignment.` };
  if (booking.status === "PENDING") return { label: "Waiting for staff", tone: "bg-sky-50 text-sky-700", note: "Your request is waiting for staff acceptance. You will get an email after it is confirmed." };
  if (booking.status === "CANCELLED") return { label: "Cancelled", tone: "bg-red-50 text-red-700", note: "This booking has been cancelled." };
  if (booking.status === "COMPLETED") return { label: "Completed", tone: "bg-blue-50 text-blue-700", note: "This appointment is completed." };
  if (booking.status === "NO_SHOW") return { label: "No-show", tone: "bg-gray-50 text-gray-700", note: "This booking was marked as no-show." };
  return { label: booking.status, tone: "bg-gray-50 text-gray-700", note: "" };
}

type Booking = {
  id: string;
  date: string;
  time: string;
  status: string;
  totalPrice: number;
  discount: number | null;
  promoCode: string | null;
  cancellationReason?: string | null;
  notes?: string | null;
  staff?: { name: string } | null;
  requestedStaff?: { name: string } | null;
  depositRequired?: boolean;
  depositAmount?: number | null;
  services?: { service: { name: string; image?: string | null; price: number; duration: number } }[];
};

export default function MyBookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [submittingCancel, setSubmittingCancel] = useState(false);

  const refresh = () => {
    setLoading(true);
    api.bookings.my()
      .then((d: any) => setBookings(d.bookings || []))
      .catch((err: any) => setError(err.message || "Could not load your bookings"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      window.location.href = "/login";
      return;
    }
    refresh();
  }, [authLoading, user]);

  const submitCancelRequest = async () => {
    if (!cancelTarget || !cancelReason.trim()) {
      setError("Please enter why you need to cancel.");
      return;
    }
    setSubmittingCancel(true);
    setError("");
    setMessage("");
    try {
      const result = await api.bookings.requestCancel(cancelTarget.id, cancelReason.trim());
      if (result?.booking) setBookings((items) => items.map((item) => item.id === cancelTarget.id ? { ...item, ...result.booking } : item));
      setMessage("Cancellation request sent to admin. The shop will review and confirm by email/phone.");
      setCancelTarget(null);
      setCancelReason("");
    } catch (err: any) {
      setError(err.message || "Could not send cancellation request");
    } finally {
      setSubmittingCancel(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="pt-24 min-h-screen bg-gradient-to-b from-pink-50/40 to-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-center justify-between gap-4 mb-8">
            <div>
              <p className="text-pink-500 font-semibold mb-2">Customer Area</p>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">My Bookings</h1>
              <p className="text-gray-500 mt-2">Track your appointments and show this page to the shop when you arrive.</p>
            </div>
            <Link href="/booking" className="btn-primary shrink-0">Book Again</Link>
          </div>

          {message && <div className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">{message}</div>}
          {loading || authLoading ? (
            <div className="bg-white rounded-3xl border border-pink-100 p-10 text-center text-gray-400">Loading your bookings...</div>
          ) : error ? (
            <div className="bg-red-50 rounded-3xl border border-red-100 p-6 text-red-600">{error}</div>
          ) : bookings.length === 0 ? (
            <div className="bg-white rounded-3xl border border-pink-100 p-10 text-center">
              <CalendarDays size={40} className="mx-auto text-pink-400 mb-3" />
              <h2 className="font-bold text-gray-900 mb-2">No bookings yet</h2>
              <p className="text-gray-500 mb-5">Create your first appointment online.</p>
              <Link href="/booking" className="btn-primary">Book Now</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const firstService = booking.services?.[0]?.service;
                const meta = statusMeta(booking);
                return (
                  <div key={booking.id} className="bg-white rounded-3xl border border-pink-100 p-5 sm:p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row gap-5">
                      <div className="w-full sm:w-28 h-28 rounded-2xl overflow-hidden bg-gradient-to-br from-pink-100 to-rose-100 shrink-0 flex items-center justify-center text-pink-400">
                        {firstService?.image ? (
                          <img src={firstService.image} alt={firstService.name} className="w-full h-full object-cover" />
                        ) : (
                          <Scissors size={32} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                          <div>
                            <h2 className="font-bold text-lg text-gray-900">{booking.services?.map((s) => s.service.name).join(", ") || "Appointment"}</h2>
                            <p className="text-sm text-gray-500">Staff: {staffDisplay(booking)}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${meta.tone}`}>{meta.label}</span>
                        </div>
                        <div className="grid sm:grid-cols-3 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-gray-600"><CalendarDays size={16} className="text-pink-500" />{new Date(booking.date).toLocaleDateString()}</div>
                          <div className="flex items-center gap-2 text-gray-600"><Clock size={16} className="text-pink-500" />{booking.time}</div>
                          <div className="flex items-center gap-2 text-gray-600"><Phone size={16} className="text-pink-500" />{booking.status === "CONFIRMED" ? "Show at shop" : "Wait for confirmation"}</div>
                        </div>
                        {meta.note && <div className={`mt-3 rounded-2xl p-3 text-sm font-semibold ${meta.tone}`}>{meta.note}</div>}
                        {booking.cancellationReason?.startsWith("Customer requested") && (
                          <div className="mt-3 rounded-2xl border border-amber-100 bg-amber-50 p-3 text-sm text-amber-800 flex gap-2">
                            <AlertCircle size={16} className="shrink-0 mt-0.5" /> Cancellation request sent. Waiting for shop review.
                          </div>
                        )}
                        <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-pink-50">
                          <span className="font-bold text-gray-900">Total: {money(booking.totalPrice)}</span>
                          {booking.discount ? <span className="flex items-center gap-1 text-green-600 text-sm"><Tag size={14} />-{money(booking.discount)} {booking.promoCode}</span> : null}
                          <span className="text-xs text-gray-400">Booking ID: {booking.id.slice(-8).toUpperCase()}</span>
                          {!["CANCELLED", "COMPLETED", "NO_SHOW"].includes(booking.status) && !booking.cancellationReason?.startsWith("Customer requested") && (
                            <button onClick={() => { setCancelTarget(booking); setCancelReason(""); }} className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-black text-gray-500 hover:border-red-100 hover:bg-red-50 hover:text-red-600">
                              <XCircle size={14} /> {booking.status === "CONFIRMED" ? "Need to cancel?" : "Request cancel"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3 sm:items-center">
          <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl">
            <div className="mb-4 flex gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600"><MessageCircle size={22} /></div>
              <div><h3 className="text-lg font-black text-gray-900">Request cancellation</h3><p className="mt-1 text-sm text-gray-500">Tell the shop why you need to cancel. Admin will review before the booking is cancelled.</p></div>
            </div>
            <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} className="mb-3 min-h-28 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-pink-300" placeholder="Example: I am busy at this time and need to cancel." />
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setCancelTarget(null)} className="btn-secondary min-h-11">Back</button>
              <button onClick={submitCancelRequest} disabled={submittingCancel} className="min-h-11 rounded-xl bg-red-600 font-bold text-white disabled:bg-gray-300">{submittingCancel ? "Sending..." : "Send request"}</button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
}
