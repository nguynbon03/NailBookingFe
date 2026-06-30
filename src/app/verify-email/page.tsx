"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";
import { AlertCircle, CheckCircle2, Loader2, Mail } from "lucide-react";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token") || "";
    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing.");
      return;
    }
    api.auth.verifyEmail(token)
      .then((result: any) => {
        setStatus("ok");
        setMessage(result.alreadyVerified ? "This email was already verified." : "Your email is verified. You can now sign in and book online.");
      })
      .catch((err: any) => {
        setStatus("error");
        setMessage(err.message || "Verification failed.");
      });
  }, []);

  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-pink-100 rounded-3xl p-8 text-center shadow-xl shadow-pink-100/50">
          <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center bg-pink-50 text-pink-600">
            {status === "loading" ? <Loader2 className="animate-spin" size={30} /> : status === "ok" ? <CheckCircle2 size={34} /> : <AlertCircle size={34} />}
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-3">Email Verification</h1>
          <p className="text-gray-600 text-sm leading-relaxed mb-6">{message}</p>
          {status === "ok" ? (
            <Link href="/login" className="btn-primary inline-flex items-center gap-2"><Mail size={16} /> Sign in</Link>
          ) : (
            <Link href="/register" className="btn-secondary inline-flex">Back to Register</Link>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
