"use client";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { Plus, Pencil, Trash, Clock, ImagePlus, X, CheckCircle, XCircle, Search } from "lucide-react";
import { formatPrice } from "@/lib/service-utils";

const emptyForm = { name: "", price: "", duration: "", category: "extensions_hands", description: "", image: "", active: true };

type Service = { id: string; name: string; price: number; duration: number; category: string; description: string | null; image: string | null; active: boolean };

function readImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const refresh = () => {
    api.admin.services()
      .then((d: any) => setServices(d.services || []))
      .catch((err: any) => setError(err.message || "Failed to load services"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { refresh(); }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return services;
    return services.filter((s) => [s.name, s.category, s.description || ""].join(" ").toLowerCase().includes(q));
  }, [services, query]);

  const save = async () => {
    setError("");
    setSaving(true);
    try {
      const data = {
        ...form,
        price: Number(form.price),
        duration: Number(form.duration),
      };
      if (editing) await api.admin.updateService({ id: editing.id, ...data });
      else await api.admin.createService(data);
      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);
      refresh();
    } catch (err: any) {
      setError(err.message || "Failed to save service");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this service?")) return;
    await api.admin.deleteService(id);
    refresh();
  };

  const edit = (s: Service) => {
    setEditing(s);
    setForm({ name: s.name, price: String(s.price), duration: String(s.duration), category: s.category, description: s.description || "", image: s.image || "", active: s.active });
    setShowForm(true);
    setError("");
  };

  const onImageFile = async (file?: File) => {
    if (!file) return;
    const dataUrl = await readImage(file);
    setForm({ ...form, image: dataUrl });
  };

  return (
    <div className="pb-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Services</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Compact food-style inventory grid: small square images, more services visible.</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm(emptyForm); setError(""); }} className="btn-primary min-h-11 flex items-center justify-center gap-2">
          <Plus size={18} /> Add Service
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search service name/category..." className="w-full pl-9 pr-3 py-3 rounded-2xl bg-white border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-pink-300" />
      </div>

      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>}

      {showForm && (
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 mb-4 sm:mb-6 shadow-sm">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h3 className="font-bold text-lg">{editing ? "Edit Service" : "New Service"}</h3>
            <button onClick={() => setShowForm(false)} className="p-2 rounded-full hover:bg-gray-100"><X size={18} /></button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[128px_1fr] gap-5">
            <div>
              <div className="w-28 h-28 lg:w-32 lg:h-32 rounded-2xl overflow-hidden bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-400 mb-3 mx-auto lg:mx-0">
                {form.image ? <img src={form.image} alt="Service preview" className="w-full h-full object-cover" /> : <ImagePlus size={30} />}
              </div>
              <label className="btn-secondary w-full text-sm cursor-pointer text-center">
                Upload Image
                <input type="file" accept="image/*" className="hidden" onChange={(e) => onImageFile(e.target.files?.[0])} />
              </label>
              {form.image && <button onClick={() => setForm({ ...form, image: "" })} className="mt-2 text-xs text-red-500">Remove image</button>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <input className="p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <select className="p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="extensions_hands">Nail Extensions (Hands)</option>
                <option value="extensions_feet">Nail Extensions (Feet)</option>
                <option value="gel_polish">Gel Polish</option>
                <option value="mani_pedi">Mani & Pedi</option>
                <option value="extras">Extras</option>
                <option value="waxing">Waxing</option>
                <option value="uncategorized">Other</option>
              </select>
              <input className="p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" placeholder="Price (£)" type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              <input className="p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" placeholder="Duration (minutes)" type="number" min="1" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
              <input className="p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none md:col-span-2" placeholder="Image URL or upload above" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
              <textarea className="p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none md:col-span-2 min-h-[76px]" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="w-5 h-5 rounded border-gray-300 text-pink-600 focus:ring-pink-500" /> Active on website
              </label>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-5">
            <button onClick={save} disabled={saving} className="btn-primary min-h-11">{saving ? "Saving..." : "Save Service"}</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary min-h-11">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2.5 sm:gap-3">
          {filtered.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl border border-gray-100 hover:shadow-sm transition-shadow overflow-hidden">
              <div className="aspect-square bg-pink-50 flex items-center justify-center text-pink-300">
                {s.image ? <img src={s.image} alt={s.name} className="w-full h-full object-cover" /> : <ImagePlus size={28} />}
              </div>
              <div className="p-2.5 sm:p-3">
                <div className="flex justify-between items-start gap-2 mb-1.5">
                  <div className="font-black text-gray-900 leading-tight text-sm line-clamp-2 min-h-[36px]">{s.name}</div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => edit(s)} className="h-8 w-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 inline-flex items-center justify-center"><Pencil size={13} /></button>
                    <button onClick={() => remove(s.id)} className="h-8 w-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 inline-flex items-center justify-center"><Trash size={13} /></button>
                  </div>
                </div>
                <div className="text-[11px] text-gray-400 truncate">{s.category}</div>
                <div className="flex items-center justify-between gap-2 mt-2">
                  <span className="text-pink-600 font-black text-sm">{formatPrice(s.price)}</span>
                  <span className="flex items-center gap-1 text-gray-400 text-[11px]"><Clock size={11} />{s.duration}m</span>
                </div>
                <div className="mt-2">
                  {s.active ? <span className="text-green-600 text-[11px] flex items-center gap-1 font-bold"><CheckCircle size={12} />Live</span> : <span className="text-gray-400 text-[11px] flex items-center gap-1 font-bold"><XCircle size={12} />Hidden</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
