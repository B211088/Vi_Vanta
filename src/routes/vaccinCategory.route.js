import express from "express";
import {
  createVaccinCategory,
  getAllVaccinCategories,
  getVaccinCategoryById,
  updateVaccinCategory,
  deleteVaccinCategory,
} from "../controllers/vaccinCategory.controller.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

// Tạo một danh mục vắc-xin mới
router.post("/", verifyToken, createVaccinCategory);

// Lấy danh sách tất cả danh mục vắc-xin
router.get("/", verifyToken, getAllVaccinCategories);

// Lấy thông tin chi tiết một danh mục vắc-xin
router.get("/:categoryId", verifyToken, getVaccinCategoryById);

// Cập nhật thông tin danh mục vắc-xin
router.put("/:categoryId", verifyToken, updateVaccinCategory);

// Xóa một danh mục vắc-xin
router.delete("/:categoryId", verifyToken, deleteVaccinCategory);

export default router;
