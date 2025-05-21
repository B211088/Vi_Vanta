import express from "express";
import {
  createMedication,
  getAllMedications,
  getMedicationById,
  updateMedication,
  deleteMedication,
  getMedicationsByCategory,
} from "../controllers/medication.controller.js";
import upload from "../middlewares/uploadMiddleware.js";
import verifyToken from "../middlewares/verifyToken.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

const router = express.Router();

// Tạo một thuốc mới
router.post(
  "/",
  verifyToken,
  authorizeRoles("admin"),
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  createMedication
);

// Lấy danh sách tất cả thuốc
router.get("/", verifyToken, getAllMedications);

// Lấy danh sách thuốc theo danh mục với phân trang
router.get(
  "/by-category/:medicationCategoryId",
  verifyToken,
  getMedicationsByCategory
);

// Lấy thông tin chi tiết một thuốc
router.get("/:medicationId", verifyToken, getMedicationById);

// Cập nhật thông tin thuốc
router.put(
  "/:medicationId",
  verifyToken,
  authorizeRoles("admin"),
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  updateMedication
);

// Xóa một thuốc
router.delete(
  "/:medicationId",
  verifyToken,
  authorizeRoles("admin"),
  deleteMedication
);

export default router;
