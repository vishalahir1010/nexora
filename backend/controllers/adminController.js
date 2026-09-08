import asyncHandler from "express-async-handler";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { success } from "../utils/apiResponse.js";

export const getDashboardOverview = asyncHandler(async (req, res) => {
  const [totalOrders, totalCustomers, totalProducts, pendingOrders, lowStockProducts, revenueAgg, recentOrders] =
    await Promise.all([
      Order.countDocuments({}),
      User.countDocuments({ role: "customer" }),
      Product.countDocuments({}),
      Order.countDocuments({ orderStatus: "pending" }),
      Product.countDocuments({ $expr: { $lte: ["$stock", "$lowStockThreshold"] } }),
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),
      Order.find().populate("user", "name email").sort({ createdAt: -1 }).limit(8),
    ]);

  success(res, 200, "Dashboard overview fetched", {
    totalOrders,
    totalCustomers,
    totalProducts,
    pendingOrders,
    lowStockProducts,
    totalRevenue: revenueAgg[0]?.total || 0,
    recentOrders,
  });
});

// range: 7d | 30d | 12m
export const getSalesAnalytics = asyncHandler(async (req, res) => {
  const { range = "30d" } = req.query;

  let startDate = new Date();
  let groupFormat = "%Y-%m-%d";
  if (range === "7d") startDate.setDate(startDate.getDate() - 7);
  else if (range === "30d") startDate.setDate(startDate.getDate() - 30);
  else if (range === "12m") {
    startDate.setMonth(startDate.getMonth() - 12);
    groupFormat = "%Y-%m";
  }

  const salesByDate = await Order.aggregate([
    { $match: { paymentStatus: "paid", createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format: groupFormat, date: "$createdAt" } },
        revenue: { $sum: "$totalPrice" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const topProducts = await Order.aggregate([
    { $match: { paymentStatus: "paid", createdAt: { $gte: startDate } } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.product",
        name: { $first: "$items.name" },
        unitsSold: { $sum: "$items.quantity" },
        revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: 10 },
  ]);

  const ordersByStatus = await Order.aggregate([
    { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
  ]);

  success(res, 200, "Analytics fetched", { salesByDate, topProducts, ordersByStatus });
});
