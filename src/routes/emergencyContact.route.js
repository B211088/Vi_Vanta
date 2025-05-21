import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import { sanitizeInputMiddleware } from "../middlewares/sanitizeInput.js";
import {
  createEmergencyContact,
  getEmergencyContact,
  removeEmergencyContact,
  updateEmergencyContact,
} from "../controllers/emergencyContact.controller.js";

const router = express.Router();

// Lấy danh sách tất cả thông tin liên hệ khẩn cấp
router.get("/getAll", verifyToken, getEmergencyContact);

// Tạo thông tin liên hệ khẩn cấp
router.post(
  "/create",
  sanitizeInputMiddleware,
  verifyToken,
  createEmergencyContact
);

// Cập nhật thông tin liên hệ khẩn cấp
router.put(
  "/update/:id",
  sanitizeInputMiddleware,
  verifyToken,
  updateEmergencyContact
);

// Xóa thông tin liên hệ khẩn cấp
router.delete("/delete/:id", verifyToken, removeEmergencyContact);

export default router;
