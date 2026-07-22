"use client";

import { Sparkles, Mail, Phone, MapPin, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/lib/translations";

export default function Footer() {
  const { lang } = useLanguage();

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
                <Sparkles size={18} className="text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
                Nail Lounge
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              {t("footer.tagline", lang)}
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-pink-600 transition-colors">
                <ExternalLink size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-pink-600 transition-colors">
                <ExternalLink size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-white">{t("footer.quickLinks", lang)}</h4>
            <nav className="flex flex-col gap-2.5 text-sm text-gray-400">
              <Link href="/" className="hover:text-pink-400 transition-colors">{t("footer.home", lang)}</Link>
              <Link href="/services-page" className="hover:text-pink-400 transition-colors">{t("footer.services", lang)}</Link>
              <Link href="/booking" className="hover:text-pink-400 transition-colors">{t("footer.bookNow", lang)}</Link>
              <Link href="/gallery" className="hover:text-pink-400 transition-colors">{t("footer.gallery", lang)}</Link>
              <Link href="/#contact" className="hover:text-pink-400 transition-colors">{t("footer.contact", lang)}</Link>
            </nav>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-4 text-white">{t("footer.servicesTitle", lang)}</h4>
            <nav className="flex flex-col gap-2.5 text-sm text-gray-400">
              <Link href="/services-page" className="hover:text-pink-400 transition-colors">{t("footer.nailExtensions", lang)}</Link>
              <Link href="/services-page" className="hover:text-pink-400 transition-colors">{t("footer.gelPolish", lang)}</Link>
              <Link href="/services-page" className="hover:text-pink-400 transition-colors">{t("footer.maniPedi", lang)}</Link>
              <Link href="/services-page" className="hover:text-pink-400 transition-colors">{t("footer.nailArt", lang)}</Link>
              <Link href="/services-page" className="hover:text-pink-400 transition-colors">{t("footer.waxing", lang)}</Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-white">{t("footer.contactTitle", lang)}</h4>
            <div className="space-y-3 text-sm text-gray-400">
              <p className="flex items-start gap-2">
                <MapPin size={16} className="text-pink-400 shrink-0 mt-0.5" />
                33 High St, Stokesley, TS9 5AD
              </p>
              <p className="flex items-center gap-2">
                <Phone size={16} className="text-pink-400 shrink-0" />
                +44 7774 292572
              </p>
              <p className="flex items-center gap-2">
                <Mail size={16} className="text-pink-400 shrink-0" />
                nails.stokesley@outlook.com
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            {t("footer.copyright", lang)}
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="#" className="hover:text-pink-400 transition-colors">{t("footer.terms", lang)}</Link>
            <Link href="#" className="hover:text-pink-400 transition-colors">{t("footer.privacy", lang)}</Link>
            <Link href="#" className="hover:text-pink-400 transition-colors">{t("footer.consent", lang)}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
