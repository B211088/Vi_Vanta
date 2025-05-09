import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import {
  getAllHealth,
  getHealthById,
  createHealth,
  updateHealth,
  deleteHealth,
} from "../controllers/health.controller.js";

const router = express.Router();

// Lấy danh sách tất cả thông tin sức khỏe
router.get("/", verifyToken, authorizeRoles("admin"), getAllHealth);

// Lấy thông tin sức khỏe theo ID
router.get("/:userId", verifyToken, getHealthById);

// Tạo thông tin sức khỏe mới
router.post("/", verifyToken, createHealth);

// Cập nhật thông tin sức khỏe
router.put("/:healthId", verifyToken, updateHealth);

// Xóa thông tin sức khỏe
router.delete("/:healthId", verifyToken, authorizeRoles("admin"), deleteHealth);

export default router;
