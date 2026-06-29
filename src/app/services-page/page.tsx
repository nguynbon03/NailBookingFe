"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Clock, ArrowRight, Scissors, Hand, Footprints, Sparkles, Gem, Palette, Wand2 } from "lucide-react";
import Link from "next/link";
import salonData from "@/data/salon-data.json";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const categoryIcons: Record<string, React.ElementType> = {
  extensions_hands: Gem,
  extensions_feet: Footprints,
  gel_polish: Sparkles,
  mani_pedi: Hand,
  extras: Palette,
  waxing: Scissors,
};

const categoryLabels: Record<string, string> = {
  extensions_hands: "Nail Extensions (Hands)",
  extensions_feet: "Nail Extensions (Feet)",
  gel_polish: "Gel Polish",
  mani_pedi: "Mani & Pedi",
  extras: "Extras",
  waxing: "Waxing",
};

export default function ServicesPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const allServices = Object.entries(salonData.categories).flatMap(([cat, services]) =>
    services.map((s) => ({ ...s, category: cat }))
  );

  const filtered = allServices.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "all" || s.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-gradient-to-b from-pink-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gradient mb-3">Our Services</h1>
            <p className="text-gray-500">Browse our full range of nail and beauty treatments</p>
          </motion.div>

          {/* Search */}
          <div className="relative max-w-md mx-auto mb-8">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-full border border-pink-200 focus:ring-2 focus:ring-pink-300 outline-none bg-white"
            />
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                activeCategory === "all" ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg" : "bg-white text-gray-600 border border-pink-100 hover:bg-pink-50"
              }`}
            >
              All Services
            </button>
            {Object.entries(categoryLabels).map(([key, label]) => {
              const Icon = categoryIcons[key] || Scissors;
              return (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 ${
                    activeCategory === key ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg" : "bg-white text-gray-600 border border-pink-100 hover:bg-pink-50"
                  }`}
                >
                  <Icon size={14} />
                  {label}
                </button>
              );
            })}
          </div>

          {/* Results */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((service, i) => (
              <motion.div
                key={`${service.name}-${i}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-white rounded-2xl p-5 border border-pink-100/80 shadow-sm card-hover"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-gray-900">{service.name}</h3>
                  <span className="text-lg font-bold text-gradient">{service.price}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-400 mb-4">
                  <Clock size={14} />
                  {service.duration}
                </div>
                <Link href="/booking" className="btn-primary w-full text-sm py-2 flex items-center justify-center gap-1">
                  Book Now <ArrowRight size={14} />
                </Link>
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-400">No services found matching your search.</p>
            </div>
          )}

          <div className="text-center mt-10">
            <Link href="/" className="text-sm text-gray-400 hover:text-pink-500 transition-colors">← Back to Home</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
