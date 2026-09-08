import asyncHandler from "express-async-handler";
import cloudinary, { isCloudinaryConfigured } from "../config/cloudinary.js";
import { success } from "../utils/apiResponse.js";
import ApiError from "../utils/ApiError.js";

// Accepts a base64 data URL from the frontend (multipart is avoided here to keep
// the JSON API consistent) and uploads it to Cloudinary under a NEXORA products
// folder. Returns the secure_url + public_id, which the Product model stores as-is.
export const uploadImage = asyncHandler(async (req, res) => {
  if (!isCloudinaryConfigured()) {
    throw new ApiError(
      500,
      "Image upload isn't configured on the server yet — add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to backend/.env"
    );
  }

  const { image } = req.body; // data URL: "data:image/jpeg;base64,...."
  if (!image) throw new ApiError(400, "No image data provided");

  const result = await cloudinary.uploader.upload(image, {
    folder: "nexora/products",
    resource_type: "image",
    transformation: [{ width: 1600, height: 1600, crop: "limit" }, { quality: "auto" }],
  });

  success(res, 201, "Image uploaded successfully", {
    url: result.secure_url,
    publicId: result.public_id,
  });
});

export const deleteImage = asyncHandler(async (req, res) => {
  if (!isCloudinaryConfigured()) {
    throw new ApiError(500, "Image upload isn't configured on the server");
  }
  const { publicId } = req.body;
  if (!publicId) throw new ApiError(400, "publicId is required");
  await cloudinary.uploader.destroy(publicId);
  success(res, 200, "Image deleted");
});
