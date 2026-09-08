import asyncHandler from "express-async-handler";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { success } from "../utils/apiResponse.js";
import ApiError from "../utils/ApiError.js";

const getStockForVariant = (product, variantId, size, color) => {
  if (product.variants && product.variants.length > 0) {
    const variant = variantId
      ? product.variants.id(variantId)
      : product.variants.find((v) => v.size === size && v.color === color);
    if (!variant) throw new ApiError(400, "Selected variant is unavailable");
    return { stock: variant.stock, variant };
  }
  return { stock: product.stock, variant: null };
};

const populateCart = (cartQuery) =>
  cartQuery.populate({
    path: "items.product",
    select: "name slug images price discountPercent stock variants status",
  });

export const getCart = asyncHandler(async (req, res) => {
  let cart = await populateCart(Cart.findOne({ user: req.user._id }));
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
  success(res, 200, "Cart fetched", { cart });
});

// body: { productId, variantId?, size?, color?, quantity }
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, variantId, size, color, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product || product.status !== "active") throw new ApiError(404, "Product not found");

  const { stock } = getStockForVariant(product, variantId, size, color);
  if (stock < quantity) throw new ApiError(400, "Not enough stock available for this selection");

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = new Cart({ user: req.user._id, items: [] });

  const price = Math.round(product.price * (1 - product.discountPercent / 100));
  const existingItem = cart.items.find(
    (item) =>
      item.product.toString() === productId &&
      String(item.variantId || "") === String(variantId || "") &&
      item.size === size &&
      item.color === color
  );

  if (existingItem) {
    if (existingItem.quantity + Number(quantity) > stock) {
      throw new ApiError(400, "Not enough stock available for this selection");
    }
    existingItem.quantity += Number(quantity);
  } else {
    cart.items.push({ product: productId, variantId, size, color, quantity, priceAtAdd: price });
  }

  await cart.save();
  cart = await populateCart(Cart.findOne({ user: req.user._id }));
  success(res, 200, "Item added to cart", { cart });
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw new ApiError(404, "Cart not found");

  const item = cart.items.id(itemId);
  if (!item) throw new ApiError(404, "Cart item not found");

  const product = await Product.findById(item.product);
  const { stock } = getStockForVariant(product, item.variantId, item.size, item.color);
  if (quantity > stock) throw new ApiError(400, "Not enough stock available");
  if (quantity < 1) throw new ApiError(400, "Quantity must be at least 1");

  item.quantity = quantity;
  await cart.save();

  const populated = await populateCart(Cart.findOne({ user: req.user._id }));
  success(res, 200, "Cart updated", { cart: populated });
});

export const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw new ApiError(404, "Cart not found");
  cart.items = cart.items.filter((item) => item._id.toString() !== req.params.itemId);
  await cart.save();
  const populated = await populateCart(Cart.findOne({ user: req.user._id }));
  success(res, 200, "Item removed from cart", { cart: populated });
});

export const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    cart.items = [];
    cart.coupon = { code: undefined, discountAmount: 0 };
    await cart.save();
  }
  success(res, 200, "Cart cleared", { cart });
});

// Merge a guest (localStorage) cart into the DB cart on login
// body: { items: [{ productId, variantId, size, color, quantity }] }
export const mergeCart = asyncHandler(async (req, res) => {
  const { items = [] } = req.body;
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = new Cart({ user: req.user._id, items: [] });

  for (const guestItem of items) {
    const product = await Product.findById(guestItem.productId);
    if (!product || product.status !== "active") continue;

    let stock;
    try {
      ({ stock } = getStockForVariant(product, guestItem.variantId, guestItem.size, guestItem.color));
    } catch {
      continue;
    }

    const price = Math.round(product.price * (1 - product.discountPercent / 100));
    const existing = cart.items.find(
      (item) =>
        item.product.toString() === guestItem.productId &&
        String(item.variantId || "") === String(guestItem.variantId || "") &&
        item.size === guestItem.size &&
        item.color === guestItem.color
    );
    if (existing) {
      existing.quantity = Math.min(existing.quantity + guestItem.quantity, stock);
    } else {
      cart.items.push({
        product: guestItem.productId,
        variantId: guestItem.variantId,
        size: guestItem.size,
        color: guestItem.color,
        quantity: Math.min(guestItem.quantity, stock),
        priceAtAdd: price,
      });
    }
  }

  await cart.save();
  const populated = await populateCart(Cart.findOne({ user: req.user._id }));
  success(res, 200, "Cart merged", { cart: populated });
});
