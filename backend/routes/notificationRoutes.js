import express from "express";
import * as notificationController from "../controllers/notificationController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

router.get("/", notificationController.getMyNotifications);
router.put("/:id/read", notificationController.markNotificationRead);
router.put("/read-all", notificationController.markAllRead);

export default router;
