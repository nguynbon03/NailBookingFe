"use client";

import { useEffect, useState } from "react";
import { API_BASE, api } from "@/lib/api";
import { AlertTriangle, Banknote, Download, FileText, Mail, MessageSquareText, RefreshCw, Upload } from "lucide-react";

type RevenueReport = {
  range: { period: string; label: string };
  ownerPhone?: string;
  ownerEmail?: string;
  summary: Record<string, any>;
  serviceTotals: Array<{ service: string; count: number; revenue: number }>;
  bankEntries: Array<{ id: string; transactionDate: string; description: string; reference?: string | null; amount: number; type: string; matchedBookingId?: string | null; matchedConfidence?: number | null }>;
  bookings: Array<{ reference: string; date: string; time: string; customerName: string; status: string; totalPrice: number; staff: string; services: string }>;
};

type BankData = {
  openBanking?: { configured: boolean; provider: string; note: string };
  summary?: Record<string, any>;
  entries?: RevenueReport["bankEntries"];
};

function money(value: any) {
  return `£${Number(value || 0).toFixed(2)}`;
}

function authHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function downloadAdminFile(path: string, fallbackName: string) {
  const res = await fetch(`${API_BASE}${path}`, { headers: authHeaders() });
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

export default function AdminReportsPage() {
  const [period, setPeriod] = useState("day");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [report, setReport] = useState<RevenueReport | null>(null);
  const [bank, setBank] = useState<BankData | null>(null);
  const [statementCsv, setStatementCsv] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const refresh = () => {
    setError("");
    setNotice("");
    setLoading(true);
    Promise.all([
      api.admin.revenueReport({ period, date }),
      api.admin.bankStatements({ period, date }),
    ])
      .then(([revenue, bankData]: any[]) => {
        setReport(revenue);
        setBank(bankData);
        setEmail(revenue.ownerEmail || "");
        setPhone(revenue.ownerPhone || "");
      })
      .catch((err: any) => setError(err.message || "Could not load reports"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { refresh(); }, []);

  const exportFile = async (format: "pdf" | "csv") => {
    try {
      const query = new URLSearchParams({ period, date, format });
      await downloadAdminFile(`/api/admin/reports/revenue/export?${query.toString()}`, `nail-lounge-revenue.${format}`);
    } catch (err: any) {
      setError(err.message || "Could not export report");
    }
  };

  const sendDailySms = async () => {
    setBusy("sms");
    setError("");
    setNotice("");
    try {
      const result = await api.admin.sendRevenueAction({ action: "sendDailySms", period: "day", date, phone });
      if (result.delivery?.sent > 0) setNotice(`Daily revenue SMS sent to ${result.recipient}.`);
      else setNotice("Daily SMS is not available yet. Please use email delivery for now.");
    } catch (err: any) {
      setError(err.message || "Could not send daily SMS");
    } finally {
      setBusy("");
    }
  };

  const sendMonthlyEmail = async () => {
    setBusy("email");
    setError("");
    setNotice("");
    try {
      const result = await api.admin.sendRevenueAction({ action: "sendMonthlyEmail", period: "month", date, email });
      setNotice(`Monthly PDF report sent to ${result.recipient}.`);
    } catch (err: any) {
      setError(err.message || "Could not send monthly email");
    } finally {
      setBusy("");
    }
  };

  const importStatement = async () => {
    if (!statementCsv.trim()) {
      setError("Paste or upload CSV bank statement content first.");
      return;
    }
    setBusy("import");
    setError("");
    setNotice("");
    try {
      const result = await api.admin.importBankStatement(statementCsv);
      setNotice(`Imported ${result.imported} transaction(s), matched ${result.matched}, skipped ${result.skipped}.`);
      setStatementCsv("");
      refresh();
    } catch (err: any) {
      setError(err.message || "Could not import bank statement");
    } finally {
      setBusy("");
    }
  };

  const handleFile = async (file?: File | null) => {
    if (!file) return;
    setStatementCsv(await file.text());
  };

  const summary = report?.summary || {};
  const openBanking = bank?.openBanking;

  return (
    <div>
      <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <p className="text-pink-600 text-xs font-black uppercase tracking-wide">Revenue / Bank operations</p>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-1">Reports</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Daily revenue, bank-statement reconciliation, PDF/CSV export, owner SMS/email delivery.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={period} onChange={(e) => setPeriod(e.target.value)} className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm font-bold text-gray-700">
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm font-bold text-gray-700" />
          <button onClick={refresh} className="h-10 px-3 rounded-xl bg-white border border-gray-200 text-gray-600 text-sm font-bold inline-flex items-center gap-2"><RefreshCw size={16} />Refresh</button>
          <button onClick={() => exportFile("pdf")} className="h-10 px-3 rounded-xl bg-pink-600 text-white text-sm font-bold inline-flex items-center gap-2"><FileText size={16} />PDF</button>
          <button onClick={() => exportFile("csv")} className="h-10 px-3 rounded-xl bg-gray-900 text-white text-sm font-bold inline-flex items-center gap-2"><Download size={16} />CSV</button>
        </div>
      </div>

      {error && <div className="mb-4 rounded-xl bg-orange-50 text-orange-700 p-3 text-sm flex gap-2"><AlertTriangle size={17} className="shrink-0" />{error}</div>}
      {notice && <div className="mb-4 rounded-xl bg-emerald-50 text-emerald-700 p-3 text-sm">{notice}</div>}

      <div className="grid grid-cols-2 xl:grid-cols-5 gap-2 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-white rounded-2xl border border-emerald-100 p-3 sm:p-5"><p className="text-[11px] font-black text-emerald-500 uppercase">Revenue</p><p className="text-2xl font-black text-gray-900">{money(summary.totalRevenue)}</p></div>
        <div className="bg-white rounded-2xl border border-sky-100 p-3 sm:p-5"><p className="text-[11px] font-black text-sky-500 uppercase">Paid bookings</p><p className="text-2xl font-black text-gray-900">{summary.revenueBookingCount || 0}</p></div>
        <div className="bg-white rounded-2xl border border-amber-100 p-3 sm:p-5"><p className="text-[11px] font-black text-amber-500 uppercase">Pending</p><p className="text-2xl font-black text-gray-900">{summary.pendingCount || 0}</p></div>
        <div className="bg-white rounded-2xl border border-pink-100 p-3 sm:p-5"><p className="text-[11px] font-black text-pink-500 uppercase">Bank credits</p><p className="text-2xl font-black text-gray-900">{money(summary.bankStatementCreditTotal)}</p></div>
        <div className="bg-white rounded-2xl border border-red-100 p-3 sm:p-5"><p className="text-[11px] font-black text-red-500 uppercase">Unmatched</p><p className="text-2xl font-black text-gray-900">{summary.bankStatementUnmatchedCount || 0}</p></div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-4 sm:gap-6 mb-4 sm:mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3"><Banknote size={18} className="text-emerald-500" /><h3 className="font-black text-gray-900">Bank statement import</h3></div>
          <div className="rounded-xl bg-gray-50 border border-gray-100 p-3 text-sm text-gray-600 mb-3">
            <b>Status:</b> {openBanking?.configured ? "Bank connection enabled" : "Manual bank statement import active"}. {openBanking?.note}
          </div>
          <textarea value={statementCsv} onChange={(e) => setStatementCsv(e.target.value)} className="w-full min-h-40 rounded-2xl border border-gray-200 p-3 text-sm font-mono outline-none focus:ring-2 focus:ring-pink-200" placeholder={'Paste CSV bank statement here: Date,Description,Reference,Amount\n2026-06-30,Nail Lounge NL-ABC12345,NL-ABC12345,45.00'} />
          <div className="mt-3 flex flex-wrap gap-2">
            <label className="h-10 px-3 rounded-xl bg-white border border-gray-200 text-gray-600 text-sm font-bold inline-flex items-center gap-2 cursor-pointer"><Upload size={16} />Upload CSV<input type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} /></label>
            <button onClick={importStatement} disabled={busy === "import"} className="h-10 px-3 rounded-xl bg-emerald-600 text-white text-sm font-bold disabled:opacity-50">{busy === "import" ? "Importing..." : "Import + match"}</button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm">
          <h3 className="font-black text-gray-900 mb-3">Owner delivery</h3>
          <label className="text-xs font-black uppercase text-gray-400">Daily SMS phone</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 mb-3 h-11 w-full rounded-xl border border-gray-200 px-3 text-sm font-bold outline-none focus:ring-2 focus:ring-pink-200" placeholder="+44..." />
          <button onClick={sendDailySms} disabled={busy === "sms"} className="mb-4 h-11 w-full rounded-xl bg-pink-600 text-white text-sm font-black inline-flex items-center justify-center gap-2 disabled:opacity-50"><MessageSquareText size={16} />{busy === "sms" ? "Sending..." : "Send daily SMS now"}</button>
          <label className="text-xs font-black uppercase text-gray-400">Monthly PDF email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 mb-3 h-11 w-full rounded-xl border border-gray-200 px-3 text-sm font-bold outline-none focus:ring-2 focus:ring-pink-200" placeholder="owner@email.com" />
          <button onClick={sendMonthlyEmail} disabled={busy === "email"} className="h-11 w-full rounded-xl bg-gray-900 text-white text-sm font-black inline-flex items-center justify-center gap-2 disabled:opacity-50"><Mail size={16} />{busy === "email" ? "Sending..." : "Email monthly PDF"}</button>
          <p className="text-xs text-gray-400 mt-3">Automatic delivery is managed from Calendar & Reports. Keep the owner's email saved there.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100"><b className="text-gray-900">Top services</b><span className="text-xs text-gray-400 ml-2">{report?.range.label}</span></div>
          {loading ? <div className="py-12 text-center text-gray-400">Loading...</div> : (report?.serviceTotals || []).length === 0 ? <div className="p-4 text-gray-400 text-sm">No service revenue.</div> : (
            <div className="divide-y divide-gray-100">{report!.serviceTotals.map((s) => <div key={s.service} className="p-4 flex items-center justify-between"><span className="font-bold text-gray-700">{s.service}</span><span className="text-sm text-gray-500">{s.count} · {money(s.revenue)}</span></div>)}</div>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100"><b className="text-gray-900">Recent bank entries</b><span className="text-xs text-gray-400 ml-2">matched by reference/amount</span></div>
          {(report?.bankEntries || []).length === 0 ? <div className="p-4 text-gray-400 text-sm">No imported bank statement entries yet.</div> : (
            <div className="divide-y divide-gray-100 max-h-[420px] overflow-auto">{report!.bankEntries.slice(0, 80).map((entry) => <div key={entry.id} className="p-4"><div className="flex items-center justify-between gap-2"><b className="text-gray-800">{entry.description}</b><span className={Number(entry.amount) >= 0 ? "text-emerald-600 font-black" : "text-red-600 font-black"}>{money(entry.amount)}</span></div><p className="text-xs text-gray-400 mt-1">{entry.transactionDate} · {entry.reference || "no ref"} · {entry.matchedBookingId ? `matched ${entry.matchedConfidence || 0}%` : "unmatched"}</p></div>)}</div>
          )}
        </div>
      </div>
    </div>
  );
}
