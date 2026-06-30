"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { CalendarDays, CheckCircle, Clock, ClipboardList, LogOut, Bell, Plus, Trash, UserCheck } from "lucide-react";
import { formatPrice } from "@/lib/service-utils";

type Booking = {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  date: string;
  time: string;
  status: string;
  totalPrice: number;
  promoCode?: string | null;
  discount?: number | null;
  staff?: { name: string } | null;
  services?: { service: { name: string; price: number; duration: number; image?: string | null } }[];
};

type Notification = { id: string; title: string; message: string; read: boolean; createdAt: string; type: string };
type Availability = { id: string; dayOfWeek: number | null; date: string | null; startTime: string; endTime: string; active: boolean };

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const cancellationReasonHint = "Shop have Problem / Staff have problem / Shop is too busy / No Reason / Other";
const emptyAvailability = { dayOfWeek: "1", date: "", startTime: "09:00", endTime: "18:00", active: true };

function bookingServices(booking: Booking) {
  return (booking.services || []).map((item) => item.service?.name).filter(Boolean).join(", ") || "Service";
}

function statusClass(status: string) {
  const map: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700",
    CONFIRMED: "bg-emerald-100 text-emerald-700",
    COMPLETED: "bg-blue-100 text-blue-700",
    CANCELLED: "bg-red-100 text-red-700",
    NO_SHOW: "bg-gray-100 text-gray-600",
  };
  return `px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wide ${map[status] || "bg-gray-100 text-gray-600"}`;
}

function shortDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, { day: "2-digit", month: "short" });
}

export default function StaffPortalPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const [availableBookings, setAvailableBookings] = useState<Booking[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [form, setForm] = useState(emptyAvailability);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const allowed = user && ["STAFF", "ADMIN", "MANAGER"].includes(user.role);

  const refresh = () => {
    setError("");
    Promise.all([
      api.staff.dashboard(),
      api.notifications.list("staff"),
      api.staff.availability().catch(() => ({ availability: [] })),
    ])
      .then(([dashboard, notificationData, availabilityData]: any[]) => {
        setAvailableBookings(dashboard.availableBookings || []);
        setMyBookings(dashboard.myBookings || []);
        setNotifications(notificationData.notifications || []);
        setAvailability(availabilityData.availability || []);
      })
      .catch((err: any) => setError(err.message || "Could not load staff portal"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      window.location.href = "/login";
      return;
    }
    if (!allowed) {
      window.location.href = "/";
      return;
    }
    refresh();
  }, [authLoading, user?.id]);

  const runAction = async (id: string, action: string, cancellationReason?: string | null) => {
    try {
      await api.staff.action(id, action, cancellationReason);
      refresh();
    } catch (err: any) {
      setError(err.message || "Action failed");
    }
  };

  const runCancelAction = (id: string) => {
    const reason = window.prompt(`Reason for cancelling (${cancellationReasonHint})`, "Staff have problem");
    if (reason === null) return;
    runAction(id, "cancel", reason.trim() || "Staff have problem");
  };

  const saveAvailability = async () => {
    try {
      await api.staff.createAvailability({
        dayOfWeek: form.date ? null : Number(form.dayOfWeek),
        date: form.date || null,
        startTime: form.startTime,
        endTime: form.endTime,
        active: form.active,
      });
      setForm(emptyAvailability);
      refresh();
    } catch (err: any) {
      setError(err.message || "Could not save availability");
    }
  };

  const deleteAvailability = async (id: string) => {
    await api.staff.deleteAvailability(id);
    refresh();
  };

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading staff portal...</div>;
  }

  return (
    <>
      <Navbar />
      <main className="pt-20 sm:pt-24 min-h-screen bg-gradient-to-b from-pink-50/70 to-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 pb-20">
          <div className="flex items-start justify-between gap-3 mb-4 sm:mb-8">
            <div className="min-w-0">
              <p className="text-pink-500 font-black text-xs sm:text-sm uppercase tracking-wide mb-1">Staff Portal</p>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">Jobs & Schedule</h1>
              <p className="hidden sm:block text-gray-500 mt-2">Claim available bookings, confirm work, and keep the shop owner notified.</p>
            </div>
            <button onClick={logout} className="h-10 px-3 rounded-xl bg-white border border-gray-200 text-gray-600 text-xs font-bold inline-flex items-center gap-1.5 shrink-0"><LogOut size={15} />Logout</button>
          </div>

          {error && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>}

          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-8">
            <div className="bg-white rounded-2xl p-3 sm:p-5 border border-pink-100 shadow-sm"><ClipboardList className="text-pink-500 mb-1 sm:mb-2" size={18} /><p className="text-2xl sm:text-3xl font-black leading-none">{availableBookings.length}</p><p className="text-[11px] sm:text-sm text-gray-500 mt-1">Open</p></div>
            <div className="bg-white rounded-2xl p-3 sm:p-5 border border-pink-100 shadow-sm"><CalendarDays className="text-emerald-500 mb-1 sm:mb-2" size={18} /><p className="text-2xl sm:text-3xl font-black leading-none">{myBookings.length}</p><p className="text-[11px] sm:text-sm text-gray-500 mt-1">Mine</p></div>
            <div className="bg-white rounded-2xl p-3 sm:p-5 border border-pink-100 shadow-sm"><Bell className="text-amber-500 mb-1 sm:mb-2" size={18} /><p className="text-2xl sm:text-3xl font-black leading-none">{notifications.filter((n) => !n.read).length}</p><p className="text-[11px] sm:text-sm text-gray-500 mt-1">Unread</p></div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px] gap-4 sm:gap-6">
            <div className="space-y-4 sm:space-y-6 min-w-0">
              <section className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-pink-100 shadow-sm">
                <div className="flex items-center justify-between mb-4 sm:mb-5">
                  <h2 className="text-lg sm:text-xl font-black text-gray-900">Available Jobs</h2>
                  <button onClick={refresh} className="h-10 px-3 rounded-xl bg-pink-50 text-pink-600 text-xs sm:text-sm font-bold">Refresh</button>
                </div>
                {availableBookings.length === 0 ? <p className="text-sm text-gray-400">No open jobs right now.</p> : <div className="space-y-2.5 sm:space-y-3">
                  {availableBookings.map((booking) => (
                    <div key={booking.id} className="rounded-2xl border border-gray-100 p-3 sm:p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5"><span className="font-black text-gray-900 truncate">{booking.customerName}</span><span className={statusClass(booking.status)}>{booking.status}</span></div>
                        <p className="text-sm text-gray-600 truncate">{bookingServices(booking)}</p>
                        <p className="text-xs text-gray-400 mt-1"><Clock size={12} className="inline mr-1" />{shortDate(booking.date)} {booking.time} · {formatPrice(booking.totalPrice)}</p>
                      </div>
                      <button onClick={() => runAction(booking.id, "claim")} className="btn-primary w-full lg:w-auto min-h-11 inline-flex items-center justify-center gap-2"><UserCheck size={16} />Claim & Confirm</button>
                    </div>
                  ))}
                </div>}
              </section>

              <section className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-pink-100 shadow-sm">
                <h2 className="text-lg sm:text-xl font-black text-gray-900 mb-4 sm:mb-5">My Schedule</h2>
                {myBookings.length === 0 ? <p className="text-sm text-gray-400">No assigned jobs yet.</p> : <div className="space-y-2.5 sm:space-y-3">
                  {myBookings.map((booking) => (
                    <div key={booking.id} className="rounded-2xl border border-gray-100 p-3 sm:p-4">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5"><span className="font-black text-gray-900 truncate">{booking.customerName}</span><span className={statusClass(booking.status)}>{booking.status}</span></div>
                          <p className="text-sm text-gray-600 truncate">{bookingServices(booking)}</p>
                          <p className="text-xs text-gray-400 mt-1"><Clock size={12} className="inline mr-1" />{shortDate(booking.date)} {booking.time} · {formatPrice(booking.totalPrice)}</p>
                          <p className="text-xs text-gray-400 mt-1 truncate">Phone: {booking.customerPhone}</p>
                        </div>
                        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                          {booking.status === "PENDING" && <button onClick={() => runAction(booking.id, "confirm")} className="btn-primary min-h-11 text-sm">Confirm</button>}
                          {booking.status === "CONFIRMED" && <button onClick={() => runAction(booking.id, "complete")} className="btn-primary min-h-11 text-sm"><CheckCircle size={14} className="inline mr-1" />Complete</button>}
                          <button onClick={() => runCancelAction(booking.id)} className="btn-secondary min-h-11 text-sm">Cancel</button>
                          <button onClick={() => runAction(booking.id, "no_show")} className="btn-secondary min-h-11 text-sm">No-show</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>}
              </section>
            </div>

            <aside className="space-y-4 sm:space-y-6 min-w-0">
              <section className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-pink-100 shadow-sm">
                <h2 className="text-lg sm:text-xl font-black text-gray-900 mb-4">My Free Hours</h2>
                <div className="space-y-3 mb-4">
                  <label className="block text-sm font-semibold text-gray-700">Repeat every</label>
                  <select className="w-full min-h-11 p-3 rounded-xl border border-pink-200" value={form.dayOfWeek} onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value, date: "" })}>{days.map((d, i) => <option key={d} value={i}>{d}</option>)}</select>
                  <label className="block text-sm font-semibold text-gray-700">Or specific date</label>
                  <input type="date" className="w-full min-h-11 p-3 rounded-xl border border-pink-200" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-sm font-semibold text-gray-700 mb-1">Start</label><input type="time" className="w-full min-h-11 p-3 rounded-xl border border-pink-200" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} /></div>
                    <div><label className="block text-sm font-semibold text-gray-700 mb-1">End</label><input type="time" className="w-full min-h-11 p-3 rounded-xl border border-pink-200" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} /></div>
                  </div>
                  <button onClick={saveAvailability} className="btn-primary w-full min-h-11 inline-flex justify-center items-center gap-2"><Plus size={16} />Add Free Slot</button>
                </div>
                <div className="space-y-2 max-h-[240px] overflow-auto pr-1">
                  {availability.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-2 rounded-xl bg-gray-50 p-3 text-sm">
                      <span className="truncate">{item.date ? new Date(item.date).toLocaleDateString() : days[item.dayOfWeek ?? 0]} · {item.startTime}-{item.endTime}</span>
                      <button onClick={() => deleteAvailability(item.id)} className="h-9 w-9 rounded-lg bg-red-50 text-red-500 inline-flex items-center justify-center shrink-0"><Trash size={14} /></button>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-pink-100 shadow-sm">
                <h2 className="text-lg sm:text-xl font-black text-gray-900 mb-4">Notifications</h2>
                {notifications.length === 0 ? <p className="text-sm text-gray-400">No notifications.</p> : <div className="space-y-2.5 max-h-[320px] overflow-auto pr-1">
                  {notifications.map((n) => (
                    <div key={n.id} className={`rounded-2xl p-3 border ${n.read ? "bg-white border-gray-100" : "bg-pink-50 border-pink-100"}`}>
                      <p className="font-bold text-sm text-gray-900">{n.title}</p>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{n.message}</p>
                      <p className="text-[11px] text-gray-400 mt-2">{new Date(n.createdAt).toLocaleString()}</p>
                    </div>
                  ))}
                </div>}
              </section>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
