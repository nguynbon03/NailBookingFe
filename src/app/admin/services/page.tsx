"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Plus, Pencil, Trash, Clock, ImagePlus, X, CheckCircle, XCircle } from "lucide-react";
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

  const refresh = () => {
    api.admin.services()
      .then((d: any) => setServices(d.services || []))
      .catch((err: any) => setError(err.message || "Failed to load services"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { refresh(); }, []);

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
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Services</h2>
          <p className="text-sm text-gray-500 mt-1">No duplicate service names. Images sync to public booking and homepage.</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm(emptyForm); setError(""); }} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Service
        </button>
      </div>

      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>}

      {showForm && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6 shadow-sm">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h3 className="font-bold text-lg">{editing ? "Edit Service" : "New Service"}</h3>
            <button onClick={() => setShowForm(false)} className="p-2 rounded-full hover:bg-gray-100"><X size={18} /></button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[180px_1fr] gap-6">
            <div>
              <div className="w-full aspect-square rounded-2xl overflow-hidden bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-400 mb-3">
                {form.image ? <img src={form.image} alt="Service preview" className="w-full h-full object-cover" /> : <ImagePlus size={36} />}
              </div>
              <label className="btn-secondary w-full text-sm cursor-pointer">
                Upload Image
                <input type="file" accept="image/*" className="hidden" onChange={(e) => onImageFile(e.target.files?.[0])} />
              </label>
              {form.image && <button onClick={() => setForm({ ...form, image: "" })} className="mt-2 text-xs text-red-500">Remove image</button>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <textarea className="p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none md:col-span-2 min-h-[90px]" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="w-5 h-5 rounded border-gray-300 text-pink-600 focus:ring-pink-500" /> Active on website
              </label>
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={save} disabled={saving} className="btn-primary">{saving ? "Saving..." : "Save Service"}</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {services.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl border border-gray-100 hover:shadow-sm transition-shadow overflow-hidden">
              <div className="h-36 bg-pink-50 flex items-center justify-center text-pink-300">
                {s.image ? <img src={s.image} alt={s.name} className="w-full h-full object-cover" /> : <ImagePlus size={34} />}
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start gap-3 mb-2">
                  <div className="font-bold text-gray-900 leading-tight">{s.name}</div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => edit(s)} className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600"><Pencil size={14} /></button>
                    <button onClick={() => remove(s.id)} className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500"><Trash size={14} /></button>
                  </div>
                </div>
                <div className="text-sm text-gray-500">{s.category}</div>
                <div className="flex items-center justify-between gap-3 mt-3">
                  <div className="flex items-center gap-3">
                    <span className="text-pink-600 font-bold">{formatPrice(s.price)}</span>
                    <span className="flex items-center gap-1 text-gray-400 text-xs"><Clock size={12} />{s.duration}m</span>
                  </div>
                  {s.active ? <span className="text-green-600 text-xs flex items-center gap-1"><CheckCircle size={13} />Live</span> : <span className="text-gray-400 text-xs flex items-center gap-1"><XCircle size={13} />Hidden</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
