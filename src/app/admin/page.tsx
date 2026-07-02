"use client";

import { motion } from "framer-motion";
import { Users, CalendarDays, DollarSign, Package, UserCog, Tags, AlertTriangle, RefreshCw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";

type SeriesItem = { label: string; revenue: number; count: number };

type DashboardData = {
  filters?: { fromDate: string; toDate: string; label: string };
  stats: {
    totalUsers: number;
    customers: number;
    adminUsers: number;
    bookings: number;
    confirmedBookings: number;
    pendingBookings: number;
    cancelledBookings: number;
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

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoIso(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [granularity, setGranularity] = useState<"daily" | "monthly" | "yearly">("daily");
  const [fromDate, setFromDate] = useState(() => daysAgoIso(13));
  const [toDate, setToDate] = useState(() => todayIso());

  const load = () => {
    setLoading(true);
    setError("");
    api.admin.stats({ fromDate, toDate, granularity })
      .then((d: DashboardData) => setData(d))
      .catch((err: any) => setError(err.message || "Could not load dashboard"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [fromDate, toDate, granularity]);

  const stats = data?.stats || {
    totalUsers: 0,
    customers: 0,
    adminUsers: 0,
    bookings: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    cancelledBookings: 0,
    revenue: 0,
    services: 0,
    activeServices: 0,
    activePromoCodes: 0,
  };
  const series = data?.revenueSeries?.[granularity] || [];
  const maxCount = useMemo(() => Math.max(1, ...series.map((item) => item.count || 0)), [series]);

  const rangeLabel = data?.filters?.label || `${fromDate} to ${toDate}`;

  const cards = [
    { label: "Active bookings", value: stats.bookings, sub: `Visible bookings in ${rangeLabel}`, icon: CalendarDays, color: "from-violet-400 to-purple-400" },
    { label: "Confirmed revenue", value: money(stats.revenue), sub: `Confirmed/completed only in ${rangeLabel}`, icon: DollarSign, color: "from-emerald-400 to-teal-400" },
    { label: "Pending review", value: stats.pendingBookings, sub: "Still waiting for action/payment", icon: AlertTriangle, color: "from-amber-400 to-orange-400" },
    { label: "Cancelled", value: stats.cancelledBookings, sub: "Cancelled inside selected date range", icon: RefreshCw, color: "from-rose-400 to-pink-500" },
    { label: "Total Users", value: stats.totalUsers, sub: `${stats.customers} customers · ${stats.adminUsers} staff/admin`, icon: Users, color: "from-pink-400 to-rose-400" },
    { label: "Console Role", value: user?.role || "-", sub: user?.name || "Current user", icon: UserCog, color: "from-gray-500 to-gray-700" },
  ];

  return (
    <div>
      <div className="flex flex-col gap-4 mb-4 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Pick an exact date range to audit bookings and revenue. Archived/deleted bookings are excluded here.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm text-gray-600 truncate">{user?.name}</span>
            <span className="px-2.5 py-1 bg-pink-100 text-pink-700 rounded-full text-[10px] sm:text-xs font-bold uppercase">{user?.role}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-pink-600">Audit range</p>
              <p className="mt-1 text-sm text-gray-500">Use this filter before checking booking count, cancellations, and revenue so nothing looks “lost”.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm font-bold text-gray-700" />
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm font-bold text-gray-700" />
              <button onClick={() => { setFromDate(todayIso()); setToDate(todayIso()); }} className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-700">Today</button>
              <button onClick={() => { setFromDate(daysAgoIso(6)); setToDate(todayIso()); }} className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-700">Last 7 days</button>
              <button onClick={() => { setFromDate(daysAgoIso(29)); setToDate(todayIso()); }} className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-700">Last 30 days</button>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="mb-4 rounded-xl bg-orange-50 text-orange-700 p-3 text-sm flex gap-2"><AlertTriangle size={17} className="shrink-0" />{error}</div>}

      <div className="grid grid-cols-2 xl:grid-cols-3 gap-2.5 sm:gap-5 mb-4 sm:mb-8">
        {cards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-2xl p-3 sm:p-6 shadow-sm border border-gray-100">
            <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center text-white mb-2 sm:mb-4`}><c.icon size={18} /></div>
            <p className="text-xl sm:text-3xl font-black text-gray-900 truncate">{loading ? "..." : c.value}</p>
            <p className="text-xs sm:text-sm font-semibold text-gray-700 mt-1">{c.label}</p>
            <p className="hidden sm:block text-xs text-gray-400 mt-1">{c.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4 sm:gap-6 mb-4 sm:mb-8">
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <h3 className="font-bold text-gray-900">Booking Count / Revenue Trend</h3>
              <p className="text-xs text-gray-400">Current scope: {rangeLabel}. Switch the grouping below to inspect by exact day, month, or year.</p>
            </div>
            <div className="flex gap-2 bg-gray-50 rounded-xl p-1">
              {(["daily", "monthly", "yearly"] as const).map((item) => (
                <button key={item} onClick={() => setGranularity(item)} className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize ${granularity === item ? "bg-pink-600 text-white" : "text-gray-500 hover:bg-white"}`}>{item}</button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {series.length === 0 ? <div className="py-8 text-sm text-gray-400">No booking or revenue records in this range.</div> : series.map((item) => (
              <div key={item.label} className="grid grid-cols-[92px_1fr_126px] sm:grid-cols-[112px_1fr_160px] items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                <span className="text-gray-500 font-medium">{item.label}</span>
                <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-500" style={{ width: `${Math.max(2, ((item.count || 0) / maxCount) * 100)}%` }} />
                </div>
                <span className="text-right font-bold text-gray-900">{item.count || 0} bookings · {money(item.revenue)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
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

      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 mb-6 sm:mb-8">
        <h3 className="font-bold mb-3 sm:mb-4 text-gray-900">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
          <Link href="/admin/inbox" className="btn-secondary text-center">Inbox</Link>
          <Link href="/admin/customers" className="btn-secondary text-center">Customers</Link>
          <Link href="/admin/reports" className="btn-secondary text-center">Reports</Link>
          <Link href="/admin/services" className="btn-primary text-center">+ Add Service</Link>
          <Link href="/admin/staff" className="btn-secondary text-center">+ Add Staff</Link>
          <Link href="/admin/leave-requests" className="btn-secondary text-center">Leave Requests</Link>
          <Link href="/admin/promo-codes" className="btn-secondary text-center">Promo Codes</Link>
          <Link href="/admin/accounts" className="btn-secondary text-center">Accounts</Link>
          <Link href="/admin/bookings" className="btn-secondary text-center">View Bookings</Link>
        </div>
      </div>
    </div>
  );
}
