import express from "express";
import * as userController from "../controllers/userController.js";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();
router.use(protect, admin);

router.get("/", userController.getUsers);
router.get("/:id", userController.getUserById);
router.put("/:id/role", userController.updateUserRole);
router.put("/:id/toggle-active", userController.toggleUserActive);

export default router;
