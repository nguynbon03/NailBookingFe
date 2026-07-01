"use client";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Ban, RefreshCw, Save, ShieldCheck, Trash2 } from "lucide-react";

type Settings = {
  depositMode: string;
  depositAmount: number;
  highValueThreshold: number;
  maxActiveBookingsPerCustomer: number;
  maxBookingsPerPhonePerDay: number;
  maxBookingsPerEmailPerDay: number;
  maxBookingsPerIpPerDay: number;
  requireDepositForNewCustomer: boolean;
  requireDepositForWeekend: boolean;
  requireDepositForHighValue: boolean;
};

type BlocklistItem = {
  id: string;
  type: string;
  value: string;
  reason?: string | null;
  active: boolean;
  createdAt: string;
  createdBy?: string | null;
};

const defaultSettings: Settings = {
  depositMode: "SMART",
  depositAmount: 10,
  highValueThreshold: 50,
  maxActiveBookingsPerCustomer: 2,
  maxBookingsPerPhonePerDay: 3,
  maxBookingsPerEmailPerDay: 3,
  maxBookingsPerIpPerDay: 8,
  requireDepositForNewCustomer: true,
  requireDepositForWeekend: true,
  requireDepositForHighValue: true,
};

function toNumber(value: unknown, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export default function BookingProtectionPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [blocklist, setBlocklist] = useState<BlocklistItem[]>([]);
  const [form, setForm] = useState({ type: "EMAIL", value: "", reason: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const refresh = () => {
    setLoading(true);
    setError("");
    api.admin.protection()
      .then((data: any) => {
        setSettings({ ...defaultSettings, ...(data.settings || {}) });
        setBlocklist(data.blocklist || []);
      })
      .catch((err: any) => setError(err.message || "Could not load protection settings"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { refresh(); }, []);

  const updateField = (key: keyof Settings, value: string | boolean) => {
    setSettings((current) => ({
      ...current,
      [key]: typeof value === "boolean" ? value : toNumber(value, Number(current[key]) || 0),
    }));
  };

  const saveSettings = async () => {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const result = await api.admin.updateProtection(settings);
      setSettings({ ...defaultSettings, ...(result.settings || {}) });
      setMessage("Booking protection settings saved.");
    } catch (err: any) {
      setError(err.message || "Could not save settings");
    } finally {
      setSaving(false);
    }
  };

  const addBlock = async () => {
    setError("");
    setMessage("");
    if (!form.value.trim()) {
      setError("Enter an email, phone, or IP to blacklist.");
      return;
    }
    try {
      const result = await api.admin.addBlocklist(form);
      const item = result.blocklistItem;
      setBlocklist((items) => [item, ...items.filter((entry) => entry.id !== item.id)]);
      setForm({ ...form, value: "", reason: "" });
      setMessage("Blacklist updated. Future matching bookings will be blocked.");
    } catch (err: any) {
      setError(err.message || "Could not add blacklist item");
    }
  };

  const removeBlock = async (id: string) => {
    if (!window.confirm("Remove this blacklist item?")) return;
    await api.admin.removeBlocklist(id);
    setBlocklist((items) => items.map((item) => item.id === id ? { ...item, active: false } : item));
  };

  if (loading) return <div className="py-12 text-center text-gray-400">Loading booking protection...</div>;

  return (
    <div className="pb-10">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-pink-500">Anti-spam / No-show control</p>
          <h2 className="mt-1 text-2xl font-black text-gray-900">Booking Protection</h2>
          <p className="mt-2 max-w-3xl text-sm text-gray-500">Use several signals together: verified account, phone, email, IP/network, booking limits, blacklist, and deposit rules. IP is useful but not enough by itself because bad actors can use proxy/antidetect browsers.</p>
        </div>
        <button onClick={refresh} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-sm font-bold text-gray-600"><RefreshCw size={16} /> Refresh</button>
      </div>

      {error && <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-600">{error}</div>}
      {message && <div className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700">{message}</div>}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="rounded-3xl border border-pink-100 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-pink-50 text-pink-600"><ShieldCheck size={22} /></div>
            <div><h3 className="font-black text-gray-900">Rules</h3><p className="text-xs text-gray-500">Recommended for a busy shop: SMART deposit + strict active booking limits.</p></div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-bold text-gray-700">Deposit mode
              <select value={settings.depositMode} onChange={(e) => setSettings({ ...settings, depositMode: e.target.value })} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-3 font-semibold">
                <option value="OFF">OFF — staff acceptance only</option>
                <option value="SMART">SMART — only risky bookings need deposit</option>
                <option value="REQUIRED">REQUIRED — every online booking needs deposit</option>
              </select>
            </label>
            <label className="block text-sm font-bold text-gray-700">Deposit amount (£)
              <input type="number" min="0" value={settings.depositAmount} onChange={(e) => updateField("depositAmount", e.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-3" />
            </label>
            <label className="block text-sm font-bold text-gray-700">High-value threshold (£)
              <input type="number" min="0" value={settings.highValueThreshold} onChange={(e) => updateField("highValueThreshold", e.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-3" />
            </label>
            <label className="block text-sm font-bold text-gray-700">Max active bookings / customer
              <input type="number" min="0" value={settings.maxActiveBookingsPerCustomer} onChange={(e) => updateField("maxActiveBookingsPerCustomer", e.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-3" />
            </label>
            <label className="block text-sm font-bold text-gray-700">Max bookings / phone / day
              <input type="number" min="0" value={settings.maxBookingsPerPhonePerDay} onChange={(e) => updateField("maxBookingsPerPhonePerDay", e.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-3" />
            </label>
            <label className="block text-sm font-bold text-gray-700">Max bookings / email / day
              <input type="number" min="0" value={settings.maxBookingsPerEmailPerDay} onChange={(e) => updateField("maxBookingsPerEmailPerDay", e.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-3" />
            </label>
            <label className="block text-sm font-bold text-gray-700 md:col-span-2">Max bookings / IP network / day
              <input type="number" min="0" value={settings.maxBookingsPerIpPerDay} onChange={(e) => updateField("maxBookingsPerIpPerDay", e.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-3" />
              <span className="mt-1 block text-xs font-medium text-gray-400">Keep this higher than phone/email because families/public Wi‑Fi may share one IP.</span>
            </label>
          </div>

          <div className="mt-5 grid gap-2 rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
            <label className="inline-flex items-center gap-2 font-bold"><input type="checkbox" checked={settings.requireDepositForNewCustomer} onChange={(e) => updateField("requireDepositForNewCustomer", e.target.checked)} /> New customer needs deposit</label>
            <label className="inline-flex items-center gap-2 font-bold"><input type="checkbox" checked={settings.requireDepositForWeekend} onChange={(e) => updateField("requireDepositForWeekend", e.target.checked)} /> Weekend / peak slot needs deposit</label>
            <label className="inline-flex items-center gap-2 font-bold"><input type="checkbox" checked={settings.requireDepositForHighValue} onChange={(e) => updateField("requireDepositForHighValue", e.target.checked)} /> High-value service needs deposit</label>
          </div>

          <button onClick={saveSettings} disabled={saving} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-pink-600 px-5 font-black text-white disabled:bg-gray-300"><Save size={16} /> {saving ? "Saving..." : "Save protection settings"}</button>
        </section>

        <aside className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600"><Ban size={22} /></div><div><h3 className="font-black text-gray-900">Blacklist</h3><p className="text-xs text-gray-500">Block email, phone, or IP/network from creating new bookings.</p></div></div>
          <div className="grid grid-cols-[110px_1fr] gap-2">
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="rounded-xl border border-gray-200 px-3 py-3 text-sm font-bold">
              <option value="EMAIL">Email</option>
              <option value="PHONE">Phone</option>
              <option value="IP">IP</option>
            </select>
            <input value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="rounded-xl border border-gray-200 px-3 py-3 text-sm" placeholder="value to block" />
          </div>
          <input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-3 text-sm" placeholder="Reason, e.g. spam/no-show/competitor abuse" />
          <button onClick={addBlock} className="mt-3 w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-black text-white">Add to blacklist</button>

          <div className="mt-5 max-h-[520px] space-y-2 overflow-auto pr-1">
            {blocklist.length === 0 ? <p className="text-sm text-gray-400">No blacklist items yet.</p> : blocklist.map((item) => (
              <div key={item.id} className={`rounded-2xl border p-3 text-sm ${item.active ? "border-gray-100 bg-white" : "border-gray-100 bg-gray-50 opacity-50"}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0"><p className="font-black text-gray-900"><span className="text-red-600">{item.type}</span> · <span className="break-all">{item.value}</span></p>{item.reason && <p className="mt-1 text-xs text-gray-500">{item.reason}</p>}<p className="mt-1 text-[11px] text-gray-400">{new Date(item.createdAt).toLocaleString()}</p></div>
                  {item.active && <button onClick={() => removeBlock(item.id)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={14} /></button>}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
