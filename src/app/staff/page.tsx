"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/service-utils";
import {
  AlertTriangle,
  BadgeCheck,
  Bell,
  CalendarCheck,
  CalendarDays,
  CheckCircle,
  ChevronRight,
  Clock,
  ClipboardList,
  History,
  LogOut,
  Mail,
  Phone,
  Plane,
  Plus,
  PoundSterling,
  RefreshCw,
  Send,
  Sparkles,
  Trash,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";

type Booking = {
  id: string;
  customerName: string;
  customerPhone?: string | null;
  customerEmail?: string | null;
  date: string;
  time: string;
  status: string;
  totalPrice: number;
  numPeople?: number;
  promoCode?: string | null;
  discount?: number | null;
  paymentConfirmedAt?: string | null;
  paymentConfirmedBy?: string | null;
  depositRequired?: boolean;
  depositAmount?: number | null;
  requestedStaff?: { name?: string | null } | null;
  staff?: { name?: string | null } | null;
  staffRejectionReason?: string | null;
  staffRejectedAt?: string | null;
  externalProvider?: string | null;
  externalBookingUid?: string | null;
  externalSyncStatus?: string | null;
  externalLastSyncedAt?: string | null;
  googleCalendarEventId?: string | null;
  googleCalendarLastError?: string | null;
  createdAt?: string;
  updatedAt?: string;
  services?: { service?: { name?: string | null; price?: number; duration?: number; image?: string | null } | null }[];
};

type Notification = { id: string; title: string; message: string; read: boolean; createdAt: string; type: string };
type Availability = { id: string; dayOfWeek: number | null; date: string | null; startTime: string; endTime: string; active: boolean };
type WeekDraftItem = { enabled: boolean; startTime: string; endTime: string };
type LeaveRequest = { id: string; startDate: string; endDate: string; daysCount: number; reason: string; status: string; managerNote?: string | null; reviewedBy?: string | null; reviewedAt?: string | null; createdAt: string };
type DashboardStats = { available: number; assigned: number; history: number; completed: number; revenueToday?: number; revenueWeek?: number; revenueMonth?: number; revenueTotal?: number };
type ViewKey = "requests" | "schedule" | "history" | "availability" | "leave" | "notifications";
type PortalLang = "en" | "vi";

const staffCopy = {
  en: {
    portal: "Staff Portal",
    dashboard: "Work dashboard",
    hero: "Accept jobs, see today's schedule, review booking history, set availability, and submit leave tickets from one simple dashboard.",
    refresh: "Refresh",
    logout: "Logout",
    signedInAs: "Signed in as",
    navRequests: "Open requests",
    navSchedule: "My schedule",
    navHistory: "Booking history",
    navAvailability: "Availability",
    navLeave: "Leave tickets",
    navNotifications: "Notifications",
    open: "Open", assigned: "Assigned", today: "Today", history: "History", unread: "Unread", revenueToday: "Revenue today", revenueWeek: "Revenue this week", revenueTotal: "Revenue total",
    rotaTitle: "Weekly rota",
    rotaSubtitle: "Compact schedule setup: turn on the days you work, set start/end time, then save once.",
    weekStarts: "Week starts",
    workingDays: "Working days",
    activeSlots: "Saved slots",
    quickSetup: "Quick setup",
    weekdays: "Mon-Fri 09-18",
    copyFirst: "Copy first working day",
    clearWeek: "Clear week",
    off: "Off",
    working: "Working",
    start: "Start",
    end: "End",
    saveWeek: "Save week",
    savingWeek: "Saving...",
    extraTitle: "Extra shift",
    extraSubtitle: "Add a second block or one special date only when needed.",
    repeatEvery: "Repeat every",
    specificDate: "Specific date",
    addSlot: "Add slot",
    savedTitle: "Saved hours",
    savedSubtitle: "Your current working slots.",
    noHoursTitle: "No hours saved yet",
    noHoursText: "Turn on working days and save the week so bookings can be assigned correctly.",
  },
  vi: {
    portal: "Cổng nhân viên",
    dashboard: "Bảng công việc",
    hero: "Nhận lịch, xem việc hôm nay, kiểm tra lịch sử, đăng ký giờ làm và gửi yêu cầu nghỉ trong một màn hình đơn giản.",
    refresh: "Tải lại",
    logout: "Đăng xuất",
    signedInAs: "Đang đăng nhập",
    navRequests: "Lịch chờ nhận",
    navSchedule: "Lịch của tôi",
    navHistory: "Lịch sử booking",
    navAvailability: "Giờ làm",
    navLeave: "Xin nghỉ",
    navNotifications: "Thông báo",
    open: "Đang mở", assigned: "Đã nhận", today: "Hôm nay", history: "Lịch sử", unread: "Chưa đọc", revenueToday: "Doanh thu hôm nay", revenueWeek: "Doanh thu tuần này", revenueTotal: "Tổng doanh thu",
    rotaTitle: "Đăng ký lịch làm",
    rotaSubtitle: "Giao diện gọn: bật ngày đi làm, chọn giờ bắt đầu/kết thúc, rồi lưu một lần.",
    weekStarts: "Tuần bắt đầu",
    workingDays: "Ngày làm",
    activeSlots: "Ca đã lưu",
    quickSetup: "Thiết lập nhanh",
    weekdays: "Thứ 2-6 09-18",
    copyFirst: "Copy ngày đầu",
    clearWeek: "Xóa tuần",
    off: "Nghỉ",
    working: "Đi làm",
    start: "Bắt đầu",
    end: "Kết thúc",
    saveWeek: "Lưu lịch tuần",
    savingWeek: "Đang lưu...",
    extraTitle: "Ca bổ sung",
    extraSubtitle: "Chỉ dùng khi cần thêm ca thứ hai hoặc một ngày đặc biệt.",
    repeatEvery: "Lặp lại mỗi",
    specificDate: "Ngày cụ thể",
    addSlot: "Thêm ca",
    savedTitle: "Giờ đã lưu",
    savedSubtitle: "Các khung giờ làm hiện tại.",
    noHoursTitle: "Chưa có giờ làm",
    noHoursText: "Bật ngày đi làm và lưu tuần để hệ thống phân lịch chính xác.",
  },
} as const;

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const rejectReasons = ["Staff have problem", "Time not available", "Service skill mismatch", "Too busy", "Other"];
const emptyAvailability = { dayOfWeek: "1", date: "", startTime: "09:00", endTime: "18:00", active: true };

function todayISO() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

function nextMondayISO() {
  const d = new Date();
  const day = d.getDay();
  const add = day === 0 ? 1 : 8 - day;
  d.setDate(d.getDate() + add);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

function addDaysISO(value: string, daysToAdd: number) {
  const d = new Date(value + "T00:00:00");
  d.setDate(d.getDate() + daysToAdd);
  return d.toISOString().slice(0, 10);
}

function dateISO(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 10);
  return d.toISOString().slice(0, 10);
}

function defaultWeekDraft(weekStart: string, availability: Availability[]) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDaysISO(weekStart, index);
    const match = availability.find((item) => dateISO(item.date) === date) || availability.find((item) => !item.date && item.dayOfWeek === ((index + 1) % 7));
    return [date, {
      enabled: Boolean(match),
      startTime: match?.startTime || "09:00",
      endTime: match?.endTime || "18:00",
    } satisfies WeekDraftItem];
  }).reduce<Record<string, WeekDraftItem>>((acc, [date, value]) => {
    acc[date] = value;
    return acc;
  }, {});
}

function shortDate(value?: string | null) {
  const iso = dateISO(value);
  if (!iso) return "—";
  const date = new Date(iso + "T00:00:00");
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleDateString(undefined, { weekday: "short", day: "2-digit", month: "short" });
}

function longDateTime(value?: string | null) {
  if (!value) return "Never";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString();
}

function bookingServices(booking: Booking) {
  return (booking.services || []).map((item) => item.service?.name).filter(Boolean).join(", ") || "Service";
}

function bookingDuration(booking: Booking) {
  const minutes = (booking.services || []).reduce((sum, item) => sum + Number(item.service?.duration || 0), 0);
  return minutes ? `${minutes} min` : "Duration pending";
}

function statusClass(status: string) {
  const map: Record<string, string> = {
    PENDING: "border-amber-200 bg-amber-50 text-amber-700",
    CONFIRMED: "border-emerald-200 bg-emerald-50 text-emerald-700",
    COMPLETED: "border-blue-200 bg-blue-50 text-blue-700",
    CANCELLED: "border-red-200 bg-red-50 text-red-700",
    NO_SHOW: "border-gray-200 bg-gray-100 text-gray-600",
    APPROVED: "border-emerald-200 bg-emerald-50 text-emerald-700",
    REJECTED: "border-red-200 bg-red-50 text-red-700",
  };
  return `inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-black uppercase tracking-wide ${map[status] || "border-gray-200 bg-gray-50 text-gray-600"}`;
}

function syncLabel(booking: Booking) {
  if (booking.externalBookingUid) return `Synced to ${booking.externalProvider || "calendar"}`;
  if (booking.externalSyncStatus === "FAILED") return "Calendar sync failed";
  return "Not synced yet";
}

function StatCard({ icon, label, value, tone = "pink" }: { icon: React.ReactNode; label: string; value: number | string; tone?: "pink" | "emerald" | "amber" | "sky" | "slate" }) {
  const tones = {
    pink: "border-pink-100 bg-pink-50 text-pink-600",
    emerald: "border-emerald-100 bg-emerald-50 text-emerald-600",
    amber: "border-amber-100 bg-amber-50 text-amber-600",
    sky: "border-sky-100 bg-sky-50 text-sky-600",
    slate: "border-slate-100 bg-slate-50 text-slate-600",
  };
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-2xl border ${tones[tone]}`}>{icon}</div>
      <p className="text-2xl font-black leading-none text-gray-950">{value}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-wide text-gray-400">{label}</p>
    </div>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
      <Sparkles className="mx-auto mb-3 text-pink-300" size={28} />
      <p className="font-black text-gray-900">{title}</p>
      <p className="mt-1 text-sm leading-6 text-gray-500">{text}</p>
    </div>
  );
}

function Section({ title, subtitle, action, children }: { title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-[2rem] border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-gray-950">{title}</h2>
          {subtitle && <p className="mt-1 text-sm leading-6 text-gray-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function DetailLine({ icon, label, value }: { icon: React.ReactNode; label: string; value?: React.ReactNode }) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-2xl bg-gray-50 px-3 py-2 text-xs text-gray-600">
      <span className="shrink-0 text-gray-400">{icon}</span>
      <span className="font-black text-gray-400">{label}</span>
      <span className="min-w-0 truncate font-bold text-gray-800">{value || "—"}</span>
    </div>
  );
}

function BookingCard({ booking, mode, onAccept, onComplete, onReject, onNoShow, busy = false }: { booking: Booking; mode: "request" | "schedule" | "history"; onAccept?: () => void; onComplete?: () => void; onReject?: () => void; onNoShow?: () => void; busy?: boolean }) {
  const people = Number(booking.numPeople || 1);
  const statusText = mode === "request" && booking.status === "CONFIRMED" ? "Replacement needed" : booking.status;
  return (
    <article className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="border-b border-gray-100 bg-gradient-to-r from-pink-50 via-white to-amber-50 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h3 className="truncate text-lg font-black text-gray-950">{booking.customerName}</h3>
              <span className={statusClass(booking.status)}>{statusText}</span>
              {people > 1 && <span className="rounded-full border border-violet-100 bg-violet-50 px-2.5 py-1 text-[11px] font-black text-violet-700">{people} people</span>}
            </div>
            <p className="text-sm font-bold text-gray-700">{bookingServices(booking)}</p>
            <p className="mt-1 text-xs text-gray-500">{bookingDuration(booking)} · {formatPrice(booking.totalPrice || 0)}</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            {mode === "request" && <button disabled={busy} onClick={onAccept} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-pink-600 px-4 text-sm font-black text-white hover:bg-pink-700 disabled:opacity-50"><UserCheck size={16} />{busy ? "Accepting..." : "Accept job"}</button>}
            {mode === "schedule" && (
              <>
                <button disabled={busy} onClick={onComplete} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 text-sm font-black text-white hover:bg-emerald-700 disabled:opacity-50"><CheckCircle size={16} />{busy ? "Updating..." : "Complete"}</button>
                <button disabled={busy} onClick={onReject} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-orange-200 bg-orange-50 px-4 text-sm font-black text-orange-700 hover:bg-orange-100 disabled:opacity-50"><XCircle size={16} />{busy ? "Updating..." : "Cannot take"}</button>
                <button disabled={busy} onClick={onNoShow} className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 text-sm font-black text-gray-700 hover:bg-gray-50 disabled:opacity-50">{busy ? "Updating..." : "No-show"}</button>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="grid gap-2 p-4 sm:grid-cols-2 xl:grid-cols-3">
        <DetailLine icon={<CalendarDays size={14} />} label="Date" value={`${shortDate(booking.date)} · ${booking.time}`} />
        <DetailLine icon={<Phone size={14} />} label="Phone" value={booking.customerPhone || "No phone"} />
        <DetailLine icon={<Mail size={14} />} label="Email" value={booking.customerEmail || "No email"} />
        <DetailLine icon={<Users size={14} />} label="Staff" value={booking.staff?.name || booking.requestedStaff?.name || "Any available staff"} />
        <DetailLine icon={<BadgeCheck size={14} />} label="Deposit" value={booking.depositRequired ? (booking.paymentConfirmedAt ? `Confirmed by ${booking.paymentConfirmedBy || "Manager"}` : `Required ${formatPrice(Number(booking.depositAmount || 0))}`) : "Not required"} />
        <DetailLine icon={<CalendarCheck size={14} />} label="Calendar" value={syncLabel(booking)} />
      </div>
      {(booking.staffRejectionReason || booking.googleCalendarLastError) && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-0">
          {booking.staffRejectionReason && <p className="rounded-2xl bg-orange-50 px-3 py-2 text-xs font-bold text-orange-700">Previous staff rejected: {booking.staffRejectionReason}</p>}
          {booking.googleCalendarLastError && <p className="mt-2 rounded-2xl bg-red-50 px-3 py-2 text-xs font-bold text-red-700">Calendar note: {booking.googleCalendarLastError}</p>}
        </div>
      )}
    </article>
  );
}

export default function StaffPortalPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const [view, setView] = useState<ViewKey>("requests");
  const [availableBookings, setAvailableBookings] = useState<Booking[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [historyBookings, setHistoryBookings] = useState<Booking[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({ available: 0, assigned: 0, history: 0, completed: 0, revenueToday: 0, revenueWeek: 0, revenueMonth: 0, revenueTotal: 0 });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [form, setForm] = useState(emptyAvailability);
  const [weekStart, setWeekStart] = useState(nextMondayISO());
  const [weekDraft, setWeekDraft] = useState<Record<string, WeekDraftItem>>({});
  const [selectedNotifications, setSelectedNotifications] = useState<Record<string, boolean>>({});
  const [leaveForm, setLeaveForm] = useState({ startDate: todayISO(), endDate: todayISO(), reason: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [actionBusyId, setActionBusyId] = useState("");
  const [rejectTarget, setRejectTarget] = useState<Booking | null>(null);
  const [rejectReason, setRejectReason] = useState(rejectReasons[0]);
  const [rejectOther, setRejectOther] = useState("");
  const [lang, setLang] = useState<PortalLang>("en");
  const copy = staffCopy[lang];

  const allowed = user && ["STAFF", "ADMIN", "MANAGER"].includes(user.role);
  const pendingLeaves = leaveRequests.filter((item) => item.status === "PENDING").length;
  const unread = notifications.filter((n) => !n.read).length;
  const selectedNotificationIds = notifications.filter((item) => selectedNotifications[item.id]).map((item) => item.id);
  const allNotificationsSelected = notifications.length > 0 && notifications.every((item) => selectedNotifications[item.id]);
  const weekDays = Array.from({ length: 7 }, (_, index) => addDaysISO(weekStart, index));
  const today = todayISO();

  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem("nail_staff_lang") : null;
    if (saved === "en" || saved === "vi") setLang(saved);
  }, []);

  const switchLang = (next: PortalLang) => {
    setLang(next);
    if (typeof window !== "undefined") window.localStorage.setItem("nail_staff_lang", next);
  };

  useEffect(() => {
    setSelectedNotifications((current) => Object.fromEntries(Object.entries(current).filter(([id]) => notifications.some((item) => item.id === id))));
  }, [notifications]);

  useEffect(() => {
    setWeekDraft(defaultWeekDraft(weekStart, availability));
  }, [weekStart, availability]);

  const todayBookings = useMemo(() => myBookings.filter((booking) => dateISO(booking.date) === today), [myBookings, today]);
  const nextBooking = useMemo(() => myBookings[0], [myBookings]);

  const refresh = () => {
    setError("");
    Promise.all([
      api.staff.dashboard(),
      api.notifications.list("staff", 80),
      api.staff.availability().catch(() => ({ availability: [] })),
      api.staff.leaves().catch(() => ({ leaveRequests: [] })),
    ])
      .then(([dashboard, notificationData, availabilityData, leaveData]: any[]) => {
        const slots = availabilityData.availability || [];
        setAvailableBookings(dashboard.availableBookings || []);
        setMyBookings(dashboard.myBookings || []);
        setHistoryBookings(dashboard.historyBookings || []);
        setDashboardStats(dashboard.stats || { available: 0, assigned: 0, history: 0, completed: 0, revenueToday: 0, revenueWeek: 0, revenueMonth: 0, revenueTotal: 0 });
        setNotifications(notificationData.notifications || []);
        setAvailability(slots);
        setLeaveRequests(leaveData.leaveRequests || []);
        setView((current) => (current === "requests" && slots.length === 0 ? "availability" : current));
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
    const timer = window.setInterval(refresh, 15000);
    return () => window.clearInterval(timer);
  }, [authLoading, user?.id]);

  const runAction = async (id: string, action: string, reason?: string | null) => {
    try {
      setActionBusyId(`${action}:${id}`);
      setError("");
      const result = await api.staff.action(id, action, reason);
      if (result?.calcomSync?.ok) setNotice("Booking updated and synced to calendar.");
      else setNotice("Booking updated.");
      refresh();
    } catch (err: any) {
      setError(err.message || "Action failed");
    } finally {
      setActionBusyId("");
    }
  };

  const openReject = (booking: Booking) => {
    setRejectTarget(booking);
    setRejectReason(rejectReasons[0]);
    setRejectOther("");
  };

  const submitReject = async () => {
    if (!rejectTarget) return;
    const reason = rejectReason === "Other" ? rejectOther.trim() : rejectReason;
    if (!reason) {
      setError("Please enter a reason before rejecting the job");
      return;
    }
    await runAction(rejectTarget.id, "reject", reason);
    setRejectTarget(null);
  };

  const saveAvailability = async () => {
    try {
      setSaving(true);
      setError("");
      await api.staff.createAvailability({
        dayOfWeek: form.date ? null : Number(form.dayOfWeek),
        date: form.date || null,
        startTime: form.startTime,
        endTime: form.endTime,
        active: form.active,
      });
      setForm(emptyAvailability);
      setNotice(lang === "vi" ? "Đã lưu ca làm bổ sung." : "Extra shift saved.");
      refresh();
    } catch (err: any) {
      setError(err.message || "Could not save availability");
    } finally {
      setSaving(false);
    }
  };

  const saveWeeklyAvailability = async () => {
    const selectedDates = weekDays.filter((day) => weekDraft[day]?.enabled);
    for (const date of selectedDates) {
      const slot = weekDraft[date];
      if (!slot?.startTime || !slot?.endTime || slot.startTime >= slot.endTime) {
        setError(lang === "vi" ? `Kiểm tra lại giờ làm cho ${shortDate(date)}` : `Please check working hours for ${shortDate(date)}`);
        return;
      }
    }
    try {
      setSaving(true);
      setError("");
      await api.staff.replaceWeekAvailability({
        weekStart,
        weekEnd: weekDays[weekDays.length - 1],
        slots: selectedDates.map((date) => ({
          dayOfWeek: null,
          date,
          startTime: weekDraft[date].startTime,
          endTime: weekDraft[date].endTime,
          active: true,
        })),
      });
      setNotice(selectedDates.length ? (lang === "vi" ? "Đã lưu lịch làm tuần và thay thế lịch cũ của tuần này." : "Weekly rota saved and old slots for that week were replaced.") : (lang === "vi" ? "Đã xóa lịch làm của tuần này." : "This week was cleared from your saved availability."));
      refresh();
    } catch (err: any) {
      setError(err.message || "Could not save weekly availability");
    } finally {
      setSaving(false);
    }
  };

  const deleteAvailability = async (id: string) => {
    await api.staff.deleteAvailability(id);
    setNotice("Availability slot removed.");
    refresh();
  };

  const requestLeave = async () => {
    try {
      if (!leaveForm.startDate || !leaveForm.endDate || !leaveForm.reason.trim()) {
        setError("Please enter leave dates and reason");
        return;
      }
      setSaving(true);
      setError("");
      await api.staff.requestLeave(leaveForm);
      setLeaveForm({ startDate: todayISO(), endDate: todayISO(), reason: "" });
      setNotice("Leave ticket submitted for manager review.");
      refresh();
    } catch (err: any) {
      setError(err.message || "Could not request leave");
    } finally {
      setSaving(false);
    }
  };

  const cancelLeave = async (id: string) => {
    try {
      await api.staff.cancelLeave(id);
      setNotice("Leave ticket cancelled.");
      refresh();
    } catch (err: any) {
      setError(err.message || "Could not cancel leave request");
    }
  };

  const markNotificationsRead = async () => {
    await api.notifications.markAll("staff");
    refresh();
  };

  const deleteSelectedNotifications = async () => {
    if (!selectedNotificationIds.length) return;
    await api.notifications.deleteMany(selectedNotificationIds, "staff");
    setNotice(`${selectedNotificationIds.length} notification(s) deleted.`);
    setSelectedNotifications({});
    refresh();
  };

  const deleteAllNotifications = async () => {
    if (!notifications.length) return;
    await api.notifications.deleteAll("staff");
    setNotice("All staff notifications deleted.");
    setSelectedNotifications({});
    refresh();
  };

  const workingDayCount = weekDays.filter((day) => weekDraft[day]?.enabled).length;

  const applyWeekdaysPreset = () => {
    setWeekDraft(Object.fromEntries(weekDays.map((day) => {
      const jsDay = new Date(day + "T00:00:00").getDay();
      const enabled = jsDay >= 1 && jsDay <= 5;
      return [day, { enabled, startTime: "09:00", endTime: "18:00" } satisfies WeekDraftItem];
    })));
  };

  const copyFirstWorkingDay = () => {
    const first = weekDays.map((day) => weekDraft[day]).find((slot) => slot?.enabled);
    if (!first) return;
    setWeekDraft((current) => Object.fromEntries(weekDays.map((day) => [day, current[day]?.enabled ? { ...current[day], startTime: first.startTime, endTime: first.endTime } : (current[day] || { enabled: false, startTime: first.startTime, endTime: first.endTime })])));
  };

  const clearWeek = () => setWeekDraft(Object.fromEntries(weekDays.map((day) => [day, { enabled: false, startTime: "09:00", endTime: "18:00" } satisfies WeekDraftItem])));

  const navItems: { key: ViewKey; label: string; count?: number; icon: React.ReactNode }[] = [
    { key: "requests", label: copy.navRequests, count: availableBookings.length, icon: <ClipboardList size={17} /> },
    { key: "schedule", label: copy.navSchedule, count: myBookings.length, icon: <CalendarDays size={17} /> },
    { key: "history", label: copy.navHistory, count: historyBookings.length, icon: <History size={17} /> },
    { key: "availability", label: copy.navAvailability, count: availability.length, icon: <CalendarCheck size={17} /> },
    { key: "leave", label: copy.navLeave, count: pendingLeaves, icon: <Plane size={17} /> },
    { key: "notifications", label: copy.navNotifications, count: unread, icon: <Bell size={17} /> },
  ];

  if (authLoading || loading) {
    return <div className="flex min-h-screen items-center justify-center bg-pink-50 text-sm font-bold text-gray-500">{lang === "vi" ? "Đang tải cổng nhân viên..." : "Loading staff portal..."}</div>;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-white pt-20 sm:pt-24">
        <div className="mx-auto max-w-7xl px-3 py-4 pb-20 sm:px-6 sm:py-8">
          <div className="mb-5 overflow-hidden rounded-[2rem] border border-pink-100 bg-gradient-to-br from-pink-50 via-white to-amber-50 p-5 shadow-sm sm:p-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-pink-600">{copy.portal}</p>
                <h1 className="mt-2 text-2xl font-black leading-tight text-gray-950 sm:text-4xl">{copy.dashboard}</h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">{copy.hero}</p>
                {nextBooking && <p className="mt-3 inline-flex rounded-full bg-white px-3 py-1.5 text-xs font-black text-gray-700 shadow-sm">Next job: {shortDate(nextBooking.date)} at {nextBooking.time} · {nextBooking.customerName}</p>}
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="inline-flex h-11 overflow-hidden rounded-2xl border border-pink-100 bg-white p-1 text-xs font-black shadow-sm" data-i18n="staff-language-toggle">
                  <button onClick={() => switchLang("en")} className={`rounded-xl px-3 ${lang === "en" ? "bg-pink-600 text-white" : "text-gray-500"}`}>EN</button>
                  <button onClick={() => switchLang("vi")} className={`rounded-xl px-3 ${lang === "vi" ? "bg-pink-600 text-white" : "text-gray-500"}`}>VI</button>
                </div>
                <button onClick={refresh} className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-black text-gray-700 hover:bg-gray-50"><RefreshCw size={16} />{copy.refresh}</button>
                <button onClick={logout} className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-gray-900 px-4 text-sm font-black text-white hover:bg-gray-800"><LogOut size={16} />{copy.logout}</button>
              </div>
            </div>
          </div>

          {error && <div className="mb-4 flex gap-2 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-700"><AlertTriangle size={18} className="shrink-0" />{error}</div>}
          {notice && <div className="mb-4 flex gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-bold text-emerald-700"><CheckCircle size={18} className="shrink-0" />{notice}</div>}

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              <StatCard icon={<ClipboardList size={20} />} label={copy.open} value={dashboardStats.available || availableBookings.length} tone="pink" />
              <StatCard icon={<CalendarDays size={20} />} label={copy.assigned} value={dashboardStats.assigned || myBookings.length} tone="emerald" />
              <StatCard icon={<Clock size={20} />} label={copy.today} value={todayBookings.length} tone="amber" />
              <StatCard icon={<History size={20} />} label={copy.history} value={dashboardStats.history || historyBookings.length} tone="sky" />
              <StatCard icon={<Bell size={20} />} label={copy.unread} value={unread} tone="slate" />
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <StatCard icon={<PoundSterling size={20} />} label={copy.revenueToday} value={formatPrice(dashboardStats.revenueToday || 0)} tone="emerald" />
              <StatCard icon={<PoundSterling size={20} />} label={copy.revenueWeek} value={formatPrice(dashboardStats.revenueWeek || 0)} tone="amber" />
              <StatCard icon={<PoundSterling size={20} />} label={copy.revenueTotal} value={formatPrice(dashboardStats.revenueTotal || 0)} tone="pink" />
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-[270px_minmax(0,1fr)]">
            <aside className="rounded-[2rem] border border-gray-100 bg-white p-3 shadow-sm xl:sticky xl:top-24 xl:self-start">
              <div className="mb-3 rounded-3xl bg-gray-50 p-4">
                <p className="text-xs font-black uppercase tracking-wide text-gray-400">{copy.signedInAs}</p>
                <p className="mt-1 truncate text-sm font-black text-gray-950">{user?.name || user?.email || "Staff"}</p>
                <p className="text-xs font-bold text-pink-600">{user?.role}</p>
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <button key={item.key} onClick={() => setView(item.key)} className={`flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-3 text-left text-sm font-black transition ${view === item.key ? "bg-pink-600 text-white shadow-lg shadow-pink-100" : "text-gray-600 hover:bg-gray-50"}`}>
                    <span className="flex min-w-0 items-center gap-2">{item.icon}<span className="truncate">{item.label}</span></span>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] ${view === item.key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>{item.count ?? 0}</span>
                  </button>
                ))}
              </nav>
            </aside>

            <div className="min-w-0 space-y-5">
              {view === "requests" && (
                <Section title="Open booking requests" subtitle="Verified customer bookings that are open to you. Accepting assigns the job to your schedule." action={<button onClick={refresh} className="inline-flex h-10 items-center gap-2 rounded-2xl bg-pink-50 px-3 text-sm font-black text-pink-600"><RefreshCw size={15} />Refresh</button>}>
                  {availableBookings.length === 0 ? <EmptyState title="No open requests right now" text="New verified booking requests will appear here automatically." /> : <div className="space-y-3">{availableBookings.map((booking) => <BookingCard key={booking.id} booking={booking} mode="request" busy={actionBusyId === `claim:${booking.id}` || actionBusyId === `accept:${booking.id}`} onAccept={() => runAction(booking.id, "claim")} />)}</div>}
                </Section>
              )}

              {view === "schedule" && (
                <Section title="My schedule" subtitle="Confirmed jobs assigned to you. Complete, mark no-show, or return a job to the replacement pool if you cannot take it.">
                  {myBookings.length === 0 ? <EmptyState title="No confirmed jobs assigned" text="Accepted bookings will appear in this schedule with phone, email, services, payment and calendar sync details." /> : <div className="space-y-3">{myBookings.map((booking) => <BookingCard key={booking.id} booking={booking} mode="schedule" busy={actionBusyId.endsWith(`:${booking.id}`)} onComplete={() => runAction(booking.id, "complete")} onReject={() => openReject(booking)} onNoShow={() => runAction(booking.id, "no_show")} />)}</div>}
                </Section>
              )}

              {view === "history" && (
                <Section title="Booking history" subtitle="Completed, no-show and cancelled jobs assigned to you. This keeps full customer, service, payment and calendar details for quick review.">
                  {historyBookings.length === 0 ? <EmptyState title="No history yet" text="Completed, cancelled and no-show bookings will be saved here." /> : <div className="space-y-3">{historyBookings.map((booking) => <BookingCard key={booking.id} booking={booking} mode="history" />)}</div>}
                </Section>
              )}

              {view === "availability" && (
                <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_360px]" data-staff-availability-ux="compact-bilingual-v20260709">
                  <Section title={copy.rotaTitle} subtitle={copy.rotaSubtitle}>
                    <div className="mb-4 grid gap-3 md:grid-cols-[220px_1fr]">
                      <label className="block rounded-3xl border border-pink-100 bg-white p-3 shadow-sm">
                        <span className="mb-1 block text-[11px] font-black uppercase tracking-wide text-gray-400">{copy.weekStarts}</span>
                        <input type="date" className="h-11 w-full rounded-2xl border border-pink-200 px-3 text-sm font-black outline-none focus:ring-4 focus:ring-pink-50" value={weekStart} onChange={(e) => setWeekStart(e.target.value)} />
                      </label>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div className="rounded-3xl border border-pink-100 bg-pink-50 p-3"><p className="text-2xl font-black text-pink-700">{workingDayCount}</p><p className="text-[11px] font-black uppercase tracking-wide text-pink-500">{copy.workingDays}</p></div>
                        <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-3"><p className="text-2xl font-black text-emerald-700">{availability.length}</p><p className="text-[11px] font-black uppercase tracking-wide text-emerald-500">{copy.activeSlots}</p></div>
                        <button type="button" onClick={applyWeekdaysPreset} className="rounded-3xl border border-gray-100 bg-gray-950 px-3 py-3 text-left text-xs font-black text-white shadow-sm hover:bg-gray-800">{copy.weekdays}</button>
                        <button type="button" onClick={clearWeek} className="rounded-3xl border border-gray-200 bg-white px-3 py-3 text-left text-xs font-black text-gray-700 hover:bg-gray-50">{copy.clearWeek}</button>
                      </div>
                    </div>

                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-gray-400">{copy.quickSetup}</p>
                      <button type="button" onClick={copyFirstWorkingDay} className="rounded-full border border-pink-100 bg-pink-50 px-3 py-1.5 text-xs font-black text-pink-700 hover:bg-pink-100">{copy.copyFirst}</button>
                    </div>

                    <div className="overflow-hidden rounded-[1.75rem] border border-gray-100 bg-white shadow-sm">
                      {weekDays.map((day) => {
                        const slot = weekDraft[day] || { enabled: false, startTime: "09:00", endTime: "18:00" };
                        const date = new Date(day + "T00:00:00");
                        const weekday = date.toLocaleDateString(lang === "vi" ? "vi-VN" : undefined, { weekday: "short" });
                        const monthDay = date.toLocaleDateString(lang === "vi" ? "vi-VN" : undefined, { day: "2-digit", month: "short" });
                        return (
                          <div key={day} className={`grid gap-3 border-b border-gray-100 p-3 last:border-b-0 sm:grid-cols-[150px_minmax(0,1fr)_92px] sm:items-center ${slot.enabled ? "bg-pink-50/55" : "bg-white"}`}>
                            <button
                              type="button"
                              onClick={() => setWeekDraft((current) => ({ ...current, [day]: { ...(current[day] || slot), enabled: !(current[day]?.enabled ?? slot.enabled) } }))}
                              className="flex items-center gap-3 text-left"
                            >
                              <span className={`relative h-7 w-12 shrink-0 rounded-full transition ${slot.enabled ? "bg-pink-600" : "bg-gray-300"}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${slot.enabled ? "left-6" : "left-1"}`} /></span>
                              <span><span className="block text-sm font-black text-gray-950">{weekday}</span><span className="block text-xs font-bold text-gray-500">{monthDay}</span></span>
                            </button>
                            <div className="grid grid-cols-2 gap-2">
                              <label className="sr-only">{copy.start}</label>
                              <input aria-label={`${copy.start} ${weekday}`} type="time" disabled={!slot.enabled} className="h-11 rounded-2xl border border-pink-200 bg-white px-3 text-sm font-black outline-none focus:ring-4 focus:ring-pink-50 disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400" value={slot.startTime} onChange={(e) => setWeekDraft((current) => ({ ...current, [day]: { ...(current[day] || slot), startTime: e.target.value } }))} />
                              <label className="sr-only">{copy.end}</label>
                              <input aria-label={`${copy.end} ${weekday}`} type="time" disabled={!slot.enabled} className="h-11 rounded-2xl border border-pink-200 bg-white px-3 text-sm font-black outline-none focus:ring-4 focus:ring-pink-50 disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400" value={slot.endTime} onChange={(e) => setWeekDraft((current) => ({ ...current, [day]: { ...(current[day] || slot), endTime: e.target.value } }))} />
                            </div>
                            <span className={`inline-flex h-9 items-center justify-center rounded-2xl text-xs font-black ${slot.enabled ? "bg-pink-600 text-white" : "bg-gray-100 text-gray-500"}`}>{slot.enabled ? copy.working : copy.off}</span>
                          </div>
                        );
                      })}
                    </div>
                    <button onClick={saveWeeklyAvailability} disabled={saving} className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-pink-600 px-4 text-sm font-black text-white hover:bg-pink-700 disabled:opacity-50"><Plus size={16} />{saving ? copy.savingWeek : copy.saveWeek}</button>
                  </Section>

                  <div className="space-y-5">
                    <Section title={copy.extraTitle} subtitle={copy.extraSubtitle}>
                      <div className="space-y-3">
                        <label className="block"><span className="mb-1 block text-xs font-black uppercase tracking-wide text-gray-400">{copy.repeatEvery}</span><select className="h-12 w-full rounded-2xl border border-pink-200 px-4 text-sm font-bold outline-none focus:ring-4 focus:ring-pink-50" value={form.dayOfWeek} onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value, date: "" })}>{days.map((d, i) => <option key={d} value={i}>{lang === "vi" ? new Date(`2026-07-${12 + i}T00:00:00`).toLocaleDateString("vi-VN", { weekday: "long" }) : d}</option>)}</select></label>
                        <label className="block"><span className="mb-1 block text-xs font-black uppercase tracking-wide text-gray-400">{copy.specificDate}</span><input type="date" className="h-12 w-full rounded-2xl border border-pink-200 px-4 text-sm font-bold outline-none focus:ring-4 focus:ring-pink-50" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label>
                        <div className="grid grid-cols-2 gap-3">
                          <label className="block"><span className="mb-1 block text-xs font-black uppercase tracking-wide text-gray-400">{copy.start}</span><input type="time" className="h-12 w-full rounded-2xl border border-pink-200 px-4 text-sm font-bold outline-none focus:ring-4 focus:ring-pink-50" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} /></label>
                          <label className="block"><span className="mb-1 block text-xs font-black uppercase tracking-wide text-gray-400">{copy.end}</span><input type="time" className="h-12 w-full rounded-2xl border border-pink-200 px-4 text-sm font-bold outline-none focus:ring-4 focus:ring-pink-50" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} /></label>
                        </div>
                        <button onClick={saveAvailability} disabled={saving} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gray-900 px-4 text-sm font-black text-white hover:bg-gray-800 disabled:opacity-50"><Plus size={16} />{copy.addSlot}</button>
                      </div>
                    </Section>

                    <Section title={copy.savedTitle} subtitle={copy.savedSubtitle}>
                      {availability.length === 0 ? <EmptyState title={copy.noHoursTitle} text={copy.noHoursText} /> : <div className="grid gap-2">{availability.map((item) => <div key={item.id} className="flex items-center justify-between gap-2 rounded-2xl bg-gray-50 p-3 text-sm"><span className="truncate font-bold text-gray-700">{item.date ? shortDate(item.date) : (lang === "vi" ? new Date(`2026-07-${12 + (item.dayOfWeek ?? 0)}T00:00:00`).toLocaleDateString("vi-VN", { weekday: "long" }) : days[item.dayOfWeek ?? 0])} · {item.startTime}-{item.endTime}</span><button onClick={() => deleteAvailability(item.id)} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500"><Trash size={15} /></button></div>)}</div>}
                    </Section>
                  </div>
                </div>
              )}

              {view === "leave" && (
                <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
                  <Section title="Day off / leave ticket" subtitle="Submit leave before the day off. Approved leave hides your free hours for those dates.">
                    <div className="grid grid-cols-2 gap-3">
                      <label className="block"><span className="mb-1 block text-xs font-black uppercase tracking-wide text-gray-400">From</span><input type="date" className="h-12 w-full rounded-2xl border border-sky-200 px-4 text-sm font-bold outline-none focus:ring-4 focus:ring-sky-50" value={leaveForm.startDate} onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value, endDate: leaveForm.endDate || e.target.value })} /></label>
                      <label className="block"><span className="mb-1 block text-xs font-black uppercase tracking-wide text-gray-400">To</span><input type="date" className="h-12 w-full rounded-2xl border border-sky-200 px-4 text-sm font-bold outline-none focus:ring-4 focus:ring-sky-50" value={leaveForm.endDate} onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })} /></label>
                    </div>
                    <textarea className="mt-3 min-h-28 w-full rounded-2xl border border-sky-200 p-4 text-sm outline-none focus:ring-4 focus:ring-sky-50" placeholder="Reason: today sick, family matter, holiday request..." value={leaveForm.reason} onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })} />
                    <button onClick={requestLeave} disabled={saving} className="mt-3 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-pink-600 px-4 text-sm font-black text-white hover:bg-pink-700 disabled:opacity-50"><Send size={16} />{saving ? "Submitting..." : "Submit leave ticket"}</button>
                  </Section>

                  <Section title="Leave history" subtitle="Manager approval status and notes appear here.">
                    {leaveRequests.length === 0 ? <EmptyState title="No leave requests yet" text="Submit a day off ticket and it will appear here." /> : <div className="grid gap-3 lg:grid-cols-2">{leaveRequests.map((item) => <div key={item.id} className="rounded-3xl border border-gray-100 p-4"><div className="flex items-center justify-between gap-2"><b className="text-gray-950">{shortDate(item.startDate)} → {shortDate(item.endDate)}</b><span className={statusClass(item.status)}>{item.status}</span></div><p className="mt-2 text-sm text-gray-600">{item.daysCount} day(s) · {item.reason}</p>{item.managerNote && <p className="mt-2 rounded-2xl bg-gray-50 px-3 py-2 text-xs font-bold text-gray-500">Manager note: {item.managerNote}</p>}{item.status === "PENDING" && <button onClick={() => cancelLeave(item.id)} className="mt-3 text-sm font-black text-red-600">Cancel request</button>}</div>)}</div>}
                  </Section>
                </div>
              )}

              {view === "notifications" && (
                <Section title="Notifications" subtitle="Only updates linked to your own leave tickets or your own assigned bookings appear here." action={<div className="flex flex-wrap gap-2"><button onClick={markNotificationsRead} className="inline-flex h-10 items-center gap-2 rounded-2xl bg-gray-900 px-3 text-sm font-black text-white"><Bell size={15} />Mark all read</button><button onClick={deleteSelectedNotifications} disabled={!selectedNotificationIds.length} className="inline-flex h-10 items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-3 text-sm font-black text-red-600 disabled:opacity-40"><Trash size={15} />Delete selected</button><button onClick={deleteAllNotifications} disabled={!notifications.length} className="inline-flex h-10 items-center gap-2 rounded-2xl bg-red-600 px-3 text-sm font-black text-white disabled:opacity-40"><Trash size={15} />Delete all</button></div>}>
                  {notifications.length === 0 ? <EmptyState title="No notifications" text="Important booking and leave updates will appear here." /> : <div className="space-y-3"><div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-3 text-sm font-bold text-gray-600"><label className="inline-flex items-center gap-2"><input type="checkbox" checked={allNotificationsSelected} onChange={(e) => setSelectedNotifications(e.target.checked ? Object.fromEntries(notifications.map((item) => [item.id, true])) : {})} className="h-4 w-4 accent-pink-600" />Select all visible</label><span>{selectedNotificationIds.length} selected</span></div><div className="grid gap-3 lg:grid-cols-2">{notifications.map((n) => <div key={n.id} className={`rounded-3xl border p-4 ${n.read ? "border-gray-100 bg-white" : "border-pink-100 bg-pink-50"}`}><div className="flex items-start justify-between gap-3"><div className="flex items-start gap-3"><input type="checkbox" checked={Boolean(selectedNotifications[n.id])} onChange={(e) => setSelectedNotifications((current) => ({ ...current, [n.id]: e.target.checked }))} className="mt-1 h-4 w-4 accent-pink-600" /><div><p className="font-black text-gray-950">{n.title}</p><p className="mt-1 text-sm leading-6 text-gray-600">{n.message}</p></div></div>{!n.read && <span className="rounded-full bg-pink-600 px-2 py-1 text-[10px] font-black text-white">NEW</span>}</div><p className="mt-3 text-xs font-bold text-gray-400">{longDateTime(n.createdAt)}</p></div>)}</div></div>}
                </Section>
              )}
            </div>
          </div>
        </div>
      </main>

      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3 sm:items-center">
          <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600"><AlertTriangle size={22} /></div>
              <div>
                <h3 className="text-lg font-black text-gray-950">Cannot take this job?</h3>
                <p className="mt-1 text-sm leading-6 text-gray-500">This returns the job to the replacement pool and records your reason for Admin/Manager.</p>
              </div>
            </div>
            <p className="mb-2 text-sm font-black text-gray-700">Reason</p>
            <select value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="mb-3 h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm font-bold">
              {rejectReasons.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            {rejectReason === "Other" && <textarea value={rejectOther} onChange={(e) => setRejectOther(e.target.value)} className="mb-3 min-h-24 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm" placeholder="Enter reason" />}
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setRejectTarget(null)} className="min-h-11 rounded-2xl border border-gray-200 bg-white font-black text-gray-700">Back</button>
              <button onClick={submitReject} disabled={actionBusyId === `reject:${rejectTarget.id}`} className="min-h-11 rounded-2xl bg-orange-600 font-black text-white disabled:opacity-50">{actionBusyId === `reject:${rejectTarget.id}` ? "Submitting..." : "Submit reason"}</button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
}
