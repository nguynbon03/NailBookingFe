"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { CalendarDays, Phone, Mail, Tag, ImageIcon } from "lucide-react";
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

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");

  const refresh = () => {
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

  const filtered = filter === "all" ? bookings : bookings.filter(b => b.status === filter);
  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      PENDING: "bg-amber-100 text-amber-700",
      CONFIRMED: "bg-emerald-100 text-emerald-700",
      CANCELLED: "bg-red-100 text-red-700",
      COMPLETED: "bg-blue-100 text-blue-700",
      NO_SHOW: "bg-gray-100 text-gray-600",
    };
    return cn("px-2.5 py-1 rounded-full text-xs font-bold uppercase", map[status] || "bg-gray-100 text-gray-600");
  };

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bookings</h2>
          <p className="text-sm text-gray-500 mt-1">Shop view of all customer appointments. Update status in real time.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {["all", ...statuses].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={cn("px-3 py-1.5 rounded-lg text-sm font-medium capitalize", filter === f ? "bg-pink-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>{f === "all" ? "All" : f.toLowerCase().replace("_", " ")}</button>
          ))}
        </div>
      </div>
      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading bookings...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No bookings found.</div>
      ) : (
        <div className="space-y-4">
          {filtered.map((b) => {
            const firstService = b.services?.[0]?.service;
            return (
              <div key={b.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="flex flex-col xl:flex-row gap-5">
                  <div className="w-full xl:w-28 h-28 rounded-2xl overflow-hidden bg-pink-50 shrink-0 flex items-center justify-center text-pink-400">
                    {firstService?.image ? <img src={firstService.image} alt={firstService.name} className="w-full h-full object-cover" /> : <ImageIcon size={30} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div>
                        <div className="font-bold text-gray-900 text-lg">{b.customerName}</div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400 mt-1">
                          <span className="flex items-center gap-1"><Phone size={12} />{b.customerPhone}</span>
                          <span className="flex items-center gap-1"><Mail size={12} />{b.customerEmail || b.user?.email || "No email"}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={statusBadge(b.status)}>{b.status}</span>
                        <select value={b.status} onChange={(e) => updateStatus(b.id, e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-pink-300 outline-none">
                          {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 mt-4">
                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-xs text-gray-400 mb-1">Date & Time</p>
                        <p className="font-semibold text-gray-900 flex items-center gap-2"><CalendarDays size={14} className="text-pink-500" />{new Date(b.date).toLocaleDateString()} {b.time}</p>
                      </div>
                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-xs text-gray-400 mb-1">Staff</p>
                        <p className="font-semibold text-gray-900">{b.staff?.name || "Any Staff"}</p>
                      </div>
                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-xs text-gray-400 mb-1">Revenue</p>
                        <p className="font-bold text-pink-600">{formatPrice(b.totalPrice)}</p>
                      </div>
                    </div>

                    <div className="mt-4 text-sm text-gray-600">
                      <span className="font-semibold text-gray-900">Services: </span>
                      {(b.services || []).map((s) => s.service?.name).filter(Boolean).join(", ") || "N/A"}
                    </div>
                    {b.discount ? <div className="mt-2 flex items-center gap-1 text-green-600 text-sm"><Tag size={14} />Discount: -{formatPrice(b.discount)} {b.promoCode ? `(${b.promoCode})` : ""}</div> : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
