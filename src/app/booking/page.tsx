"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Clock, CalendarDays, User, Phone, Mail, MessageSquare,
  Check, Sparkles, Upload, Tag, ShieldCheck, Heart, Stethoscope, ImagePlus,
  X, Star, AlertCircle
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { fallbackServices, formatDuration, formatPrice, normalizeServices, type PublicService } from "@/lib/service-utils";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
];

function isEmailAddress(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function bookingReference(id?: string) {
  return id ? `NL-${id.slice(-8).toUpperCase()}` : "NL-PENDING";
}

type Staff = { id: string; name: string; email: string; role: string; active: boolean; avatar?: string | null };
type Slot = { time: string; availableStaffCount: number; staffIds: string[] };

export default function BookingPage() {
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [formData, setFormData] = useState({
    name: "", phone: "", email: "", emailConfirm: "", notes: "",
    promoCode: "", healthConfirmed: false, allergiesConfirmed: false, termsAccepted: false,
  });
  const [selectedStaff, setSelectedStaff] = useState("any");
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [services, setServices] = useState<PublicService[]>(fallbackServices());
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<any | null>(null);
  const [verificationInfo, setVerificationInfo] = useState<any | null>(null);
  const [promoError, setPromoError] = useState("");

  useEffect(() => {
    api.staff.list().then((d: any) => setStaffList(d.staff || [])).catch(() => {});
    api.services.list().then((d: any) => {
      const live = normalizeServices(d.services || []);
      if (live.length) {
        setServices(live);
        const saved = typeof window !== "undefined" ? localStorage.getItem("selectedService") : "";
        if (saved) {
          const match = live.find((s) => s.id === saved || s.name === saved);
          if (match) setSelectedService(match.id);
        }
      }
    }).catch(() => {
      const saved = typeof window !== "undefined" ? localStorage.getItem("selectedService") : "";
      if (saved) {
        const match = services.find((s) => s.id === saved || s.name === saved);
        if (match) setSelectedService(match.id);
      }
    });
  }, []);

  useEffect(() => {
    if (authLoading || !user) return;
    setFormData((current) => ({
      ...current,
      name: current.name || user.name || "",
      phone: current.phone || user.phone || "",
      email: user.email || current.email,
      emailConfirm: current.emailConfirm || user.email || "",
    }));
  }, [authLoading, user?.id, user?.email, user?.name, user?.phone]);

  const service = services.find((s) => s.id === selectedService || s.name === selectedService);
  const basePrice = service ? service.price : 0;
  const finalPrice = Math.max(0, basePrice - discount);
  const accountEmail = (user?.email || "").trim().toLowerCase();
  const bookingEmail = formData.email.trim().toLowerCase();
  const confirmEmail = formData.emailConfirm.trim().toLowerCase();
  const emailValid = isEmailAddress(formData.email);
  const emailMatchesAccount = Boolean(user && accountEmail && bookingEmail === accountEmail);
  const emailConfirmMatchesAccount = Boolean(user && accountEmail && confirmEmail === accountEmail);

  useEffect(() => {
    setSelectedTime("");
    setSlotsError("");
    setAvailableSlots([]);
    if (!selectedDate || !service?.id) return;

    setSlotsLoading(true);
    api.availability.slots(selectedDate, service.id, selectedStaff)
      .then((d: any) => {
        setAvailableSlots(d.slots || []);
        if (!(d.slots || []).length) setSlotsError("No staff is free for this date. Please choose another date or staff.");
      })
      .catch((err: any) => {
        setAvailableSlots([]);
        setSlotsError(err.message || "Could not load available slots");
      })
      .finally(() => setSlotsLoading(false));
  }, [selectedDate, selectedStaff, service?.id]);

  const handleNext = () => { if (step < 4) setStep(step + 1); };
  const handleBack = () => { if (step > 1) setStep(step - 1); };

  const applyPromo = async () => {
    const code = formData.promoCode.trim().toUpperCase();
    if (!code) return;
    try {
      const result = await api.promoCodes.validate(code, basePrice);
      setDiscount(Number(result.discount || 0));
      setPromoError("");
    } catch (err: any) {
      setDiscount(0);
      setPromoError(err.message || "Invalid promotion code");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setUploadedImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => setUploadedImage(null);

  const handleSubmit = async () => {
    if (!user) {
      alert("Please sign in before booking online.");
      window.location.href = "/login?next=/booking";
      return;
    }
    if (!emailMatchesAccount || !emailConfirmMatchesAccount) {
      alert("The booking email and confirmation email must both match your signed-in account email.");
      return;
    }
    if (!formData.termsAccepted) return;
    setLoading(true);
    try {
      const result = await api.bookings.create({
        customerName: formData.name,
        customerPhone: formData.phone,
        customerEmail: user?.email || formData.email,
        date: selectedDate,
        time: selectedTime,
        serviceIds: service ? [service.id] : [],
        staffId: selectedStaff === "any" ? null : selectedStaff,
        notes: formData.notes,
        promoCode: formData.promoCode || null,
        discount: discount > 0 ? discount : null,
        imageBase64: uploadedImage,
        healthConfirmed: formData.healthConfirmed,
        allergiesConfirmed: formData.allergiesConfirmed,
        termsAccepted: formData.termsAccepted,
      });
      setCreatedBooking(result.booking || null);
      setVerificationInfo(result.verification || null);
      setSubmitted(true);
    } catch (e: any) {
      alert(e.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  const canProceed =
    (step === 1 && selectedService) ||
    (step === 2 && selectedDate) ||
    (step === 3 && selectedTime) ||
    step === 4;

  const step4Valid = Boolean(user && formData.name && formData.phone && emailValid && emailMatchesAccount && emailConfirmMatchesAccount && formData.termsAccepted);

  if (!authLoading && !user) {
    return (
      <>
        <Navbar />
        <main className="pt-20 min-h-screen bg-gradient-to-b from-pink-50/30 to-white flex items-center justify-center px-4">
          <div className="max-w-lg w-full bg-white rounded-3xl border border-pink-100 shadow-xl shadow-pink-100/50 p-8 text-center">
            <ShieldCheck size={42} className="mx-auto text-pink-600 mb-4" />
            <h1 className="text-2xl font-black text-gray-900 mb-2">Sign in required</h1>
            <p className="text-sm text-gray-500 mb-6">Please sign in or register first. Booking email must match the verified account email before a transfer link is sent.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link href="/login?next=/booking" className="btn-primary">Sign In</Link>
              <Link href="/register" className="btn-secondary">Register</Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (submitted) {
    const reference = verificationInfo?.reference || bookingReference(createdBooking?.id);
    return (
      <>
        <Navbar />
        <main className="pt-16 min-h-screen bg-gradient-to-b from-pink-50/30 to-white flex items-center justify-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
            <div className="bg-white rounded-3xl border border-pink-100 shadow-xl shadow-pink-100/60 p-5 sm:p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white mx-auto mb-5 shadow-lg shadow-pink-200">
                <Mail size={38} />
              </div>
              <h1 className="text-3xl font-black text-gray-900 mb-3">Check Your Email</h1>
              <p className="text-gray-600 mb-2">Thank you, {formData.name}. Your booking request has been received.</p>
              <p className="text-sm text-pink-600 font-bold mb-5">We sent a secure bank-transfer link to {formData.email}. Open it within 3 minutes to lock one available staff member for this time slot, then transfer with reference {reference}. Admin will confirm payment before the job appears on staff schedule.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-400 font-black">Booking reference</p>
                  <p className="text-2xl font-black text-gray-900 tracking-wide">{reference}</p>
                </div>
                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-400 font-black">Current status</p>
                  <p className="text-sm font-black text-orange-600">Awaiting transfer link click</p>
                </div>
                <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-700 space-y-1 sm:col-span-2">
                  <p><span className="font-bold">Date:</span> {selectedDate} at {selectedTime}</p>
                  <p><span className="font-bold">Service:</span> {service?.name}</p>
                  <p><span className="font-bold">Email:</span> {formData.email}</p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-orange-50 border border-orange-100 p-4 text-left text-sm text-orange-800 flex gap-3">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <p>This request is not confirmed yet. Only transfer after opening the secure email link successfully; admin confirms payment manually and then the assigned staff schedule is updated.</p>
              </div>
              <Link href="/" className="btn-primary inline-flex mt-6">Back to Home</Link>
            </div>
          </motion.div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-gradient-to-b from-pink-50/30 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-50 rounded-full text-pink-600 text-sm font-semibold mb-4">
                <Sparkles size={16} /> Book Your Appointment
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gradient mb-2">Online Booking</h1>
              <p className="text-gray-500">Select your service, date, and time. We&apos;ll confirm shortly.</p>
            </div>

            {/* Progress */}
            <div className="flex items-center justify-between mb-10 max-w-md mx-auto">
              {["Service", "Date", "Time", "Details"].map((label, i) => (
                <div key={label} className="flex flex-col items-center">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                    i + 1 <= step
                      ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-200"
                      : "bg-gray-100 text-gray-400"
                  )}>
                    {i + 1 < step ? <Check size={18} /> : i + 1}
                  </div>
                  <span className={cn("text-xs mt-1.5 font-medium", i + 1 <= step ? "text-pink-600" : "text-gray-400")}>{label}</span>
                </div>
              ))}
            </div>

            {/* Steps */}
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="text-lg font-bold mb-5">Select a Service</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {services.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedService(s.id)}
                        className={cn(
                          "text-left p-4 rounded-2xl border transition-all flex items-center gap-3",
                          selectedService === s.id
                            ? "border-pink-400 bg-pink-50 shadow-md shadow-pink-100"
                            : "border-gray-100 bg-white hover:border-pink-200 hover:shadow-sm"
                        )}
                      >
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center text-pink-400 font-bold text-lg shrink-0 overflow-hidden">
                          {s.image ? (
                            <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
                          ) : (
                            s.name.charAt(0)
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">{s.name}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                            <Clock size={12} />{formatDuration(s.duration)}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-pink-600 text-sm">{formatPrice(s.price)}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="text-lg font-bold mb-5">Select a Date</h3>
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-pink-100">
                    <div className="flex items-center gap-2 mb-4 text-pink-600">
                      <CalendarDays size={20} />
                      <span className="font-semibold">Choose your preferred date</span>
                    </div>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full p-4 rounded-xl border border-pink-200 focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none transition-all text-gray-700"
                    />
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="text-lg font-bold mb-5">Select Staff & Available Time</h3>
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-pink-100 space-y-6">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"><User size={16} /> Staff availability</label>
                      <p className="text-xs text-gray-400 mb-3">Only staff with a free working slot will show available times.</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <button onClick={() => setSelectedStaff("any")} className={cn(
                          "p-3 rounded-xl border text-sm font-medium transition-all",
                          selectedStaff === "any" ? "border-pink-400 bg-pink-50 text-pink-700" : "border-gray-200 hover:border-pink-200"
                        )}>
                          <Star size={14} className="inline mr-1" /> Any Staff
                        </button>
                        {staffList.map((st) => (
                          <button key={st.id} onClick={() => setSelectedStaff(st.id)} className={cn(
                            "p-3 rounded-xl border text-sm font-medium transition-all flex items-center gap-2 text-left",
                            selectedStaff === st.id ? "border-pink-400 bg-pink-50 text-pink-700" : "border-gray-200 hover:border-pink-200"
                          )}>
                            <span className="w-8 h-8 rounded-full bg-pink-50 overflow-hidden flex items-center justify-center text-pink-400 shrink-0">
                              {st.avatar ? <img src={st.avatar} alt={st.name} className="w-full h-full object-cover" /> : st.name.charAt(0)}
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate">{st.name}</span>
                              <span className={cn("mt-1 w-2 h-2 rounded-full inline-block", st.active ? "bg-green-500" : "bg-red-400")} />
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 mb-4">Available slots for {selectedDate}</p>
                      {slotsLoading ? (
                        <div className="rounded-xl bg-gray-50 p-6 text-center text-gray-400">Checking staff availability...</div>
                      ) : slotsError ? (
                        <div className="rounded-xl bg-amber-50 p-4 text-amber-700 text-sm">{slotsError}</div>
                      ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                          {availableSlots.map((slot) => (
                            <button
                              key={slot.time}
                              onClick={() => setSelectedTime(slot.time)}
                              className={cn(
                                "py-3 px-4 rounded-xl text-sm font-semibold transition-all",
                                selectedTime === slot.time
                                  ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-200"
                                  : "bg-gray-50 text-gray-700 hover:bg-pink-50 hover:text-pink-600"
                              )}
                            >
                              {slot.time}
                              <span className="block text-[10px] opacity-70">{slot.availableStaffCount} free</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="text-lg font-bold mb-5">Confirm Details</h3>
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-pink-100 space-y-5">
                    {/* Contact info */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="relative">
                        <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input placeholder="Full Name *" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full pl-10 p-4 rounded-xl border border-pink-200 focus:ring-2 focus:ring-pink-300 outline-none" />
                      </div>
                      <div className="relative">
                        <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input placeholder="Phone Number *" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full pl-10 p-4 rounded-xl border border-pink-200 focus:ring-2 focus:ring-pink-300 outline-none" />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <div className="relative">
                          <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input placeholder="Account Email *" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={cn("w-full pl-10 p-4 rounded-xl border focus:ring-2 outline-none", formData.email && (!emailValid || !emailMatchesAccount) ? "border-red-300 focus:ring-red-200" : "border-pink-200 focus:ring-pink-300")} />
                        </div>
                        <p className={cn("text-xs mt-1.5", formData.email && (!emailValid || !emailMatchesAccount) ? "text-red-500" : "text-gray-400")}>Must match your signed-in account: {user?.email}</p>
                      </div>
                      <div>
                        <div className="relative">
                          <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input placeholder="Confirm Account Email *" type="email" value={formData.emailConfirm} onChange={(e) => setFormData({ ...formData, emailConfirm: e.target.value })} className={cn("w-full pl-10 p-4 rounded-xl border focus:ring-2 outline-none", formData.emailConfirm && !emailConfirmMatchesAccount ? "border-red-300 focus:ring-red-200" : "border-pink-200 focus:ring-pink-300")} />
                        </div>
                        <p className={cn("text-xs mt-1.5", formData.emailConfirm && !emailConfirmMatchesAccount ? "text-red-500" : "text-gray-400")}>Re-type the same verified account email before we send the transfer link.</p>
                      </div>
                    </div>

                    {/* Staff summary */}
                    <div className="rounded-xl bg-pink-50/60 border border-pink-100 p-4 text-sm text-gray-700">
                      <span className="font-semibold">Staff:</span> {selectedStaff === "any" ? "Any available staff" : staffList.find((st) => st.id === selectedStaff)?.name || "Selected staff"} · <span className="font-semibold">Time:</span> {selectedTime}
                    </div>

                    {/* Upload design */}
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"><ImagePlus size={16} /> Upload Design Picture</label>
                      <div className="border-2 border-dashed border-pink-200 rounded-xl p-4 text-center hover:bg-pink-50/50 transition-colors">
                        {uploadedImage ? (
                          <div className="relative inline-block">
                            <img src={uploadedImage} alt="Design preview" className="w-32 h-32 object-cover rounded-xl" />
                            <button onClick={removeImage} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center"><X size={14} /></button>
                          </div>
                        ) : (
                          <label className="cursor-pointer flex flex-col items-center gap-2">
                            <Upload size={24} className="text-pink-400" />
                            <span className="text-sm text-gray-500">Click to upload a design picture</span>
                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="relative">
                      <MessageSquare size={18} className="absolute left-3 top-4 text-gray-400" />
                      <textarea placeholder="Special requests or notes..." value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full pl-10 p-4 rounded-xl border border-pink-200 focus:ring-2 focus:ring-pink-300 outline-none min-h-[100px] resize-y" />
                    </div>

                    {/* Promo code */}
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"><Tag size={16} /> Promotion Code</label>
                      <div className="flex gap-2">
                        <input placeholder="Enter promo code (e.g. NAIL20)" value={formData.promoCode} onChange={(e) => setFormData({ ...formData, promoCode: e.target.value })} className="flex-1 p-3 rounded-xl border border-pink-200 focus:ring-2 focus:ring-pink-300 outline-none text-sm" />
                        <button onClick={applyPromo} className="btn-primary px-5">Apply</button>
                      </div>
                      {promoError && <p className="text-red-500 text-xs mt-1">{promoError}</p>}
                      {discount > 0 && <p className="text-green-600 text-xs mt-1">Discount applied: -£{discount}</p>}
                    </div>

                    {/* Medical checkboxes */}
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Stethoscope size={16} /> Health Confirmation</p>
                      <label className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:bg-pink-50/30 cursor-pointer">
                        <input type="checkbox" checked={formData.healthConfirmed} onChange={(e) => setFormData({ ...formData, healthConfirmed: e.target.checked })} className="mt-1 w-5 h-5 rounded border-pink-300 text-pink-600 focus:ring-pink-500" />
                        <span className="text-sm text-gray-600">I confirm I am not experiencing any health conditions that would affect this service</span>
                      </label>
                      <label className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:bg-pink-50/30 cursor-pointer">
                        <input type="checkbox" checked={formData.allergiesConfirmed} onChange={(e) => setFormData({ ...formData, allergiesConfirmed: e.target.checked })} className="mt-1 w-5 h-5 rounded border-pink-300 text-pink-600 focus:ring-pink-500" />
                        <span className="text-sm text-gray-600">I confirm I do not have allergies to cosmetics or chemicals</span>
                      </label>
                    </div>

                    {/* Terms */}
                    <label className="flex items-start gap-3 p-3 rounded-xl border border-pink-100 bg-pink-50/30 cursor-pointer">
                      <input type="checkbox" checked={formData.termsAccepted} onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })} className="mt-1 w-5 h-5 rounded border-pink-300 text-pink-600 focus:ring-pink-500" required />
                      <span className="text-sm text-gray-600">I agree to the <Link href="/terms" className="text-pink-600 underline">Terms & Conditions</Link>, <Link href="/privacy" className="text-pink-600 underline">Privacy Policy</Link>, and consent to the treatment.</span>
                    </label>
                  </div>

                  {/* Booking Summary */}
                  <div className="mt-6 bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-6 border border-pink-100">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><ShieldCheck size={18} /> Booking Summary</h4>
                    <div className="space-y-2 text-sm">
                      <p className="flex justify-between"><span className="text-gray-500">Service:</span> <span className="font-medium">{service?.name}</span></p>
                      <p className="flex justify-between">
                        <span className="text-gray-500">Price:</span>
                        <span className="font-bold text-pink-600">
                          {discount > 0 ? (
                            <>
                              <span className="line-through text-gray-400 text-xs mr-2">£{basePrice}</span>
                              £{finalPrice}
                            </>
                          ) : (
                            `£${basePrice}`
                          )}
                        </span>
                      </p>
                      {discount > 0 && <p className="flex justify-between"><span className="text-gray-500">Discount:</span> <span className="text-green-600 font-bold">-£{discount}</span></p>}
                      <p className="flex justify-between"><span className="text-gray-500">Date:</span> <span className="font-medium">{selectedDate}</span></p>
                      <p className="flex justify-between"><span className="text-gray-500">Time:</span> <span className="font-medium">{selectedTime}</span></p>
                      <p className="flex justify-between"><span className="text-gray-500">Staff:</span> <span className="font-medium">{selectedStaff === "any" ? "Any Staff" : staffList.find(s => s.id === selectedStaff)?.name}</span></p>
                    </div>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={!step4Valid || loading}
                    className={cn(
                      "w-full mt-6 py-4 text-lg font-bold rounded-2xl transition-all",
                      step4Valid && !loading
                        ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    )}
                  >
                    {loading ? "Processing..." : "Send Secure Transfer Link"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation buttons */}
            {step < 4 && (
              <div className="flex gap-4 mt-8">
                {step > 1 && (
                  <button onClick={handleBack} className="btn-secondary flex-1">
                    <ChevronLeft size={18} className="mr-2" /> Back
                  </button>
                )}
                <button
                  onClick={handleNext}
                  disabled={!canProceed}
                  className={cn(
                    "btn-primary flex-1",
                    !canProceed && "opacity-50 cursor-not-allowed"
                  )}
                >
                  Next <ChevronRight size={18} className="ml-2" />
                </button>
              </div>
            )}

            <div className="text-center mt-6">
              <Link href="/" className="text-sm text-gray-400 hover:text-pink-500 transition-colors">
                ← Back to Home
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
