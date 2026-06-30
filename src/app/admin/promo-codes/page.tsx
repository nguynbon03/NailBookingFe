"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Plus, Pencil, Trash, Tags, CheckCircle, XCircle, CalendarDays } from "lucide-react";

const emptyForm = { code: "", name: "", discountPercent: "20", usageLimit: "", active: true, startsAt: "", endsAt: "" };

const fieldClass = "w-full min-h-14 px-4 py-3 rounded-2xl border border-gray-200 bg-white text-base sm:text-lg font-semibold text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-pink-300 outline-none";
const dateFieldClass = fieldClass + " pr-4 [color-scheme:light] [&::-webkit-calendar-picker-indicator]:w-6 [&::-webkit-calendar-picker-indicator]:h-6 [&::-webkit-calendar-picker-indicator]:cursor-pointer";

type PromoCode = {
  id: string;
  code: string;
  name: string | null;
  discountPercent: number;
  active: boolean;
  usageLimit: number | null;
  usedCount: number;
  remaining: number | null;
  startsAt: string | null;
  endsAt: string | null;
};

function formatDate(value: string | null) {
  if (!value) return "No date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No date";
  return date.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

export default function PromoCodesPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<PromoCode | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const refresh = () => {
    api.admin.promoCodes()
      .then((d: any) => setPromoCodes(d.promoCodes || []))
      .catch((err: any) => setError(err.message || "Failed to load promo codes"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { refresh(); }, []);

  const edit = (promo: PromoCode) => {
    setEditing(promo);
    setForm({
      code: promo.code,
      name: promo.name || "",
      discountPercent: String(promo.discountPercent),
      usageLimit: promo.usageLimit == null ? "" : String(promo.usageLimit),
      active: promo.active,
      startsAt: promo.startsAt ? promo.startsAt.slice(0, 10) : "",
      endsAt: promo.endsAt ? promo.endsAt.slice(0, 10) : "",
    });
    setShowForm(true);
    setError("");
  };

  const save = async () => {
    setSaving(true);
    setError("");
    const data = {
      ...form,
      code: form.code.toUpperCase().replace(/\s+/g, ""),
      discountPercent: Number(form.discountPercent),
      usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
      startsAt: form.startsAt || null,
      endsAt: form.endsAt || null,
    };
    try {
      if (editing) await api.admin.updatePromoCode({ id: editing.id, ...data });
      else await api.admin.createPromoCode(data);
      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);
      refresh();
    } catch (err: any) {
      setError(err.message || "Failed to save promo code");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this promo code?")) return;
    await api.admin.deletePromoCode(id);
    refresh();
  };

  return (
    <div className="pb-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Promo Codes</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Create discount codes, track usage count, and control active status.</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm(emptyForm); setError(""); }} className="btn-primary min-h-12 flex items-center justify-center gap-2 text-base">
          <Plus size={19} /> Add Code
        </button>
      </div>

      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>}

      {showForm && (
        <div className="bg-white rounded-3xl p-4 sm:p-6 border border-gray-100 mb-5 sm:mb-6 shadow-sm">
          <h3 className="font-black text-lg sm:text-xl mb-4 text-gray-900">{editing ? "Edit Promo Code" : "New Promo Code"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            <input className={fieldClass + " uppercase tracking-wide"} placeholder="Code e.g. NAIL20" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            <input className={fieldClass} placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className={fieldClass} type="number" min="1" max="100" placeholder="Discount %" value={form.discountPercent} onChange={(e) => setForm({ ...form, discountPercent: e.target.value })} />
            <input className={fieldClass} type="number" min="1" placeholder="Usage limit (optional)" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} />
            <label className="space-y-1.5">
              <span className="text-sm font-black text-gray-700 flex items-center gap-1.5"><CalendarDays size={16} className="text-pink-500" /> Start date</span>
              <input className={dateFieldClass} type="date" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} />
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-black text-gray-700 flex items-center gap-1.5"><CalendarDays size={16} className="text-pink-500" /> End date</span>
              <input className={dateFieldClass} type="date" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} />
            </label>
            <label className="flex items-center gap-3 text-base font-bold text-gray-700 min-h-14 rounded-2xl border border-gray-200 px-4 bg-gray-50">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="w-6 h-6 rounded border-gray-300 text-pink-600 focus:ring-pink-500" /> Active
            </label>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-5">
            <button onClick={save} disabled={saving} className="btn-primary min-h-12 text-base">{saving ? "Saving..." : "Save Promo Code"}</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary min-h-12 text-base">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading promo codes...</div>
      ) : promoCodes.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 text-gray-400">No promo codes yet.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-3 sm:gap-4">
          {promoCodes.map((promo) => (
            <div key={promo.id} className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center shrink-0"><Tags size={22} /></div>
                  <div className="min-w-0">
                    <h3 className="text-lg sm:text-xl font-black tracking-wide text-gray-900 truncate">{promo.code}</h3>
                    <p className="text-sm text-gray-500 truncate">{promo.name || "Discount code"}</p>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => edit(promo)} className="h-9 w-9 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 inline-flex items-center justify-center"><Pencil size={15} /></button>
                  <button onClick={() => remove(promo.id)} className="h-9 w-9 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 inline-flex items-center justify-center"><Trash size={15} /></button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4">
                <div className="rounded-xl bg-pink-50 p-3"><p className="text-[11px] sm:text-xs text-gray-500 font-bold">Discount</p><p className="font-black text-pink-700 text-lg">{promo.discountPercent}%</p></div>
                <div className="rounded-xl bg-gray-50 p-3"><p className="text-[11px] sm:text-xs text-gray-500 font-bold">Used</p><p className="font-black text-gray-900 text-lg">{promo.usedCount}</p></div>
                <div className="rounded-xl bg-gray-50 p-3"><p className="text-[11px] sm:text-xs text-gray-500 font-bold">Limit</p><p className="font-black text-gray-900 text-lg">{promo.usageLimit ?? "∞"}</p></div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
                <div className="rounded-xl bg-gray-50 p-2"><span className="font-bold text-gray-700">Start:</span> {formatDate(promo.startsAt)}</div>
                <div className="rounded-xl bg-gray-50 p-2"><span className="font-bold text-gray-700">End:</span> {formatDate(promo.endsAt)}</div>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                {promo.active ? <span className="flex items-center gap-1 text-green-600 font-bold"><CheckCircle size={15} />Active</span> : <span className="flex items-center gap-1 text-gray-400 font-bold"><XCircle size={15} />Inactive</span>}
                <span className="text-gray-500 font-semibold">Remaining: {promo.remaining ?? "Unlimited"}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
