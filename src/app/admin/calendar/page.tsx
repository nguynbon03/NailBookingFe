"use client";

import React, { useEffect, useState } from "react";
import { CalendarDays, Download, RefreshCw, User } from "lucide-react";

const API = "https://bookingnail.overpowers.agency";

type Staff = { id: string; name: string; role?: string };
type Booking = { id: string; customerName: string; date: string; time: string; status: string; customerPhone?: string };
type Leave = { id: string; startDate: string; endDate: string; reason: string; status: string; daysCount: number; managerNote?: string | null };
type Availability = { id: string; dayOfWeek: number | null; date: string | null; startTime: string; endTime: string; active: boolean };

export const dynamic = "force-dynamic";

export default function AdminCalendar() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [schedule, setSchedule] = useState<Record<string, Booking[]>>({});
  const [leaves, setLeaves] = useState<Record<string, Leave[]>>({});
  const [availability, setAvailability] = useState<Record<string, Availability[]>>({});
  const [from, setFrom] = useState(new Date().toISOString().slice(0, 10));
  const [to, setTo] = useState(() => { const d = new Date(); d.setDate(d.getDate() + 6); return d.toISOString().slice(0, 10); });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const h: any = { "Content-Type": "application/json" };
      if (token) h.Authorization = `Bearer ${token}`;

      const url = `${API}/api/staff/schedule?from=${from}&to=${to}`;
      const res = await fetch(url, { headers: h, credentials: "include" });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Failed (${res.status}) ${txt}`);
      }

      const json = await res.json();
      setStaff(json.staff || []);
      setSchedule(json.schedule || {});
      setLeaves(json.leaves || {});
      setAvailability(json.availability || {});
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (e: any) {
      setErr(e.message || "Load failed");
      // fallback demo data
      setStaff([{ id: "demo", name: "Emma Linh", role: "Staff" }]);
      setSchedule({ demo: [] });
      setLeaves({ demo: [] });
      setAvailability({ demo: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [from, to]);

  const exportICS = (sid?: string) => {
    window.open(`${API}/api/staff/schedule/export?from=${from}&to=${to}${sid ? `&staffId=${sid}` : ""}`, "_blank");
  };

  const days = (() => {
    const startDay = new Date(from + "T00:00:00");
    const endDay = new Date(to + "T00:00:00");
    const total = Math.max(1, Math.min(31, Math.floor((endDay.getTime() - startDay.getTime()) / 86400000) + 1));
    return Array.from({ length: total }, (_, i) => {
      const d = new Date(startDay);
      d.setDate(d.getDate() + i);
      return d.toISOString().slice(0, 10);
    });
  })();

  const leavesForDay = (items: Leave[], day: string) => items.filter((item) => item.startDate.slice(0, 10) <= day && item.endDate.slice(0, 10) >= day);
  const freeHoursForDay = (items: Availability[], day: string) => {
    const weekday = new Date(day + "T00:00:00").getDay();
    return items.filter((item) => item.date ? item.date.slice(0, 10) === day : item.dayOfWeek === weekday);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <CalendarDays /> Staff Appointment Calendar
          </h1>
          <p className="text-sm text-gray-500">2-way view • Export ICS • Last refresh: {lastUpdated || "—"}</p>
          {err && <p className="text-xs text-red-600 mt-1">Error: {err} (showing demo)</p>}
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="px-4 py-2 border rounded-xl flex items-center gap-2 text-sm">
            <RefreshCw size={16} /> Refresh
          </button>
          <button onClick={() => exportICS()} className="px-4 py-2 bg-emerald-600 text-white rounded-xl flex items-center gap-2 text-sm">
            <Download size={16} /> Export All ICS
          </button>
        </div>
      </div>

      <div className="flex gap-3 mb-4 text-sm">
        <div>
          <label className="block text-xs mb-1">From</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="border p-2 rounded-xl" />
        </div>
        <div>
          <label className="block text-xs mb-1">To</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} className="border p-2 rounded-xl" />
        </div>
      </div>

      {loading ? (
        <div className="text-gray-500">Loading schedule...</div>
      ) : (
        <div className="space-y-6">
          {staff.length === 0 && <div>No active staff.</div>}
          {staff.map((s) => {
            const bks: Booking[] = schedule[s.id] || [];
            return (
              <div key={s.id} className="border rounded-3xl p-5 bg-white">
                <div className="flex justify-between items-center mb-3">
                  <div className="font-bold flex items-center gap-2">
                    <User size={18} /> {s.name} <span className="text-xs text-gray-400">({s.role || "Staff"})</span>
                  </div>
                  <button onClick={() => exportICS(s.id)} className="text-xs px-3 py-1 border rounded-lg flex items-center gap-1">
                    <Download size={14} /> Export ICS
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-7 gap-2 text-xs">
                  {days.map((day) => {
                    const dayB = bks.filter((b) => b.date?.slice(0, 10) === day);
                    const dayLeaves = leavesForDay(leaves[s.id] || [], day);
                    const dayFree = freeHoursForDay(availability[s.id] || [], day);
                    return (
                      <div key={day} className="border rounded-2xl p-2 bg-gray-50 min-h-[150px]">
                        <div className="font-semibold text-pink-600 mb-1">
                          {new Date(day + "T00:00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                        </div>
                        <div className="mb-2 space-y-1">
                          {dayFree.length === 0 ? <div className="text-[11px] text-gray-400 italic">No free-hours setup</div> : dayFree.map((slot) => (
                            <div key={slot.id} className="rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700">Free {slot.startTime}-{slot.endTime}</div>
                          ))}
                          {dayLeaves.map((leave) => (
                            <div key={leave.id} className={`rounded-lg px-2 py-1 text-[11px] font-black ${leave.status === "APPROVED" ? "bg-red-50 text-red-700" : leave.status === "REJECTED" ? "bg-gray-100 text-gray-500" : "bg-amber-50 text-amber-700"}`}>Leave {leave.status}: {leave.reason}</div>
                          ))}
                        </div>
                        {dayB.length === 0 ? (
                          <div className="text-gray-400 italic">No bookings</div>
                        ) : (
                          dayB.map((b, idx) => (
                            <div key={idx} className="mb-1 p-1.5 bg-white rounded-xl border text-[11px]">
                              <div className="font-semibold">{b.time} • {b.customerName}</div>
                              <div className="text-gray-500">{b.status}</div>
                            </div>
                          ))
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-2 text-xs text-gray-500">Bookings: {bks.length}</div>
              </div>
            );
          })}

          {schedule.unassigned && schedule.unassigned.length > 0 && (
            <div className="border rounded-3xl p-5 bg-amber-50">
              <div className="font-bold mb-2">Unassigned / Pending</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {schedule.unassigned.map((b: Booking, i: number) => (
                  <div key={i} className="p-2 bg-white rounded-xl border text-xs">
                    {b.date} {b.time} • {b.customerName} • {b.status}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
