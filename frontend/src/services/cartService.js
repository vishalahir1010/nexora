import api from "./api.js";

export const cartService = {
  getCart: () => api.get("/cart"),
  addItem: (data) => api.post("/cart/items", data),
  updateItem: (itemId, quantity) => api.put(`/cart/items/${itemId}`, { quantity }),
  removeItem: (itemId) => api.delete(`/cart/items/${itemId}`),
  clearCart: () => api.delete("/cart"),
  mergeCart: (items) => api.post("/cart/merge", { items }),
};
