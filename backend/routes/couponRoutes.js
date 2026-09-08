import express from "express";
import * as couponController from "../controllers/couponController.js";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

router.post("/apply", protect, couponController.applyCoupon);
router.get("/", protect, admin, couponController.getCoupons);
router.post("/", protect, admin, couponController.createCoupon);
router.put("/:id", protect, admin, couponController.updateCoupon);
router.delete("/:id", protect, admin, couponController.deleteCoupon);

export default router;
