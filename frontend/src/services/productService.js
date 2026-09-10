import api from "./api.js";


export const productService = {
  getProducts: (params) => api.get("/products", { params }),
  getProductBySlug: (slug) => api.get(`/products/${slug}`),
  getSuggestions: (q) => api.get("/products/search-suggestions", { params: { q } }),
  createProduct: (data) => api.post("/products", data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  getAdminProduct: (id) => api.get(`/products/admin/${id}`),
  getLowStock: () => api.get("/products/admin/low-stock"),
  bulkImportProducts: (rows) => api.post("/products/bulk-import", { rows }),
};

export const categoryService = {
  getCategories: () => api.get("/categories"),
  getCategoryBySlug: (slug) => api.get(`/categories/${slug}`),
  getAllAdmin: () => api.get("/categories/admin/all"),
  createCategory: (data) => api.post("/categories", data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
};

export const brandService = {
  getBrands: () => api.get("/brands"),
  createBrand: (data) => api.post("/brands", data),
  updateBrand: (id, data) => api.put(`/brands/${id}`, data),
  deleteBrand: (id) => api.delete(`/brands/${id}`),
};
