import express from "express";
import * as categoryController from "../controllers/categoryController.js";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", categoryController.getCategories);
router.get("/admin/all", protect, admin, categoryController.getAllCategoriesAdmin);
router.get("/:slug", categoryController.getCategoryBySlug);
router.post("/", protect, admin, categoryController.createCategory);
router.put("/:id", protect, admin, categoryController.updateCategory);
router.delete("/:id", protect, admin, categoryController.deleteCategory);

export default router;
