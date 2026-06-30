"use client";
import { motion } from "framer-motion";
import { Users, CalendarDays, DollarSign, TrendingUp, Package } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ customers: 0, bookings: 0, revenue: 0, services: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.admin.stats()
      .then((d: any) => { if (d.stats) setStats(d.stats); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: "Customers", value: stats.customers, icon: Users, color: "from-pink-400 to-rose-400" },
    { label: "Bookings", value: stats.bookings, icon: CalendarDays, color: "from-violet-400 to-purple-400" },
    { label: "Revenue", value: `£${stats.revenue}`, icon: DollarSign, color: "from-emerald-400 to-teal-400" },
    { label: "Services", value: stats.services, icon: Package, color: "from-amber-400 to-orange-400" },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">{user?.name}</span>
          <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-bold uppercase">{user?.role}</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center text-white mb-4`}>
              <c.icon size={22} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{loading ? "..." : c.value}</p>
            <p className="text-sm text-gray-500">{c.label}</p>
          </motion.div>
        ))}
      </div>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
        <h3 className="font-bold mb-4 text-gray-900">Quick Actions</h3>
        <div className="flex gap-3">
          <Link href="/admin/services" className="btn-primary">+ Add Service</Link>
          <Link href="/admin/staff" className="btn-secondary">+ Add Staff</Link>
          <Link href="/admin/bookings" className="btn-secondary">View Bookings</Link>
        </div>
      </div>
    </div>
  );
}
