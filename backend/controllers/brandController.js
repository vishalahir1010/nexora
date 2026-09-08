import asyncHandler from "express-async-handler";
import Brand from "../models/Brand.js";
import { success } from "../utils/apiResponse.js";
import ApiError from "../utils/ApiError.js";

export const getBrands = asyncHandler(async (req, res) => {
  const brands = await Brand.find({ isActive: true }).sort({ name: 1 });
  success(res, 200, "Brands fetched", { brands });
});

export const createBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.create(req.body);
  success(res, 201, "Brand created", { brand });
});

export const updateBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!brand) throw new ApiError(404, "Brand not found");
  success(res, 200, "Brand updated", { brand });
});

export const deleteBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findByIdAndDelete(req.params.id);
  if (!brand) throw new ApiError(404, "Brand not found");
  success(res, 200, "Brand deleted");
});
