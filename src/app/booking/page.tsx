"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock, CalendarDays, User, Phone, Mail, MessageSquare, Check, Sparkles } from "lucide-react";
import Link from "next/link";
import salonData from "@/data/salon-data.json";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const allServices = [
  ...salonData.categories.extensions_hands,
  ...salonData.categories.extensions_feet,
  ...salonData.categories.gel_polish,
  ...salonData.categories.mani_pedi,
  ...salonData.categories.extras,
  ...salonData.categories.waxing,
];

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
];

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", notes: "" });

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };
  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const service = allServices.find((s) => s.name === selectedService);

  const canProceed =
    (step === 1 && selectedService) ||
    (step === 2 && selectedDate) ||
    (step === 3 && selectedTime) ||
    step === 4;

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
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    i + 1 <= step ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-200" : "bg-gray-100 text-gray-400"
                  }`}>
                    {i + 1 < step ? <Check size={18} /> : i + 1}
                  </div>
                  <span className={`text-xs mt-1.5 font-medium ${i + 1 <= step ? "text-pink-600" : "text-gray-400"}`}>{label}</span>
                </div>
              ))}
            </div>

            {/* Steps */}
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="text-lg font-bold mb-5">Select a Service</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {allServices.map((s, i) => (
                      <button
                        key={`${s.name}-${i}`}
                        onClick={() => setSelectedService(s.name)}
                        className={`text-left p-4 rounded-2xl border transition-all ${
                          selectedService === s.name
                            ? "border-pink-400 bg-pink-50 shadow-md shadow-pink-100"
                            : "border-gray-100 bg-white hover:border-pink-200 hover:shadow-sm"
                        }`}
                      >
                        <p className="font-semibold text-gray-900">{s.name}</p>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                          <span className="text-pink-600 font-bold">{s.price}</span>
                          <span className="flex items-center gap-1"><Clock size={12} />{s.duration}</span>
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
                  <h3 className="text-lg font-bold mb-5">Select a Time</h3>
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-pink-100">
                    <p className="text-sm text-gray-500 mb-4">Available slots for {selectedDate}</p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {timeSlots.map((t) => (
                        <button
                          key={t}
                          onClick={() => setSelectedTime(t)}
                          className={`py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                            selectedTime === t
                              ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-200"
                              : "bg-gray-50 text-gray-700 hover:bg-pink-50 hover:text-pink-600"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="text-lg font-bold mb-5">Your Details</h3>
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-pink-100 space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="relative">
                        <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full pl-10 p-4 rounded-xl border border-pink-200 focus:ring-2 focus:ring-pink-300 outline-none" />
                      </div>
                      <div className="relative">
                        <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input placeholder="Phone Number" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full pl-10 p-4 rounded-xl border border-pink-200 focus:ring-2 focus:ring-pink-300 outline-none" />
                      </div>
                    </div>
                    <div className="relative">
                      <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input placeholder="Email Address" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full pl-10 p-4 rounded-xl border border-pink-200 focus:ring-2 focus:ring-pink-300 outline-none" />
                    </div>
                    <div className="relative">
                      <MessageSquare size={18} className="absolute left-3 top-4 text-gray-400" />
                      <textarea placeholder="Special requests or notes..." value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full pl-10 p-4 rounded-xl border border-pink-200 focus:ring-2 focus:ring-pink-300 outline-none min-h-[100px] resize-y" />
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="mt-6 bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-6 border border-pink-100">
                    <h4 className="font-bold text-gray-900 mb-3">Booking Summary</h4>
                    <div className="space-y-2 text-sm">
                      <p className="flex justify-between"><span className="text-gray-500">Service:</span> <span className="font-medium">{service?.name}</span></p>
                      <p className="flex justify-between"><span className="text-gray-500">Price:</span> <span className="font-bold text-pink-600">{service?.price}</span></p>
                      <p className="flex justify-between"><span className="text-gray-500">Date:</span> <span className="font-medium">{selectedDate}</span></p>
                      <p className="flex justify-between"><span className="text-gray-500">Time:</span> <span className="font-medium">{selectedTime}</span></p>
                    </div>
                  </div>

                  <button className="w-full mt-6 btn-primary py-4 text-lg font-bold">
                    Confirm Booking
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
                  className={`btn-primary flex-1 ${!canProceed ? "opacity-50 cursor-not-allowed" : ""}`}
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
