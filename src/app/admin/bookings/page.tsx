"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { CalendarDays, Phone, Mail, Tag, RefreshCw, UserRound, Scissors, PoundSterling } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatPrice } from "@/lib/service-utils";

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

type Booking = {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  date: string;
  time: string;
  totalPrice: number;
  discount: number | null;
  promoCode: string | null;
  status: string;
  staff?: { name: string } | null;
  user?: { name: string; email: string; role: string } | null;
  services?: { service: { name: string; price: number; image?: string | null } }[];
};

const statuses = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"];

function serviceSummary(booking: Booking) {
  return (booking.services || []).map((s) => s.service?.name).filter(Boolean).join(", ") || "N/A";
}

function shortDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, { day: "2-digit", month: "short" });
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");

  const refresh = () => {
    setError("");
    api.admin.bookings()
      .then((d: any) => setBookings(d.bookings || []))
      .catch((err: any) => setError(err.message || "Failed to load bookings"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { refresh(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const old = bookings;
    setBookings((items) => items.map((b) => b.id === id ? { ...b, status } : b));
    try {
      await api.admin.updateBookingStatus(id, status);
    } catch (err: any) {
      setBookings(old);
      setError(err.message || "Failed to update booking status");
    }
  };

  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);
  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      PENDING: "bg-amber-100 text-amber-700",
      CONFIRMED: "bg-emerald-100 text-emerald-700",
      CANCELLED: "bg-red-100 text-red-700",
      COMPLETED: "bg-blue-100 text-blue-700",
      NO_SHOW: "bg-gray-100 text-gray-600",
    };
    return cn("px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wide whitespace-nowrap", map[status] || "bg-gray-100 text-gray-600");
  };

  const filterItems = ["all", ...statuses];

  return (
    <div className="pb-6">
      <div className="flex flex-col gap-3 mb-4 sm:mb-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Bookings</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Compact shop view — more bookings visible on desktop, thumb-friendly cards on phone.</p>
          </div>
          <button onClick={refresh} className="h-10 w-10 sm:w-auto sm:px-3 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-pink-600 hover:border-pink-200 inline-flex items-center justify-center gap-2 shrink-0">
            <RefreshCw size={16} /><span className="hidden sm:inline text-sm font-semibold">Refresh</span>
          </button>
        </div>

        <div className="-mx-3 sm:mx-0 overflow-x-auto pb-1 px-3 sm:px-0">
          <div className="flex gap-2 min-w-max">
            {filterItems.map((f) => {
              const count = f === "all" ? bookings.length : bookings.filter((b) => b.status === f).length;
              return (
                <button key={f} onClick={() => setFilter(f)} className={cn("px-3 py-2 rounded-xl text-xs sm:text-sm font-bold capitalize whitespace-nowrap", filter === f ? "bg-pink-600 text-white shadow-sm" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50")}>
                  {f === "all" ? "All" : f.toLowerCase().replace("_", " ")} <span className="opacity-70">{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading bookings...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No bookings found.</div>
      ) : (
        <>
          <div className="hidden lg:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="max-h-[calc(100vh-210px)] overflow-auto">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur border-b border-gray-100 text-[11px] uppercase tracking-wide text-gray-400">
                  <tr>
                    <th className="px-3 py-2 font-black">Time</th>
                    <th className="px-3 py-2 font-black">Customer</th>
                    <th className="px-3 py-2 font-black">Service</th>
                    <th className="px-3 py-2 font-black">Staff</th>
                    <th className="px-3 py-2 font-black text-right">Revenue</th>
                    <th className="px-3 py-2 font-black">Status</th>
                    <th className="px-3 py-2 font-black w-36">Update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((b) => (
                    <tr key={b.id} className="hover:bg-pink-50/30 align-middle">
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="font-black text-gray-900 leading-tight">{shortDate(b.date)}</div>
                        <div className="text-xs text-pink-600 font-bold">{b.time}</div>
                      </td>
                      <td className="px-3 py-2 min-w-[190px] max-w-[240px]">
                        <div className="font-bold text-gray-900 truncate">{b.customerName}</div>
                        <div className="text-[11px] text-gray-400 truncate">{b.customerPhone} · {b.customerEmail || b.user?.email || "No email"}</div>
                      </td>
                      <td className="px-3 py-2 max-w-[260px]">
                        <div className="text-gray-700 truncate font-medium">{serviceSummary(b)}</div>
                        {b.discount ? <div className="text-[11px] text-emerald-600 truncate">-{formatPrice(b.discount)} {b.promoCode ? `(${b.promoCode})` : ""}</div> : null}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-600">{b.staff?.name || "Any"}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-right font-black text-pink-600">{formatPrice(b.totalPrice)}</td>
                      <td className="px-3 py-2 whitespace-nowrap"><span className={statusBadge(b.status)}>{b.status}</span></td>
                      <td className="px-3 py-2">
                        <select value={b.status} onChange={(e) => updateStatus(b.id, e.target.value)} className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold focus:ring-2 focus:ring-pink-300 outline-none bg-white">
                          {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:hidden space-y-2.5">
            {filtered.map((b) => (
              <div key={b.id} className="bg-white rounded-2xl border border-gray-100 p-3 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-black text-gray-900 truncate">{b.customerName}</span>
                      <span className={statusBadge(b.status)}>{b.status}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-400">
                      <span className="inline-flex items-center gap-1"><CalendarDays size={11} />{shortDate(b.date)} {b.time}</span>
                      <span className="inline-flex items-center gap-1"><PoundSterling size={11} />{formatPrice(b.totalPrice)}</span>
                    </div>
                  </div>
                  <select value={b.status} onChange={(e) => updateStatus(b.id, e.target.value)} className="px-2 py-2 rounded-xl border border-gray-200 text-xs font-bold bg-white shrink-0 max-w-[120px]">
                    {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </div>

                <div className="mt-2 grid grid-cols-1 gap-1.5 text-xs text-gray-600">
                  <p className="flex items-center gap-1 min-w-0"><Scissors size={12} className="text-pink-500 shrink-0" /><span className="truncate">{serviceSummary(b)}</span></p>
                  <p className="flex items-center gap-1 min-w-0"><UserRound size={12} className="text-pink-500 shrink-0" /><span className="truncate">{b.staff?.name || "Any Staff"}</span></p>
                  <p className="flex items-center gap-1 min-w-0"><Phone size={12} className="text-pink-500 shrink-0" /><span className="truncate">{b.customerPhone}</span></p>
                  <p className="flex items-center gap-1 min-w-0"><Mail size={12} className="text-pink-500 shrink-0" /><span className="truncate">{b.customerEmail || b.user?.email || "No email"}</span></p>
                </div>

                {b.discount ? <div className="mt-2 flex items-center gap-1 text-emerald-600 text-xs"><Tag size={13} />Discount: -{formatPrice(b.discount)} {b.promoCode ? `(${b.promoCode})` : ""}</div> : null}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
