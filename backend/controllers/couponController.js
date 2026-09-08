import asyncHandler from "express-async-handler";
import Coupon from "../models/Coupon.js";
import Order from "../models/Order.js";
import { success } from "../utils/apiResponse.js";
import ApiError from "../utils/ApiError.js";

export const validateCoupon = async (code, userId, orderAmount) => {
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
  if (!coupon) throw new ApiError(404, "Invalid coupon code");
  if (coupon.expiresAt < new Date()) throw new ApiError(400, "This coupon has expired");
  if (orderAmount < coupon.minOrderAmount) {
    throw new ApiError(400, `Minimum order amount for this coupon is ₹${coupon.minOrderAmount}`);
  }
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    throw new ApiError(400, "This coupon has reached its usage limit");
  }
  if (coupon.userSpecific.length > 0 && !coupon.userSpecific.some((id) => id.toString() === userId.toString())) {
    throw new ApiError(403, "This coupon is not valid for your account");
  }
  const timesUsed = await Order.countDocuments({ user: userId, couponCode: coupon.code, paymentStatus: "paid" });
  if (timesUsed >= coupon.perUserLimit) {
    throw new ApiError(400, "You have already used this coupon the maximum number of times");
  }

  let discount = coupon.type === "percentage" ? (orderAmount * coupon.value) / 100 : coupon.value;
  if (coupon.maxDiscountAmount) discount = Math.min(discount, coupon.maxDiscountAmount);
  discount = Math.min(discount, orderAmount);

  return { coupon, discount: Math.round(discount) };
};

export const applyCoupon = asyncHandler(async (req, res) => {
  const { code, orderAmount } = req.body;
  const { discount } = await validateCoupon(code, req.user._id, orderAmount);
  success(res, 200, "Coupon applied successfully", { discount, code: code.toUpperCase() });
});

// Admin
export const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  success(res, 200, "Coupons fetched", { coupons });
});

export const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  success(res, 201, "Coupon created", { coupon });
});

export const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!coupon) throw new ApiError(404, "Coupon not found");
  success(res, 200, "Coupon updated", { coupon });
});

export const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) throw new ApiError(404, "Coupon not found");
  success(res, 200, "Coupon deleted");
});
