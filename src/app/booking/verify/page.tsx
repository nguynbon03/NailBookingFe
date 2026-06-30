"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";
import { AlertCircle, CalendarCheck2, CheckCircle2, Loader2 } from "lucide-react";

export default function BookingVerifyPage() {
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState("Confirming your booking email...");
  const [booking, setBooking] = useState<any | null>(null);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token") || "";
    if (!token) {
      setStatus("error");
      setMessage("Booking verification token is missing.");
      return;
    }
    api.bookings.verify(token)
      .then((result: any) => {
        setStatus("ok");
        setBooking(result.booking || null);
        setMessage(result.alreadyVerified
          ? "This booking email was already confirmed. The shop can now review it."
          : "Thank you. Your email is confirmed. The shop/admin can now review and confirm the booking. Staff will only see it after admin confirmation."
        );
      })
      .catch((err: any) => {
        setStatus("error");
        setMessage(err.message || "Booking verification failed.");
      });
  }, []);

  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center px-4">
        <div className="max-w-lg w-full bg-white border border-pink-100 rounded-3xl p-8 text-center shadow-xl shadow-pink-100/50">
          <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center bg-pink-50 text-pink-600">
            {status === "loading" ? <Loader2 className="animate-spin" size={30} /> : status === "ok" ? <CheckCircle2 size={34} /> : <AlertCircle size={34} />}
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-3">Booking Email Confirmation</h1>
          <p className="text-gray-600 text-sm leading-relaxed mb-5">{message}</p>
          {booking && (
            <div className="rounded-2xl bg-gray-50 p-4 text-left text-sm text-gray-700 mb-6 space-y-1">
              <p><span className="font-bold">Name:</span> {booking.customerName}</p>
              <p><span className="font-bold">Date:</span> {String(booking.date).slice(0, 10)} at {booking.time}</p>
              <p><span className="font-bold">Status:</span> Awaiting shop/admin confirmation</p>
            </div>
          )}
          <Link href="/" className="btn-primary inline-flex items-center gap-2"><CalendarCheck2 size={16} /> Back to Home</Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
