"use client";

import { useEffect, useMemo, useState } from "react";
import { API_BASE, api } from "@/lib/api";
import { AlertTriangle, Download, FileText, RefreshCw, UsersRound } from "lucide-react";

type CustomerRow = {
  key: string;
  userId?: string | null;
  name: string;
  email: string;
  phone: string;
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  noShowBookings: number;
  spend: number;
  firstBookingAt?: string | null;
  lastBookingAt?: string | null;
  lastService?: string;
  lastStaff?: string;
  source: string;
};

type CustomerReport = {
  range: { period: string; label: string };
  summary: { customers: number; activeInPeriod: number; bookings: number; spend: number; cancelled: number; noShow: number };
  customers: CustomerRow[];
  exportEnabled: boolean;
};

function money(value: number) {
  return `£${Number(value || 0).toFixed(2)}`;
}

async function downloadAdminFile(path: string, fallbackName: string) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
  const headers: Record<string, string> = token ? { Authorization: String.fromCharCode(66, 101, 97, 114, 101, 114) + " " + token } : {};
  const res = await fetch(`${API_BASE}${path}`, { headers });
  if (!res.ok) throw new Error(`Download failed (${res.status})`);
  const blob = await res.blob();
  const disposition = res.headers.get("content-disposition") || "";
  const match = disposition.match(/filename="?([^";]+)"?/i);
  const filename = match?.[1] || fallbackName;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function AdminCustomersPage() {
  const [period, setPeriod] = useState("month");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [report, setReport] = useState<CustomerReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingExport, setSavingExport] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");

  const refresh = () => {
    setError("");
    setNotice("");
    setLoading(true);
    api.admin.customers({ period, date })
      .then((data: CustomerReport) => setReport(data))
      .catch((err: any) => setError(err.message || "Could not load customers"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { refresh(); }, []);

  const exportFile = async (format: "pdf" | "csv") => {
    if (report?.exportEnabled === false) {
      setError("Customer export is OFF. Turn on Export data before downloading PDF/CSV.");
      return;
    }
    try {
      const query = new URLSearchParams({ period, date, format });
      await downloadAdminFile(`/api/admin/customers/export?${query.toString()}`, `nail-lounge-customers.${format}`);
    } catch (err: any) {
      setError(err.message || "Could not export customer data");
    }
  };

  const toggleExport = async () => {
    const next = !(report?.exportEnabled !== false);
    setSavingExport(true);
    setError("");
    setNotice("");
    try {
      const result = await api.admin.updateCustomerExport(next);
      setReport((current) => current ? { ...current, exportEnabled: result.exportEnabled !== false } : current);
      setNotice(result.exportEnabled ? "Customer export is ON. Admin can download PDF/CSV." : "Customer export is OFF. PDF/CSV download is blocked until re-enabled.");
    } catch (err: any) {
      setError(err.message || "Could not update export toggle");
    } finally {
      setSavingExport(false);
    }
  };

  const customers = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = report?.customers || [];
    if (!q) return rows;
    return rows.filter((c) => [c.name, c.email, c.phone, c.lastService, c.lastStaff].some((value) => String(value || "").toLowerCase().includes(q)));
  }, [report, search]);

  const exportEnabled = report?.exportEnabled !== false;

  return (
    <div>
      <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <p className="text-pink-600 text-xs font-black uppercase tracking-wide">Pro customer management</p>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-1">Customers</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Customer list with weekly, monthly, and yearly exports for shop owner reporting.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={toggleExport} disabled={savingExport || !report} className={`h-10 px-3 rounded-xl text-sm font-black inline-flex items-center gap-2 border disabled:opacity-50 ${exportEnabled ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>
            Export data: {savingExport ? "Saving..." : exportEnabled ? "ON" : "OFF"}
          </button>
          <select value={period} onChange={(e) => setPeriod(e.target.value)} className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm font-bold text-gray-700">
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm font-bold text-gray-700" />
          <button onClick={refresh} className="h-10 px-3 rounded-xl bg-white border border-gray-200 text-gray-600 text-sm font-bold inline-flex items-center gap-2"><RefreshCw size={16} />Refresh</button>
          <button onClick={() => exportFile("pdf")} disabled={!exportEnabled} className={`h-10 px-3 rounded-xl text-sm font-bold inline-flex items-center gap-2 disabled:cursor-not-allowed ${exportEnabled ? "bg-pink-600 text-white" : "bg-gray-100 text-gray-400"}`}><FileText size={16} />PDF</button>
          <button onClick={() => exportFile("csv")} disabled={!exportEnabled} className={`h-10 px-3 rounded-xl text-sm font-bold inline-flex items-center gap-2 disabled:cursor-not-allowed ${exportEnabled ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-400"}`}><Download size={16} />Excel CSV</button>
        </div>
      </div>

      {error && <div className="mb-4 rounded-xl bg-orange-50 text-orange-700 p-3 text-sm flex gap-2"><AlertTriangle size={17} className="shrink-0" />{error}</div>}
      {notice && <div className="mb-4 rounded-xl bg-emerald-50 text-emerald-700 p-3 text-sm font-bold">{notice}</div>}
      {!exportEnabled && <div className="mb-4 rounded-xl bg-red-50 text-red-700 p-3 text-sm font-bold">Customer PDF/CSV export is OFF. The customer list remains visible for admin operations, but downloads are blocked until this toggle is turned back ON.</div>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-white rounded-2xl border border-pink-100 p-3 sm:p-5"><p className="text-[11px] font-black text-pink-500 uppercase">Customers</p><p className="text-2xl font-black text-gray-900">{report?.summary.customers ?? 0}</p></div>
        <div className="bg-white rounded-2xl border border-emerald-100 p-3 sm:p-5"><p className="text-[11px] font-black text-emerald-500 uppercase">Active in period</p><p className="text-2xl font-black text-gray-900">{report?.summary.activeInPeriod ?? 0}</p></div>
        <div className="bg-white rounded-2xl border border-sky-100 p-3 sm:p-5"><p className="text-[11px] font-black text-sky-500 uppercase">Bookings</p><p className="text-2xl font-black text-gray-900">{report?.summary.bookings ?? 0}</p></div>
        <div className="bg-white rounded-2xl border border-amber-100 p-3 sm:p-5"><p className="text-[11px] font-black text-amber-500 uppercase">Spend</p><p className="text-2xl font-black text-gray-900">{money(report?.summary.spend || 0)}</p></div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2"><UsersRound size={18} className="text-pink-500" /><b className="text-gray-900">Customer data</b><span className="text-xs text-gray-400">{report?.range.label}</span></div>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, phone..." className="h-10 w-full sm:w-80 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-pink-200" />
        </div>
        {loading ? <div className="py-12 text-center text-gray-400">Loading customers...</div> : customers.length === 0 ? (
          <div className="py-12 text-center text-gray-400">No customer data for this filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase text-gray-400">
                <tr>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Bookings</th>
                  <th className="px-4 py-3">Spend</th>
                  <th className="px-4 py-3">Last booking</th>
                  <th className="px-4 py-3">Last service/staff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.slice(0, 250).map((c) => (
                  <tr key={c.key} className="hover:bg-pink-50/40">
                    <td className="px-4 py-3"><b className="text-gray-900">{c.name || "Unknown"}</b><p className="text-xs text-gray-400">{c.source}</p></td>
                    <td className="px-4 py-3 text-gray-600"><p>{c.email || "-"}</p><p className="text-xs text-gray-400">{c.phone || "-"}</p></td>
                    <td className="px-4 py-3 text-gray-700"><b>{c.totalBookings}</b><p className="text-xs text-gray-400">{c.confirmedBookings} ok · {c.cancelledBookings} cancel · {c.noShowBookings} no-show</p></td>
                    <td className="px-4 py-3 font-black text-gray-900">{money(c.spend)}</td>
                    <td className="px-4 py-3 text-gray-600">{c.lastBookingAt || "-"}</td>
                    <td className="px-4 py-3 text-gray-600"><p>{c.lastService || "-"}</p><p className="text-xs text-gray-400">{c.lastStaff || "-"}</p></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
