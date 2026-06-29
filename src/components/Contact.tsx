"use client";

import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, CalendarDays } from "lucide-react";
import salonData from "@/data/salon-data.json";

export default function Contact() {
  const { salon } = salonData;

  return (
    <section id="contact" className="section-padding bg-gradient-to-b from-pink-50/50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-pink-500 font-semibold mb-3">Get In Touch</p>
          <h2 className="text-4xl lg:text-5xl font-bold text-gradient">
            Visit Our Salon
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Info Cards */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-5"
          >
            <div className="bg-white rounded-2xl p-6 shadow-lg shadow-pink-100/30 border border-pink-100/60 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center text-pink-500 shrink-0">
                <MapPin size={22} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-1">Address</h4>
                <p className="text-gray-600">{salon.address}</p>
                <p className="text-gray-600">{salon.postcode}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg shadow-pink-100/30 border border-pink-100/60 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center text-pink-500 shrink-0">
                <Phone size={22} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-1">Phone</h4>
                <a href={`tel:${salon.phone}`} className="text-gray-600 hover:text-pink-600 transition-colors">
                  {salon.phone}
                </a>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg shadow-pink-100/30 border border-pink-100/60 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center text-pink-500 shrink-0">
                <Mail size={22} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-1">Email</h4>
                <a href={`mailto:${salon.email}`} className="text-gray-600 hover:text-pink-600 transition-colors">
                  {salon.email}
                </a>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg shadow-pink-100/30 border border-pink-100/60">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-pink-500">
                  <Clock size={20} />
                </div>
                <h4 className="font-bold text-gray-900">Opening Hours</h4>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {salon.hours.map((h) => (
                  <div key={h.day} className="flex justify-between py-1.5 border-b border-gray-50">
                    <span className="font-medium text-gray-700">{h.day}</span>
                    <span className="text-gray-500">{h.open} - {h.close}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Map placeholder */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl overflow-hidden bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center min-h-[400px] shadow-xl shadow-pink-200/30"
          >
            <div className="text-center p-8">
              <div className="w-20 h-20 rounded-full bg-white/80 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <MapPin size={36} className="text-pink-500" />
              </div>
              <p className="text-lg font-bold text-gray-800 mb-2">{salon.name}</p>
              <p className="text-gray-600 mb-4">{salon.address}</p>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(salon.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-sm inline-flex items-center gap-2"
              >
                <CalendarDays size={16} />
                Open in Google Maps
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
