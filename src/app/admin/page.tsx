"use client";
import { motion } from "framer-motion";
import { Users, CalendarDays, DollarSign, Package, UserCog, Tags } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";

type SeriesItem = { label: string; revenue: number };

type DashboardData = {
  stats: {
    totalUsers: number;
    customers: number;
    adminUsers: number;
    bookings: number;
    revenue: number;
    services: number;
    activeServices: number;
    activePromoCodes: number;
  };
  revenueSeries: { daily: SeriesItem[]; monthly: SeriesItem[]; yearly: SeriesItem[] };
  promoCodes: Array<{ code: string; discountPercent: number; usedCount: number; usageLimit: number | null; active: boolean }>;
};

function money(value: number) {
  return `£${Number(value || 0).toFixed(2)}`;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"daily" | "monthly" | "yearly">("daily");

  useEffect(() => {
    api.admin.stats()
      .then((d: DashboardData) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = data?.stats || { totalUsers: 0, customers: 0, adminUsers: 0, bookings: 0, revenue: 0, services: 0, activeServices: 0, activePromoCodes: 0 };
  const series = data?.revenueSeries?.[period] || [];
  const maxRevenue = useMemo(() => Math.max(1, ...series.map((item) => item.revenue)), [series]);

  const cards = [
    { label: "Total Users", value: stats.totalUsers, sub: `${stats.customers} customers · ${stats.adminUsers} staff/admin`, icon: Users, color: "from-pink-400 to-rose-400" },
    { label: "Bookings", value: stats.bookings, sub: "All customer appointments", icon: CalendarDays, color: "from-violet-400 to-purple-400" },
    { label: "Revenue", value: money(stats.revenue), sub: "Total confirmed revenue records", icon: DollarSign, color: "from-emerald-400 to-teal-400" },
    { label: "Services", value: stats.services, sub: `${stats.activeServices} active on frontend`, icon: Package, color: "from-amber-400 to-orange-400" },
    { label: "Promo Codes", value: stats.activePromoCodes, sub: "Active discount codes", icon: Tags, color: "from-sky-400 to-cyan-400" },
    { label: "Admin Role", value: user?.role || "-", sub: user?.name || "Current user", icon: UserCog, color: "from-gray-500 to-gray-700" },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-sm text-gray-500 mt-1">Bank-style overview: users, bookings, promo usage, and revenue by day/month/year.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">{user?.name}</span>
          <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-bold uppercase">{user?.role}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
        {cards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center text-white mb-4`}><c.icon size={22} /></div>
            <p className="text-3xl font-bold text-gray-900">{loading ? "..." : c.value}</p>
            <p className="text-sm font-semibold text-gray-700 mt-1">{c.label}</p>
            <p className="text-xs text-gray-400 mt-1">{c.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <h3 className="font-bold text-gray-900">Revenue Trend</h3>
              <p className="text-xs text-gray-400">Grouped like a bank statement by selected period.</p>
            </div>
            <div className="flex gap-2 bg-gray-50 rounded-xl p-1">
              {(["daily", "monthly", "yearly"] as const).map((item) => (
                <button key={item} onClick={() => setPeriod(item)} className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize ${period === item ? "bg-pink-600 text-white" : "text-gray-500 hover:bg-white"}`}>{item}</button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {series.map((item) => (
              <div key={item.label} className="grid grid-cols-[92px_1fr_90px] items-center gap-3 text-sm">
                <span className="text-gray-500 font-medium">{item.label}</span>
                <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500" style={{ width: `${Math.max(2, (item.revenue / maxRevenue) * 100)}%` }} />
                </div>
                <span className="text-right font-bold text-gray-900">{money(item.revenue)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Promo Usage</h3>
            <Link href="/admin/promo-codes" className="text-xs text-pink-600 font-bold">Manage</Link>
          </div>
          <div className="space-y-3">
            {(data?.promoCodes || []).length ? data!.promoCodes.map((promo) => (
              <div key={promo.code} className="rounded-xl border border-gray-100 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-black text-gray-900 tracking-wide">{promo.code}</span>
                  <span className="text-pink-600 font-bold">{promo.discountPercent}%</span>
                </div>
                <div className="mt-2 text-xs text-gray-500 flex justify-between">
                  <span>Used: {promo.usedCount}</span>
                  <span>Limit: {promo.usageLimit ?? "∞"}</span>
                </div>
              </div>
            )) : <p className="text-sm text-gray-400">No promo codes yet.</p>}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
        <h3 className="font-bold mb-4 text-gray-900">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/services" className="btn-primary">+ Add Service</Link>
          <Link href="/admin/staff" className="btn-secondary">+ Add Staff</Link>
          <Link href="/admin/promo-codes" className="btn-secondary">Promo Codes</Link>
          <Link href="/admin/bookings" className="btn-secondary">View Bookings</Link>
        </div>
      </div>
    </div>
  );
}
