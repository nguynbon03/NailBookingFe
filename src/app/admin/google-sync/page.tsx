"use client";

import React, { useState } from "react";
import { RefreshCw, CalendarDays, Download, Link as LinkIcon, Check } from "lucide-react";

const API = "https://bookingnail.overpowers.agency";

export default function GoogleSyncPage() {
  const [from, setFrom] = useState(new Date().toISOString().slice(0, 10));
  const [to, setTo] = useState(() => { const d = new Date(); d.setDate(d.getDate() + 6); return d.toISOString().slice(0, 10); });
  const [status, setStatus] = useState("");
  const [icsUrl, setIcsUrl] = useState("");
  const [googleLink, setGoogleLink] = useState("");

  const exportICS = (sid?: string) => {
    const url = `${API}/api/staff/schedule/export?from=${from}&to=${to}${sid ? `&staffId=${sid}` : ""}&format=ics`;
    window.open(url, "_blank");
    setIcsUrl(url);
    setStatus("ICS exported. Import this file into Google Calendar (Settings → Import & Export).");
  };

  const getAddToGoogleLink = () => {
    const url = `${API}/api/staff/schedule/export?from=${from}&to=${to}&format=ics`;
    const gLink = `https://calendar.google.com/calendar/r/settings/export?src=${encodeURIComponent(url)}`;
    setGoogleLink(gLink);
    setStatus("Copy the ICS URL and use Google Calendar Import or subscribe. For full 2-way, connect via backend webhook (scaffold ready).");
  };

  const triggerSync = async () => {
    setStatus("Syncing (placeholder)...");
    await new Promise(r => setTimeout(r, 800));
    setStatus("Placeholder done. Real push/pull needs GOOGLE_CLIENT_ID + refresh token + /api/google-webhook route.");
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center"><RefreshCw /></div>
        <div>
          <h1 className="text-2xl font-black">Google Calendar Sync</h1>
          <p className="text-sm text-gray-500">Export ICS • Add to Google • Webhook scaffold (2-way ready)</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border p-6 mb-6">
        <div className="flex gap-3 mb-4 text-sm">
          <div>
            <label className="block text-xs mb-1">From</label>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="border p-2 rounded-xl" />
          </div>
          <div>
            <label className="block text-xs mb-1">To</label>
            <input type="date" value={to} onChange={e => setTo(e.target.value)} className="border p-2 rounded-xl" />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button onClick={() => exportICS()} className="btn-primary flex items-center gap-2">
            <Download size={16} /> Export All ICS
          </button>
          <button onClick={getAddToGoogleLink} className="btn-secondary flex items-center gap-2">
            <LinkIcon size={16} /> Get "Add to Google" Link
          </button>
          <button onClick={triggerSync} className="btn-secondary flex items-center gap-2">
            <RefreshCw size={16} /> Trigger Sync (placeholder)
          </button>
        </div>

        {icsUrl && (
          <div className="mt-4 p-3 bg-gray-50 rounded-xl text-xs break-all">
            ICS URL: <a href={icsUrl} target="_blank" className="text-pink-600 underline">{icsUrl}</a>
          </div>
        )}
        {googleLink && (
          <div className="mt-2 p-3 bg-emerald-50 rounded-xl text-xs break-all">
            Google import hint: <a href={googleLink} target="_blank" className="text-emerald-700 underline">{googleLink}</a>
          </div>
        )}
        {status && <div className="mt-3 text-sm text-emerald-600 flex items-center gap-2"><Check size={16} />{status}</div>}
      </div>

      <div className="bg-white rounded-3xl border p-6 text-sm">
        <h2 className="font-black mb-2">How 2-way works (current state)</h2>
        <ul className="list-disc pl-5 space-y-1 text-gray-600">
          <li><b>Export (outbound):</b> ICS file or direct download → import/subscribe in Google Calendar.</li>
          <li><b>Import (inbound):</b> Scaffold exists (google-auth.ts + ICS export). Full webhook needs Google Calendar API + /api/google-webhook.</li>
          <li><b>Future:</b> Add GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET + OAuth for staff, then real-time create/update/delete on both sides.</li>
        </ul>
        <p className="mt-3 text-xs text-gray-400">ICS export is live. Webhook scaffold can be enabled when you provide Google API credentials.</p>
      </div>
    </div>
  );
}
