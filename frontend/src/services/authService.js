import api from "./api";

// All auth-related API calls in one place
export const authService = {
  register: (data) => api.post("/auth/register", data).then((r) => r.data),
  login: (data) => api.post("/auth/login", data).then((r) => r.data),
  getMe: () => api.get("/auth/me").then((r) => r.data),
};
