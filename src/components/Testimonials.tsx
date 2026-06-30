"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import salonData from "@/data/salon-data.json";

const testimonials = salonData.testimonials;

const colors = [
  "from-pink-400 to-rose-400",
  "from-violet-400 to-purple-400",
  "from-amber-400 to-orange-400",
  "from-emerald-400 to-teal-400",
  "from-sky-400 to-cyan-400",
  "from-fuchsia-400 to-pink-400",
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
        <div className="relative">
          <div className="flex gap-5 animate-marquee-slow hover:[animation-play-state:paused]">
            {all.map((t, i) => (
              <div
                key={`${t.name}-${i}`}
                className="shrink-0 w-[300px] sm:w-[340px] lg:w-[380px] bg-white rounded-2xl p-6 shadow-lg shadow-pink-100/30 border border-pink-100/60 flex flex-col"
              >
                <Quote size={24} className="text-pink-300 mb-3" />
                <p className="text-gray-600 text-sm leading-relaxed mb-4 italic flex-1">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${colors[i % colors.length]} flex items-center justify-center text-white text-sm font-bold shadow-sm`}>
                    {t.name.charAt(0)}
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
