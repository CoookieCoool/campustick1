import axios from "axios";

// ✅ Use ENV if available, otherwise fallback (VERY IMPORTANT)
const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://campustick-backend.onrender.com/api";

console.log("API URL:", BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
});

// ✅ Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Auto logout on 401 (from original full version)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);



// ================= SERVICES ================= //

export const eventService = {
  getAll:     ()         => api.get("/events").then((r) => r.data),
  getMy:      ()         => api.get("/events/my").then((r) => r.data),
  getById:    (id)       => api.get(`/events/${id}`).then((r) => r.data),
  create:     (data)     => api.post("/events", data).then((r) => r.data),
  update:     (id, data) => api.put(`/events/${id}`, data).then((r) => r.data),
  remove:     (id)       => api.delete(`/events/${id}`).then((r) => r.data),
};

export const adminService = {
  getAllUsers:         ()   => api.get("/auth/users").then((r) => r.data),
  promoteToOrganizer:  (id) => api.patch(`/auth/promote/${id}`).then((r) => r.data),
  demoteToStudent:     (id) => api.patch(`/auth/demote/${id}`).then((r) => r.data),
};

export const ticketService = {
  book:         (eventId, quantity = 1) =>
    api.post(`/tickets/book/${eventId}`, { quantity }).then((r) => r.data),

  getMyTickets: () =>
    api.get("/tickets/my").then((r) => r.data),

  getById:      (id) =>
    api.get(`/tickets/${id}`).then((r) => r.data),

  scan:         (qrData) =>
    api.post("/tickets/scan", { qrData }).then((r) => r.data),
};

export const orderService = {
  create:  (eventId, quantity = 1) =>
    api.post(`/orders/create/${eventId}`, { quantity }).then((r) => r.data),

  confirm: (orderId) =>
    api.post(`/orders/confirm/${orderId}`).then((r) => r.data),

  getById: (orderId) =>
    api.get(`/orders/${orderId}`).then((r) => r.data),
};

export default api;