import asyncHandler from "express-async-handler";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import { success } from "../utils/apiResponse.js";
import ApiError from "../utils/ApiError.js";

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1, name: 1 });
  success(res, 200, "Categories fetched", { categories });
});

export const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug, isActive: true });
  if (!category) throw new ApiError(404, "Category not found");
  success(res, 200, "Category fetched", { category });
});

// Admin
export const getAllCategoriesAdmin = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ displayOrder: 1, name: 1 });
  success(res, 200, "Categories fetched", { categories });
});

export const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  success(res, 201, "Category created", { category });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!category) throw new ApiError(404, "Category not found");
  success(res, 200, "Category updated", { category });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const inUse = await Product.exists({ category: req.params.id });
  if (inUse) throw new ApiError(409, "Cannot delete a category that has products. Deactivate it instead.");
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) throw new ApiError(404, "Category not found");
  success(res, 200, "Category deleted");
});
