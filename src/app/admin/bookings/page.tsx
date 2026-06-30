"use client";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { CalendarDays, Phone, Mail, Tag, RefreshCw, UserRound, Scissors, PoundSterling, Archive, AlertTriangle, Trash2 } from "lucide-react";
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
  cancellationReason?: string | null;
  notes?: string | null;
  emailVerifiedAt?: string | null;
  emailVerificationSentAt?: string | null;
  emailVerificationExpiresAt?: string | null;
  paymentConfirmedAt?: string | null;
  paymentConfirmedBy?: string | null;
  staffRejectedAt?: string | null;
  staffRejectionReason?: string | null;
  staffRejectionBy?: string | null;
  archivedAt?: string | null;
  status: string;
  staff?: { name: string } | null;
  user?: { name: string; email: string; role: string } | null;
  services?: { service: { name: string; price: number; image?: string | null } }[];
};

const statuses = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"];
const cancellationReasons = ["Shop have Problem", "Staff have problem", "Shop is too busy", "Customer asked to cancel", "No Reason", "Other"];
const defaultCancellationReason = "No Reason";
const statusLabels: Record<string, string> = {
  PENDING: "Awaiting transfer",
  CONFIRMED: "Paid / Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW: "No show",
};

function todayISO() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

function bookingReference(id: string) {
  return `NL-${id.slice(-8).toUpperCase()}`;
}

function serviceSummary(booking: Booking) {
  return (booking.services || []).map((s) => s.service?.name).filter(Boolean).join(", ") || "N/A";
}

function shortDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, { day: "2-digit", month: "short" });
}

function workflowStage(b: Booking) {
  if (b.archivedAt) return { label: "Archived", tone: "bg-gray-100 text-gray-600" };
  if (b.status === "CANCELLED") return { label: "Cancelled with reason", tone: "bg-red-100 text-red-700" };
  if (b.status === "COMPLETED") return { label: "Done / revenue kept", tone: "bg-blue-100 text-blue-700" };
  if (b.status === "NO_SHOW") return { label: "No-show / paid revenue kept", tone: "bg-gray-100 text-gray-700" };
  if (!b.emailVerifiedAt) return { label: "1. Email pending", tone: "bg-amber-100 text-amber-700" };
  if (b.status === "PENDING") return { label: "2. Awaiting bank transfer", tone: "bg-orange-100 text-orange-700" };
  if (b.status === "CONFIRMED" && !b.staff) return { label: "3. Paid - assign staff", tone: "bg-emerald-100 text-emerald-700" };
  if (b.status === "CONFIRMED" && b.staff) return { label: "4. Staff assigned", tone: "bg-emerald-100 text-emerald-700" };
  return { label: b.status, tone: "bg-gray-100 text-gray-700" };
}

function dateTimeText(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString();
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [includeArchived, setIncludeArchived] = useState(false);
  const [error, setError] = useState("");
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [cancelReason, setCancelReason] = useState(defaultCancellationReason);
  const [cancelOther, setCancelOther] = useState("");

  const refresh = () => {
    setError("");
    setLoading(true);
    api.admin.bookings({ date: dateFilter || undefined, includeArchived })
      .then((d: any) => { setBookings(d.bookings || []); setSelectedIds([]); })
      .catch((err: any) => setError(err.message || "Failed to load bookings"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { refresh(); }, [dateFilter, includeArchived]);

  const askCancelReason = (booking: Booking) => {
    setCancelTarget(booking);
    setCancelReason(defaultCancellationReason);
    setCancelOther("");
  };

  const updateStatus = async (id: string, status: string, cancellationReason?: string | null) => {
    const target = bookings.find((b) => b.id === id);
    if (!target) return;
    if (status === "CANCELLED" && !cancellationReason) {
      askCancelReason(target);
      return;
    }
    if (status === "CONFIRMED" && !target.emailVerifiedAt) {
      setError("Cannot confirm payment before customer email verification.");
      return;
    }
    if (status === "CONFIRMED" && target.status !== "CONFIRMED") {
      const ok = window.confirm("Only confirm after bank transfer/payment is actually received. This will count revenue and release the job to Staff Portal. Continue?");
      if (!ok) return;
    }

    const old = bookings;
    const reason = status === "CANCELLED" ? (cancellationReason || defaultCancellationReason) : null;
    setBookings((items) => items.map((b) => b.id === id ? { ...b, status, cancellationReason: reason } : b));
    try {
      const result = await api.admin.updateBookingStatus(id, status, undefined, reason);
      if (result?.booking) {
        setBookings((items) => items.map((b) => b.id === id ? { ...b, ...result.booking } : b));
      }
    } catch (err: any) {
      setBookings(old);
      setError(err.message || "Failed to update booking status");
    }
  };

  const submitCancel = async () => {
    if (!cancelTarget) return;
    const reason = cancelReason === "Other" ? cancelOther.trim() : cancelReason;
    if (!reason) {
      setError("Please enter a cancellation reason");
      return;
    }
    await updateStatus(cancelTarget.id, "CANCELLED", reason);
    setCancelTarget(null);
  };

  const archiveBooking = async (id: string) => {
    if (!window.confirm("Archive this booking from the active list? It will not be permanently deleted.")) return;
    try {
      await api.admin.archiveBooking(id);
      setBookings((items) => items.filter((b) => b.id !== id));
      setSelectedIds((items) => items.filter((item) => item !== id));
    } catch (err: any) {
      setError(err.message || "Failed to archive booking");
    }
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  };

  const archiveSelected = async () => {
    if (!selectedIds.length) return;
    if (!window.confirm(`Archive ${selectedIds.length} selected booking(s)? This hides them from active list but keeps records.`)) return;
    const ids = [...selectedIds];
    try {
      await Promise.all(ids.map((id) => api.admin.archiveBooking(id)));
      setBookings((items) => items.filter((b) => !ids.includes(b.id)));
      setSelectedIds([]);
    } catch (err: any) {
      setError(err.message || "Failed to archive selected bookings");
    }
  };

  const deleteSelected = async () => {
    if (!selectedIds.length) return;
    if (!window.confirm(`Permanently delete ${selectedIds.length} selected booking record(s)? Use only for test/wrong data.`)) return;
    const ids = [...selectedIds];
    try {
      await Promise.all(ids.map((id) => api.admin.deleteBooking(id)));
      setBookings((items) => items.filter((b) => !ids.includes(b.id)));
      setSelectedIds([]);
    } catch (err: any) {
      setError(err.message || "Failed to delete selected bookings");
    }
  };

  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);
  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      PENDING: "bg-orange-100 text-orange-700",
      CONFIRMED: "bg-emerald-100 text-emerald-700",
      CANCELLED: "bg-red-100 text-red-700",
      COMPLETED: "bg-blue-100 text-blue-700",
      NO_SHOW: "bg-gray-100 text-gray-600",
    };
    return cn("px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wide whitespace-nowrap", map[status] || "bg-gray-100 text-gray-600");
  };

  const stats = useMemo(() => {
    const active = bookings.filter((b) => !b.archivedAt);
    const paid = active.filter((b) => ["CONFIRMED", "COMPLETED", "NO_SHOW"].includes(b.status));
    return {
      total: active.length,
      emailPending: active.filter((b) => !b.emailVerifiedAt).length,
      awaitingTransfer: active.filter((b) => b.emailVerifiedAt && b.status === "PENDING").length,
      paidCount: paid.length,
      revenue: paid.reduce((sum, b) => sum + Number(b.totalPrice || 0), 0),
      cancelled: active.filter((b) => b.status === "CANCELLED").length,
    };
  }, [bookings]);

  const filterItems = ["all", ...statuses];
  const filteredIds = filtered.map((b) => b.id);
  const allFilteredSelected = filteredIds.length > 0 && filteredIds.every((id) => selectedIds.includes(id));
  const toggleAllFiltered = () => {
    setSelectedIds((items) => allFilteredSelected ? items.filter((id) => !filteredIds.includes(id)) : Array.from(new Set([...items, ...filteredIds])));
  };

  return (
    <div className="pb-6">
      <div className="flex flex-col gap-3 mb-4 sm:mb-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Bookings</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Daily workflow: email verified → bank transfer checked → payment confirmed → staff accepts job → complete/no-show.</p>
          </div>
          <button onClick={refresh} className="h-10 w-10 sm:w-auto sm:px-3 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-pink-600 hover:border-pink-200 inline-flex items-center justify-center gap-2 shrink-0">
            <RefreshCw size={16} /><span className="hidden sm:inline text-sm font-semibold">Refresh</span>
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-6 gap-2">
          <div className="rounded-2xl bg-white border border-gray-100 p-3"><p className="text-[11px] text-gray-400 font-black uppercase">Active</p><p className="text-2xl font-black">{stats.total}</p></div>
          <div className="rounded-2xl bg-white border border-amber-100 p-3"><p className="text-[11px] text-amber-500 font-black uppercase">Email pending</p><p className="text-2xl font-black">{stats.emailPending}</p></div>
          <div className="rounded-2xl bg-white border border-orange-100 p-3"><p className="text-[11px] text-orange-500 font-black uppercase">Awaiting transfer</p><p className="text-2xl font-black">{stats.awaitingTransfer}</p></div>
          <div className="rounded-2xl bg-white border border-emerald-100 p-3"><p className="text-[11px] text-emerald-500 font-black uppercase">Paid jobs</p><p className="text-2xl font-black">{stats.paidCount}</p></div>
          <div className="rounded-2xl bg-white border border-pink-100 p-3"><p className="text-[11px] text-pink-500 font-black uppercase">Paid revenue</p><p className="text-2xl font-black">{formatPrice(stats.revenue)}</p></div>
          <div className="rounded-2xl bg-white border border-red-100 p-3"><p className="text-[11px] text-red-500 font-black uppercase">Cancelled</p><p className="text-2xl font-black">{stats.cancelled}</p></div>
        </div>

        <div className="flex flex-col md:flex-row gap-2 md:items-center">
          <label className="flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-3 py-2 text-sm font-bold text-gray-600">
            <CalendarDays size={16} />
            <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="outline-none bg-transparent" />
          </label>
          <button onClick={() => setDateFilter(todayISO())} className={cn("px-3 py-2 rounded-xl border text-sm font-bold", dateFilter === todayISO() ? "bg-pink-600 border-pink-600 text-white" : "bg-white border-gray-200 text-gray-600")}>Today</button>
          <button onClick={() => setDateFilter("")} className={cn("px-3 py-2 rounded-xl border text-sm font-bold", !dateFilter ? "bg-pink-600 border-pink-600 text-white" : "bg-white border-gray-200 text-gray-600")}>All days</button>
          <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200 text-sm font-bold text-gray-600">
            <input type="checkbox" checked={includeArchived} onChange={(e) => setIncludeArchived(e.target.checked)} /> Include archived
          </label>
        </div>

        {!dateFilter && <p className="text-xs text-gray-400 font-semibold">Showing all active bookings, newest first. Pick a date only when you want a daily view.</p>}

        <div className="-mx-3 sm:mx-0 overflow-x-auto pb-1 px-3 sm:px-0">
          <div className="flex gap-2 min-w-max">
            {filterItems.map((f) => {
              const count = f === "all" ? bookings.length : bookings.filter((b) => b.status === f).length;
              return (
                <button key={f} onClick={() => setFilter(f)} className={cn("px-3 py-2 rounded-xl text-xs sm:text-sm font-bold capitalize whitespace-nowrap", filter === f ? "bg-pink-600 text-white shadow-sm" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50")}>
                  {f === "all" ? "All" : statusLabels[f]} <span className="opacity-70">{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>}
      {selectedIds.length > 0 && (
        <div className="mb-4 flex flex-col gap-2 rounded-2xl border border-pink-100 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-black text-gray-800">{selectedIds.length} booking(s) selected</p>
          <div className="flex gap-2">
            <button onClick={archiveSelected} className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 text-xs font-black text-gray-600 hover:bg-gray-50"><Archive size={14} /> Archive</button>
            <button onClick={deleteSelected} className="inline-flex items-center gap-1 rounded-xl bg-red-600 px-3 py-2 text-xs font-black text-white hover:bg-red-700"><Trash2 size={14} /> Delete</button>
          </div>
        </div>
      )}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading bookings...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No bookings found for this filter.</div>
      ) : (
        <>
          <div className="hidden lg:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="max-h-[calc(100vh-250px)] overflow-auto">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur border-b border-gray-100 text-[11px] uppercase tracking-wide text-gray-400">
                  <tr>
                    <th className="px-3 py-2 font-black"><input type="checkbox" checked={allFilteredSelected} onChange={toggleAllFiltered} /></th>
                    <th className="px-3 py-2 font-black">Time</th>
                    <th className="px-3 py-2 font-black">Customer</th>
                    <th className="px-3 py-2 font-black">Service</th>
                    <th className="px-3 py-2 font-black">Staff</th>
                    <th className="px-3 py-2 font-black text-right">Revenue</th>
                    <th className="px-3 py-2 font-black">Step</th>
                    <th className="px-3 py-2 font-black">Reason / Audit</th>
                    <th className="px-3 py-2 font-black w-56">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((b) => {
                    const step = workflowStage(b);
                    return (
                      <tr key={b.id} className="hover:bg-pink-50/30 align-middle">
                        <td className="px-3 py-2"><input type="checkbox" checked={selectedIds.includes(b.id)} onChange={() => toggleSelected(b.id)} /></td>
                        <td className="px-3 py-2 whitespace-nowrap"><div className="font-black text-gray-900 leading-tight">{shortDate(b.date)}</div><div className="text-xs text-pink-600 font-bold">{b.time}</div></td>
                        <td className="px-3 py-2 min-w-[190px] max-w-[250px]"><div className="font-bold text-gray-900 truncate">{b.customerName}</div><div className="text-[11px] text-gray-400 truncate">{b.customerPhone} · {b.customerEmail || b.user?.email || "No email"}</div><div className="text-[11px] text-orange-600 font-bold truncate">Ref: {bookingReference(b.id)}</div></td>
                        <td className="px-3 py-2 max-w-[250px]"><div className="text-gray-700 truncate font-medium">{serviceSummary(b)}</div>{b.discount ? <div className="text-[11px] text-emerald-600 truncate">-{formatPrice(b.discount)} {b.promoCode ? `(${b.promoCode})` : ""}</div> : null}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-gray-600">{b.staff?.name || "Any"}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-right font-black text-pink-600">{formatPrice(b.totalPrice)}</td>
                        <td className="px-3 py-2 whitespace-nowrap"><span className={cn("px-2 py-0.5 rounded-full text-[10px] font-black", step.tone)}>{step.label}</span></td>
                        <td className="px-3 py-2 max-w-[260px] text-xs text-gray-500"><div className="line-clamp-3">{b.cancellationReason ? `${b.cancellationReason.startsWith("Customer requested") ? "Ticket: " : "Cancel: "}${b.cancellationReason}` : b.notes?.includes("Customer transfer submitted") ? "Customer marked transfer sent. Verify bank then confirm payment." : b.staffRejectionReason ? `Staff rejected: ${b.staffRejectionReason}` : b.paymentConfirmedAt ? `Paid: ${dateTimeText(b.paymentConfirmedAt)} by ${b.paymentConfirmedBy || "Manager"}` : b.emailVerifiedAt ? "Email verified. Wait for transfer." : "Waiting customer email verification."}</div></td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <select value={b.status} onChange={(e) => updateStatus(b.id, e.target.value)} className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold focus:ring-2 focus:ring-pink-300 outline-none bg-white">
                              {statuses.map((status) => <option key={status} value={status} disabled={status === "CONFIRMED" && !b.emailVerifiedAt}>{status === "CONFIRMED" ? "Payment received → Confirm" : statusLabels[status]}{status === "CONFIRMED" && !b.emailVerifiedAt ? " (verify email first)" : ""}</option>)}
                            </select>
                            <button onClick={() => archiveBooking(b.id)} className="h-8 w-8 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 inline-flex items-center justify-center" title="Archive"><Archive size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:hidden space-y-2.5">
            {filtered.map((b) => {
              const step = workflowStage(b);
              return (
                <div key={b.id} className="bg-white rounded-2xl border border-gray-100 p-3 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0"><div className="flex items-center gap-2 mb-1"><span className="font-black text-gray-900 truncate">{b.customerName}</span><span className={statusBadge(b.status)}>{statusLabels[b.status] || b.status}</span></div><div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-400"><span className="inline-flex items-center gap-1"><CalendarDays size={11} />{shortDate(b.date)} {b.time}</span><span className="inline-flex items-center gap-1"><PoundSterling size={11} />{formatPrice(b.totalPrice)}</span></div></div>
                    <div className="flex items-center gap-2"><input type="checkbox" checked={selectedIds.includes(b.id)} onChange={() => toggleSelected(b.id)} /><button onClick={() => archiveBooking(b.id)} className="h-9 w-9 rounded-xl bg-gray-50 text-gray-500 inline-flex items-center justify-center"><Archive size={14} /></button></div>
                  </div>
                  <div className="mt-2"><span className={cn("px-2 py-1 rounded-full text-[11px] font-black", step.tone)}>{step.label}</span></div>
                  <div className="mt-2 grid grid-cols-1 gap-1.5 text-xs text-gray-600"><p className="flex items-center gap-1 min-w-0"><Scissors size={12} className="text-pink-500 shrink-0" /><span className="truncate">{serviceSummary(b)}</span></p><p className="flex items-center gap-1 min-w-0"><UserRound size={12} className="text-pink-500 shrink-0" /><span className="truncate">{b.staff?.name || "Any Staff"}</span></p><p className="flex items-center gap-1 min-w-0"><Phone size={12} className="text-pink-500 shrink-0" /><span className="truncate">{b.customerPhone}</span></p><p className="flex items-center gap-1 min-w-0"><Mail size={12} className="text-pink-500 shrink-0" /><span className="truncate">{b.customerEmail || b.user?.email || "No email"}</span></p><p className="text-orange-600 font-bold">Ref: {bookingReference(b.id)}</p>{b.cancellationReason && <p className="text-red-600">{b.cancellationReason.startsWith("Customer requested") ? "Ticket" : "Cancel reason"}: {b.cancellationReason}</p>}{b.notes?.includes("Customer transfer submitted") && <p className="text-emerald-600">Customer marked transfer sent. Verify bank then confirm payment.</p>}{b.staffRejectionReason && <p className="text-orange-600">Staff reject reason: {b.staffRejectionReason}</p>}</div>
                  <select value={b.status} onChange={(e) => updateStatus(b.id, e.target.value)} className="mt-3 w-full px-3 py-3 rounded-xl border border-gray-200 text-xs font-bold bg-white"><option value={b.status}>{statusLabels[b.status] || b.status}</option>{statuses.filter((s) => s !== b.status).map((status) => <option key={status} value={status} disabled={status === "CONFIRMED" && !b.emailVerifiedAt}>{status === "CONFIRMED" ? "Payment received → Confirm" : statusLabels[status]}</option>)}</select>
                  {b.discount ? <div className="mt-2 flex items-center gap-1 text-emerald-600 text-xs"><Tag size={13} />Discount: -{formatPrice(b.discount)} {b.promoCode ? `(${b.promoCode})` : ""}</div> : null}
                </div>
              );
            })}
          </div>
        </>
      )}

      {cancelTarget && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-3">
          <div className="bg-white rounded-3xl p-5 w-full max-w-md shadow-2xl">
            <div className="flex items-start gap-3 mb-4"><div className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0"><AlertTriangle size={22} /></div><div><h3 className="text-lg font-black text-gray-900">Cancel customer booking?</h3><p className="text-sm text-gray-500 mt-1">This is customer-facing and will queue cancellation notice. Staff reject is handled in Staff Portal, not here.</p></div></div>
            <p className="text-sm font-bold text-gray-700 mb-2">Cancellation reason</p>
            <select value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} className="w-full min-h-12 rounded-2xl border border-gray-200 px-4 mb-3 bg-white">{cancellationReasons.map((r) => <option key={r} value={r}>{r}</option>)}</select>
            {cancelReason === "Other" && <textarea value={cancelOther} onChange={(e) => setCancelOther(e.target.value)} className="w-full min-h-24 rounded-2xl border border-gray-200 px-4 py-3 mb-3" placeholder="Enter reason" />}
            <div className="grid grid-cols-2 gap-3"><button onClick={() => setCancelTarget(null)} className="btn-secondary min-h-11">Back</button><button onClick={submitCancel} className="min-h-11 rounded-xl bg-red-600 text-white font-bold">Cancel booking</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
