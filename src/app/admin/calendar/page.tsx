"use client";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import React, { useEffect, useState } from "react";
import { CalendarDays, Download, RefreshCw, User, Home } from "lucide-react";
import Link from "next/link";

const API = "https://bookingnail.overpowers.agency";

type Staff = { id: string; name: string; avatar?: string | null; role?: string };
type Booking = { id: string; customerName: string; customerPhone: string; date: string; time: string; status: string; services?: any[] };

export default function AdminCalendar() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [schedule, setSchedule] = useState<any>({});
  const [from, setFrom] = useState(new Date().toISOString().slice(0,10));
  const [to, setTo] = useState(() => { const d=new Date(); d.setDate(d.getDate()+6); return d.toISOString().slice(0,10); });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const load = async () => {
    setLoading(true); setErr("");
    try {
      const h: any = { "Content-Type": "application/json" };
      if (token) h.Authorization = `Bearer ${token}`;
      const r = await fetch(`${API}/api/staff/schedule?from=${from}&to=${to}`, { headers: h, credentials: "include" });
      if (!r.ok) throw new Error("Failed to load (" + r.status + ")");
      const j = await r.json();
      setStaff(j.staff || []);
      setSchedule(j.schedule || {});
    } catch(e:any) {
      setErr(e.message || "Load error");
      setStaff([{id:"demo", name:"Emma Linh"}]);
      setSchedule({demo:[]});
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [from,to]);

  const exportICS = (sid?:string) => window.open(`${API}/api/staff/schedule/export?from=${from}&to=${to}${sid?`&staffId=${sid}`:""}`, "_blank");

  const days = Array.from({length:7}, (_,i) => { const d=new Date(from); d.setDate(d.getDate()+i); return d.toISOString().slice(0,10); });

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2"><CalendarDays/> Staff Appointment Calendar</h1>
          <p className="text-sm text-gray-500">2-way view • Export ICS</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="px-4 py-2 border rounded-xl flex items-center gap-2"><RefreshCw size={16}/>Refresh</button>
          <button onClick={()=>exportICS()} className="px-4 py-2 bg-emerald-600 text-white rounded-xl flex items-center gap-2"><Download size={16}/>Export ICS</button>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <div><label className="text-xs block">From</label><input type="date" value={from} onChange={e=>setFrom(e.target.value)} className="border p-2 rounded-xl"/></div>
        <div><label className="text-xs block">To</label><input type="date" value={to} onChange={e=>setTo(e.target.value)} className="border p-2 rounded-xl"/></div>
      </div>

      {err && <div className="text-red-600 mb-2 text-sm">{err}</div>}

      {loading ? <div>Loading...</div> : (
        <div className="space-y-6">
          {staff.length === 0 ? <div>No staff</div> : staff.map(s => {
            const bks = schedule[s.id] || [];
            return (
              <div key={s.id} className="border rounded-3xl p-5 bg-white">
                <div className="flex justify-between mb-2">
                  <div className="font-bold flex items-center gap-2"><User size={18}/> {s.name}</div>
                  <button onClick={()=>exportICS(s.id)} className="text-xs px-3 py-1 border rounded">Export ICS</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-7 gap-2 text-xs">
                  {days.map(day => {
                    const dayB = bks.filter((b:any) => b.date?.slice(0,10) === day);
                    return (
                      <div key={day} className="border rounded-2xl p-2 bg-gray-50 min-h-[110px]">
                        <div className="font-semibold text-pink-600 mb-1">{new Date(day).toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'})}</div>
                        {dayB.length === 0 ? <div className="text-gray-400 italic">Free</div> : dayB.map((b:any,i:number)=>(
                          <div key={i} className="mb-1 p-1 bg-white rounded border text-[11px]">
                            {b.time} • {b.customerName}<br/>
                            <span className="text-gray-500">{b.status}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6">
        <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border hover:bg-white text-sm">
          <Home size={16}/> ← Back to Site
        </Link>
      </div>
    </div>
  );
}
