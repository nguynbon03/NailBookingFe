"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const categories = ["All", "Acrylic", "Gel", "Nail Art", "Chrome", "Ombre"];

const images = [
  { src: "/images/gallery-1.jpg", title: "BIAB Extension", cat: "Gel" },
  { src: "/images/gallery-2.jpg", title: "Cat Eye Design", cat: "Nail Art" },
  { src: "/images/gallery-3.jpg", title: "Acrylic Powder", cat: "Acrylic" },
  { src: "/images/gallery-4.jpg", title: "Gel Colour Set", cat: "Gel" },
  { src: "/images/gallery-5.jpg", title: "Ombre Infill", cat: "Ombre" },
  { src: "/images/gallery-6.jpg", title: "Mirror Chrome", cat: "Chrome" },
  { src: "/images/gallery-7.jpg", title: "Colour Powder", cat: "Acrylic" },
  { src: "/images/gallery-8.jpg", title: "SNS Dipping", cat: "Gel" },
  { src: "/images/gallery-9.jpg", title: "Nail Art Design", cat: "Nail Art" },
  { src: "/images/gallery-10.jpg", title: "Elegant Style", cat: "Gel" },
];

export default function GalleryPage() {
  const [activeCat, setActiveCat] = useState("All");
  const [lightbox, setLightbox] = useState<string | null>(null);

  const filtered = activeCat === "All" ? images : images.filter((i) => i.cat === activeCat);

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-gradient-to-b from-pink-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gradient mb-3">Our Gallery</h1>
            <p className="text-gray-500">Explore our stunning nail designs and transformations</p>
          </motion.div>

          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCat(c)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeCat === c
                    ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-200"
                    : "bg-white text-gray-600 border border-pink-100 hover:bg-pink-50"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence>
              {filtered.map((img, i) => (
                <motion.div
                  key={img.src}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group shadow-sm"
                  onClick={() => setLightbox(img.src)}
                >
                  <Image src={img.src} alt={img.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 group-hover:translate-y-0 transition-transform">
                    <p className="text-white font-semibold text-sm">{img.title}</p>
                  </div>
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn size={16} className="text-white" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          <div className="text-center mt-10">
            <Link href="/" className="text-sm text-gray-400 hover:text-pink-500 transition-colors">← Back to Home</Link>
          </div>
        </div>
      </main>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <button className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
              <X size={24} />
            </button>
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative w-full max-w-3xl aspect-square rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <Image src={lightbox} alt="Gallery" fill className="object-contain" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <Footer />
    </>
  );
}
