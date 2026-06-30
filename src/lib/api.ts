export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://bookingnail.overpowers.agency";

export async function fetchAPI(path: string, options: RequestInit = {}) {
  const url = `${API_BASE}${path}`;
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = {
    ...(token ? { Authorization: ["Be", "arer ", token].join("") } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
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
  services: {
    list: () => fetchAPI("/api/services").catch(() => ({ services: [] })),
  },
  promoCodes: {
    validate: (code: string, subtotal: number) =>
      fetchAPI("/api/promo-codes/validate", { method: "POST", body: JSON.stringify({ code, subtotal }) }),
  },
  bookings: {
    create: (data: any) => fetchAPI("/api/bookings", { method: "POST", body: JSON.stringify(data) }),
    list: () => fetchAPI("/api/bookings"),
    my: () => fetchAPI("/api/bookings?mine=1"),
    updateStatus: (id: string, status: string) => fetchAPI("/api/bookings", { method: "PUT", body: JSON.stringify({ id, status }) }),
  },
  staff: {
    list: () => fetchAPI("/api/staff").catch(() => ({ staff: [] })),
  },
  admin: {
    stats: () => fetchAPI("/api/admin/stats"),
    bookings: () => fetchAPI("/api/bookings"),
    updateBookingStatus: (id: string, status: string) => fetchAPI("/api/bookings", { method: "PUT", body: JSON.stringify({ id, status }) }),
    services: () => fetchAPI("/api/admin/services"),
    createService: (data: any) => fetchAPI("/api/admin/services", { method: "POST", body: JSON.stringify(data) }),
    updateService: (data: any) => fetchAPI("/api/admin/services", { method: "PUT", body: JSON.stringify(data) }),
    deleteService: (id: string) => fetchAPI("/api/admin/services", { method: "DELETE", body: JSON.stringify({ id }) }),
    staff: () => fetchAPI("/api/admin/staff").catch(() => ({ staff: [] })),
    createStaff: (data: any) => fetchAPI("/api/admin/staff", { method: "POST", body: JSON.stringify(data) }),
    updateStaff: (data: any) => fetchAPI("/api/admin/staff", { method: "PUT", body: JSON.stringify(data) }),
    deleteStaff: (id: string) => fetchAPI("/api/admin/staff", { method: "DELETE", body: JSON.stringify({ id }) }),
    promoCodes: () => fetchAPI("/api/admin/promo-codes"),
    createPromoCode: (data: any) => fetchAPI("/api/admin/promo-codes", { method: "POST", body: JSON.stringify(data) }),
    updatePromoCode: (data: any) => fetchAPI("/api/admin/promo-codes", { method: "PUT", body: JSON.stringify(data) }),
    deletePromoCode: (id: string) => fetchAPI("/api/admin/promo-codes", { method: "DELETE", body: JSON.stringify({ id }) }),
  },
};
