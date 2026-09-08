import asyncHandler from "express-async-handler";
import Review from "../models/Review.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import { success } from "../utils/apiResponse.js";
import ApiError from "../utils/ApiError.js";

const recalculateProductRating = async (productId) => {
  const reviews = await Review.find({ product: productId });
  const numReviews = reviews.length;
  const rating = numReviews ? reviews.reduce((sum, r) => sum + r.rating, 0) / numReviews : 0;
  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => breakdown[r.rating]++);

  await Product.findByIdAndUpdate(productId, {
    rating: Math.round(rating * 10) / 10,
    numReviews,
    ratingBreakdown: breakdown,
  });
};

export const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId })
    .populate("user", "name avatar")
    .sort({ createdAt: -1 });
  success(res, 200, "Reviews fetched", { reviews });
});

// Only users who have a delivered order containing this product may review it
export const createReview = asyncHandler(async (req, res) => {
  const { productId, rating, title, comment } = req.body;

  const deliveredOrder = await Order.findOne({
    user: req.user._id,
    orderStatus: "delivered",
    "items.product": productId,
  });
  if (!deliveredOrder) {
    throw new ApiError(403, "You can only review products from your delivered orders");
  }

  const existing = await Review.findOne({ product: productId, user: req.user._id });
  if (existing) throw new ApiError(409, "You have already reviewed this product");

  const review = await Review.create({
    product: productId,
    user: req.user._id,
    order: deliveredOrder._id,
    rating,
    title,
    comment,
    verifiedPurchase: true,
  });

  await recalculateProductRating(productId);
  success(res, 201, "Review submitted successfully", { review });
});

export const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError(404, "Review not found");
  if (review.user.toString() !== req.user._id.toString()) throw new ApiError(403, "Not authorized");

  const { rating, title, comment } = req.body;
  if (rating) review.rating = rating;
  if (title !== undefined) review.title = title;
  if (comment) review.comment = comment;
  await review.save();

  await recalculateProductRating(review.product);
  success(res, 200, "Review updated", { review });
});

export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError(404, "Review not found");
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    throw new ApiError(403, "Not authorized");
  }
  const productId = review.product;
  await review.deleteOne();
  await recalculateProductRating(productId);
  success(res, 200, "Review deleted");
});
