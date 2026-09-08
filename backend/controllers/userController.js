import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Order from "../models/Order.js";
import { success } from "../utils/apiResponse.js";
import ApiError from "../utils/ApiError.js";

// Admin
export const getUsers = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (search) {
    filter.$or = [{ name: new RegExp(search, "i") }, { email: new RegExp(search, "i") }];
  }
  const pageNum = Number(page);
  const limitNum = Number(limit);
  const [users, total] = await Promise.all([
    User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    User.countDocuments(filter),
  ]);
  success(res, 200, "Users fetched", { users }, { pagination: { total, page: pageNum, pages: Math.ceil(total / limitNum) || 1 } });
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) throw new ApiError(404, "User not found");
  const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 }).limit(20);
  success(res, 200, "User fetched", { user, orders });
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!["customer", "admin"].includes(role)) throw new ApiError(400, "Invalid role");
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-password");
  if (!user) throw new ApiError(404, "User not found");
  success(res, 200, "User role updated", { user });
});

export const toggleUserActive = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");
  user.isActive = !user.isActive;
  await user.save();
  success(res, 200, `User ${user.isActive ? "activated" : "deactivated"}`, { user });
});
