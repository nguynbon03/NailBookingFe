"use client";

import { motion } from "framer-motion";
import { Hand, Footprints, Palette, Sparkles, Gem, Wand2, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import salonData from "@/data/salon-data.json";

const iconMap: Record<string, React.ElementType> = {
  "Acrylic & Gel Polish - New Set": Gem,
  "Manicure & Gel Polish": Hand,
  "Gel Polish - Hands": Sparkles,
  "Deluxe Pedicure & Gel Polish": Footprints,
  "Nail Art": Palette,
  "Acrylic & Gel Polish - Infill": Wand2,
};

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Services() {
  return (
    <section id="services" className="section-padding bg-gradient-to-b from-white via-pink-50/50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-pink-500 font-semibold mb-3">What We Offer</p>
          <h2 className="text-4xl lg:text-5xl font-bold text-gradient mb-4">
            Popular Services
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            From classic manicures to intricate nail art, we offer a wide range of services to make you look and feel your best.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {salonData.categories.popular.map((service) => {
            const Icon = iconMap[service.name] || Sparkles;
            return (
              <motion.div
                key={service.name}
                variants={item}
                className="card-hover group bg-white rounded-2xl p-6 border border-pink-100/80 shadow-sm"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center text-pink-600 mb-5 group-hover:scale-110 transition-transform">
                  <Icon size={26} />
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">{service.name}</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Professional {service.name.toLowerCase()} with premium products and expert care.
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gradient">{service.price}</span>
                    <span className="flex items-center gap-1 text-sm text-gray-400">
                      <Clock size={14} />
                      {service.duration}
                    </span>
                  </div>
                </div>
                <Link
                  href="/booking"
                  className="mt-4 btn-primary w-full text-sm py-2.5 group/btn"
                >
                  Book Now
                  <ArrowRight size={16} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link href="/services-page" className="btn-secondary">
            View All Services
            <ArrowRight size={18} className="ml-2" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
