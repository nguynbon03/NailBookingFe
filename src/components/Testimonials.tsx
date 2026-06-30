"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import salonData from "@/data/salon-data.json";

const testimonials = salonData.testimonials;

const avatarImages = [
  "/images/gallery-1.jpg","/images/gallery-2.jpg","/images/gallery-3.jpg","/images/gallery-4.jpg",
  "/images/gallery-5.jpg","/images/gallery-6.jpg","/images/gallery-7.jpg","/images/gallery-8.jpg",
  "/images/gallery-9.jpg","/images/gallery-10.jpg",
];

export default function Testimonials() {
  const all = [...testimonials, ...testimonials, ...testimonials];

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

        {/* Slow marquee */}
        <div className="relative overflow-hidden">
          <div className="flex gap-5 animate-marquee-slow hover:[animation-play-state:paused] w-max">
            {all.map((t, i) => (
              <div
                key={`${t.name}-${i}`}
                className="shrink-0 w-[280px] sm:w-[300px] md:w-[340px] lg:w-[380px] bg-white rounded-2xl p-6 shadow-lg shadow-pink-100/30 border border-pink-100/60 flex flex-col"
              >
                <Quote size={24} className="text-pink-300 mb-3" />
                <p className="text-gray-600 text-sm leading-relaxed mb-4 italic flex-1">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-pink-200 flex-shrink-0">
                    <img src={t.avatar || avatarImages[i % avatarImages.length]} alt={t.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, s) => (
                        <svg key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
