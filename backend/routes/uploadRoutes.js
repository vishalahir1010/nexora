import express from "express";
import * as uploadController from "../controllers/uploadController.js";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();
router.use(protect, admin);

router.post("/", uploadController.uploadImage);
router.delete("/", uploadController.deleteImage);

export default router;
