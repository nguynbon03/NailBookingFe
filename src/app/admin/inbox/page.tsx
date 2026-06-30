"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { AlertTriangle, Bell, CheckCheck, RefreshCw, Trash2 } from "lucide-react";

type NotificationRow = {
  id: string;
  audience: string;
  staffId?: string | null;
  bookingId?: string | null;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

function shortDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString(undefined, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function typeClass(type: string) {
  if (type.includes("CANCEL")) return "bg-red-50 text-red-700 border-red-100";
  if (type.includes("LEAVE")) return "bg-sky-50 text-sky-700 border-sky-100";
  if (type.includes("BANK") || type.includes("REVENUE")) return "bg-emerald-50 text-emerald-700 border-emerald-100";
  return "bg-pink-50 text-pink-700 border-pink-100";
}

export default function AdminInboxPage() {
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = () => {
    setError("");
    setLoading(true);
    api.notifications.list("admin", 100)
      .then((data: any) => {
        setItems(data.notifications || []);
        setUnread(data.unread || 0);
      })
      .catch((err: any) => setError(err.message || "Could not load inbox"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { refresh(); }, []);

  const markOne = async (id: string, read: boolean) => {
    try {
      await api.notifications.markOne(id, read, "admin");
      setItems((rows) => rows.map((row) => row.id === id ? { ...row, read } : row));
      setUnread((n) => Math.max(0, n + (read ? -1 : 1)));
    } catch (err: any) {
      setError(err.message || "Could not update notification");
    }
  };

  const markAll = async () => {
    try {
      await api.notifications.markAll("admin");
      setItems((rows) => rows.map((row) => ({ ...row, read: true })));
      setUnread(0);
    } catch (err: any) {
      setError(err.message || "Could not mark inbox read");
    }
  };

  const remove = async (id: string) => {
    try {
      await api.notifications.deleteOne(id, "admin");
      setItems((rows) => rows.filter((row) => row.id !== id));
    } catch (err: any) {
      setError(err.message || "Could not delete notification");
    }
  };

  const stats = useMemo(() => ({
    cancel: items.filter((item) => item.type.includes("CANCEL")).length,
    leave: items.filter((item) => item.type.includes("LEAVE")).length,
    unread,
  }), [items, unread]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <p className="text-pink-600 text-xs font-black uppercase tracking-wide">Admin operations inbox</p>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-1">Inbox</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">One place for user cancellation alerts, pending cancellations, staff leave requests, bank/report events, and cleanup messages.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={refresh} className="h-10 px-3 rounded-xl bg-white border border-gray-200 text-gray-600 text-sm font-bold inline-flex items-center gap-2"><RefreshCw size={16} />Refresh</button>
          <button onClick={markAll} className="h-10 px-3 rounded-xl bg-pink-600 text-white text-sm font-bold inline-flex items-center gap-2"><CheckCheck size={16} />Mark all read</button>
        </div>
      </div>

      {error && <div className="mb-4 rounded-xl bg-orange-50 text-orange-700 p-3 text-sm flex gap-2"><AlertTriangle size={17} className="shrink-0" />{error}</div>}

      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-white rounded-2xl border border-pink-100 p-3 sm:p-5"><p className="text-[11px] font-black text-pink-500 uppercase">Unread</p><p className="text-2xl font-black text-gray-900">{stats.unread}</p></div>
        <div className="bg-white rounded-2xl border border-red-100 p-3 sm:p-5"><p className="text-[11px] font-black text-red-500 uppercase">Cancel alerts</p><p className="text-2xl font-black text-gray-900">{stats.cancel}</p></div>
        <div className="bg-white rounded-2xl border border-sky-100 p-3 sm:p-5"><p className="text-[11px] font-black text-sky-500 uppercase">Leave alerts</p><p className="text-2xl font-black text-gray-900">{stats.leave}</p></div>
      </div>

      {loading ? <div className="py-12 text-center text-gray-400">Loading inbox...</div> : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400">Inbox is empty.</div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className={`bg-white rounded-2xl border shadow-sm p-4 ${item.read ? "border-gray-100" : "border-pink-200 ring-2 ring-pink-50"}`}>
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Bell size={17} className={item.read ? "text-gray-400" : "text-pink-600"} />
                    <h3 className="font-black text-gray-900">{item.title}</h3>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${typeClass(item.type)}`}>{item.type.replace(/_/g, " ")}</span>
                    {!item.read && <span className="px-2 py-1 rounded-full bg-pink-600 text-white text-[10px] font-black uppercase">Unread</span>}
                  </div>
                  <p className="text-sm text-gray-600 leading-6">{item.message}</p>
                  <p className="text-xs text-gray-400 mt-2">{shortDate(item.createdAt)}{item.bookingId ? ` · booking ${item.bookingId.slice(-8).toUpperCase()}` : ""}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => markOne(item.id, !item.read)} className="min-h-10 rounded-xl bg-gray-50 px-3 text-gray-600 text-sm font-bold hover:bg-gray-100">{item.read ? "Unread" : "Read"}</button>
                  <button onClick={() => remove(item.id)} className="min-h-10 w-10 rounded-xl bg-red-50 text-red-600 inline-flex items-center justify-center hover:bg-red-100"><Trash2 size={15} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
