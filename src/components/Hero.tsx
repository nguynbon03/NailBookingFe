"use client";

import { motion } from "framer-motion";
import { ArrowRight, CalendarDays, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const marqueeImages = [
  "/images/gallery-1.jpg",
  "/images/gallery-2.jpg",
  "/images/gallery-3.jpg",
  "/images/gallery-4.jpg",
  "/images/gallery-5.jpg",
  "/images/gallery-6.jpg",
  "/images/gallery-7.jpg",
  "/images/gallery-8.jpg",
  "/images/gallery-9.jpg",
  "/images/gallery-10.jpg",
];

export default function Hero() {
  const allImages = [...marqueeImages, ...marqueeImages, ...marqueeImages, ...marqueeImages];

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-gradient-hero pt-16">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-200/30 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-rose-200/20 rounded-full blur-3xl animate-float-delay" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-100/40 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-pink-600 text-sm font-semibold mb-6 shadow-sm border border-pink-100"
            >
              <Sparkles size={16} />
              Premium Nail & Beauty Care
            </motion.div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6">
              <span className="text-gradient">Beautiful</span>
              <br />
              Nails,{" "}
              <span className="text-gray-900">Beautiful</span>
              <br />
              <span className="text-gradient">You</span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-lg leading-relaxed">
              Here for Pretty Nails, Quality and Trust. Experience the best nail services in Stokesley with our skilled technicians.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/booking" className="btn-primary text-lg group">
                <CalendarDays size={20} className="mr-2" />
                Book Now
                <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/#services" className="btn-secondary text-lg">
                Explore Services
              </Link>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-8 flex items-center gap-6"
            >
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-pink-300 to-rose-400 flex items-center justify-center text-white text-xs font-bold"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div>
                <p className="font-bold text-gray-900">500+ Happy Clients</p>
                <p className="text-sm text-gray-500">Rated 5.0 on Google</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-300/40 to-rose-400/40 rounded-[3rem] rotate-6" />
              <div className="absolute inset-0 bg-white rounded-[3rem] shadow-2xl shadow-pink-200/50 overflow-hidden">
                <Image
                  src="/images/gallery-5.jpg"
                  alt="Beautiful nail art at The Nail Lounge"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              {/* Floating badge */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-xl border border-pink-100"
              >
                <p className="text-sm font-bold text-gray-900">10% OFF</p>
                <p className="text-xs text-gray-500">for under 13&apos;s!</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30"
      >
        <div className="w-6 h-10 rounded-full border-2 border-pink-300 flex items-start justify-center p-1">
          <div className="w-1.5 h-3 bg-pink-400 rounded-full" />
        </div>
      </motion.div>
    </section>
  );
}
