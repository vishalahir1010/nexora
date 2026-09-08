import asyncHandler from "express-async-handler";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import { success } from "../utils/apiResponse.js";
import ApiError from "../utils/ApiError.js";

// GET /api/products  - public, supports filters/sort/pagination/search
export const getProducts = asyncHandler(async (req, res) => {
  const {
    keyword,
    category,
    brand,
    minPrice,
    maxPrice,
    rating,
    size,
    color,
    inStock,
    sort,
    page = 1,
    limit = 12,
    featured,
    bestseller,
    newArrival,
    flashSale,
  } = req.query;

  const filter = { status: "active" };

  if (keyword) {
    filter.$text = { $search: keyword };
  }
  if (category) {
    const cat = await Category.findOne({ slug: category });
    if (cat) filter.category = cat._id;
    else filter.category = category; // allow raw id too
  }
  if (brand) {
    filter.brand = Array.isArray(brand) ? { $in: brand } : brand;
  }
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (rating) {
    filter.rating = { $gte: Number(rating) };
  }
  if (size) {
    filter.sizes = Array.isArray(size) ? { $in: size } : size;
  }
  if (color) {
    filter["colors.name"] = Array.isArray(color) ? { $in: color } : color;
  }
  if (inStock === "true") {
    filter.stock = { $gt: 0 };
  }
  if (featured === "true") filter.isFeatured = true;
  if (bestseller === "true") filter.isBestseller = true;
  if (newArrival === "true") filter.isNewArrival = true;
  if (flashSale === "true") filter.isFlashSale = true;

  let sortOption = { createdAt: -1 };
  switch (sort) {
    case "price_asc":
      sortOption = { price: 1 };
      break;
    case "price_desc":
      sortOption = { price: -1 };
      break;
    case "rating":
      sortOption = { rating: -1 };
      break;
    case "popularity":
      sortOption = { numReviews: -1 };
      break;
    case "newest":
      sortOption = { createdAt: -1 };
      break;
  }

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(60, Number(limit));
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("brand", "name slug")
      .populate("category", "name slug")
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum),
    Product.countDocuments(filter),
  ]);

  success(res, 200, "Products fetched successfully", { products }, {
    pagination: {
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      limit: limitNum,
    },
  });
});

export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, status: "active" })
    .populate("brand", "name slug")
    .populate("category", "name slug");

  if (!product) throw new ApiError(404, "Product not found");

  const related = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
    status: "active",
  })
    .limit(8)
    .select("name slug price discountPercent images rating numReviews");

  success(res, 200, "Product fetched successfully", { product, related });
});

export const getSearchSuggestions = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 2) {
    return success(res, 200, "No query provided", { products: [], categories: [], brands: [] });
  }
  const regex = new RegExp(q, "i");
  const [products, categories] = await Promise.all([
    Product.find({ name: regex, status: "active" }).limit(6).select("name slug images price"),
    Category.find({ name: regex, isActive: true }).limit(4).select("name slug"),
  ]);
  success(res, 200, "Suggestions fetched", { products, categories });
});

// ---- Admin ----

export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  success(res, 201, "Product created successfully", { product });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) throw new ApiError(404, "Product not found");
  success(res, 200, "Product updated successfully", { product });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");
  success(res, 200, "Product deleted successfully");
});

export const getAdminProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate("brand category");
  if (!product) throw new ApiError(404, "Product not found");
  success(res, 200, "Product fetched", { product });
});

export const getLowStockProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({
    $expr: { $lte: ["$stock", "$lowStockThreshold"] },
    status: "active",
  }).select("name sku stock lowStockThreshold images");
  success(res, 200, "Low stock products fetched", { products });
});
