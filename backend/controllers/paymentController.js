import asyncHandler from "express-async-handler";
import crypto from "crypto";
import Razorpay from "razorpay";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import { finalizeOrder } from "./orderController.js";
import { success } from "../utils/apiResponse.js";
import ApiError from "../utils/ApiError.js";
import { createNotification } from "./notificationController.js";

const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new ApiError(500, "Payment gateway is not configured on the server");
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// POST /api/payments/create-order  body: { orderId }
// Creates a Razorpay order for the given internal order. Amount is taken from
// OUR database record (never trusted from the client) to prevent tampering.
export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, "Order not found");
  if (order.user.toString() !== req.user._id.toString()) throw new ApiError(403, "Not authorized");
  if (order.paymentStatus === "paid") throw new ApiError(400, "This order has already been paid for");

  const razorpay = getRazorpayInstance();
  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(order.totalPrice * 100), // paise
    currency: "INR",
    receipt: order.orderNumber,
  });

  order.paymentInfo.razorpayOrderId = razorpayOrder.id;
  await order.save();

  success(res, 200, "Razorpay order created", {
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
  });
});

// POST /api/payments/verify
// body: { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature }
// CRITICAL: payment success is only ever set here, after verifying the HMAC
// signature server-side. The frontend's claim of "success" is never trusted directly.
export const verifyPayment = asyncHandler(async (req, res) => {
  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, "Order not found");
  if (order.user.toString() !== req.user._id.toString()) throw new ApiError(403, "Not authorized");

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    order.paymentStatus = "failed";
    await order.save();
    throw new ApiError(400, "Payment verification failed. Signature mismatch.");
  }

  order.paymentStatus = "paid";
  order.orderStatus = "confirmed";
  order.paymentInfo.razorpayOrderId = razorpay_order_id;
  order.paymentInfo.razorpayPaymentId = razorpay_payment_id;
  order.paymentInfo.razorpaySignature = razorpay_signature;
  order.statusHistory.push({ status: "confirmed", note: "Payment verified successfully" });
  await order.save();

  const cart = await Cart.findOne({ user: order.user });
  if (cart) await finalizeOrder(order, cart);

  await createNotification(
    order.user,
    "payment_successful",
    "Payment successful",
    `Payment for order ${order.orderNumber} was successful.`,
    `/orders/${order._id}`
  );

  success(res, 200, "Payment verified successfully", { order });
});

// POST /api/payments/failed  body: { orderId }
export const markPaymentFailed = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) throw new ApiError(404, "Order not found");
  if (order.user.toString() !== req.user._id.toString()) throw new ApiError(403, "Not authorized");

  order.paymentStatus = "failed";
  order.statusHistory.push({ status: order.orderStatus, note: "Payment attempt failed" });
  await order.save();

  success(res, 200, "Payment marked as failed", { order });
});
