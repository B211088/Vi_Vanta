import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { sanitizeInputMiddleware } from "../middlewares/sanitizeInput.js";
import {
  getAllHealth,
  createHealth,
  deleteHealth,
  getUserHealthInfoById,
  updateUserHealth,
} from "../controllers/health.controller.js";

const router = express.Router();
// Lấy thông tin sức khỏe theo ID
router.get("/me", verifyToken, getUserHealthInfoById);
// Lấy danh sách tất cả thông tin sức khỏe
router.get("/", verifyToken, authorizeRoles("admin"), getAllHealth);

// Tạo thông tin sức khỏe mới
router.post("/", sanitizeInputMiddleware, verifyToken, createHealth);

// Cập nhật thông tin sức khỏe
router.put("/me", sanitizeInputMiddleware, verifyToken, updateUserHealth);

// Xóa thông tin sức khỏe
router.delete("/:healthId", verifyToken, authorizeRoles("admin"), deleteHealth);

export default router;
