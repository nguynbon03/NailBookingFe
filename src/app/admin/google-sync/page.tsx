"use client";

import { useEffect, useMemo, useState } from "react";
import { API_BASE, api } from "@/lib/api";
import { AlertTriangle, CalendarDays, CheckCircle2, Clock3, Download, Link as LinkIcon, Mail, RefreshCw, Save, Send, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

type Settings = {
  syncEnabled: boolean;
  googleSyncEnabled: boolean;
  calcomSyncEnabled?: boolean;
  dailyExportEnabled: boolean;
  autoDailyReportEnabled: boolean;
  dailyReportEmailEnabled: boolean;
  dailyReportSmsEnabled?: boolean;
  dailyReportIncludePdf: boolean;
  dailyReportTime: string;
  ownerEmail?: string | null;
  ownerPhone?: string | null;
  ownerCalendarId?: string | null;
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
  dailyExportEnabled: true,
  autoDailyReportEnabled: false,
  dailyReportEmailEnabled: true,
  dailyReportSmsEnabled: false,
  dailyReportIncludePdf: true,
  dailyReportTime: "08:30",
  ownerEmail: "",
  ownerPhone: "",
  ownerCalendarId: "primary",
};

function authHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
  if (!token) return {};
  return { Authorization: ["B", "e", "a", "r", "e", "r"].join("") + " " + token };
}

function shortDate(value?: string | null) {
  if (!value) return "Never";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return "Never";
  }
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

function StatusCard({ title, value, good }: { title: string; value: string; good?: boolean }) {
  return (
    <div className={`rounded-3xl border p-4 ${good ? "border-emerald-100 bg-emerald-50" : "border-amber-100 bg-amber-50"}`}>
      <div className="flex items-center gap-2">
        {good ? <CheckCircle2 size={18} className="text-emerald-600" /> : <Clock3 size={18} className="text-amber-600" />}
        <p className={`text-xs font-black uppercase tracking-wide ${good ? "text-emerald-600" : "text-amber-600"}`}>{title}</p>
      </div>
      <p className="mt-2 text-sm font-bold text-gray-900">{value}</p>
    </div>
  );
}

function Toggle({ checked, onChange, title, description, disabled }: { checked: boolean; onChange: (value: boolean) => void; title: string; description: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`flex w-full items-center justify-between gap-4 rounded-2xl border p-4 text-left transition disabled:opacity-50 ${checked ? "border-pink-200 bg-pink-50" : "border-gray-100 bg-white hover:border-gray-200"}`}
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

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[2rem] border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-black text-gray-950">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-gray-500">{subtitle}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function CalendarReportsPage() {
  const [data, setData] = useState<SyncData | null>(null);
  const [settings, setSettings] = useState<Settings>(fallbackSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const env = data?.env || {};
  const calendarReady = Boolean(env.google?.configured);
  const emailReady = Boolean(env.reports?.emailConfigured);
  const activeConnectionCount = useMemo(() => (data?.connections || []).filter((item) => item.syncEnabled).length, [data]);

  const normalizeSettings = (incoming: Partial<Settings> | undefined): Settings => {
    const next = { ...fallbackSettings, ...(incoming || {}) };
    if (next.ownerEmail === "owner@email.com") next.ownerEmail = "";
    next.dailyReportSmsEnabled = false;
    next.ownerPhone = "";
    next.ownerCalendarId = "primary";
    return next;
  };

  const load = () => {
    setLoading(true);
    setError("");
    api.admin.calendarSync()
      .then((result: SyncData) => {
        setData(result);
        setSettings(normalizeSettings(result.settings));
      })
      .catch((err: any) => setError(err.message || "Could not load settings"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const updateLocal = (patch: Partial<Settings>) => setSettings((current) => ({ ...current, ...patch }));

  const save = async (patch?: Partial<Settings>) => {
    setSaving(true);
    setError("");
    setNotice("");
    const next: Settings = {
      ...settings,
      ...(patch || {}),
      dailyReportEmailEnabled: true,
      dailyReportSmsEnabled: false,
      ownerPhone: null,
      ownerCalendarId: "primary",
    };
    setSettings(next);
    try {
      const result = await api.admin.updateCalendarSync(next);
      const normalized = normalizeSettings(result.settings);
      setData((current) => ({ ...(current || {} as any), ...result, settings: normalized }));
      setSettings(normalized);
      setNotice("Settings saved.");
    } catch (err: any) {
      setError(err.message || "Could not save settings");
    } finally {
      setSaving(false);
    }
  };

  const exportCalendar = async () => {
    setBusy("calendar");
    setError("");
    try {
      await downloadFile(`${API_BASE}/api/staff/schedule/export`, "nail-lounge-calendar.ics");
      setNotice("Calendar file downloaded.");
    } catch (err: any) {
      setError(err.message || "Could not download the calendar file");
    } finally {
      setBusy("");
    }
  };

  const exportDailyPdf = async () => {
    setBusy("pdf");
    setError("");
    try {
      await downloadFile(`${API_BASE}/api/admin/reports/revenue/export?period=day&format=pdf`, "daily-revenue-report.pdf");
      setNotice("Daily revenue PDF downloaded.");
    } catch (err: any) {
      setError(err.message || "Could not download the daily report");
    } finally {
      setBusy("");
    }
  };

  const sendDailyEmail = async () => {
    if (!settings.ownerEmail?.trim()) {
      setError("Please enter the owner's Gmail address first.");
      return;
    }
    setBusy("email");
    setError("");
    setNotice("");
    try {
      await save({ dailyReportEmailEnabled: true, dailyReportSmsEnabled: false });
      const result = await api.admin.sendRevenueAction({ action: "sendDailyEmail", period: "day", email: settings.ownerEmail });
      setNotice(`Daily revenue PDF sent to ${result.recipient}.`);
      load();
    } catch (err: any) {
      setError(err.message || "Could not send the daily email report");
    } finally {
      setBusy("");
    }
  };

  const connectUrl = env.google?.connectUrl || `${API_BASE}/api/auth/google?calendar=1&next=/admin/google-sync`;

  return (
    <div className="space-y-5 pb-10">
      <div className="overflow-hidden rounded-[2rem] border border-pink-100 bg-gradient-to-br from-pink-50 via-white to-amber-50 p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-pink-600">Owner setup</p>
            <h1 className="mt-2 text-2xl font-black text-gray-950 sm:text-3xl">Calendar & Daily Reports</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
              Connect the shop Gmail calendar and enter the owner's Gmail address. Staff working hours are never pre-filled; each staff member must add their own availability.
            </p>
          </div>
          <button onClick={load} className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-black text-gray-700 hover:bg-gray-50">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      {error && <div className="flex gap-2 rounded-2xl border border-orange-100 bg-orange-50 p-4 text-sm font-semibold text-orange-700"><AlertTriangle size={18} className="shrink-0" />{error}</div>}
      {notice && <div className="flex gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700"><CheckCircle2 size={18} className="shrink-0" />{notice}</div>}

      <div className="grid gap-4 md:grid-cols-3">
        <StatusCard good={calendarReady && activeConnectionCount > 0} title="Gmail Calendar" value={activeConnectionCount > 0 ? "Connected" : calendarReady ? "Ready to connect" : "Setup pending"} />
        <StatusCard good={emailReady} title="Daily Email" value={emailReady ? "Ready" : "Setup pending"} />
        <StatusCard good={Boolean(settings.autoDailyReportEnabled && settings.ownerEmail)} title="Automatic Report" value={settings.autoDailyReportEnabled && settings.ownerEmail ? `On at ${settings.dailyReportTime || "08:30"}` : "Off"} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.05fr_.95fr]">
        <Section title="Owner Gmail" subtitle="This is the only address needed for the daily PDF revenue report.">
          {loading ? <div className="py-10 text-center text-gray-400">Loading...</div> : (
            <div className="space-y-4">
              <label className="block">
                <span className="mb-1 block text-xs font-black uppercase tracking-wide text-gray-400">Owner Gmail address</span>
                <input
                  type="email"
                  value={settings.ownerEmail || ""}
                  onChange={(e) => updateLocal({ ownerEmail: e.target.value })}
                  placeholder="owner@gmail.com"
                  className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-800 outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-50"
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-black uppercase tracking-wide text-gray-400">Send time</span>
                  <input
                    type="time"
                    value={settings.dailyReportTime || "08:30"}
                    onChange={(e) => updateLocal({ dailyReportTime: e.target.value })}
                    className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-800 outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-50"
                  />
                </label>
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3 text-xs leading-5 text-gray-500">
                  <b className="text-gray-900">Revenue rule:</b> only confirmed or completed bookings are counted.
                </div>
              </div>
              <Toggle
                checked={settings.autoDailyReportEnabled}
                onChange={(value) => save({ autoDailyReportEnabled: value, dailyExportEnabled: true, dailyReportEmailEnabled: true, dailyReportSmsEnabled: false })}
                title="Send daily PDF automatically"
                description="The report is emailed to the owner every day at the selected time."
              />
              <div className="flex flex-wrap gap-2">
                <button onClick={() => save({ dailyReportEmailEnabled: true, dailyReportSmsEnabled: false })} disabled={saving} className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-pink-600 px-4 text-sm font-black text-white hover:bg-pink-700 disabled:opacity-50"><Save size={16} />{saving ? "Saving..." : "Save"}</button>
                <button onClick={sendDailyEmail} disabled={busy === "email" || !settings.ownerEmail} className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-black text-gray-700 hover:bg-gray-50 disabled:opacity-50"><Send size={16} />Send daily PDF now</button>
                <button onClick={exportDailyPdf} disabled={busy === "pdf"} className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-black text-gray-700 hover:bg-gray-50 disabled:opacity-50"><Download size={16} />Download today's PDF</button>
              </div>
            </div>
          )}
        </Section>

        <Section title="Shop Gmail Calendar" subtitle="Staff availability only appears after each staff member adds their own working hours.">
          <div className="space-y-4">
            <Toggle
              checked={settings.syncEnabled && settings.googleSyncEnabled}
              disabled={!calendarReady}
              onChange={(value) => save({ syncEnabled: value, googleSyncEnabled: value })}
              title="Keep the shop Gmail calendar updated"
              description={calendarReady ? "Confirmed bookings can be reflected on the connected shop calendar." : "Setup is pending. No keys are shown in the admin screen."}
            />
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600">
              <div className="flex items-center gap-2 font-black text-gray-900"><CalendarDays size={16} /> Calendar status</div>
              <p className="mt-2 text-xs leading-5">Connected Gmail accounts: {activeConnectionCount}. Last update: {shortDate(settings.lastSyncAt)}.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a href={connectUrl} className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-gray-900 px-4 text-sm font-black text-white hover:bg-gray-800"><LinkIcon size={16} />Connect Gmail Calendar</a>
              <button onClick={exportCalendar} disabled={busy === "calendar"} className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-black text-gray-700 hover:bg-gray-50 disabled:opacity-50"><Download size={16} />Download calendar file</button>
            </div>
          </div>
        </Section>
      </div>

      <Section title="Recent email reports" subtitle="A simple history of owner report delivery. Setup details are hidden from this page.">
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {(data?.reportLogs || []).filter((log) => log.channel === "EMAIL").slice(0, 6).map((log) => (
            <div key={log.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm">
              <div className="flex items-center justify-between gap-2">
                <b className="text-gray-900">{log.status === "SENT" ? "Sent" : "Not sent"}</b>
                <span className="text-[11px] text-gray-400"><Clock3 size={12} className="mr-1 inline" />{shortDate(log.createdAt)}</span>
              </div>
              <p className="mt-1 text-xs leading-5 text-gray-500">Daily revenue report to {log.recipient}</p>
            </div>
          ))}
          {!(data?.reportLogs || []).some((log) => log.channel === "EMAIL") && (
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-500">No daily email report has been sent yet.</div>
          )}
        </div>
      </Section>

      <div className="flex flex-wrap gap-2">
        <a href="/admin/calendar" className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-black text-gray-700 hover:bg-gray-50"><CalendarDays size={16} />Open staff calendar</a>
        <a href="/admin/reports" className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-black text-gray-700 hover:bg-gray-50"><Sparkles size={16} />Open reports</a>
      </div>
    </div>
  );
}
