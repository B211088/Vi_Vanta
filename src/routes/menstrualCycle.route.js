import express from "express";
import {
  getMenstrualCyclesByUser,
  getMenstrualCycleById,
  updateMenstrualCycle,
  deleteMenstrualCycle,
  createMenstrualCycle,
} from "../controllers/menstrualCycle.controller.js";
import verifyToken from "../middlewares/verifyToken.js";
import { sanitizeInputMiddleware } from "../middlewares/sanitizeInput.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
const router = express.Router();

// Tạo một chu kỳ kinh nguyệt mới
router.post("/", verifyToken, sanitizeInputMiddleware, createMenstrualCycle);

// Lấy danh sách chu kỳ kinh nguyệt của người dùng
router.get("/", verifyToken, getMenstrualCyclesByUser);

// Lấy thông tin chi tiết một chu kỳ kinh nguyệt
router.get("/:cycleId", verifyToken, getMenstrualCycleById);

// Cập nhật chu kỳ kinh nguyệt
router.put("/:cycleId", verifyToken, updateMenstrualCycle);

// Xóa chu kỳ kinh nguyệt
router.delete("/:cycleId", verifyToken, deleteMenstrualCycle);

export default router;
