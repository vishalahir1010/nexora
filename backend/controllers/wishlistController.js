import asyncHandler from "express-async-handler";
import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";
import { success } from "../utils/apiResponse.js";
import ApiError from "../utils/ApiError.js";

const populateWishlist = (query) =>
  query.populate("products", "name slug images price discountPercent stock rating numReviews");

export const getWishlist = asyncHandler(async (req, res) => {
  let wishlist = await populateWishlist(Wishlist.findOne({ user: req.user._id }));
  if (!wishlist) wishlist = await Wishlist.create({ user: req.user._id, products: [] });
  success(res, 200, "Wishlist fetched", { wishlist });
});

export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");

  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) wishlist = new Wishlist({ user: req.user._id, products: [] });

  if (!wishlist.products.some((p) => p.toString() === productId)) {
    wishlist.products.push(productId);
    await wishlist.save();
  }
  const populated = await populateWishlist(Wishlist.findOne({ user: req.user._id }));
  success(res, 200, "Added to wishlist", { wishlist: populated });
});

export const removeFromWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id });
  if (wishlist) {
    wishlist.products = wishlist.products.filter((p) => p.toString() !== req.params.productId);
    await wishlist.save();
  }
  const populated = await populateWishlist(Wishlist.findOne({ user: req.user._id }));
  success(res, 200, "Removed from wishlist", { wishlist: populated });
});
