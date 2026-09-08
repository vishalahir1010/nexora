import express from "express";
import * as addressController from "../controllers/addressController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

router.get("/", addressController.getAddresses);
router.post("/", addressController.addAddress);
router.put("/:addressId", addressController.updateAddress);
router.delete("/:addressId", addressController.deleteAddress);
router.put("/:addressId/default", addressController.setDefaultAddress);

export default router;
