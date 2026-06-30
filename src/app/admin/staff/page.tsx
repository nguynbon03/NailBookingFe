"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Plus, Pencil, Trash, CheckCircle, XCircle, ImagePlus, X, Mail, Phone } from "lucide-react";

const emptyForm = { name: "", email: "", phone: "", role: "THERAPIST", bio: "", avatar: "", active: true };

type Staff = { id: string; name: string; email: string; phone?: string | null; role: string; bio?: string | null; avatar?: string | null; active: boolean; createdAt: string };

function readImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AdminStaff() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Staff | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const refresh = () => {
    api.admin.staff()
      .then((d: any) => setStaff(d.staff || []))
      .catch((err: any) => setError(err.message || "Failed to load staff"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { refresh(); }, []);

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      if (editing) await api.admin.updateStaff({ id: editing.id, ...form });
      else await api.admin.createStaff(form);
      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);
      refresh();
    } catch (err: any) {
      setError(err.message || "Failed to save staff");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this staff member?")) return;
    await api.admin.deleteStaff(id);
    refresh();
  };

  const edit = (s: Staff) => {
    setEditing(s);
    setForm({ name: s.name, email: s.email, phone: s.phone || "", role: s.role, bio: s.bio || "", avatar: s.avatar || "", active: s.active });
    setShowForm(true);
    setError("");
  };

  const onImageFile = async (file?: File) => {
    if (!file) return;
    setForm({ ...form, avatar: await readImage(file) });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Staff Management</h2>
          <p className="text-sm text-gray-500 mt-1">Photos and active status sync to public booking staff selection.</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm(emptyForm); setError(""); }} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Staff
        </button>
      </div>

      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>}

      {showForm && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6 shadow-sm">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h3 className="font-bold text-lg">{editing ? "Edit Staff" : "New Staff"}</h3>
            <button onClick={() => setShowForm(false)} className="p-2 rounded-full hover:bg-gray-100"><X size={18} /></button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[180px_1fr] gap-6">
            <div>
              <div className="w-full aspect-square rounded-2xl overflow-hidden bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-400 mb-3">
                {form.avatar ? <img src={form.avatar} alt="Staff preview" className="w-full h-full object-cover" /> : <ImagePlus size={36} />}
              </div>
              <label className="btn-secondary w-full text-sm cursor-pointer">
                Upload Photo
                <input type="file" accept="image/*" className="hidden" onChange={(e) => onImageFile(e.target.files?.[0])} />
              </label>
              {form.avatar && <button onClick={() => setForm({ ...form, avatar: "" })} className="mt-2 text-xs text-red-500">Remove photo</button>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input className="p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className="p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input className="p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <select className="p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="THERAPIST">Therapist</option>
                <option value="MANICURIST">Manicurist</option>
                <option value="WAXING_SPECIALIST">Waxing Specialist</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Admin</option>
              </select>
              <input className="p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none md:col-span-2" placeholder="Photo URL or upload above" value={form.avatar} onChange={(e) => setForm({ ...form, avatar: e.target.value })} />
              <textarea className="p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none md:col-span-2 min-h-[90px]" placeholder="Bio / specialties" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="w-5 h-5 rounded border-gray-300 text-pink-600 focus:ring-pink-500" /> Active on website
              </label>
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={save} disabled={saving} className="btn-primary">{saving ? "Saving..." : "Save Staff"}</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {staff.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-sm transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-pink-50 flex items-center justify-center text-pink-400 shrink-0">
                  {s.avatar ? <img src={s.avatar} alt={s.name} className="w-full h-full object-cover" /> : <ImagePlus size={24} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <h3 className="font-bold text-gray-900 truncate">{s.name}</h3>
                      <span className="inline-flex mt-1 px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-bold">{s.role}</span>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => edit(s)} className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600"><Pencil size={14} /></button>
                      <button onClick={() => remove(s.id)} className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500"><Trash size={14} /></button>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1 text-xs text-gray-500">
                    <p className="flex items-center gap-1"><Mail size={12} />{s.email}</p>
                    {s.phone && <p className="flex items-center gap-1"><Phone size={12} />{s.phone}</p>}
                  </div>
                  <div className="mt-3">
                    {s.active ? <span className="flex items-center gap-1 text-green-600 text-xs font-bold"><CheckCircle size={14} /> Active</span> : <span className="flex items-center gap-1 text-gray-400 text-xs font-bold"><XCircle size={14} /> Inactive</span>}
                  </div>
                </div>
              </div>
              {s.bio && <p className="mt-4 text-sm text-gray-500 line-clamp-2">{s.bio}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
