import api from "./api.js";

export const addressService = {
  getAddresses: () => api.get("/addresses"),
  addAddress: (data) => api.post("/addresses", data),
  updateAddress: (id, data) => api.put(`/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/addresses/${id}`),
  setDefault: (id) => api.put(`/addresses/${id}/default`),
};
