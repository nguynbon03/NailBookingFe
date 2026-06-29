"use client";

import { motion } from "framer-motion";
import { Award, Heart, Sparkles } from "lucide-react";
import Image from "next/image";

const features = [
  { icon: Sparkles, label: "Premium Quality" },
  { icon: Heart, label: "Gentle Care" },
  { icon: Award, label: "Expert Staff" },
];

export default function About() {
  return (
    <section id="about" className="section-padding px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="relative"
        >
          <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-pink-200/40">
            <Image
              src="/images/gallery-9.jpg"
              alt="The Nail Lounge interior"
              fill
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-5 shadow-xl border border-pink-50">
            <p className="text-3xl font-bold text-gradient">8+</p>
            <p className="text-sm text-gray-500">Years Experience</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <p className="text-pink-500 font-semibold mb-3 flex items-center gap-2">
            <Sparkles size={18} />
            About Us
          </p>
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            We Are{" "}
            <span className="text-gradient">The Nail Lounge</span>
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-6">
            Welcome to{" "}
            <strong className="text-gray-900">The Nail Lounge @ Stokesley</strong>, your go-to destination for stunning nails and professional beauty care. Our skilled technicians specialize in manicures, pedicures, acrylics, gel nails, and intricate nail art.
          </p>
          <p className="text-gray-600 text-lg leading-relaxed mb-8">
            We provide a welcoming and relaxing atmosphere where every client receives top-quality service and attention to detail. Whether you&apos;re after a simple, elegant look or a bold, trendy design, we bring your vision to life.
          </p>

          <div className="flex flex-wrap gap-4 mb-8">
            {features.map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-2 px-4 py-2 bg-pink-50 rounded-full text-pink-700 text-sm font-medium"
              >
                <f.icon size={16} />
                {f.label}
              </div>
            ))}
          </div>

          <div className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full font-semibold shadow-lg shadow-pink-200">
            <Sparkles size={18} />
            10% off for under 13&apos;s!
          </div>
        </motion.div>
      </div>
    </section>
  );
}
