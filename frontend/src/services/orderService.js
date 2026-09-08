import api from "./api.js";

export const orderService = {
  getPricingPreview: (data) => api.post("/orders/pricing-preview", data),
  createOrder: (data) => api.post("/orders", data),
  getMyOrders: () => api.get("/orders"),
  getOrderById: (id) => api.get(`/orders/${id}`),
  cancelOrder: (id, reason) => api.put(`/orders/${id}/cancel`, { reason }),
  getAllOrdersAdmin: (params) => api.get("/orders/admin/all", { params }),
  updateOrderStatus: (id, status, note) => api.put(`/orders/admin/${id}/status`, { status, note }),
};
