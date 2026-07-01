"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function WhatsAppSetup() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/otp/whatsapp/qr", { headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` } });
      const json = await res.json();
      setData(json);
    } catch (e) {
      setData({ error: "Failed to load" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-black mb-6">WhatsApp (Evolution API) Setup</h1>

      {loading && <div>Loading...</div>}

      {data?.error && <div className="text-red-600">{data.error}</div>}

      {data && !data.error && (
        <div>
          {data.connected ? (
            <div className="p-4 bg-emerald-100 text-emerald-800 rounded-xl">✅ Connected to WhatsApp (instance: {data.instance})</div>
          ) : data.configured === false ? (
            <div className="p-4 bg-amber-100 text-amber-800 rounded-xl">Evolution API not configured. Add EVOLUTION_API_BASE_URL + EVOLUTION_API_KEY in Coolify.</div>
          ) : (
            <div>
              <p className="mb-4">Scan this QR with the staff WhatsApp number:</p>
              {data.qr ? (
                typeof data.qr === "string" && data.qr.startsWith("data:") ? (
                  <img src={data.qr} alt="WhatsApp QR" />
                ) : (
                  <pre className="bg-black text-green-400 p-4 rounded overflow-auto text-xs">{JSON.stringify(data.qr, null, 2)}</pre>
                )
              ) : (
                <div>No QR returned. Check Evolution logs.</div>
              )}
              <button onClick={load} className="mt-4 px-4 py-2 bg-black text-white rounded">Refresh QR / Status</button>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 text-sm text-gray-500">
        After scanning, WhatsApp will be primary for OTP. SMS (Infobip) is fallback.
      </div>
    </div>
  );
}
