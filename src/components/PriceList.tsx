"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Hand,
  Footprints,
  Sparkles,
  Scissors,
  Star,
  Droplets,
  ChevronDown,
  ChevronUp,
  Clock,
  ArrowRight,
  ImageIcon,
} from "lucide-react";
import Link from "next/link";
import salonData from "@/data/salon-data.json";

const categoryConfig: Record<
  string,
  { label: string; icon: React.ElementType; color: string }
> = {
  extensions_hands: { label: "Nail Extensions (Hands)", icon: Hand, color: "bg-pink-50 text-pink-600" },
  extensions_feet: { label: "Nail Extensions (Feet)", icon: Footprints, color: "bg-rose-50 text-rose-600" },
  gel_polish: { label: "Gel Polish", icon: Sparkles, color: "bg-fuchsia-50 text-fuchsia-600" },
  mani_pedi: { label: "Mani & Pedi", icon: Scissors, color: "bg-pink-50 text-pink-600" },
  extras: { label: "Extras", icon: Star, color: "bg-amber-50 text-amber-600" },
  waxing: { label: "Waxing", icon: Droplets, color: "bg-cyan-50 text-cyan-600" },
};

const categoryOrder = [
  "extensions_hands",
  "extensions_feet",
  "gel_polish",
  "mani_pedi",
  "extras",
  "waxing",
];

export default function PriceList() {
  const [openCategory, setOpenCategory] = useState<string | null>("extensions_hands");

  const handleBook = (serviceName: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedService", serviceName);
    }
  };

  return (
    <section id="price-list" className="section-padding px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <p className="text-pink-500 font-semibold mb-3">Transparent Pricing</p>
        <h2 className="text-4xl lg:text-5xl font-bold text-gradient">Price List</h2>
      </motion.div>

      <div className="max-w-4xl mx-auto space-y-3">
        {categoryOrder.map((catKey) => {
          const config = categoryConfig[catKey];
          const Icon = config.icon;
          const services = salonData.categories[catKey as keyof typeof salonData.categories] as Array<{
            name: string;
            price: string;
            duration: string;
          }>;
          const isOpen = openCategory === catKey;

          return (
            <motion.div
              key={catKey}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-2xl border border-pink-100/80 shadow-sm overflow-hidden"
            >
              <button
                onClick={() => setOpenCategory(isOpen ? null : catKey)}
                className="w-full flex items-center justify-between p-5 sm:p-6 text-left hover:bg-pink-50/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${config.color} flex items-center justify-center`}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{config.label}</h3>
                    <p className="text-sm text-gray-400">{services.length} services</p>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-pink-500 transition-transform duration-300">
                  {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 sm:px-6 pb-5 sm:pb-6 space-y-2">
                      {services.map((service, idx) => (
                        <motion.div
                          key={service.name}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05, duration: 0.3 }}
                          className="flex items-center gap-4 p-3 rounded-xl hover:bg-pink-50/50 transition-colors group"
                        >
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center text-pink-400 shrink-0">
                            <ImageIcon size={18} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">{service.name}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <Clock size={12} />
                              <span>{service.duration}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                            <span className="font-bold text-pink-600 text-sm sm:text-base">{service.price}</span>
                            <Link
                              href="/booking"
                              onClick={() => handleBook(service.name)}
                              className="btn-primary text-xs sm:text-sm py-2 px-4 flex items-center gap-1 group/btn"
                            >
                              Book
                              <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                            </Link>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
