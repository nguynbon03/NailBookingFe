"use client";

import { useEffect, useMemo, useState } from "react";
import { API_BASE, api } from "@/lib/api";
import {
  AlertTriangle,
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  Copy,
  Download,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Link as LinkIcon,
  Mail,
  MessageSquareText,
  RefreshCw,
  Settings2,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

export const dynamic = "force-dynamic";

type Settings = {
  syncEnabled: boolean;
  googleSyncEnabled: boolean;
  calcomSyncEnabled: boolean;
  dailyExportEnabled: boolean;
  autoDailyReportEnabled: boolean;
  dailyReportEmailEnabled: boolean;
  dailyReportSmsEnabled: boolean;
  dailyReportIncludePdf: boolean;
  dailyReportTime: string;
  ownerEmail?: string | null;
  ownerPhone?: string | null;
  ownerCalendarId: string;
  provider: string;
  lastSyncAt?: string | null;
  lastExportAt?: string | null;
  lastDailyReportAt?: string | null;
};

type SyncData = {
  settings: Settings;
  env: any;
  connections: any[];
  logs: any[];
  reportLogs: any[];
};

const fallbackSettings: Settings = {
  syncEnabled: false,
  googleSyncEnabled: false,
  calcomSyncEnabled: false,
  dailyExportEnabled: true,
  autoDailyReportEnabled: false,
  dailyReportEmailEnabled: true,
  dailyReportSmsEnabled: false,
  dailyReportIncludePdf: true,
  dailyReportTime: "08:30",
  ownerEmail: "",
  ownerPhone: "",
  ownerCalendarId: "primary",
  provider: "GOOGLE_CALENDAR",
};

function statusClass(ok?: boolean) {
  return ok ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200";
}

function StatusPill({ ok, text }: { ok?: boolean; text: string }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black ${statusClass(ok)}`}>{ok ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}{text}</span>;
}

function Toggle({ checked, onChange, title, description, disabled }: { checked: boolean; onChange: (value: boolean) => void; title: string; description: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`group flex w-full items-center justify-between gap-4 rounded-2xl border p-4 text-left transition disabled:opacity-50 ${checked ? "border-pink-200 bg-pink-50" : "border-gray-100 bg-white hover:border-gray-200"}`}
    >
      <span>
        <span className="block text-sm font-black text-gray-900">{title}</span>
        <span className="mt-1 block text-xs leading-5 text-gray-500">{description}</span>
      </span>
      <span className={`relative h-7 w-12 shrink-0 rounded-full transition ${checked ? "bg-pink-600" : "bg-gray-300"}`}>
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${checked ? "left-6" : "left-1"}`} />
      </span>
    </button>
  );
}

function Card({ title, subtitle, icon, children }: { title: string; subtitle: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-pink-50 text-pink-600">{icon}</div>
        <div>
          <h2 className="text-lg font-black text-gray-900">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-gray-500">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-black uppercase tracking-wide text-gray-400">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-11 w-full rounded-2xl border border-gray-200 bg-white px-3 text-sm font-bold text-gray-800 outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-50" />
    </label>
  );
}

function shortDate(value?: string | null) {
  if (!value) return "Never";
  try { return new Date(value).toLocaleString(); } catch { return "Never"; }
}

function authHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
  return token ? { Authorization: String.fromCharCode(66, 101, 97, 114, 101, 114) + " " + token } : {};
}

async function downloadFile(url: string, fallbackName: string) {
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Download failed (${res.status})`);
  const blob = await res.blob();
  const disposition = res.headers.get("content-disposition") || "";
  const match = disposition.match(/filename="?([^";]+)"?/i);
  const filename = match?.[1] || fallbackName;
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
}

export default function GoogleSyncPage() {
  const [data, setData] = useState<SyncData | null>(null);
  const [settings, setSettings] = useState<Settings>(fallbackSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  const env = data?.env || {};
  const googleOk = Boolean(env.google?.configured);
  const calcomOk = Boolean(env.calcom?.configured);
  const reportReady = Boolean(env.reports?.cronSecretConfigured && (env.reports?.emailConfigured || env.reports?.smsConfigured));
  const activeConnectionCount = useMemo(() => (data?.connections || []).filter((item) => item.syncEnabled).length, [data]);

  const load = () => {
    setLoading(true);
    setError("");
    api.admin.calendarSync()
      .then((result: SyncData) => {
        setData(result);
        setSettings({ ...fallbackSettings, ...(result.settings || {}) });
      })
      .catch((err: any) => setError(err.message || "Could not load sync settings"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const updateLocal = (patch: Partial<Settings>) => setSettings((current) => ({ ...current, ...patch }));

  const save = async (patch?: Partial<Settings>) => {
    setSaving(true);
    setError("");
    setNotice("");
    const next = { ...settings, ...(patch || {}) };
    setSettings(next);
    try {
      const result = await api.admin.updateCalendarSync(next);
      setData((current) => ({ ...(current || {} as any), ...result, settings: result.settings }));
      setSettings({ ...fallbackSettings, ...(result.settings || {}) });
      setNotice("Settings saved.");
    } catch (err: any) {
      setError(err.message || "Could not save settings");
    } finally {
      setSaving(false);
    }
  };

  const copyText = async (label: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(""), 1400);
  };

  const exportFile = async (kind: "ics" | "pdf" | "csv") => {
    setBusy(kind);
    setError("");
    try {
      if (kind === "ics") await downloadFile(env.exports?.icsUrl || `${API_BASE}/api/staff/schedule/export?format=ics`, "nail-lounge-staff-calendar.ics");
      if (kind === "pdf") await downloadFile(env.reports?.dailyPdfUrl || `${API_BASE}/api/admin/reports/revenue/export?period=day&format=pdf`, "nail-lounge-daily-revenue.pdf");
      if (kind === "csv") await downloadFile(env.reports?.dailyCsvUrl || `${API_BASE}/api/admin/reports/revenue/export?period=day&format=csv`, "nail-lounge-daily-revenue.csv");
      setNotice(`${kind.toUpperCase()} exported.`);
    } catch (err: any) {
      setError(err.message || "Export failed");
    } finally {
      setBusy("");
    }
  };

  const sendTest = async (channel: "email" | "sms") => {
    setBusy(channel);
    setError("");
    setNotice("");
    try {
      await save();
      const action = channel === "email" ? "sendDailyEmail" : "sendDailySms";
      const payload = channel === "email" ? { action, period: "day", email: settings.ownerEmail } : { action, period: "day", phone: settings.ownerPhone };
      const result = await api.admin.sendRevenueAction(payload);
      setNotice(channel === "email" ? `Daily PDF sent to ${result.recipient}.` : `Daily SMS queued/sent to ${result.recipient}.`);
      load();
    } catch (err: any) {
      setError(err.message || "Could not send test report");
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="space-y-5 pb-10">
      <div className="relative overflow-hidden rounded-[2rem] border border-pink-100 bg-gradient-to-br from-pink-50 via-white to-amber-50 p-5 shadow-sm sm:p-7">
        <div className="absolute right-6 top-6 hidden h-24 w-24 rounded-full bg-pink-200/30 blur-2xl sm:block" />
        <div className="relative flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-pink-600">Calendar + revenue automation</p>
            <h1 className="mt-2 text-2xl font-black text-gray-950 sm:text-3xl">Google / Cal.com Sync</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
              Một màn hình để bật lịch làm việc, webhook Cal.com/Google và báo cáo doanh thu hằng ngày. Revenue chỉ tính booking CONFIRMED/COMPLETED.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusPill ok={googleOk} text={googleOk ? "Google ready" : "Google missing env"} />
            <StatusPill ok={calcomOk} text={calcomOk ? "Cal.com ready" : "Cal.com missing env"} />
            <StatusPill ok={reportReady} text={reportReady ? "Report cron ready" : "Report setup needed"} />
          </div>
        </div>
      </div>

      {error && <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4 text-sm font-semibold text-orange-700 flex gap-2"><AlertTriangle size={18} className="shrink-0" />{error}</div>}
      {notice && <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700 flex gap-2"><CheckCircle2 size={18} className="shrink-0" />{notice}</div>}

      <div className="grid gap-5 xl:grid-cols-[1.05fr_.95fr]">
        <Card title="1. Calendar sync setup" subtitle="Bật/tắt Google hoặc Cal.com sync. Nếu thiếu env, card sẽ báo rõ cần key nào." icon={<CalendarCheck2 size={22} />}>
          {loading ? <div className="py-12 text-center text-gray-400">Loading setup...</div> : (
            <div className="space-y-3">
              <Toggle checked={settings.syncEnabled} onChange={(value) => save({ syncEnabled: value })} title="Master calendar automation" description="Công tắc tổng cho các hoạt động sync lịch từ booking sang calendar." />
              <Toggle checked={settings.googleSyncEnabled} disabled={!googleOk} onChange={(value) => save({ googleSyncEnabled: value, syncEnabled: value ? true : settings.syncEnabled })} title="Google Calendar sync" description={googleOk ? "Đẩy/nhận trạng thái lịch qua Google Calendar connection." : "Thiếu GOOGLE_CLIENT_ID hoặc GOOGLE_CLIENT_SECRET trong Coolify BE."} />
              <Toggle checked={settings.calcomSyncEnabled} disabled={!calcomOk} onChange={(value) => save({ calcomSyncEnabled: value, syncEnabled: value ? true : settings.syncEnabled })} title="Cal.com broker sync" description={calcomOk ? "Khi booking được confirm, hệ thống tạo/cancel booking tương ứng trên Cal.com." : "Thiếu CALCOM_API_KEY và event type. UI đã sẵn, cần thêm env để chạy thật."} />

              <div className="grid gap-2 rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600 sm:grid-cols-2">
                <div><b className="text-gray-900">Google connections:</b> {activeConnectionCount}</div>
                <div><b className="text-gray-900">Last sync:</b> {shortDate(settings.lastSyncAt)}</div>
                <div><b className="text-gray-900">Provider:</b> {settings.provider}</div>
                <div><b className="text-gray-900">Calendar ID:</b> {settings.ownerCalendarId || "primary"}</div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <a href={env.google?.connectUrl || `${API_BASE}/api/auth/google?calendar=1&next=/admin/google-sync`} className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-gray-900 px-4 text-sm font-black text-white hover:bg-gray-800"><LinkIcon size={16} />Connect Google Calendar</a>
                <button onClick={() => exportFile("ics")} disabled={busy === "ics"} className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-white px-4 text-sm font-black text-gray-700 border border-gray-200 hover:bg-gray-50 disabled:opacity-50"><Download size={16} />Export staff ICS</button>
              </div>
            </div>
          )}
        </Card>

        <Card title="2. Daily revenue report" subtitle="Toggle auto báo cáo theo ngày + export PDF/CSV. Gửi thủ công để test trước khi bật auto." icon={<FileText size={22} />}>
          <div className="space-y-3">
            <Toggle checked={settings.autoDailyReportEnabled} onChange={(value) => save({ autoDailyReportEnabled: value, dailyExportEnabled: value ? true : settings.dailyExportEnabled })} title="Auto daily revenue report" description="Bật để cron gửi báo cáo doanh thu hằng ngày theo giờ dưới đây." />
            <Toggle checked={settings.dailyExportEnabled} onChange={(value) => save({ dailyExportEnabled: value })} title="Daily PDF/CSV export available" description="Cho phép export file doanh thu ngày từ trang Reports và cron." />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Send time" type="time" value={settings.dailyReportTime || "08:30"} onChange={(value) => updateLocal({ dailyReportTime: value })} />
              <Field label="Owner calendar id" value={settings.ownerCalendarId || "primary"} onChange={(value) => updateLocal({ ownerCalendarId: value })} placeholder="primary" />
              <Field label="Daily PDF email" type="email" value={settings.ownerEmail || ""} onChange={(value) => updateLocal({ ownerEmail: value })} placeholder="owner@email.com" />
              <Field label="Daily SMS phone" value={settings.ownerPhone || ""} onChange={(value) => updateLocal({ ownerPhone: value })} placeholder="+44..." />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Toggle checked={settings.dailyReportEmailEnabled} onChange={(value) => updateLocal({ dailyReportEmailEnabled: value })} title="Email PDF daily" description={env.reports?.emailConfigured ? "Email provider configured." : "Needs SMTP_* or RESEND_API_KEY env."} />
              <Toggle checked={settings.dailyReportSmsEnabled} onChange={(value) => updateLocal({ dailyReportSmsEnabled: value })} title="SMS summary daily" description={env.reports?.smsConfigured ? "SMS provider configured." : "Needs Twilio env to send real SMS."} />
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <button onClick={() => save()} disabled={saving} className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-pink-600 px-4 text-sm font-black text-white hover:bg-pink-700 disabled:opacity-50"><Settings2 size={16} />{saving ? "Saving..." : "Save settings"}</button>
              <button onClick={() => sendTest("email")} disabled={busy === "email" || !settings.ownerEmail} className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-black text-gray-700 hover:bg-gray-50 disabled:opacity-50"><Mail size={16} />Send daily PDF now</button>
              <button onClick={() => sendTest("sms")} disabled={busy === "sms" || !settings.ownerPhone} className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-black text-gray-700 hover:bg-gray-50 disabled:opacity-50"><MessageSquareText size={16} />Send SMS now</button>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <button onClick={() => exportFile("pdf")} disabled={busy === "pdf"} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gray-900 px-3 text-xs font-black text-white disabled:opacity-50"><FileText size={15} />Export daily PDF</button>
              <button onClick={() => exportFile("csv")} disabled={busy === "csv"} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gray-900 px-3 text-xs font-black text-white disabled:opacity-50"><FileSpreadsheet size={15} />Export daily CSV</button>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Card title="3. Webhook URLs" subtitle="Copy đúng URL này sang Google/Cal.com. Cal.com webhook hiện có cả alias để tránh lỗi path-prefix." icon={<Zap size={22} />}>
          <div className="space-y-3 text-sm">
            {[
              ["Cal.com", env.calcom?.webhookUrl],
              ["Cal.com alternate", env.calcom?.alternateWebhookUrl],
              ["Google webhook", `${API_BASE}/api/google-webhook`],
              ["Cron endpoint", env.reports?.cronUrl],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-gray-100 bg-gray-50 p-3">
                <div className="mb-1 flex items-center justify-between gap-2"><b className="text-gray-900">{label}</b><button onClick={() => copyText(String(label), String(value || ""))} className="inline-flex items-center gap-1 text-xs font-black text-pink-600"><Copy size={13} />{copied === label ? "Copied" : "Copy"}</button></div>
                <p className="break-all text-xs leading-5 text-gray-500">{String(value || "Not available")}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card title="4. What is missing" subtitle="Không cần đoán nữa: thiếu env nào sẽ hiện ở đây." icon={<ShieldCheck size={22} />}>
          <div className="space-y-3 text-sm">
            <div className="rounded-2xl border border-gray-100 p-3"><StatusPill ok={googleOk} text="Google env" /><ul className="mt-2 list-disc pl-5 text-xs leading-5 text-gray-500">{(env.google?.missing || []).length ? env.google.missing.map((m: string) => <li key={m}>{m}</li>) : <li>Ready</li>}</ul></div>
            <div className="rounded-2xl border border-gray-100 p-3"><StatusPill ok={calcomOk} text="Cal.com env" /><ul className="mt-2 list-disc pl-5 text-xs leading-5 text-gray-500">{(env.calcom?.missing || []).length ? env.calcom.missing.map((m: string) => <li key={m}>{m}</li>) : <li>Ready</li>}</ul></div>
            <div className="rounded-2xl border border-gray-100 p-3"><StatusPill ok={reportReady} text="Report automation" /><ul className="mt-2 list-disc pl-5 text-xs leading-5 text-gray-500"><li>REPORT_CRON_SECRET: {env.reports?.cronSecretConfigured ? "ready" : "missing"}</li><li>Email provider: {env.reports?.emailConfigured ? "ready" : "missing"}</li><li>SMS provider: {env.reports?.smsConfigured ? "ready" : "missing"}</li></ul></div>
          </div>
        </Card>

        <Card title="5. Recent activity" subtitle="Sync/report logs gần nhất để biết hệ thống đã làm gì." icon={<Clock3 size={22} />}>
          <div className="max-h-[460px] space-y-2 overflow-auto pr-1 text-sm">
            {!(data?.logs || []).length && !(data?.reportLogs || []).length ? <div className="rounded-2xl bg-gray-50 p-4 text-gray-400">No logs yet.</div> : null}
            {(data?.logs || []).slice(0, 8).map((log) => <div key={log.id} className="rounded-2xl border border-gray-100 p-3"><div className="flex items-center justify-between gap-2"><b className="text-gray-900">{log.direction} · {log.status}</b><span className="text-[11px] text-gray-400">{shortDate(log.createdAt)}</span></div><p className="mt-1 text-xs leading-5 text-gray-500">{log.message}</p></div>)}
            {(data?.reportLogs || []).slice(0, 6).map((log) => <div key={log.id} className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-3"><div className="flex items-center justify-between gap-2"><b className="text-gray-900">{log.channel} · {log.status}</b><span className="text-[11px] text-gray-400">{shortDate(log.createdAt)}</span></div><p className="mt-1 text-xs leading-5 text-gray-500">{log.reportType} → {log.recipient}</p></div>)}
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={load} className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-black text-gray-700 hover:bg-gray-50"><RefreshCw size={16} />Refresh status</button>
        <a href="/admin/calendar" className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-black text-gray-700 hover:bg-gray-50"><ExternalLink size={16} />Open staff calendar</a>
        <a href="/admin/reports" className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-black text-gray-700 hover:bg-gray-50"><Sparkles size={16} />Open reports</a>
      </div>
    </div>
  );
}
