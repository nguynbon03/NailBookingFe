export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://bookingnail.overpowers.agency";

export async function fetchAPI(path: string, options: RequestInit = {}) {
  const url = `${API_BASE}${path}`;
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = {
    ...(token ? { Authorization: "Bearer " + token } : {}),
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
    verifyEmail: (token: string) => fetchAPI("/api/auth/verify-email", { method: "POST", body: JSON.stringify({ token }) }),
    me: () => fetchAPI("/api/auth/me"),
  },
  services: {
    list: () => fetchAPI("/api/services").catch(() => ({ services: [] })),
  },
  availability: {
    slots: (date: string, serviceId?: string, staffId?: string) => {
      const params = new URLSearchParams({ date });
      if (serviceId) params.set("serviceId", serviceId);
      if (staffId && staffId !== "any") params.set("staffId", staffId);
      return fetchAPI(`/api/availability?${params.toString()}`);
    },
  },
  notifications: {
    list: (audience?: string) => fetchAPI(`/api/notifications${audience ? `?audience=${audience}` : ""}`),
    markAll: (audience: string) => fetchAPI("/api/notifications", { method: "PUT", body: JSON.stringify({ audience, read: true }) }),
  },
  promoCodes: {
    validate: (code: string, subtotal: number) =>
      fetchAPI("/api/promo-codes/validate", { method: "POST", body: JSON.stringify({ code, subtotal }) }),
  },
  bookings: {
    create: (data: any) => fetchAPI("/api/bookings", { method: "POST", body: JSON.stringify(data) }),
    list: () => fetchAPI("/api/bookings"),
    my: () => fetchAPI("/api/bookings?mine=1"),
    verify: (token: string) => fetchAPI("/api/bookings/verify", { method: "POST", body: JSON.stringify({ token }) }),
    updateStatus: (id: string, status: string, staffId?: string | null) => fetchAPI("/api/bookings", { method: "PUT", body: JSON.stringify({ id, status, staffId }) }),
  },
  staff: {
    list: () => fetchAPI("/api/staff").catch(() => ({ staff: [] })),
    dashboard: () => fetchAPI("/api/staff/bookings"),
    action: (id: string, action: string, cancellationReason?: string | null) => fetchAPI("/api/staff/bookings", { method: "PUT", body: JSON.stringify({ id, action, cancellationReason }) }),
    availability: () => fetchAPI("/api/staff/availability"),
    createAvailability: (data: any) => fetchAPI("/api/staff/availability", { method: "POST", body: JSON.stringify(data) }),
    updateAvailability: (data: any) => fetchAPI("/api/staff/availability", { method: "PUT", body: JSON.stringify(data) }),
    deleteAvailability: (id: string) => fetchAPI("/api/staff/availability", { method: "DELETE", body: JSON.stringify({ id }) }),
  },
  admin: {
    stats: () => fetchAPI("/api/admin/stats"),
    bookings: (params?: { date?: string; includeArchived?: boolean; status?: string }) => {
      const query = new URLSearchParams();
      if (params?.date) query.set("date", params.date);
      if (params?.includeArchived) query.set("includeArchived", "1");
      if (params?.status) query.set("status", params.status);
      const qs = query.toString();
      return fetchAPI(`/api/bookings${qs ? `?${qs}` : ""}`);
    },
    updateBookingStatus: (id: string, status: string, staffId?: string | null, cancellationReason?: string | null) => fetchAPI("/api/bookings", { method: "PUT", body: JSON.stringify({ id, status, staffId, cancellationReason }) }),
    archiveBooking: (id: string) => fetchAPI("/api/bookings", { method: "DELETE", body: JSON.stringify({ id }) }),
    deleteBooking: (id: string) => fetchAPI("/api/bookings", { method: "DELETE", body: JSON.stringify({ id, hardDelete: true }) }),
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
    accounts: () => fetchAPI("/api/admin/accounts"),
    resetPassword: (id: string, newPassword: string) => fetchAPI("/api/admin/accounts", { method: "PUT", body: JSON.stringify({ id, newPassword }) }),
  },
};
