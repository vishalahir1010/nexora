import api from "./api.js";

export const couponService = {
  apply: (code, orderAmount) => api.post("/coupons/apply", { code, orderAmount }),
  getAll: () => api.get("/coupons"),
  create: (data) => api.post("/coupons", data),
  update: (id, data) => api.put(`/coupons/${id}`, data),
  remove: (id) => api.delete(`/coupons/${id}`),
};
