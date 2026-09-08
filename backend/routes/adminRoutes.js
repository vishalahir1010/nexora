import express from "express";
import * as adminController from "../controllers/adminController.js";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();
router.use(protect, admin);

router.get("/dashboard", adminController.getDashboardOverview);
router.get("/analytics", adminController.getSalesAnalytics);

export default router;
