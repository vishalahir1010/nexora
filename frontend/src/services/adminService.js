import api from "./api.js";

export const adminService = {
  getDashboard: () => api.get("/admin/dashboard"),
  getAnalytics: (range) => api.get("/admin/analytics", { params: { range } }),
  getUsers: (params) => api.get("/users", { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUserRole: (id, role) => api.put(`/users/${id}/role`, { role }),
  toggleUserActive: (id) => api.put(`/users/${id}/toggle-active`),
};
