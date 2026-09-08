import asyncHandler from "express-async-handler";
import Notification from "../models/Notification.js";
import { success } from "../utils/apiResponse.js";

export const createNotification = async (userId, type, title, message, link = "") => {
  return Notification.create({ user: userId, type, title, message, link });
};

export const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
  const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });
  success(res, 200, "Notifications fetched", { notifications, unreadCount });
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isRead: true },
    { new: true }
  );
  success(res, 200, "Notification marked as read", { notification });
});

export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
  success(res, 200, "All notifications marked as read");
});
