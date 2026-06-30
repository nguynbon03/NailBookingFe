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
  Clock,
  ArrowRight,
  ImageIcon,
} from "lucide-react";
import Link from "next/link";
import salonData from "@/data/salon-data.json";

const categories = [
  { key: "extensions_hands", label: "Nail Extensions (Hands)", icon: Hand, services: salonData.categories.extensions_hands },
  { key: "extensions_feet", label: "Nail Extensions (Feet)", icon: Footprints, services: salonData.categories.extensions_feet },
  { key: "gel_polish", label: "Gel Polish", icon: Sparkles, services: salonData.categories.gel_polish },
  { key: "mani_pedi", label: "Mani & Pedi", icon: Scissors, services: salonData.categories.mani_pedi },
  { key: "extras", label: "Extras", icon: Star, services: salonData.categories.extras },
  { key: "waxing", label: "Waxing", icon: Droplets, services: salonData.categories.waxing },
];

const gradients = [
  "from-pink-500 to-rose-400","from-violet-500 to-purple-400","from-emerald-500 to-teal-400",
  "from-amber-500 to-orange-400","from-sky-500 to-cyan-400","from-fuchsia-500 to-pink-400",
];

// Map services to gallery images for thumbnails
const galleryImages = [
  "/images/gallery-1.jpg","/images/gallery-2.jpg","/images/gallery-3.jpg","/images/gallery-4.jpg","/images/gallery-5.jpg",
  "/images/gallery-6.jpg","/images/gallery-7.jpg","/images/gallery-8.jpg","/images/gallery-9.jpg","/images/gallery-10.jpg",
];
function getServiceImage(i: number) {
  return galleryImages[i % galleryImages.length];
}

export default function Services() {
  const [openIndex, setOpenIndex] = useState(null);
  const toggle = (i: any) => setOpenIndex(openIndex === i ? null : i);
  const handleBook = (name: string) => { if (typeof window !== "undefined") localStorage.setItem("selectedService", name); };

  return (
    <section id="services" className="section-padding bg-gradient-to-b from-white to-pink-50/30">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <p className="text-pink-500 font-semibold mb-3">Our Services</p>
          <h2 className="text-4xl lg:text-5xl font-bold text-gradient">Premium Nail Care</h2>
          <p className="text-gray-500 mt-4 max-w-lg mx-auto">Explore our full range of professional nail and beauty services</p>
        </motion.div>
        <div className="space-y-3">
          {categories.map((cat, i) => {
            const Icon = cat.icon;
            const isOpen = openIndex === i;
            return (
              <div key={cat.key} className="bg-white rounded-2xl border border-pink-100/60 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <button onClick={() => toggle(i)} className="w-full flex items-center justify-between p-5 text-left">
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradients[i]} flex items-center justify-center text-white shadow-sm`}><Icon size={20} /></div>
                    <div><p className="font-bold text-gray-900 text-lg">{cat.label}</p><p className="text-sm text-gray-400">{cat.services.length} service{cat.services.length !== 1 ? "s" : ""}</p></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400 font-medium">From {cat.services[0]?.price || "£0.00"}</span>
                    <div className={`w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center text-pink-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}><ChevronDown size={18} /></div>
                  </div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                      <div className="border-t border-pink-50 px-5 pb-5 pt-2 space-y-2">
                        {cat.services.map((service, si) => (
                          <div key={si} className="flex items-center gap-4 p-3 rounded-xl hover:bg-pink-50/50 transition-colors group">
                            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                              <img src={getServiceImage(si + i * 10)} alt={service.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0"><p className="font-semibold text-gray-900 text-sm truncate">{service.name}</p><div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5"><Clock size={12} /><span>{service.duration}</span></div></div>
                            <p className="font-bold text-pink-600 text-sm shrink-0">{service.price}</p>
                            <Link href="/booking" onClick={() => handleBook(service.name)} className="shrink-0 inline-flex items-center gap-1 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-semibold hover:shadow-lg hover:shadow-pink-200/50 transition-all hover:-translate-y-0.5">Book <ArrowRight size={14} /></Link>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
