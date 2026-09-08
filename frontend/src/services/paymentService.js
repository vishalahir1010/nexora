import api from "./api.js";

export const paymentService = {
  createRazorpayOrder: (orderId) => api.post("/payments/create-order", { orderId }),
  verifyPayment: (data) => api.post("/payments/verify", data),
  markFailed: (orderId) => api.post(`/payments/failed/${orderId}`),
};
