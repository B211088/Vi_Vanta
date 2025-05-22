import express from "express";
import {
  createVaccine,
  getAllVaccines,
  getVaccineById,
  updateVaccine,
  deleteVaccine,
  getVaccinesByCategory,
} from "../controllers/vaccine.controller.js";
import verifyToken from "../middlewares/verifyToken.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// Tạo một vắc-xin mới
router.post(
  "/",
  verifyToken,
  authorizeRoles("admin"),
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  createVaccine
);

// Lấy danh sách tất cả vắc-xin
router.get("/", verifyToken, getAllVaccines);

// Lấy thông tin chi tiết một vắc-xin
router.get("/:vaccineId", verifyToken, authorizeRoles("admin"), getVaccineById);

// Cập nhật thông tin vắc-xin
router.put(
  "/:vaccineId",
  verifyToken,
  authorizeRoles("admin"),
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  updateVaccine
);

// Xóa một vắc-xin
router.delete(
  "/:vaccineId",
  verifyToken,
  authorizeRoles("admin"),
  deleteVaccine
);

// Lấy danh sách vắc-xin theo loại
router.get("/category/:categoryId", verifyToken, getVaccinesByCategory);

export default router;
