import express from "express";
import * as productController from "../controllers/productController.js";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", productController.getProducts);
router.get("/search-suggestions", productController.getSearchSuggestions);
router.get("/admin/low-stock", protect, admin, productController.getLowStockProducts);
router.get("/admin/:id", protect, admin, productController.getAdminProductById);
router.get("/:slug", productController.getProductBySlug);

router.post("/", protect, admin, productController.createProduct);
router.put("/:id", protect, admin, productController.updateProduct);
router.delete("/:id", protect, admin, productController.deleteProduct);

export default router;
