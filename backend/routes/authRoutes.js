import express from "express";
import * as authController from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { registerValidator, loginValidator, resetPasswordValidator } from "../validators/authValidators.js";

const router = express.Router();

router.post("/register", registerValidator, validate, authController.register);
router.post("/login", loginValidator, validate, authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", resetPasswordValidator, validate, authController.resetPassword);
router.get("/me", protect, authController.getMe);
router.put("/profile", protect, authController.updateProfile);
router.put("/change-password", protect, authController.changePassword);

export default router;
