"use client";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { KeyRound, Mail, Phone, Search, ShieldCheck, UserRound, UsersRound } from "lucide-react";

type Account = {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string | null;
  avatar?: string | null;
  createdAt: string;
  updatedAt: string;
  staffProfile?: { id: string; name: string; role: string; active: boolean } | null;
};

const roleClass: Record<string, string> = {
  ADMIN: "bg-purple-100 text-purple-700",
  MANAGER: "bg-blue-100 text-blue-700",
  STAFF: "bg-emerald-100 text-emerald-700",
  CUSTOMER: "bg-gray-100 text-gray-700",
};

function shortDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "2-digit" });
}

export default function AdminAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("all");
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [passwords, setPasswords] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const refresh = () => {
    setError("");
    api.admin.accounts()
      .then((d: any) => setAccounts(d.accounts || []))
      .catch((err: any) => setError(err.message || "Failed to load accounts"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { refresh(); }, []);

  const roles = useMemo(() => ["all", ...Array.from(new Set(accounts.map((a) => a.role)))], [accounts]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return accounts.filter((account) => {
      const matchRole = role === "all" || account.role === role;
      const text = [account.name, account.email, account.phone || "", account.role, account.staffProfile?.name || ""].join(" ").toLowerCase();
      return matchRole && (!q || text.includes(q));
    });
  }, [accounts, query, role]);

  const resetPassword = async (account: Account) => {
    const newPassword = passwords[account.id] || "";
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setError("");
    setMessage("");
    setResettingId(account.id);
    try {
      await api.admin.resetPassword(account.id, newPassword);
      setPasswords((items) => ({ ...items, [account.id]: "" }));
      setMessage(`Password reset for ${account.email}`);
      refresh();
    } catch (err: any) {
      setError(err.message || "Failed to reset password");
    } finally {
      setResettingId(null);
    }
  };

  return (
    <div className="pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Accounts</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Check login accounts and reset forgotten passwords for staff or customers.</p>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center">
          <div className="rounded-2xl bg-white border border-gray-100 p-3 text-center sm:min-w-24"><p className="text-xl font-black">{accounts.length}</p><p className="text-[11px] text-gray-400">Total</p></div>
          <div className="rounded-2xl bg-white border border-gray-100 p-3 text-center sm:min-w-24"><p className="text-xl font-black">{accounts.filter((a) => a.role === "STAFF").length}</p><p className="text-[11px] text-gray-400">Staff</p></div>
          <div className="rounded-2xl bg-white border border-gray-100 p-3 text-center sm:min-w-24"><p className="text-xl font-black">{accounts.filter((a) => a.role === "CUSTOMER").length}</p><p className="text-[11px] text-gray-400">Users</p></div>
        </div>
      </div>

      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>}
      {message && <div className="mb-4 p-3 rounded-xl bg-emerald-50 text-emerald-700 text-sm">{message}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_180px] gap-2 mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name/email/phone..." className="w-full pl-9 pr-3 py-3 rounded-2xl bg-white border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-pink-300" />
        </div>
        <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full p-3 rounded-2xl bg-white border border-gray-200 text-sm font-semibold outline-none focus:ring-2 focus:ring-pink-300">
          {roles.map((item) => <option key={item} value={item}>{item === "all" ? "All roles" : item}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading accounts...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No accounts found.</div>
      ) : (
        <>
          <div className="hidden lg:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="max-h-[calc(100vh-220px)] overflow-auto">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-gray-50 border-b border-gray-100 text-[11px] uppercase tracking-wide text-gray-400">
                  <tr>
                    <th className="px-3 py-2 font-black">Account</th>
                    <th className="px-3 py-2 font-black">Role</th>
                    <th className="px-3 py-2 font-black">Phone</th>
                    <th className="px-3 py-2 font-black">Linked Staff</th>
                    <th className="px-3 py-2 font-black">Created</th>
                    <th className="px-3 py-2 font-black w-72">Reset password</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((account) => (
                    <tr key={account.id} className="hover:bg-pink-50/30">
                      <td className="px-3 py-2 max-w-[260px]"><div className="font-black text-gray-900 truncate">{account.name}</div><div className="text-xs text-gray-400 truncate">{account.email}</div></td>
                      <td className="px-3 py-2"><span className={`px-2 py-1 rounded-full text-xs font-black ${roleClass[account.role] || "bg-gray-100 text-gray-600"}`}>{account.role}</span></td>
                      <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{account.phone || "-"}</td>
                      <td className="px-3 py-2 text-gray-600">{account.staffProfile ? `${account.staffProfile.name} · ${account.staffProfile.active ? "Active" : "Inactive"}` : "-"}</td>
                      <td className="px-3 py-2 text-gray-500 whitespace-nowrap">{shortDate(account.createdAt)}</td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2">
                          <input type="text" value={passwords[account.id] || ""} onChange={(e) => setPasswords({ ...passwords, [account.id]: e.target.value })} placeholder="New password" className="min-w-0 flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-pink-300" />
                          <button onClick={() => resetPassword(account)} disabled={resettingId === account.id} className="px-3 py-2 rounded-xl bg-gray-900 text-white text-xs font-bold whitespace-nowrap">{resettingId === account.id ? "..." : "Reset"}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:hidden space-y-2.5">
            {filtered.map((account) => (
              <div key={account.id} className="bg-white rounded-2xl border border-gray-100 p-3 shadow-sm">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <div className="font-black text-gray-900 truncate flex items-center gap-1"><UserRound size={14} className="text-pink-500" />{account.name}</div>
                    <div className="text-xs text-gray-400 truncate flex items-center gap-1 mt-1"><Mail size={12} />{account.email}</div>
                    {account.phone && <div className="text-xs text-gray-400 truncate flex items-center gap-1 mt-1"><Phone size={12} />{account.phone}</div>}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-black ${roleClass[account.role] || "bg-gray-100 text-gray-600"}`}>{account.role}</span>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] text-gray-500 mb-3">
                  <span className="inline-flex items-center gap-1"><ShieldCheck size={12} />Created {shortDate(account.createdAt)}</span>
                  {account.staffProfile && <span className="inline-flex items-center gap-1"><UsersRound size={12} />{account.staffProfile.active ? "Active staff" : "Inactive staff"}</span>}
                </div>
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <input type="text" value={passwords[account.id] || ""} onChange={(e) => setPasswords({ ...passwords, [account.id]: e.target.value })} placeholder="New password" className="min-w-0 px-3 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-pink-300" />
                  <button onClick={() => resetPassword(account)} disabled={resettingId === account.id} className="px-3 py-3 rounded-xl bg-gray-900 text-white text-xs font-bold inline-flex items-center gap-1"><KeyRound size={13} />{resettingId === account.id ? "..." : "Reset"}</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
