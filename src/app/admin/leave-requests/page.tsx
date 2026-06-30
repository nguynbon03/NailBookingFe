"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { CheckCircle2, XCircle, RefreshCw, CalendarOff, AlertTriangle, Trash2 } from "lucide-react";

type LeaveRequest = {
  id: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: string;
  managerNote?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  staff?: { id: string; name: string; email: string; role: string } | null;
};

function shortDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

function statusClass(status: string) {
  const map: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700",
    APPROVED: "bg-emerald-100 text-emerald-700",
    REJECTED: "bg-red-100 text-red-700",
    CANCELLED: "bg-gray-100 text-gray-600",
  };
  return `px-2.5 py-1 rounded-full text-xs font-black uppercase ${map[status] || "bg-gray-100 text-gray-600"}`;
}

export default function AdminLeaveRequestsPage() {
  const [items, setItems] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>({});

  const refresh = () => {
    setError("");
    setLoading(true);
    api.admin.leaves()
      .then((data: any) => setItems(data.leaveRequests || []))
      .catch((err: any) => setError(err.message || "Could not load leave requests"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { refresh(); }, []);

  const review = async (id: string, status: "APPROVED" | "REJECTED") => {
    try {
      const result = await api.admin.reviewLeave(id, status, notes[id] || undefined);
      setItems((rows) => rows.map((row) => row.id === id ? { ...row, ...result.leaveRequest } : row));
      if (result.affectedBookings?.length) {
        setError(`Approved leave, but ${result.affectedBookings.length} confirmed booking(s) still assigned to this staff. Reassign them in Bookings.`);
      }
    } catch (err: any) {
      setError(err.message || "Could not review leave request");
    }
  };

  const deleteLeave = async (item: LeaveRequest) => {
    const ok = window.confirm(`Delete ${item.staff?.name || "staff"}'s leave request from the admin list? This is for cleanup and cannot be undone.`);
    if (!ok) return;
    try {
      await api.admin.deleteLeave(item.id);
      setItems((rows) => rows.filter((row) => row.id !== item.id));
    } catch (err: any) {
      setError(err.message || "Could not delete leave request");
    }
  };

  const stats = useMemo(() => ({
    pending: items.filter((item) => item.status === "PENDING").length,
    approved: items.filter((item) => item.status === "APPROVED").length,
    rejected: items.filter((item) => item.status === "REJECTED").length,
  }), [items]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <p className="text-pink-600 text-xs font-black uppercase tracking-wide">Manager schedule control</p>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-1">Staff Leave Requests</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Approve leave tickets so approved days are automatically removed from staff availability.</p>
        </div>
        <button onClick={refresh} className="h-10 px-3 rounded-xl bg-white border border-gray-200 text-gray-600 text-sm font-bold inline-flex items-center gap-2"><RefreshCw size={16} />Refresh</button>
      </div>

      {error && <div className="mb-4 rounded-xl bg-orange-50 text-orange-700 p-3 text-sm flex gap-2"><AlertTriangle size={17} className="shrink-0" />{error}</div>}

      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-white rounded-2xl border border-amber-100 p-3 sm:p-5"><p className="text-[11px] font-black text-amber-500 uppercase">Pending</p><p className="text-2xl font-black text-gray-900">{stats.pending}</p></div>
        <div className="bg-white rounded-2xl border border-emerald-100 p-3 sm:p-5"><p className="text-[11px] font-black text-emerald-500 uppercase">Approved</p><p className="text-2xl font-black text-gray-900">{stats.approved}</p></div>
        <div className="bg-white rounded-2xl border border-red-100 p-3 sm:p-5"><p className="text-[11px] font-black text-red-500 uppercase">Rejected</p><p className="text-2xl font-black text-gray-900">{stats.rejected}</p></div>
      </div>

      {loading ? <div className="py-12 text-center text-gray-400">Loading leave requests...</div> : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400">No leave requests yet.</div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <CalendarOff size={17} className="text-sky-500" />
                    <h3 className="font-black text-gray-900 truncate">{item.staff?.name || "Staff"}</h3>
                    <span className={statusClass(item.status)}>{item.status}</span>
                  </div>
                  <p className="text-sm text-gray-600"><b>{shortDate(item.startDate)} → {shortDate(item.endDate)}</b> · {item.daysCount} day(s)</p>
                  <p className="text-sm text-gray-500 mt-1">Reason: {item.reason}</p>
                  <p className="text-xs text-gray-400 mt-1">Requested: {new Date(item.createdAt).toLocaleString()} · {item.staff?.email}</p>
                  {item.reviewedAt && <p className="text-xs text-gray-400 mt-1">Reviewed by {item.reviewedBy || "Manager"} at {new Date(item.reviewedAt).toLocaleString()}</p>}
                  {item.managerNote && <p className="text-xs text-gray-500 mt-1">Manager note: {item.managerNote}</p>}
                </div>
                {item.status === "PENDING" ? (
                  <div className="w-full lg:w-[360px] shrink-0">
                    <textarea className="w-full min-h-20 rounded-xl border border-gray-200 p-3 text-sm mb-2" placeholder="Optional manager note" value={notes[item.id] || ""} onChange={(e) => setNotes({ ...notes, [item.id]: e.target.value })} />
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => review(item.id, "APPROVED")} className="min-h-11 rounded-xl bg-emerald-600 text-white text-sm font-bold inline-flex items-center justify-center gap-1"><CheckCircle2 size={16} />Approve</button>
                      <button onClick={() => review(item.id, "REJECTED")} className="min-h-11 rounded-xl bg-red-600 text-white text-sm font-bold inline-flex items-center justify-center gap-1"><XCircle size={16} />Reject</button>
                      <button onClick={() => deleteLeave(item)} className="col-span-2 min-h-10 rounded-xl bg-red-50 text-red-600 text-sm font-bold inline-flex items-center justify-center gap-1 hover:bg-red-100"><Trash2 size={15} />Delete ticket</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => deleteLeave(item)} className="min-h-10 rounded-xl bg-red-50 px-3 text-red-600 text-sm font-bold inline-flex items-center justify-center gap-1 hover:bg-red-100"><Trash2 size={15} />Delete</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
