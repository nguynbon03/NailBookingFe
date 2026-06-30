"use client";

import { motion } from "framer-motion";
import { Star, Quote, User } from "lucide-react";
import salonData from "@/data/salon-data.json";

export default function Testimonials() {
  const testimonials = salonData.testimonials;
  const duplicated = [...testimonials, ...testimonials, ...testimonials, ...testimonials];

  return (
    <section className="section-padding bg-gradient-to-b from-white to-pink-50/50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-pink-500 font-semibold mb-3">Testimonials</p>
          <h2 className="text-4xl lg:text-5xl font-bold text-gradient">What Our Clients Say</h2>
        </motion.div>
      </div>

      {/* Marquee container */}
      <div className="relative w-full overflow-hidden">
        <div className="flex gap-6 animate-marquee-2 w-max hover:[animation-play-state:paused]">
          {duplicated.map((t, i) => (
            <div
              key={`${t.name}-${i}`}
              className="w-80 sm:w-96 flex-shrink-0 bg-white rounded-2xl p-6 shadow-md border border-pink-100/60 relative"
            >
              <Quote size={28} className="text-pink-200 mb-3" />
              <p className="text-sm text-gray-700 leading-relaxed mb-4 italic line-clamp-4">
                "{t.text}"
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white">
                    <User size={18} />
                  </div>
                  <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={14} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
