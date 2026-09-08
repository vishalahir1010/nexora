import express from "express";
import * as orderController from "../controllers/orderController.js";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

router.get("/admin/all", protect, admin, orderController.getAllOrdersAdmin);
router.put("/admin/:id/status", protect, admin, orderController.updateOrderStatus);

router.use(protect);
router.post("/pricing-preview", orderController.getOrderPricingPreview);
router.post("/", orderController.createOrder);
router.get("/", orderController.getMyOrders);
router.get("/:id", orderController.getOrderById);
router.put("/:id/cancel", orderController.cancelOrder);

export default router;
