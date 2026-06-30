"use client";

import { useState, useEffect } from "react";
import { Menu, X, Phone, CalendarDays, LogIn, User, LogOut, ClipboardList, Settings } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import BrandLogo from "@/components/BrandLogo";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/#services" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/#contact" },
];

const adminRoles = new Set(["ADMIN", "MANAGER"]);

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, loading, logout } = useAuth();
  const isAdmin = adminRoles.has(user?.role || "");
  const isStaff = user?.role === "STAFF";

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
            <ClipboardList size={16} />My Bookings
          </Link>
          {isAdmin && (
            <Link href="/admin" className="flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium text-pink-700 bg-pink-50 hover:bg-pink-100 transition-all">
              <Settings size={16} />{user?.role === "MANAGER" ? "Manager" : "Admin"}
            </Link>
          )}
          {isStaff && (
            <Link href="/staff" className="flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-all">
              <Settings size={16} />Staff
            </Link>
          )}
          <button onClick={logout} className="flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all">
            <LogOut size={16} />Logout
          </button>
        </>
      ) : !loading ? (
        <>
          <Link href="/login" className="flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:text-pink-600 hover:bg-pink-50 transition-all">
            <LogIn size={16} />Sign In
          </Link>
          <Link href="/register" className="flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:shadow-lg transition-all">
            <User size={16} />Register
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
              <Link key={link.label} href={link.href} className="px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:text-pink-600 hover:bg-pink-50 transition-all">{link.label}</Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <a href="tel:+447774292572" className="flex items-center gap-2 text-sm text-gray-600 hover:text-pink-600 transition-colors">
              <Phone size={16} />+44 7774 292572
            </a>
            {accountLinks}
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
          {user ? (
            <>
              <Link href="/my-bookings" className="block px-4 py-3 rounded-xl text-gray-700 hover:text-pink-600 hover:bg-pink-50 font-medium transition-all" onClick={() => setMobileOpen(false)}>My Bookings</Link>
              {isAdmin && <Link href="/admin" className="block px-4 py-3 rounded-xl text-pink-700 bg-pink-50 font-medium transition-all" onClick={() => setMobileOpen(false)}>{user?.role === "MANAGER" ? "Manager Dashboard" : "Admin Dashboard"}</Link>}
              {isStaff && <Link href="/staff" className="block px-4 py-3 rounded-xl text-emerald-700 bg-emerald-50 font-medium transition-all" onClick={() => setMobileOpen(false)}>Staff Portal</Link>}
              <button onClick={() => { setMobileOpen(false); logout(); }} className="block w-full text-left px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 font-medium transition-all">Logout</button>
            </>
          ) : !loading ? (
            <>
              <Link href="/login" className="block px-4 py-3 rounded-xl text-gray-700 hover:text-pink-600 hover:bg-pink-50 font-medium transition-all">Sign In</Link>
              <Link href="/register" className="block px-4 py-3 rounded-xl text-gray-700 hover:text-pink-600 hover:bg-pink-50 font-medium transition-all">Register</Link>
            </>
          ) : null}
          <Link href="/booking" className="btn-primary block text-center mt-4" onClick={() => setMobileOpen(false)}>
            <CalendarDays size={18} className="inline mr-2" />Book Now
          </Link>
        </div>
      )}
    </nav>
  );
}
