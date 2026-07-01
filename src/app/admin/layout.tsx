"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { TrendingUp, CalendarDays, Package, Users, LogOut, Tags, UserCog, CalendarOff, ShieldCheck, Inbox, FileText, BarChart3, User as UserIcon, Home } from "lucide-react";
import Link from "next/link";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const sidebarLinks = [
  { href: "/admin", label: "Dashboard", icon: TrendingUp },
  { href: "/admin/inbox", label: "Inbox", icon: Inbox },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/admin/customers", label: "Customers", icon: FileText },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/services", label: "Services", icon: Package },
  { href: "/admin/staff", label: "Staff", icon: Users },
  { href: "/admin/leave-requests", label: "Leave", icon: CalendarOff },
  { href: "/admin/accounts", label: "Accounts", icon: UserCog },
  { href: "/admin/protection", label: "Protection", icon: ShieldCheck },
  { href: "/admin/promo-codes", label: "Promo", icon: Tags },
  { href: "/admin/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/admin/whatsapp", label: "WhatsApp", icon: UserIcon },
];

const adminRoles = new Set(["ADMIN", "MANAGER"]);

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (loading || typeof window === "undefined") return;
    if (!user) {
      window.location.href = "/login";
      return;
    }
    if (!adminRoles.has(user.role)) {
      window.location.href = user.role === "STAFF" ? "/staff" : "/";
    }
  }, [user, loading, pathname]);

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Loading admin...</div>;
  }

  if (!user || !adminRoles.has(user.role)) {
    return null;
  }

  const consoleLabel = user.role === "MANAGER" ? "Manager" : "Admin";
  const productLabel = `Nail Lounge ${consoleLabel}`;

  const nav = (mobile = false) => (
    <nav className={mobile ? "flex gap-2 overflow-x-auto px-3 pb-3" : "space-y-2"}>
      {sidebarLinks.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              mobile
                ? "min-w-fit flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors"
                : "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
              isActive
                ? "bg-pink-600 text-white"
                : mobile
                  ? "bg-white text-gray-600 border border-gray-200"
                  : "text-gray-200 hover:bg-gray-800"
            )}
          >
            <link.icon size={mobile ? 15 : 18} />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 bg-gray-900 text-white p-6 flex-shrink-0 h-screen sticky top-0">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-bold">{productLabel}</h1>
          <Link href="/" className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs text-gray-300">
            <Home size={14} /> Back to Site
          </Link>
        </div>
        {nav(false)}
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-40 bg-gray-50/95 backdrop-blur border-b border-gray-200 pt-3">
        <div className="flex items-center justify-between px-3 pb-3">
          <div>
            <p className="text-xs text-pink-600 font-black uppercase tracking-wide">{consoleLabel}</p>
            <h1 className="text-base font-black text-gray-900 leading-tight">Nail Lounge</h1>
          </div>
          <Link href="/" className="h-10 px-4 rounded-xl bg-gray-900 text-white text-xs font-bold inline-flex items-center gap-1.5">
            <Home size={14} /> Back to Site
          </Link>
        </div>
        {nav(true)}
      </header>

      {/* Main Content */}
      <main className="flex-1 p-3 sm:p-5 lg:p-8 overflow-auto">
        {/* Always visible Back to Site bar for desktop too */}
        <div className="hidden lg:flex justify-end mb-4">
          <Link href="/" className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:bg-white text-sm text-gray-600">
            <Home size={16} /> ← Back to Site
          </Link>
        </div>
        {children}
      </main>
    </div>
  );
}
