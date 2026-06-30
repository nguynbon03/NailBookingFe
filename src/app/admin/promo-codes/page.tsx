"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Plus, Pencil, Trash, Tags, CheckCircle, XCircle } from "lucide-react";

const emptyForm = { code: "", name: "", discountPercent: "20", usageLimit: "", active: true, startsAt: "", endsAt: "" };

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
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Promo Codes</h2>
          <p className="text-sm text-gray-500 mt-1">Create discount codes, track usage count, and control active status.</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm(emptyForm); setError(""); }} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Code
        </button>
      </div>

      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>}

      {showForm && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6 shadow-sm">
          <h3 className="font-bold text-lg mb-4">{editing ? "Edit Promo Code" : "New Promo Code"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input className="p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none uppercase" placeholder="Code e.g. NAIL20" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            <input className="p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" type="number" min="1" max="100" placeholder="Discount %" value={form.discountPercent} onChange={(e) => setForm({ ...form, discountPercent: e.target.value })} />
            <input className="p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" type="number" min="1" placeholder="Usage limit (optional)" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} />
            <input className="p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" type="date" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} />
            <input className="p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" type="date" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} />
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="w-5 h-5 rounded border-gray-300 text-pink-600 focus:ring-pink-500" /> Active
            </label>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={save} disabled={saving} className="btn-primary">{saving ? "Saving..." : "Save Promo Code"}</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading promo codes...</div>
      ) : promoCodes.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 text-gray-400">No promo codes yet.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {promoCodes.map((promo) => (
            <div key={promo.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center"><Tags size={22} /></div>
                  <div>
                    <h3 className="text-xl font-black tracking-wide text-gray-900">{promo.code}</h3>
                    <p className="text-sm text-gray-500">{promo.name || "Discount code"}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => edit(promo)} className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600"><Pencil size={14} /></button>
                  <button onClick={() => remove(promo.id)} className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500"><Trash size={14} /></button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-5">
                <div className="rounded-xl bg-pink-50 p-3"><p className="text-xs text-gray-500">Discount</p><p className="font-bold text-pink-700">{promo.discountPercent}%</p></div>
                <div className="rounded-xl bg-gray-50 p-3"><p className="text-xs text-gray-500">Used</p><p className="font-bold text-gray-900">{promo.usedCount}</p></div>
                <div className="rounded-xl bg-gray-50 p-3"><p className="text-xs text-gray-500">Limit</p><p className="font-bold text-gray-900">{promo.usageLimit ?? "∞"}</p></div>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                {promo.active ? <span className="flex items-center gap-1 text-green-600 font-semibold"><CheckCircle size={15} />Active</span> : <span className="flex items-center gap-1 text-gray-400 font-semibold"><XCircle size={15} />Inactive</span>}
                <span className="text-gray-500">Remaining: {promo.remaining ?? "Unlimited"}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
