import api from "./api.js";

export const reviewService = {
  getProductReviews: (productId) => api.get(`/reviews/product/${productId}`),
  createReview: (data) => api.post("/reviews", data),
  updateReview: (id, data) => api.put(`/reviews/${id}`, data),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
};
