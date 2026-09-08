import express from "express";
import * as brandController from "../controllers/brandController.js";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", brandController.getBrands);
router.post("/", protect, admin, brandController.createBrand);
router.put("/:id", protect, admin, brandController.updateBrand);
router.delete("/:id", protect, admin, brandController.deleteBrand);

export default router;
