"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import salonData from "@/data/salon-data.json";

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const testimonials = salonData.testimonials.slice(0, 8);

  const next = () => setActiveIndex((i) => (i + 1) % testimonials.length);
  const prev = () => setActiveIndex((i) => (i - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="section-padding bg-gradient-to-b from-white to-pink-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-pink-500 font-semibold mb-3">Testimonials</p>
          <h2 className="text-4xl lg:text-5xl font-bold text-gradient">
            What Our Clients Say
          </h2>
        </motion.div>

        <div className="relative max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl shadow-pink-100/50 border border-pink-100/60"
            >
              <Quote size={40} className="text-pink-200 mb-4" />
              <p className="text-lg sm:text-xl text-gray-700 leading-relaxed mb-8 italic">
                &ldquo;{testimonials[activeIndex].text}&rdquo;
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900 text-lg">{testimonials[activeIndex].name}</p>
                  <div className="flex gap-0.5 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-bold text-lg">
                  {testimonials[activeIndex].name.charAt(0)}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prev}
              className="w-12 h-12 rounded-full bg-white border border-pink-100 flex items-center justify-center text-gray-600 hover:bg-pink-50 hover:text-pink-600 transition-colors shadow-sm"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    i === activeIndex ? "w-8 bg-gradient-to-r from-pink-500 to-rose-500" : "w-2.5 bg-gray-300"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="w-12 h-12 rounded-full bg-white border border-pink-100 flex items-center justify-center text-gray-600 hover:bg-pink-50 hover:text-pink-600 transition-colors shadow-sm"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
