import express from "express";
import {
  createDiseaseCategory,
  getAllDiseaseCategories,
  getDiseaseCategoryById,
  updateDiseaseCategory,
  deleteDiseaseCategory,
} from "../controllers/diseaseCategory.controller.js";
import verifyToken from "../middlewares/verifyToken.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

const router = express.Router();

// Tạo một danh mục bệnh mới
router.post("/", verifyToken, authorizeRoles("admin"), createDiseaseCategory);

// Lấy danh sách tất cả danh mục bệnh
router.get("/", verifyToken, getAllDiseaseCategories);

// Lấy thông tin chi tiết một danh mục bệnh
router.get("/:categoryId", verifyToken, getDiseaseCategoryById);

// Cập nhật danh mục bệnh
router.put(
  "/:categoryId",
  verifyToken,
  authorizeRoles("admin"),
  updateDiseaseCategory
);

// Xóa một danh mục bệnh
router.delete(
  "/:categoryId",
  verifyToken,
  authorizeRoles("admin"),
  deleteDiseaseCategory
);

export default router;
