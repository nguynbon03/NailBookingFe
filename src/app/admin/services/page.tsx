"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Package, Plus, Pencil, Trash, Clock } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

type Service = { id: string; name: string; price: number; duration: number; category: string; description: string; image: string | null };

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState({ name: "", price: "", duration: "", category: "", description: "", image: "" });
  const [showForm, setShowForm] = useState(false);

  const refresh = () => {
    api.admin.services()
      .then((d: any) => setServices(d.services || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { refresh(); }, []);

  const save = async () => {
    const data = {
      ...form,
      price: Number(form.price),
      duration: Number(form.duration),
    };
    if (editing) {
      await api.admin.updateService({ id: editing.id, ...data });
    } else {
      await api.admin.createService(data);
    }
    setShowForm(false);
    setEditing(null);
    setForm({ name: "", price: "", duration: "", category: "", description: "", image: "" });
    refresh();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this service?")) return;
    await api.admin.deleteService(id);
    refresh();
  };

  const edit = (s: Service) => {
    setEditing(s);
    setForm({ name: s.name, price: String(s.price), duration: String(s.duration), category: s.category, description: s.description || "", image: s.image || "" });
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Services</h2>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm({ name: "", price: "", duration: "", category: "", description: "", image: "" }); }}
          className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Service
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6">
          <h3 className="font-bold mb-4">{editing ? "Edit Service" : "New Service"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" placeholder="Price (£)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            <input className="p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" placeholder="Duration (minutes)" type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
            <input className="p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <input className="p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none md:col-span-2" placeholder="Image URL (optional)" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
            <textarea className="p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none md:col-span-2 min-h-[80px]" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={save} className="btn-primary">Save</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-sm transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <div className="font-bold text-gray-900">{s.name}</div>
                <div className="flex gap-1">
                  <button onClick={() => edit(s)} className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600"><Pencil size={14} /></button>
                  <button onClick={() => remove(s.id)} className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500"><Trash size={14} /></button>
                </div>
              </div>
              <div className="text-sm text-gray-500">{s.category}</div>
              <div className="flex items-center gap-3 mt-3">
                <span className="text-pink-600 font-bold">£{s.price}</span>
                <span className="flex items-center gap-1 text-gray-400 text-xs"><Clock size={12} />{s.duration}m</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
