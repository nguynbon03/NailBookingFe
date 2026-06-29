"use client";

import { Sparkles, Mail, Phone, MapPin, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function Footer() {
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
              Your go-to destination for stunning nails and professional beauty care in Stokesley.
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
            <h4 className="font-semibold mb-4 text-white">Quick Links</h4>
            <nav className="flex flex-col gap-2.5 text-sm text-gray-400">
              <Link href="/" className="hover:text-pink-400 transition-colors">Home</Link>
              <Link href="/services-page" className="hover:text-pink-400 transition-colors">Services</Link>
              <Link href="/booking" className="hover:text-pink-400 transition-colors">Book Now</Link>
              <Link href="/gallery" className="hover:text-pink-400 transition-colors">Gallery</Link>
              <Link href="/#contact" className="hover:text-pink-400 transition-colors">Contact</Link>
            </nav>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Services</h4>
            <nav className="flex flex-col gap-2.5 text-sm text-gray-400">
              <Link href="/services-page" className="hover:text-pink-400 transition-colors">Nail Extensions</Link>
              <Link href="/services-page" className="hover:text-pink-400 transition-colors">Gel Polish</Link>
              <Link href="/services-page" className="hover:text-pink-400 transition-colors">Manicure & Pedicure</Link>
              <Link href="/services-page" className="hover:text-pink-400 transition-colors">Nail Art</Link>
              <Link href="/services-page" className="hover:text-pink-400 transition-colors">Waxing</Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Contact</h4>
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
            Copyright © 2026 The Nail Lounge @ Stokesley. All Rights Reserved
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="#" className="hover:text-pink-400 transition-colors">Terms</Link>
            <Link href="#" className="hover:text-pink-400 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-pink-400 transition-colors">Consent</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
