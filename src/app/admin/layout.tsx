"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { usePathname } from "next/navigation";
import { TrendingUp, CalendarDays, Package, Users, Tags, UserCog, CalendarOff, ShieldCheck, Inbox, FileText, BarChart3, User as UserIcon, Home, RefreshCw } from "lucide-react";
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
  { href: "/admin/google-sync", label: "Calendar & Reports", icon: RefreshCw },
  { href: "/admin/whatsapp", label: "WhatsApp", icon: UserIcon },
];

const adminRoles = new Set(["ADMIN", "MANAGER"]);

const DEPLOY_VERSION = "v2026-07-01-14:15"; // force visible version

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [ticketUnread, setTicketUnread] = useState(0);

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

  useEffect(() => {
    if (loading || !user || !adminRoles.has(user.role)) return;
    const loadUnread = () => {
      api.notifications.list("admin", 50, "tickets")
        .then((data: any) => setTicketUnread(Number(data.unread || 0)))
        .catch(() => {});
    };
    loadUnread();
    const timer = window.setInterval(loadUnread, 10000);
    return () => window.clearInterval(timer);
  }, [loading, user?.id, user?.role]);

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Loading admin...</div>;
  }

  if (!user || !adminRoles.has(user.role)) {
    return null;
  }

  const consoleLabel = user.role === "MANAGER" ? "Manager" : "Admin";
  const productLabel = `Nail Lounge ${consoleLabel}`;

  const nav = (mobile = false) => (
    <nav className={mobile ? "flex gap-2 overflow-x-auto px-3 pb-3" : "space-y-1"}>
      {sidebarLinks.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              mobile
                ? "min-w-fit flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors"
                : "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors text-sm",
              isActive
                ? "bg-pink-600 text-white"
                : mobile
                  ? "bg-white text-gray-600 border border-gray-200"
                  : "text-gray-200 hover:bg-gray-800"
            )}
          >
            <link.icon size={mobile ? 15 : 17} />
            <span>{link.label}</span>
            {link.href === "/admin/inbox" && ticketUnread > 0 && (
              <span className={cn(
                "ml-auto min-w-5 rounded-full px-1.5 py-0.5 text-center text-[10px] font-black",
                isActive ? "bg-white text-pink-600" : "bg-red-500 text-white"
              )}>{ticketUnread}</span>
            )}
          </Link>
        );
      })}
      {!mobile && (
        <a
          href="/"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-200 hover:bg-gray-800 border-t border-gray-700 mt-2 pt-3 text-sm"
        >
          <Home size={17} />
          Back to Site
        </a>
      )}
    </nav>
  );

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-gray-900 text-white p-5 flex-shrink-0 h-screen sticky top-0 flex-col overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold">{productLabel}</h1>
            <p className="text-[10px] text-gray-500">ADMIN • {DEPLOY_VERSION}</p>
          </div>
        </div>
        {nav(false)}
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-40 bg-white/95 backdrop-blur border-b">
        <div className="flex items-center justify-between px-3 py-3">
          <div>
            <p className="text-xs text-pink-600 font-black uppercase tracking-wide">{consoleLabel} {DEPLOY_VERSION}</p>
            <h1 className="text-base font-black text-gray-900">Nail Lounge</h1>
          </div>
          <a href="/" className="px-4 py-2 rounded-xl bg-gray-900 text-white text-xs font-bold flex items-center gap-1.5">
            <Home size={14} /> Back to Site
          </a>
        </div>
        <div className="border-t px-3 pb-2 overflow-x-auto">{nav(true)}</div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-3 sm:p-5 lg:p-8">
        {children}
      </main>
    </div>
  );
}
