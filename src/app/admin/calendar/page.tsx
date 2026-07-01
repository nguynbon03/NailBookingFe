"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function AdminAppointmentCalendar() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState(() => new Date().toISOString().slice(0,10));
  const [to, setTo] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0,10);
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.staffSchedule(from, to);
      setData(res);
    } catch (e) {
      setData({ error: "Không tải được lịch" });
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [from, to]);

  const staffList = data?.staff || [];
  const schedule = data?.schedule || {};

  return (
    <div className="p-6">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black">Appointment Calendar</h1>
          <p className="text-sm text-gray-500">Xem booking của từng staff theo ngày (2-way view nội bộ)</p>
        </div>
        <div className="flex gap-2">
          <input type="date" value={from} onChange={e=>setFrom(e.target.value)} className="border px-3 py-2 rounded-xl text-sm" />
          <input type="date" value={to} onChange={e=>setTo(e.target.value)} className="border px-3 py-2 rounded-xl text-sm" />
          <button onClick={load} className="px-4 py-2 bg-pink-600 text-white rounded-xl text-sm font-bold">Tải lại</button>
          <a 
            href={`/api/staff/schedule/export?from=${from}&to=${to}`} 
            target="_blank"
            className="px-4 py-2 border rounded-xl text-sm font-bold"
          >
            Export .ics
          </a>
        </div>
      </div>

      {loading && <div className="text-sm text-gray-500">Đang tải lịch...</div>}

      {data?.error && <div className="text-red-500">{data.error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {staffList.map((staff: any) => {
          const bookings = schedule[staff.id] || [];
          return (
            <div key={staff.id} className="bg-white border rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-pink-100 flex items-center justify-center font-bold text-pink-700">
                  {staff.name?.[0] || "S"}
                </div>
                <div>
                  <div className="font-bold">{staff.name}</div>
                  <div className="text-xs text-gray-500">{staff.role}</div>
                </div>
              </div>

              {bookings.length === 0 ? (
                <div className="text-sm text-gray-400 py-4">Chưa có booking trong khoảng này</div>
              ) : (
                <div className="space-y-2">
                  {bookings.map((b: any) => (
                    <div key={b.id} className="border-l-4 border-pink-500 pl-3 py-1">
                      <div className="text-sm font-semibold">{b.time} — {b.service?.name}</div>
                      <div className="text-xs text-gray-600">{b.customer?.name} • {b.customer?.phone}</div>
                      <div className="text-[11px] text-gray-400 flex gap-2">
                        <span>{b.status}</span>
                        {b.depositRequired && <span className="text-amber-600">Deposit</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {schedule["unassigned"] && schedule["unassigned"].length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <div className="font-bold text-amber-800 mb-2">Chưa gán staff</div>
            {schedule["unassigned"].map((b: any) => (
              <div key={b.id} className="text-sm mb-1">
                {b.time} — {b.customer?.name} ({b.service?.name})
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 text-xs text-gray-500">
        Lưu ý: Đây là lịch xem nội bộ trong hệ thống. Muốn sync 2 chiều Google Calendar / Outlook cần tích hợp API sau.
      </div>
    </div>
  );
}
