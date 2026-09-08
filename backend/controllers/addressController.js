import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import { success } from "../utils/apiResponse.js";
import ApiError from "../utils/ApiError.js";

export const getAddresses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  success(res, 200, "Addresses fetched", { addresses: user.addresses });
});

export const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (req.body.isDefault) {
    user.addresses.forEach((a) => (a.isDefault = false));
  }
  if (user.addresses.length === 0) req.body.isDefault = true;
  user.addresses.push(req.body);
  await user.save();
  success(res, 201, "Address added", { addresses: user.addresses });
});

export const updateAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const address = user.addresses.id(req.params.addressId);
  if (!address) throw new ApiError(404, "Address not found");

  if (req.body.isDefault) {
    user.addresses.forEach((a) => (a.isDefault = false));
  }
  Object.assign(address, req.body);
  await user.save();
  success(res, 200, "Address updated", { addresses: user.addresses });
});

export const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses = user.addresses.filter((a) => a._id.toString() !== req.params.addressId);
  await user.save();
  success(res, 200, "Address deleted", { addresses: user.addresses });
});

export const setDefaultAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses.forEach((a) => {
    a.isDefault = a._id.toString() === req.params.addressId;
  });
  await user.save();
  success(res, 200, "Default address updated", { addresses: user.addresses });
});
