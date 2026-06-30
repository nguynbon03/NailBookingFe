"use client";
import { AuthProvider } from "@/context/AuthContext";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { TrendingUp, CalendarDays, Package, Users, LogOut } from "lucide-react";
import Link from "next/link";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const sidebarLinks = [
  { href: "/admin", label: "Dashboard", icon: TrendingUp },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/admin/services", label: "Services", icon: Package },
  { href: "/admin/staff", label: "Staff", icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (!user && typeof window !== "undefined" && pathname !== "/login") {
      window.location.href = "/login";
    }
  }, [user, pathname]);

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 flex">
        <aside className="w-64 bg-gray-900 text-white p-6 flex-shrink-0 h-screen sticky top-0">
          <h1 className="text-xl font-bold mb-8">Nail Lounge Admin</h1>
          <nav className="space-y-2">
            {sidebarLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
                    isActive ? "bg-pink-600" : "hover:bg-gray-800"
                  )}
                >
                  <link.icon size={18} />
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-8 pt-6 border-t border-gray-700">
            <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-800 text-gray-400">
              <LogOut size={18} /> Back to Site
            </Link>
          </div>
        </aside>
        <main className="flex-1 p-8 overflow-auto">{children}</main>
      </div>
    </AuthProvider>
  );
}
