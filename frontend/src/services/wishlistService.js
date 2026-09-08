import api from "./api.js";

export const wishlistService = {
  getWishlist: () => api.get("/wishlist"),
  add: (productId) => api.post("/wishlist", { productId }),
  remove: (productId) => api.delete(`/wishlist/${productId}`),
};
