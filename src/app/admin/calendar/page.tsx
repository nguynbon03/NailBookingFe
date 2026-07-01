"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Download, RefreshCw, User } from "lucide-react";

const API_BASE = "https://bookingnail.overpowers.agency";

type Staff = { id: string; name: string; avatar?: string | null; role?: string };
type Booking = {
  id: string;
  customerName: string;
  customerPhone: string;
  date: string;
  time: string;
  status: string;
  totalPrice: number;
  staff?: { name: string } | null;
  services?: { service: { name: string } }[];
};

export const dynamic = "force-dynamic";

export default function AdminCalendarPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [schedule, setSchedule] = useState<Record<string, Booking[]>>({});
  const [from, setFrom] = useState(() => new Date().toISOString().slice(0, 10));
  const [to, setTo] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 6);
    return d.toISOString().slice(0, 10);
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("token") : null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const token = getToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const url = `${API_BASE}/api/staff/schedule?from=${from}&to=${to}`;
      const res = await fetch(url, { method: "GET", headers, credentials: "include" });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Schedule load failed (${res.status}) ${txt}`);
      }
      const data = await res.json();
      setStaff(data.staff || []);
      setSchedule(data.schedule || {});
    } catch (e: any) {
      setError(e.message || "Could not load calendar");
      setStaff([{ id: "demo", name: "Emma Linh", role: "Staff" }]);
      setSchedule({ demo: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [from, to]);

  const exportICS = (staffId?: string) => {
    const url = `${API_BASE}/api/staff/schedule/export?from=${from}&to=${to}&format=ics${staffId ? `&staffId=${staffId}` : ""}`;
    window.open(url, "_blank");
  };

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(from);
    d.setDate(d.getDate() + i);
    return d.toISOString().slice(0, 10);
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2"><CalendarDays /> Staff Appointment Calendar</h1>
          <p className="text-sm text-gray-500">2-way view • Export to Google/Outlook</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="px-4 py-2 rounded-xl border flex items-center gap-2"><RefreshCw size={16} /> Refresh</button>
          <button onClick={() => exportICS()} className="px-4 py-2 rounded-xl bg-emerald-600 text-white flex items-center gap-2"><Download size={16} /> Export All ICS</button>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <div>
          <label className="text-xs block mb-1">From</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="border rounded-xl p-2" />
        </div>
        <div>
          <label className="text-xs block mb-1">To</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} className="border rounded-xl p-2" />
        </div>
      </div>

      {error && <div className="text-red-600 mb-3 text-sm">Error: {error}</div>}

      {loading ? (
        <div className="text-gray-500">Loading schedule...</div>
      ) : (
        <div className="space-y-6">
          {staff.length === 0 ? <div>No staff found.</div> : staff.map((s) => {
            const bookings = schedule[s.id] || [];
            return (
              <div key={s.id} className="border rounded-3xl p-5 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-bold flex items-center gap-2"><User size={18} /> {s.name} <span className="text-xs text-gray-400">({s.role || 'Staff'})</span></div>
                  <button onClick={() => exportICS(s.id)} className="text-xs px-3 py-1 rounded-lg border flex items-center gap-1"><Download size={14} /> Export ICS</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-7 gap-2 text-xs">
                  {days.map(day => {
                    const dayBookings = bookings.filter((b: any) => b.date?.slice(0,10) === day);
                    return (
                      <div key={day} className="border rounded-2xl p-2 bg-gray-50 min-h-[120px]">
                        <div className="font-semibold mb-1 text-pink-600">{new Date(day).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                        {dayBookings.length === 0 ? (
                          <div className="text-gray-400 italic">Free</div>
                        ) : dayBookings.map((b: any) => (
                          <div key={b.id} className="mb-1 p-1.5 bg-white rounded-xl border text-[11px]">
                            <div className="font-semibold">{b.time} • {b.customerName}</div>
                            <div className="text-gray-500 truncate">{b.services?.[0]?.service?.name || 'Service'} • {b.status}</div>
                            <div className="text-gray-400">📞 {b.customerPhone}</div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3 text-xs text-gray-500">Total bookings this period: {bookings.length}</div>
              </div>
            );
          })}

          {schedule["unassigned"] && schedule["unassigned"].length > 0 && (
            <div className="border rounded-3xl p-5 bg-amber-50">
              <div className="font-bold mb-2">Unassigned / Pending</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {schedule["unassigned"].map((b: any) => (
                  <div key={b.id} className="p-2 bg-white rounded-xl border text-xs">{b.date} {b.time} • {b.customerName} • {b.services?.[0]?.service?.name}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded-2xl text-sm">
        <b>2-way Calendar Sync:</b> Export ICS above to import into Google/Outlook. (Full 2-way sync coming soon)
      </div>
    </div>
  );
}
