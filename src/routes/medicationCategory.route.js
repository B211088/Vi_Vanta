import express from "express";
import {
  createMedicationCategory,
  getAllMedicationCategories,
  getMedicationCategoryById,
  updateMedicationCategory,
  deleteMedicationCategory,
} from "../controllers/medication.controller.js";
import verifyToken from "../middlewares/verifyToken.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

const router = express.Router();

// Tạo một danh mục thuốc mới
router.post(
  "/",
  verifyToken,
  authorizeRoles("admin"),
  createMedicationCategory
);

// Lấy danh sách tất cả danh mục thuốc
router.get("/", verifyToken, getAllMedicationCategories);

// Lấy thông tin chi tiết một danh mục thuốc
router.get("/:categoryId", verifyToken, getMedicationCategoryById);

// Cập nhật danh mục thuốc
router.put(
  "/:categoryId",
  verifyToken,
  authorizeRoles("admin"),
  updateMedicationCategory
);

// Xóa một danh mục thuốc
router.delete(
  "/:categoryId",
  verifyToken,
  authorizeRoles("admin"),
  deleteMedicationCategory
);

export default router;
