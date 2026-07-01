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
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const err = await res.json().catch(() => ({ error: "Request failed" }));
      throw new Error(err.error || err.message || `HTTP ${res.status}`);
    }
    const text = await res.text().catch(() => "");
    throw new Error(text && text.length < 180 ? text : `Request failed (${res.status})`);
  }
  return res.json();
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      fetchAPI("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
    google: (credential: string) =>
      fetchAPI("/api/auth/google", { method: "POST", body: JSON.stringify({ credential }) }),
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
    list: (audience?: string, take = 50, category?: string) => fetchAPI(`/api/notifications?take=${take}${audience ? `&audience=${audience}` : ""}${category ? `&category=${category}` : ""}`),
    markAll: (audience: string, category?: string) => fetchAPI("/api/notifications", { method: "PUT", body: JSON.stringify({ audience, read: true, category }) }),
    markOne: (id: string, read = true, audience = "admin", category?: string) => fetchAPI("/api/notifications", { method: "PUT", body: JSON.stringify({ id, read, audience, category }) }),
    deleteOne: (id: string, audience = "admin", category?: string) => fetchAPI("/api/notifications", { method: "DELETE", body: JSON.stringify({ id, audience, category }) }),
    deleteMany: (ids: string[], audience = "admin", category?: string) => fetchAPI("/api/notifications", { method: "DELETE", body: JSON.stringify({ ids, audience, category }) }),
    deleteAll: (audience = "admin", category?: string) => fetchAPI("/api/notifications", { method: "DELETE", body: JSON.stringify({ audience, category, readOnly: false }) }),
    action: (notificationId: string, action: string, managerNote?: string) => fetchAPI("/api/notifications/action", { method: "POST", body: JSON.stringify({ notificationId, action, managerNote }) }),
  },
  promoCodes: {
    validate: (code: string, subtotal: number) =>
      fetchAPI("/api/promo-codes/validate", { method: "POST", body: JSON.stringify({ code, subtotal }) }),
  },
  payments: {
    hold: (token: string) => fetchAPI("/api/payments/transfer/hold", { method: "POST", body: JSON.stringify({ token }) }),
    claimTransfer: (token: string, note?: string) => fetchAPI("/api/payments/transfer/claim", { method: "POST", body: JSON.stringify({ token, note }) }),
  },
  otp: {
    send: (phone: string, channel: "auto" | "whatsapp" | "sms" = "auto") =>
      fetchAPI("/api/otp/send", { method: "POST", body: JSON.stringify({ phone, channel }) }),
    verify: (phone: string, otp: string) =>
      fetchAPI("/api/otp/verify", { method: "POST", body: JSON.stringify({ phone, otp }) }),
  },
  bookings: {
    create: (data: any) => fetchAPI("/api/bookings", { method: "POST", body: JSON.stringify(data) }),
    list: () => fetchAPI("/api/bookings"),
    my: () => fetchAPI("/api/bookings?mine=1"),
    verify: (token: string) => fetchAPI("/api/bookings/verify", { method: "POST", body: JSON.stringify({ token }) }),
    requestCancel: (id: string, reason: string) => fetchAPI("/api/bookings/cancel-request", { method: "POST", body: JSON.stringify({ id, reason }) }),
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
    leaves: () => fetchAPI("/api/staff/leave"),
    requestLeave: (data: any) => fetchAPI("/api/staff/leave", { method: "POST", body: JSON.stringify(data) }),
    cancelLeave: (id: string) => fetchAPI("/api/staff/leave", { method: "DELETE", body: JSON.stringify({ id }) }),
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
    deleteAccount: (id: string) => fetchAPI("/api/admin/accounts", { method: "DELETE", body: JSON.stringify({ id }) }),
    leaves: () => fetchAPI("/api/staff/leave?scope=all"),
    reviewLeave: (id: string, status: string, managerNote?: string) => fetchAPI("/api/staff/leave", { method: "PUT", body: JSON.stringify({ id, status, managerNote }) }),
    deleteLeave: (id: string) => fetchAPI("/api/staff/leave", { method: "DELETE", body: JSON.stringify({ id, hardDelete: true }) }),
    deleteLeaves: (ids: string[]) => fetchAPI("/api/staff/leave", { method: "DELETE", body: JSON.stringify({ ids, hardDelete: true }) }),
    deleteAllLeaves: () => fetchAPI("/api/staff/leave", { method: "DELETE", body: JSON.stringify({ deleteAll: true, hardDelete: true }) }),
    customers: (params?: { period?: string; date?: string }) => {
      const query = new URLSearchParams();
      if (params?.period) query.set("period", params.period);
      if (params?.date) query.set("date", params.date);
      return fetchAPI(`/api/admin/customers${query.toString() ? `?${query.toString()}` : ""}`);
    },
    updateCustomerExport: (exportEnabled: boolean) => fetchAPI("/api/admin/customers", { method: "PUT", body: JSON.stringify({ exportEnabled }) }),
    revenueReport: (params?: { period?: string; date?: string }) => {
      const query = new URLSearchParams();
      if (params?.period) query.set("period", params.period);
      if (params?.date) query.set("date", params.date);
      return fetchAPI(`/api/admin/reports/revenue${query.toString() ? `?${query.toString()}` : ""}`);
    },
    sendRevenueAction: (data: any) => fetchAPI("/api/admin/reports/revenue", { method: "POST", body: JSON.stringify(data) }),
    bankStatements: (params?: { period?: string; date?: string }) => {
      const query = new URLSearchParams();
      if (params?.period) query.set("period", params.period);
      if (params?.date) query.set("date", params.date);
      return fetchAPI(`/api/admin/bank-statements${query.toString() ? `?${query.toString()}` : ""}`);
    },
    importBankStatement: (csv: string) => fetchAPI("/api/admin/bank-statements", { method: "POST", body: JSON.stringify({ csv, source: "admin_upload" }) }),
    protection: () => fetchAPI("/api/admin/protection"),
    updateProtection: (data: any) => fetchAPI("/api/admin/protection", { method: "PUT", body: JSON.stringify(data) }),
    addBlocklist: (data: any) => fetchAPI("/api/admin/protection", { method: "POST", body: JSON.stringify(data) }),
    removeBlocklist: (id: string) => fetchAPI("/api/admin/protection", { method: "DELETE", body: JSON.stringify({ id }) }),
  },
};
