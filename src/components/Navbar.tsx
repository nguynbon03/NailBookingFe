"use client";

import { useState, useEffect } from "react";
import { Menu, X, Phone, CalendarDays, LogIn, User, LogOut, ClipboardList, Settings, Languages } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/lib/translations";
import BrandLogo from "@/components/BrandLogo";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, loading, logout } = useAuth();
  const { lang, toggleLang } = useLanguage();
  const isAdmin = ["ADMIN", "MANAGER"].includes(user?.role || "");
  const isStaff = user?.role === "STAFF";

  const navLinks = [
    { label: t("nav.home", lang), href: "/" },
    { label: t("nav.services", lang), href: "/#services" },
    { label: t("nav.gallery", lang), href: "/gallery" },
    { label: t("nav.contact", lang), href: "/#contact" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const accountLinks = (
    <>
      {user ? (
        <>
          <Link href="/my-bookings" className="flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:text-pink-600 hover:bg-pink-50 transition-all">
            <ClipboardList size={16} />{t("nav.myBookings", lang)}
          </Link>
          {isAdmin && (
            <Link href="/admin" className="flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium text-pink-700 bg-pink-50 hover:bg-pink-100 transition-all">
              <Settings size={16} />{user?.role === "MANAGER" ? t("nav.manager", lang) : t("nav.admin", lang)}
            </Link>
          )}
          {isStaff && (
            <Link href="/staff" className="flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-all">
              <Settings size={16} />{t("nav.staff", lang)}
            </Link>
          )}
          <button onClick={logout} className="flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all">
            <LogOut size={16} />{t("nav.logout", lang)}
          </button>
        </>
      ) : !loading ? (
        <>
          <Link href="/login" className="flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:text-pink-600 hover:bg-pink-50 transition-all">
            <LogIn size={16} />{t("nav.signIn", lang)}
          </Link>
          <Link href="/register" className="flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:shadow-lg transition-all">
            <User size={16} />{t("nav.register", lang)}
          </Link>
        </>
      ) : null}
    </>
  );

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-xl shadow-lg border-b border-pink-100"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          <Link href="/" className="flex items-center group" aria-label="The Nail Lounge home">
            <BrandLogo variant="nav" showSubtitle />
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:text-pink-600 hover:bg-pink-50 transition-all">{link.label}</Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <a href="tel:+447****2572" className="flex items-center gap-2 text-sm text-gray-600 hover:text-pink-600 transition-colors">
              <Phone size={16} />+44 7774 292572
            </a>
            {accountLinks}
            <button
              onClick={toggleLang}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border border-pink-200 bg-white text-pink-600 hover:bg-pink-50 transition-all"
              aria-label="Toggle language"
            >
              <Languages size={14} />
              {lang === "en" ? "EN" : "VI"}
            </button>
            <Link href="/booking" className="btn-primary text-sm px-5 py-2.5 flex items-center gap-2">
              <CalendarDays size={16} />{t("nav.bookNow", lang)}
            </Link>
          </div>

          <button className="lg:hidden p-2 rounded-xl hover:bg-pink-50 transition-colors" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={24} className="text-gray-700" /> : <Menu size={24} className="text-gray-700" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-pink-100 px-4 py-6 space-y-2 shadow-xl">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="block px-4 py-3 rounded-xl text-gray-700 hover:text-pink-600 hover:bg-pink-50 font-medium transition-all" onClick={() => setMobileOpen(false)}>{link.label}</Link>
          ))}
          {user ? (
            <>
              <Link href="/my-bookings" className="block px-4 py-3 rounded-xl text-gray-700 hover:text-pink-600 hover:bg-pink-50 font-medium transition-all" onClick={() => setMobileOpen(false)}>{t("nav.myBookings", lang)}</Link>
              {isAdmin && <Link href="/admin" className="block px-4 py-3 rounded-xl text-pink-700 bg-pink-50 font-medium transition-all" onClick={() => setMobileOpen(false)}>{user?.role === "MANAGER" ? t("nav.manager", lang) : t("nav.admin", lang)}</Link>}
              {isStaff && <Link href="/staff" className="block px-4 py-3 rounded-xl text-emerald-700 bg-emerald-50 font-medium transition-all" onClick={() => setMobileOpen(false)}>{t("nav.staff", lang)}</Link>}
              <button onClick={() => { setMobileOpen(false); logout(); }} className="block w-full text-left px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 font-medium transition-all">{t("nav.logout", lang)}</button>
            </>
          ) : !loading ? (
            <>
              <Link href="/login" className="block px-4 py-3 rounded-xl text-gray-700 hover:text-pink-600 hover:bg-pink-50 font-medium transition-all">{t("nav.signIn", lang)}</Link>
              <Link href="/register" className="block px-4 py-3 rounded-xl text-gray-700 hover:text-pink-600 hover:bg-pink-50 font-medium transition-all">{t("nav.register", lang)}</Link>
            </>
          ) : null}
          <button
            onClick={() => { toggleLang(); setMobileOpen(false); }}
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-gray-700 hover:text-pink-600 hover:bg-pink-50 font-medium transition-all w-full"
          >
            <Languages size={16} />
            {lang === "en" ? "Switch to Vietnamese" : "Chuy\u1ec3n sang English"}
          </button>
          <Link href="/booking" className="btn-primary block text-center mt-4" onClick={() => setMobileOpen(false)}>
            <CalendarDays size={18} className="inline mr-2" />{t("nav.bookNow", lang)}
          </Link>
        </div>
      )}
    </nav>
  );
}
