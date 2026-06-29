const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.bookingnail.overpowers.agency";

export async function fetchAPI(path: string, options: RequestInit = {}) {
  const url = `${API_BASE}${path}`;
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      fetchAPI("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
    register: (data: any) =>
      fetchAPI("/api/auth/register", { method: "POST", body: JSON.stringify(data) }),
    me: () => fetchAPI("/api/auth/me"),
  },
  bookings: {
    create: (data: any) => fetchAPI("/api/bookings", { method: "POST", body: JSON.stringify(data) }),
    list: () => fetchAPI("/api/bookings"),
  },
  admin: {
    stats: () => fetchAPI("/api/admin/stats"),
    services: () => fetchAPI("/api/admin/services"),
  },
};
