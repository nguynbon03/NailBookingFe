"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Users, Plus, Pencil, Trash, CheckCircle, XCircle } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

type Staff = { id: string; name: string; email: string; role: string; active: boolean; createdAt: string };

export default function AdminStaff() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Staff | null>(null);
  const [form, setForm] = useState({ name: "", email: "", role: "THERAPIST", active: true });
  const [showForm, setShowForm] = useState(false);

  const refresh = () => {
    api.admin.staff()
      .then((d: any) => setStaff(d.staff || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { refresh(); }, []);

  const save = async () => {
    if (editing) {
      await api.admin.updateStaff({ id: editing.id, ...form });
    } else {
      await api.admin.createStaff(form);
    }
    setShowForm(false);
    setEditing(null);
    setForm({ name: "", email: "", role: "THERAPIST", active: true });
    refresh();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this staff member?")) return;
    await api.admin.deleteStaff(id);
    refresh();
  };

  const edit = (s: Staff) => {
    setEditing(s);
    setForm({ name: s.name, email: s.email, role: s.role, active: s.active });
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Staff Management</h2>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm({ name: "", email: "", role: "THERAPIST", active: true }); }}
          className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Staff
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6">
          <h3 className="font-bold mb-4">{editing ? "Edit Staff" : "New Staff"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <select className="p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="THERAPIST">Therapist</option>
              <option value="MANAGER">Manager</option>
              <option value="ADMIN">Admin</option>
            </select>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="active" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="w-5 h-5 rounded border-gray-300 text-pink-600 focus:ring-pink-500" />
              <label htmlFor="active" className="text-sm text-gray-700">Active</label>
            </div>
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
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Name</th>
                  <th className="text-left px-4 py-3 font-semibold">Email</th>
                  <th className="text-left px-4 py-3 font-semibold">Role</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-right px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((s) => (
                  <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                    <td className="px-4 py-3 text-gray-500">{s.email}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-bold">{s.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      {s.active ? (
                        <span className="flex items-center gap-1 text-green-600 text-xs font-bold"><CheckCircle size={14} /> Active</span>
                      ) : (
                        <span className="flex items-center gap-1 text-gray-400 text-xs font-bold"><XCircle size={14} /> Inactive</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => edit(s)} className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600"><Pencil size={14} /></button>
                        <button onClick={() => remove(s.id)} className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500"><Trash size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
