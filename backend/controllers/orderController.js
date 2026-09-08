import asyncHandler from "express-async-handler";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";
import { validateCoupon } from "./couponController.js";
import { success } from "../utils/apiResponse.js";
import ApiError from "../utils/ApiError.js";
import { createNotification } from "./notificationController.js";

const TAX_RATE = 0.18; // 18% GST-style flat rate for demonstration
const FREE_SHIPPING_THRESHOLD = 999;
const STANDARD_SHIPPING = 79;
const EXPRESS_SHIPPING = 199;

const generateOrderNumber = () => {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `NEX-${ts}-${rand}`;
};

const computeItemStock = (product, item) => {
  if (product.variants && product.variants.length > 0) {
    const variant = item.variantId
      ? product.variants.id(item.variantId)
      : product.variants.find((v) => v.size === item.size && v.color === item.color);
    return { variant, stock: variant ? variant.stock : 0 };
  }
  return { variant: null, stock: product.stock };
};

// Recalculates totals server-side from the current cart — never trusts client-sent totals.
const buildOrderPricing = async (userId, couponCode, deliveryMethod) => {
  const cart = await Cart.findOne({ user: userId }).populate("items.product");
  if (!cart || cart.items.length === 0) throw new ApiError(400, "Your cart is empty");

  let itemsPrice = 0;
  const orderItems = [];

  for (const item of cart.items) {
    const product = item.product;
    if (!product || product.status !== "active") {
      throw new ApiError(400, `A product in your cart is no longer available`);
    }
    const { variant, stock } = computeItemStock(product, item);
    if (stock < item.quantity) {
      throw new ApiError(400, `${product.name} does not have enough stock (only ${stock} left)`);
    }
    const unitPrice = variant?.priceOverride ?? Math.round(product.price * (1 - product.discountPercent / 100));
    itemsPrice += unitPrice * item.quantity;

    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images?.[0]?.url || "",
      variantId: item.variantId,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      price: unitPrice,
    });
  }

  let discountAmount = 0;
  let appliedCoupon = null;
  if (couponCode) {
    const result = await validateCoupon(couponCode, userId, itemsPrice);
    discountAmount = result.discount;
    appliedCoupon = result.coupon;
  }

  const shippingPrice =
    itemsPrice - discountAmount >= FREE_SHIPPING_THRESHOLD
      ? 0
      : deliveryMethod === "express"
      ? EXPRESS_SHIPPING
      : STANDARD_SHIPPING;

  const taxableAmount = Math.max(itemsPrice - discountAmount, 0);
  const taxPrice = Math.round(taxableAmount * TAX_RATE);
  const totalPrice = taxableAmount + taxPrice + shippingPrice;

  return { cart, orderItems, itemsPrice, discountAmount, appliedCoupon, shippingPrice, taxPrice, totalPrice };
};

// POST /api/orders/pricing-preview  — used by checkout summary before payment
export const getOrderPricingPreview = asyncHandler(async (req, res) => {
  const { couponCode, deliveryMethod = "standard" } = req.body;
  const { itemsPrice, discountAmount, shippingPrice, taxPrice, totalPrice } = await buildOrderPricing(
    req.user._id,
    couponCode,
    deliveryMethod
  );
  success(res, 200, "Pricing calculated", {
    itemsPrice,
    discountAmount,
    shippingPrice,
    taxPrice,
    totalPrice,
  });
});

// POST /api/orders  — creates order in "pending" state (payment verified separately)
export const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, billingAddress, paymentMethod, couponCode, deliveryMethod = "standard" } = req.body;

  if (!shippingAddress) throw new ApiError(400, "Shipping address is required");

  const { cart, orderItems, itemsPrice, discountAmount, appliedCoupon, shippingPrice, taxPrice, totalPrice } =
    await buildOrderPricing(req.user._id, couponCode, deliveryMethod);

  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    billingAddress: billingAddress || shippingAddress,
    paymentMethod: paymentMethod || "razorpay",
    paymentStatus: "pending",
    orderStatus: "pending",
    statusHistory: [{ status: "pending", note: "Order created, awaiting payment" }],
    itemsPrice,
    taxPrice,
    shippingPrice,
    discountAmount,
    couponCode: appliedCoupon?.code,
    totalPrice,
    deliveryMethod,
    estimatedDelivery: new Date(Date.now() + (deliveryMethod === "express" ? 2 : 6) * 24 * 60 * 60 * 1000),
  });

  // For Cash on Delivery, confirm immediately since there's no online payment step
  if (paymentMethod === "cod") {
    order.orderStatus = "confirmed";
    order.statusHistory.push({ status: "confirmed", note: "Cash on Delivery order confirmed" });
    await order.save();
    await finalizeOrder(order, cart);
  }

  success(res, 201, "Order created", { order });
});

// Called once payment is verified (or immediately for COD): deduct stock, clear cart, notify
export const finalizeOrder = async (order, cart) => {
  for (const item of order.items) {
    const product = await Product.findById(item.product);
    if (!product) continue;
    if (product.variants && product.variants.length > 0) {
      const variant = item.variantId
        ? product.variants.id(item.variantId)
        : product.variants.find((v) => v.size === item.size && v.color === item.color);
      if (variant) variant.stock = Math.max(0, variant.stock - item.quantity);
    } else {
      product.stock = Math.max(0, product.stock - item.quantity);
    }
    await product.save();
  }

  if (order.couponCode) {
    await Coupon.findOneAndUpdate({ code: order.couponCode }, { $inc: { usedCount: 1 } });
  }

  cart.items = [];
  cart.coupon = { code: undefined, discountAmount: 0 };
  await cart.save();

  await createNotification(
    order.user,
    "order_placed",
    "Order placed successfully",
    `Your order ${order.orderNumber} has been placed.`,
    `/orders/${order._id}`
  );
};

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  success(res, 200, "Orders fetched", { orders });
});

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    throw new ApiError(403, "You are not authorized to view this order");
  }
  success(res, 200, "Order fetched", { order });
});

export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");
  if (order.user.toString() !== req.user._id.toString()) throw new ApiError(403, "Not authorized");
  if (["shipped", "out_for_delivery", "delivered"].includes(order.orderStatus)) {
    throw new ApiError(400, "This order can no longer be cancelled");
  }

  order.orderStatus = "cancelled";
  order.cancelledAt = new Date();
  order.cancelReason = req.body.reason || "Cancelled by customer";
  order.statusHistory.push({ status: "cancelled", note: order.cancelReason });
  await order.save();

  // restock items
  for (const item of order.items) {
    const product = await Product.findById(item.product);
    if (!product) continue;
    if (product.variants?.length > 0 && item.variantId) {
      const variant = product.variants.id(item.variantId);
      if (variant) variant.stock += item.quantity;
    } else {
      product.stock += item.quantity;
    }
    await product.save();
  }

  await createNotification(order.user, "order_cancelled", "Order cancelled", `Order ${order.orderNumber} was cancelled.`);
  success(res, 200, "Order cancelled", { order });
});

// ---- Admin ----

export const getAllOrdersAdmin = asyncHandler(async (req, res) => {
  const { status, search, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.orderStatus = status;
  if (search) filter.orderNumber = new RegExp(search, "i");

  const pageNum = Number(page);
  const limitNum = Number(limit);

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Order.countDocuments(filter),
  ]);

  success(res, 200, "Orders fetched", { orders }, {
    pagination: { total, page: pageNum, pages: Math.ceil(total / limitNum) || 1 },
  });
});

const VALID_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "returned",
];

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  if (!VALID_STATUSES.includes(status)) throw new ApiError(400, "Invalid order status");

  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");

  order.orderStatus = status;
  order.statusHistory.push({ status, note });
  if (status === "delivered") order.deliveredAt = new Date();

  await order.save();

  const notifMap = {
    shipped: ["order_shipped", "Order shipped", `Your order ${order.orderNumber} has shipped.`],
    delivered: ["order_delivered", "Order delivered", `Your order ${order.orderNumber} has been delivered.`],
    cancelled: ["order_cancelled", "Order cancelled", `Your order ${order.orderNumber} was cancelled.`],
  };
  if (notifMap[status]) {
    const [type, title, message] = notifMap[status];
    await createNotification(order.user, type, title, message, `/orders/${order._id}`);
  }

  success(res, 200, "Order status updated", { order });
});
