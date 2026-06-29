"use client";
import { motion } from "framer-motion";
import { Users, CalendarDays, DollarSign, TrendingUp, Package, Clock } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ customers: 0, bookings: 0, revenue: 0, services: 0 });
  useEffect(() => {
    fetch("/api/admin/stats", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } })
      .then(r => r.json()).then(d => { if (d.stats) setStats(d.stats); });
  }, []);

  const cards = [
    { label: "Customers", value: stats.customers, icon: Users, color: "from-pink-400 to-rose-400" },
    { label: "Bookings", value: stats.bookings, icon: CalendarDays, color: "from-violet-400 to-purple-400" },
    { label: "Revenue", value: `£${stats.revenue}`, icon: DollarSign, color: "from-emerald-400 to-teal-400" },
    { label: "Services", value: stats.services, icon: Package, color: "from-amber-400 to-orange-400" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white p-6">
        <h1 className="text-xl font-bold mb-8">Nail Lounge Admin</h1>
        <nav className="space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-pink-600"><TrendingUp size={18} /> Dashboard</Link>
          <Link href="/admin/bookings" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-800"><CalendarDays size={18} /> Bookings</Link>
          <Link href="/admin/services" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-800"><Package size={18} /> Services</Link>
          <Link href="/admin/staff" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-800"><Users size={18} /> Staff</Link>
        </nav>
      </aside>
      <main className="ml-64 p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">{user?.name}</span>
            <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-bold">{user?.role}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {cards.map((c, i) => (
            <motion.div key={c.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center text-white mb-4`}>
                <c.icon size={22} />
              </div>
              <p className="text-3xl font-bold text-gray-900">{c.value}</p>
              <p className="text-sm text-gray-500">{c.label}</p>
            </motion.div>
          ))}
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold mb-4">Quick Actions</h3>
          <div className="flex gap-3">
            <Link href="/admin/services" className="btn-primary">+ Add Service</Link>
            <Link href="/admin/staff" className="btn-secondary">+ Add Staff</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
