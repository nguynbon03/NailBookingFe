"use client";

import { motion } from "framer-motion";
import { Award, Heart, Sparkles } from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/lib/translations";

export default function About() {
  const { lang } = useLanguage();

  const features = [
    { icon: Sparkles, label: t("about.premiumQuality", lang) },
    { icon: Heart, label: t("about.gentleCare", lang) },
    { icon: Award, label: t("about.expertStaff", lang) },
  ];

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
            <p className="text-sm text-gray-500">{t("about.experience", lang)}</p>
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
            {t("about.badge", lang)}
          </p>
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            {t("about.title", lang)}{" "}
            <span className="text-gradient">{t("about.titleBrand", lang)}</span>
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-6" dangerouslySetInnerHTML={{ __html: t("about.description1", lang) }} />
          <p className="text-gray-600 text-lg leading-relaxed mb-8">
            {t("about.description2", lang)}
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
            {t("about.discount", lang)}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
