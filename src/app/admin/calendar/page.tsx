"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { CalendarDays, RefreshCw, User } from "lucide-react";
import Link from "next/link";

type Staff = { id: string; name: string; avatar?: string | null };
type Booking = {
  id: string;
  customerName: string;
  time: string;
  status: string;
  customerPhone: string;
  totalPrice: number;
  staff?: { name: string } | null;
};

export default function AdminCalendarPage() {
  const [from, setFrom] = useState(() => new Date().toISOString().slice(0, 10));
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [data, setData] = useState<{ staff: Staff[]; schedule: Record<string, Booking[]> } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.staffSchedule(from, to);
      setData(res);
    } catch (e: any) {
      setError(e.message || "Failed to load schedule");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [from, to]);

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      PENDING: "bg-amber-100 text-amber-800 border-amber-200",
      CONFIRMED: "bg-emerald-100 text-emerald-800 border-emerald-200",
      COMPLETED: "bg-blue-100 text-blue-800 border-blue-200",
      CANCELLED: "bg-red-100 text-red-800 border-red-200",
      NO_SHOW: "bg-gray-100 text-gray-700 border-gray-200",
    };
    return map[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarDays className="text-pink-600" />
            <div>
              <h1 className="text-2xl font-black">Staff Appointment Calendar</h1>
              <p className="text-sm text-gray-500">2-way view • Booking overview per staff</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/admin" className="px-4 py-2 text-sm border rounded-xl hover:bg-gray-50">← Admin</Link>
            <button onClick={load} className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-xl text-sm hover:bg-pink-700">
              <RefreshCw size={16} /> Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-4 mb-6">
          <div>
            <label className="text-xs text-gray-500">From</label>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="text-xs text-gray-500">To</label>
            <input type="date" value={to} onChange={e => setTo(e.target.value)} className="border rounded-lg px-3 py-2" />
          </div>
          <button onClick={load} className="mt-5 px-6 py-2 bg-black text-white rounded-xl text-sm">Apply</button>
        </div>

        {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">{error}</div>}

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading schedule...</div>
        ) : !data ? null : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {data.staff.map((st) => {
              const bookings = data.schedule[st.id] || [];
              return (
                <div key={st.id} className="bg-white rounded-2xl border border-gray-200 p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center overflow-hidden">
                      {st.avatar ? <img src={st.avatar} alt="" className="w-full h-full object-cover" /> : <User size={20} className="text-pink-600" />}
                    </div>
                    <div>
                      <div className="font-bold text-lg">{st.name}</div>
                      <div className="text-xs text-gray-500">{bookings.length} booking(s) in range</div>
                    </div>
                  </div>

                  {bookings.length === 0 ? (
                    <div className="text-sm text-gray-400 py-4">No bookings scheduled</div>
                  ) : (
                    <div className="space-y-2">
                      {bookings.sort((a, b) => a.time.localeCompare(b.time)).map(b => (
                        <div key={b.id} className={`p-3 rounded-xl border text-sm ${getStatusColor(b.status)}`}>
                          <div className="font-bold flex justify-between">
                            <span>{b.time}</span>
                            <span className="text-xs font-mono">{b.status}</span>
                          </div>
                          <div className="mt-1 text-gray-800">{b.customerName}</div>
                          <div className="text-xs text-gray-600 mt-0.5">{b.customerPhone} • £{b.totalPrice}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Unassigned */}
            {data.schedule["unassigned"]?.length > 0 && (
              <div className="bg-white rounded-2xl border border-amber-200 p-5">
                <div className="font-bold text-lg mb-4 text-amber-700">Unassigned / Pending</div>
                <div className="space-y-2">
                  {data.schedule["unassigned"].map(b => (
                    <div key={b.id} className={`p-3 rounded-xl border text-sm ${getStatusColor(b.status)}`}>
                      <div className="font-bold flex justify-between">
                        <span>{b.time}</span>
                        <span className="text-xs font-mono">{b.status}</span>
                      </div>
                      <div className="mt-1 text-gray-800">{b.customerName}</div>
                      <div className="text-xs text-gray-600 mt-0.5">{b.customerPhone} • £{b.totalPrice}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 text-xs text-gray-500">
          This is a read-only staff appointment calendar. For 2-way sync (Google/Outlook), use the ICS export or integrate OAuth later.
        </div>
      </div>
    </div>
  );
}
