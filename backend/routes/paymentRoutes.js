import express from "express";
import * as paymentController from "../controllers/paymentController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

router.post("/create-order", paymentController.createRazorpayOrder);
router.post("/verify", paymentController.verifyPayment);
router.post("/failed/:orderId", paymentController.markPaymentFailed);

export default router;
