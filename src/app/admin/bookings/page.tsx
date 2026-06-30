"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { CalendarDays, CheckCircle, XCircle, Clock, User, Phone, Mail, DollarSign } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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
  services?: { service: { name: string; price: number } }[];
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    api.admin.bookings()
      .then((d: any) => setBookings(d.bookings || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? bookings : bookings.filter(b => b.status === filter);
  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      PENDING: "bg-amber-100 text-amber-700",
      CONFIRMED: "bg-emerald-100 text-emerald-700",
      CANCELLED: "bg-red-100 text-red-700",
      COMPLETED: "bg-blue-100 text-blue-700",
    };
    return cn("px-2.5 py-1 rounded-full text-xs font-bold uppercase", map[status] || "bg-gray-100 text-gray-600");
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Bookings</h2>
        <div className="flex gap-2">
          {["all", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium capitalize",
                filter === f ? "bg-pink-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {f === "all" ? "All" : f.toLowerCase()}
            </button>
          ))}
        </div>
      </div>
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading bookings...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No bookings found.</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Customer</th>
                  <th className="text-left px-4 py-3 font-semibold">Date & Time</th>
                  <th className="text-left px-4 py-3 font-semibold">Services</th>
                  <th className="text-left px-4 py-3 font-semibold">Price</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{b.customerName}</div>
                      <div className="flex items-center gap-1 text-gray-400 text-xs mt-1">
                        <Phone size={12} /> {b.customerPhone}
                      </div>
                      <div className="flex items-center gap-1 text-gray-400 text-xs">
                        <Mail size={12} /> {b.customerEmail}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <CalendarDays size={14} className="text-pink-500" />
                        <span>{new Date(b.date).toLocaleDateString()} {b.time}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-gray-600">
                        {(b.services || []).map((s) => s.service?.name).filter(Boolean).join(", ") || "N/A"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-gray-900">£{b.totalPrice}</div>
                      {b.discount > 0 && (
                        <div className="text-xs text-green-600">-{b.discount} {b.promoCode ? `(${b.promoCode})` : ""}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={statusBadge(b.status)}>{b.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
