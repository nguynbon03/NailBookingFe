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

          {/* Google Map Embed */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl overflow-hidden shadow-xl shadow-pink-200/30 border border-pink-100"
          >
            <iframe
              title="The Nail Lounge Location"
              className="w-full h-full min-h-[400px]"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d37638.6!2d-1.2!3d54.47!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487e98f8f8f8f8f8%3A0x0!2s33+High+St%2C+Stokesley%2C+Middlesbrough+TS9+5AD%2C+UK!5e0!3m2!1sen!2suk!4v1`}
            />
            <div className="bg-white p-3 text-center border-t border-pink-100">
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(salon.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-pink-600 hover:text-pink-700 font-medium inline-flex items-center gap-1"
              >
                <MapPin size={14} />
                Open in Google Maps
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
