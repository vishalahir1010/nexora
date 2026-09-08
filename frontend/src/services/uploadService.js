import api from "./api.js";

// Converts a File object to a base64 data URL, then posts it to the backend,
// which forwards it to Cloudinary. Returns { url, publicId }.
export const uploadService = {
  uploadImage: async (file) => {
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    const res = await api.post("/upload", { image: dataUrl });
    return res.data.data; // { url, publicId }
  },
  deleteImage: (publicId) => api.delete("/upload", { data: { publicId } }),
};
