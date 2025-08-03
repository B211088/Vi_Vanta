import express from "express";
import {
  deleteClinic,
  getClinics,
  getClinicById,
  getClinicByIdAndStatus,
  registerClinic,
  rejectClinic,
  updateClinicBasicInfo,
  verifyClinic,
} from "../controllers/clinic.controller.js";

import upload from "../middlewares/uploadMiddleware.js";

import verifyToken from "../middlewares/verifyToken.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

const router = express.Router();

// Đăng ký phòng khám mới (user đã đăng nhập)
router.post(
  "/register",
  verifyToken,
  upload.fields([
    { name: "licenses", maxCount: 10 },
    { name: "avatar", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  registerClinic
);

// API lấy danh sách phòng khám với filter và phân trang
router.get("/list", verifyToken, authorizeRoles("admin"), getClinics);

// API lấy chi tiết phòng khám theo status
router.get(
  "/:id/status",
  verifyToken,
  authorizeRoles("admin"),
  getClinicByIdAndStatus
);

// Xác nhận/phê duyệt phòng khám (admin only)
router.post("/verify/:id", verifyToken, authorizeRoles("admin"), verifyClinic);

// Từ chối phòng khám (admin only)
router.post("/reject/:id", verifyToken, authorizeRoles("admin"), rejectClinic);

// Lấy thông tin phòng khám (public)
router.get("/:id", getClinicById);

// Cập nhật thông tin cơ bản
router.put("/:id/basic-info", verifyToken, updateClinicBasicInfo);

// Xóa phòng khám
router.delete("/:id", verifyToken, deleteClinic);

export default router;
