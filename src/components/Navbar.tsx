"use client";

import { useState, useEffect } from "react";
import { Menu, X, Phone, CalendarDays, Sparkles, LogIn, User } from "lucide-react";
import Link from "next/link";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/#services" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/#contact" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-pink-200 group-hover:scale-110 transition-transform">
              <Sparkles size={18} />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-rose-600 bg-clip-text text-transparent">Nail Lounge</span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.label} href={link.href} className="px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:text-pink-600 hover:bg-pink-50 transition-all">{link.label}</Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <a href="tel:+447774292572" className="flex items-center gap-2 text-sm text-gray-600 hover:text-pink-600 transition-colors">
              <Phone size={16} />+44 7774 292572
            </a>
            <Link href="/login" className="flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:text-pink-600 hover:bg-pink-50 transition-all">
              <LogIn size={16} />Sign In
            </Link>
            <Link href="/register" className="flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:shadow-lg transition-all">
              <User size={16} />Register
            </Link>
            <Link href="/booking" className="btn-primary text-sm px-5 py-2.5 flex items-center gap-2">
              <CalendarDays size={16} />Book Now
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
            <Link key={link.label} href={link.href} className="block px-4 py-3 rounded-xl text-gray-700 hover:text-pink-600 hover:bg-pink-50 font-medium transition-all" onClick={() => setMobileOpen(false)}>{link.label}</Link>
          ))}
          <Link href="/login" className="block px-4 py-3 rounded-xl text-gray-700 hover:text-pink-600 hover:bg-pink-50 font-medium transition-all">Sign In</Link>
          <Link href="/register" className="block px-4 py-3 rounded-xl text-gray-700 hover:text-pink-600 hover:bg-pink-50 font-medium transition-all">Register</Link>
          <Link href="/booking" className="btn-primary block text-center mt-4" onClick={() => setMobileOpen(false)}>
            <CalendarDays size={18} className="inline mr-2" />Book Now
          </Link>
        </div>
      )}
    </nav>
  );
}
