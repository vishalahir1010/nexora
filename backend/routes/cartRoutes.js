import express from "express";
import * as cartController from "../controllers/cartController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

router.get("/", cartController.getCart);
router.post("/items", cartController.addToCart);
router.post("/merge", cartController.mergeCart);
router.put("/items/:itemId", cartController.updateCartItem);
router.delete("/items/:itemId", cartController.removeCartItem);
router.delete("/", cartController.clearCart);

export default router;
