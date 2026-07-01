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
      setData({ error: "Failed to load QR" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-black mb-2">WhatsApp Setup (Evolution API)</h1>
      <p className="text-sm text-gray-500 mb-6">OTP qua WhatsApp (miễn phí, tự host). SMS Infobip là kênh dự phòng.</p>

      {loading && <div>Đang tải...</div>}
      {data?.error && <div className="text-red-600 p-3 bg-red-50 rounded">{data.error}</div>}

      {data && !data.error && (
        <div className="space-y-4">
          {data.connected ? (
            <div className="p-4 bg-emerald-100 text-emerald-800 rounded-xl">
              ✅ WhatsApp đã kết nối (instance: {data.instance})
            </div>
          ) : data.configured === false ? (
            <div className="p-4 bg-amber-100 text-amber-800 rounded-xl">
              <div className="font-bold mb-2">Chưa cấu hình Evolution API</div>
              Vào Coolify → NailBe app → Environment variables, thêm 3 biến sau:
              <pre className="mt-2 bg-white p-3 rounded text-xs overflow-auto">EVOLUTION_API_BASE_URL=http://100.118.114.57:8080
EVOLUTION_API_KEY=your-key-here
EVOLUTION_INSTANCE_NAME=nail-lounge</pre>
              Sau đó redeploy NailBe.
            </div>
          ) : (
            <div>
              <p className="mb-3">Quét QR bằng số WhatsApp cửa hàng (+84339351204):</p>
              {data.qr ? (
                typeof data.qr === "string" && data.qr.startsWith("data:") ? (
                  <img src={data.qr} alt="WhatsApp QR" className="border p-2 bg-white max-w-[280px]" />
                ) : (
                  <pre className="bg-black text-green-400 p-4 rounded text-xs overflow-auto max-h-80">{JSON.stringify(data.qr, null, 2)}</pre>
                )
              ) : (
                <div>Không có QR. Kiểm tra Evolution API đã chạy trên VPS chưa (port 8080).</div>
              )}
              <button onClick={load} className="mt-4 px-4 py-2 bg-black text-white rounded">Refresh QR / Trạng thái</button>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 text-xs text-gray-500">
        Hướng dẫn đầy đủ: Deploy Evolution trên VPS → Scan QR → Thêm env vào NailBe → Redeploy.
      </div>
    </div>
  );
}
