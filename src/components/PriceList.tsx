"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import salonData from "@/data/salon-data.json";

type Service = { name: string; price: string; duration: string };

const tabCategories = [
  { key: "extensions_hands" as const, label: "NAIL EXTENSIONS (HANDS)" },
  { key: "extensions_feet" as const, label: "NAIL EXTENSIONS (FEET)" },
  { key: "gel_polish" as const, label: "GEL POLISH" },
  { key: "mani_pedi" as const, label: "MANI & PEDI" },
  { key: "extras" as const, label: "EXTRAS" },
  { key: "waxing" as const, label: "WAXING" },
];

export default function PriceList() {
  const [activeTab, setActiveTab] = useState(0);
  const activeKey = tabCategories[activeTab].key;
  const services = salonData.categories[activeKey] as Service[];

  return (
    <section id="price-list" className="section-padding px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <p className="text-pink-500 font-semibold mb-3">Transparent Pricing</p>
        <h2 className="text-4xl lg:text-5xl font-bold text-gradient">
          Price List
        </h2>
      </motion.div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 justify-center mb-10">
        {tabCategories.map((tab, i) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
              i === activeTab
                ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-200"
                : "bg-pink-50 text-gray-600 hover:bg-pink-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Service Cards */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeKey}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {services.map((service, i) => (
            <motion.div
              key={`${activeKey}-${i}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card-hover bg-white rounded-2xl p-6 border border-pink-100/80 shadow-sm flex flex-col"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900 leading-snug">{service.name}</h3>
                <span className="text-xl font-bold text-gradient whitespace-nowrap ml-3">{service.price}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-400 mt-auto pt-3 border-t border-gray-50">
                <Clock size={14} />
                {service.duration}
              </div>
              <Link
                href="/booking"
                className="mt-3 btn-primary w-full text-sm py-2 flex items-center justify-center gap-1"
              >
                Book Now
                <ArrowRight size={14} />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
