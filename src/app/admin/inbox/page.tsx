"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { AlertTriangle, Bell, CheckCheck, RefreshCw, Trash2, CheckCircle2, XCircle, ClipboardCheck } from "lucide-react";

type NotificationRow = {
  id: string;
  audience: string;
  staffId?: string | null;
  bookingId?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

const TICKET_CATEGORY = "tickets";

function shortDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString(undefined, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function typeClass(type: string) {
  if (type.includes("CANCEL")) return "bg-red-50 text-red-700 border-red-100";
  if (type.includes("LEAVE")) return "bg-sky-50 text-sky-700 border-sky-100";
  return "bg-pink-50 text-pink-700 border-pink-100";
}

function isCancellationTicket(item: NotificationRow) {
  return item.type === "CUSTOMER_CANCEL_REQUEST" || item.type === "CUSTOMER_CANCELLED_PENDING_BOOKING";
}

function isLeaveTicket(item: NotificationRow) {
  return item.type === "STAFF_LEAVE_REQUESTED" || item.type === "STAFF_LEAVE_CANCELLED";
}

export default function AdminInboxPage() {
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const refresh = () => {
    setError("");
    setNotice("");
    setLoading(true);
    api.notifications.list("admin", 100, TICKET_CATEGORY)
      .then((data: any) => {
        setItems(data.notifications || []);
        setUnread(data.unread || 0);
        setSelected({});
      })
      .catch((err: any) => setError(err.message || "Could not load inbox"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { refresh(); }, []);

  const selectedIds = useMemo(() => Object.entries(selected).filter(([, value]) => value).map(([id]) => id), [selected]);
  const allSelected = items.length > 0 && selectedIds.length === items.length;

  const markOne = async (id: string, read: boolean) => {
    try {
      await api.notifications.markOne(id, read, "admin", TICKET_CATEGORY);
      setItems((rows) => rows.map((row) => row.id === id ? { ...row, read } : row));
      setUnread((n) => Math.max(0, n + (read ? -1 : 1)));
    } catch (err: any) {
      setError(err.message || "Could not update notification");
    }
  };

  const markAll = async () => {
    try {
      await api.notifications.markAll("admin", TICKET_CATEGORY);
      setItems((rows) => rows.map((row) => ({ ...row, read: true })));
      setUnread(0);
    } catch (err: any) {
      setError(err.message || "Could not mark inbox read");
    }
  };

  const remove = async (id: string) => {
    try {
      await api.notifications.deleteOne(id, "admin", TICKET_CATEGORY);
      setItems((rows) => rows.filter((row) => row.id !== id));
      setSelected((current) => ({ ...current, [id]: false }));
    } catch (err: any) {
      setError(err.message || "Could not delete ticket");
    }
  };

  const deleteSelected = async () => {
    if (!selectedIds.length) return;
    if (!window.confirm(`Delete ${selectedIds.length} selected inbox ticket(s)?`)) return;
    try {
      const result = await api.notifications.deleteMany(selectedIds, "admin", TICKET_CATEGORY);
      setItems((rows) => rows.filter((row) => !selectedIds.includes(row.id)));
      setSelected({});
      setNotice(`Deleted ${result.deleted || selectedIds.length} selected ticket(s).`);
    } catch (err: any) {
      setError(err.message || "Could not delete selected tickets");
    }
  };

  const deleteAll = async () => {
    if (!items.length) return;
    if (!window.confirm("Delete ALL inbox tickets for cancellation + staff leave? This cannot be undone.")) return;
    try {
      const result = await api.notifications.deleteAll("admin", TICKET_CATEGORY);
      setItems([]);
      setSelected({});
      setUnread(0);
      setNotice(`Deleted ${result.deleted || 0} inbox ticket(s).`);
    } catch (err: any) {
      setError(err.message || "Could not delete all inbox tickets");
    }
  };

  const runAction = async (item: NotificationRow, action: string) => {
    const note = action === "rejectLeave" ? window.prompt("Manager note for rejection (optional):") || undefined : undefined;
    const labels: Record<string, string> = {
      approveCancellation: "Cancel booking approved",
      keepBooking: "Cancellation request reviewed; booking kept active",
      approveLeave: "Leave request approved",
      rejectLeave: "Leave request rejected",
      acknowledge: "Ticket acknowledged",
    };
    setBusyId(item.id);
    setError("");
    setNotice("");
    try {
      const result = await api.notifications.action(item.id, action, note);
      setItems((rows) => rows.map((row) => row.id === item.id ? { ...row, read: true } : row));
      setUnread((n) => Math.max(0, n - (item.read ? 0 : 1)));
      const conflicts = result.affectedBookings?.length ? ` Warning: ${result.affectedBookings.length} assigned booking(s) overlap this approved leave.` : "";
      setNotice(`${labels[action] || "Ticket processed"}.${conflicts}`);
    } catch (err: any) {
      setError(err.message || "Could not process ticket");
    } finally {
      setBusyId("");
    }
  };

  const stats = useMemo(() => ({
    cancel: items.filter(isCancellationTicket).length,
    leave: items.filter(isLeaveTicket).length,
    unread,
  }), [items, unread]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <p className="text-pink-600 text-xs font-black uppercase tracking-wide">Admin ticket inbox</p>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-1">Inbox</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Only customer cancellation tickets and staff leave tickets appear here. Admin/Manager can approve, reject, acknowledge, and clean tickets from one place.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={refresh} className="h-10 px-3 rounded-xl bg-white border border-gray-200 text-gray-600 text-sm font-bold inline-flex items-center gap-2"><RefreshCw size={16} />Refresh</button>
          <button onClick={markAll} className="h-10 px-3 rounded-xl bg-pink-600 text-white text-sm font-bold inline-flex items-center gap-2"><CheckCheck size={16} />Mark all read</button>
          <button onClick={deleteSelected} disabled={!selectedIds.length} className="h-10 px-3 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm font-bold disabled:opacity-40 inline-flex items-center gap-2"><Trash2 size={16} />Delete selected</button>
          <button onClick={deleteAll} disabled={!items.length} className="h-10 px-3 rounded-xl bg-red-600 text-white text-sm font-bold disabled:opacity-40 inline-flex items-center gap-2"><Trash2 size={16} />Delete all</button>
        </div>
      </div>

      {error && <div className="mb-4 rounded-xl bg-orange-50 text-orange-700 p-3 text-sm flex gap-2"><AlertTriangle size={17} className="shrink-0" />{error}</div>}
      {notice && <div className="mb-4 rounded-xl bg-emerald-50 text-emerald-700 p-3 text-sm font-bold">{notice}</div>}

      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-white rounded-2xl border border-pink-100 p-3 sm:p-5"><p className="text-[11px] font-black text-pink-500 uppercase">Unread</p><p className="text-2xl font-black text-gray-900">{stats.unread}</p></div>
        <div className="bg-white rounded-2xl border border-red-100 p-3 sm:p-5"><p className="text-[11px] font-black text-red-500 uppercase">Cancel tickets</p><p className="text-2xl font-black text-gray-900">{stats.cancel}</p></div>
        <div className="bg-white rounded-2xl border border-sky-100 p-3 sm:p-5"><p className="text-[11px] font-black text-sky-500 uppercase">Leave tickets</p><p className="text-2xl font-black text-gray-900">{stats.leave}</p></div>
      </div>

      {items.length > 0 && (
        <div className="mb-3 rounded-2xl bg-white border border-gray-100 p-3 flex items-center justify-between gap-3">
          <label className="inline-flex items-center gap-2 text-sm font-black text-gray-700">
            <input type="checkbox" checked={allSelected} onChange={(e) => setSelected(e.target.checked ? Object.fromEntries(items.map((item) => [item.id, true])) : {})} className="h-4 w-4 accent-pink-600" />
            Tick all visible tickets
          </label>
          <span className="text-xs text-gray-400">{selectedIds.length} selected</span>
        </div>
      )}

      {loading ? <div className="py-12 text-center text-gray-400">Loading inbox...</div> : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400">Inbox is empty.</div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className={`bg-white rounded-2xl border shadow-sm p-4 ${item.read ? "border-gray-100" : "border-pink-200 ring-2 ring-pink-50"}`}>
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                <div className="min-w-0 flex gap-3">
                  <input type="checkbox" checked={Boolean(selected[item.id])} onChange={(e) => setSelected((current) => ({ ...current, [item.id]: e.target.checked }))} className="mt-1 h-4 w-4 accent-pink-600 shrink-0" />
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Bell size={17} className={item.read ? "text-gray-400" : "text-pink-600"} />
                      <h3 className="font-black text-gray-900">{item.title}</h3>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${typeClass(item.type)}`}>{item.type.replace(/_/g, " ")}</span>
                      {!item.read && <span className="px-2 py-1 rounded-full bg-pink-600 text-white text-[10px] font-black uppercase">Unread</span>}
                    </div>
                    <p className="text-sm text-gray-600 leading-6">{item.message}</p>
                    <p className="text-xs text-gray-400 mt-2">{shortDate(item.createdAt)}{item.bookingId ? ` · booking ${item.bookingId.slice(-8).toUpperCase()}` : ""}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0 lg:justify-end">
                  {item.type === "CUSTOMER_CANCEL_REQUEST" && (
                    <>
                      <button disabled={busyId === item.id} onClick={() => runAction(item, "approveCancellation")} className="min-h-10 rounded-xl bg-red-600 px-3 text-white text-sm font-bold inline-flex items-center justify-center gap-1 disabled:opacity-50"><CheckCircle2 size={15} />Approve cancel</button>
                      <button disabled={busyId === item.id} onClick={() => runAction(item, "keepBooking")} className="min-h-10 rounded-xl bg-gray-900 px-3 text-white text-sm font-bold inline-flex items-center justify-center gap-1 disabled:opacity-50"><ClipboardCheck size={15} />Keep booking</button>
                    </>
                  )}
                  {item.type === "STAFF_LEAVE_REQUESTED" && (
                    <>
                      <button disabled={busyId === item.id} onClick={() => runAction(item, "approveLeave")} className="min-h-10 rounded-xl bg-emerald-600 px-3 text-white text-sm font-bold inline-flex items-center justify-center gap-1 disabled:opacity-50"><CheckCircle2 size={15} />Approve</button>
                      <button disabled={busyId === item.id} onClick={() => runAction(item, "rejectLeave")} className="min-h-10 rounded-xl bg-red-600 px-3 text-white text-sm font-bold inline-flex items-center justify-center gap-1 disabled:opacity-50"><XCircle size={15} />Reject</button>
                    </>
                  )}
                  {(item.type === "CUSTOMER_CANCELLED_PENDING_BOOKING" || item.type === "STAFF_LEAVE_CANCELLED") && (
                    <button disabled={busyId === item.id} onClick={() => runAction(item, "acknowledge")} className="min-h-10 rounded-xl bg-pink-600 px-3 text-white text-sm font-bold disabled:opacity-50">Acknowledge</button>
                  )}
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
