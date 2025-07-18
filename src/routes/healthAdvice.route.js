import express from "express";
import {
  createHealthAdvice,
  deleteHealthAdvice,
  getHealthAdviceById,
  getHealthAdvices,
  getLatestHealthAdvice,
} from "../controllers/healthAdvices.contoller.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/", verifyToken, createHealthAdvice); // Tạo mới
router.get("/", verifyToken, getHealthAdvices); // Lấy danh sách hoặc theo type
router.get("/latest", verifyToken, getLatestHealthAdvice); // Lấy cái mới nhất theo type
router.get("/:id", verifyToken, getHealthAdviceById); // Lấy theo ID
router.delete("/", verifyToken, deleteHealthAdvice); // Xóa theo userId + type

export default router;
