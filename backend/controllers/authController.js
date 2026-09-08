import asyncHandler from "express-async-handler";
import crypto from "crypto";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { success } from "../utils/apiResponse.js";
import ApiError from "../utils/ApiError.js";
import { createNotification } from "./notificationController.js";

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  avatar: user.avatar,
  addresses: user.addresses,
});

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, "An account with this email already exists");

  const user = await User.create({ name, email, password, phone });
  const token = generateToken(user._id, user.role);

  success(res, 201, "Account created successfully", { user: sanitizeUser(user), token });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }
  if (!user.isActive) throw new ApiError(403, "This account has been deactivated");

  const token = generateToken(user._id, user.role);
  success(res, 200, "Logged in successfully", { user: sanitizeUser(user), token });
});

export const getMe = asyncHandler(async (req, res) => {
  success(res, 200, "Profile fetched", { user: sanitizeUser(req.user) });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatar } = req.body;
  const user = await User.findById(req.user._id);
  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (avatar) user.avatar = avatar;
  await user.save();
  success(res, 200, "Profile updated", { user: sanitizeUser(user) });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");
  if (!(await user.matchPassword(currentPassword))) {
    throw new ApiError(401, "Current password is incorrect");
  }
  user.password = newPassword;
  await user.save();
  await createNotification(user._id, "password_changed", "Password changed", "Your password was changed successfully.");
  success(res, 200, "Password changed successfully");
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  // Always respond generically to avoid leaking which emails exist
  if (!user) {
    return success(res, 200, "If that email exists, a reset link has been sent");
  }
  const resetToken = crypto.randomBytes(32).toString("hex");
  user.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save();

  // In production this would be emailed via a mail service (SendGrid/SES/etc).
  // Returned here only so the flow is testable without email infra configured.
  success(res, 200, "If that email exists, a reset link has been sent", {
    resetToken: process.env.NODE_ENV === "production" ? undefined : resetToken,
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  const hashed = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashed,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) throw new ApiError(400, "Reset token is invalid or has expired");

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  success(res, 200, "Password reset successfully");
});

export { sanitizeUser };
