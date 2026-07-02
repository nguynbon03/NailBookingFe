"use client";

import { useEffect, useState } from "react";

export default function WhatsAppSetup() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch("/api/otp/whatsapp/qr", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setData(json);
    } catch (e) {
      setData({ error: "Failed to load WhatsApp status" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-black mb-2">WhatsApp Setup</h1>
      <p className="text-sm text-gray-500 mb-6">WhatsApp is the primary OTP channel. SMS is handled only as a server-side fallback.</p>

      {loading && <div>Loading...</div>}
      {data?.error && <div className="text-red-600 p-3 bg-red-50 rounded">{data.error}</div>}

      {data && !data.error && (
        <div className="space-y-4">
          {data.connected ? (
            <div className="p-4 bg-emerald-100 text-emerald-800 rounded-xl">
              WhatsApp is connected (instance: {data.instance}).
            </div>
          ) : data.configured === false ? (
            <div className="p-4 bg-amber-100 text-amber-800 rounded-xl">
              <div className="font-bold mb-2">WhatsApp OTP setup is pending</div>
              Server credentials are managed by the technical admin and are not shown in this UI.
            </div>
          ) : (
            <div>
              <p className="mb-3">Scan this QR code with the shop WhatsApp number:</p>
              {data.qr ? (
                typeof data.qr === "string" && data.qr.startsWith("data:") ? (
                  <img src={data.qr} alt="WhatsApp QR" className="border p-2 bg-white max-w-[280px]" />
                ) : (
                  <pre className="bg-black text-green-400 p-4 rounded text-xs overflow-auto max-h-80">{JSON.stringify(data.qr, null, 2)}</pre>
                )
              ) : (
                <div>No QR code is available yet. Refresh the status after the WhatsApp server starts.</div>
              )}
              <button onClick={load} className="mt-4 px-4 py-2 bg-black text-white rounded">Refresh QR / Status</button>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 text-xs text-gray-500">
        Workflow: start the WhatsApp server, scan the QR code, then refresh this page until the connection is live.
      </div>
    </div>
  );
}
