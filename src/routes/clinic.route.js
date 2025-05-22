import express from "express";
import {
  deleteClinic,
  getClinics,
  getClinicById,
  getClinicByIdAndStatus,
  inviteStaffById,
  registerClinic,
  rejectClinic,
  updateClinicBasicInfo,
  verifyClinic,
  addStaff,
  updateRole,
  removeStaff,
  getStaffList,
  toggleStatus,
} from "../controllers/clinic.controller.js";

import upload from "../middlewares/uploadMiddleware.js";

import verifyToken from "../middlewares/verifyToken.js";
import {
  authorizeRoles,
  authorizeClinicStaff,
} from "../middlewares/authorizeRoles.js";

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
router.put(
  "/:id/basic-info",
  verifyToken,
  authorizeClinicStaff(["owner", "admin"]),
  updateClinicBasicInfo
);

// Xóa phòng khám
router.delete(
  "/:id",
  verifyToken,
  authorizeClinicStaff(["owner", "admin"]),
  deleteClinic
);

// Mời nhân viên
router.post(
  "/:clinicId/invite-staff",
  verifyToken,
  authorizeClinicStaff(["owner", "admin"]),
  inviteStaffById
);

// Staff Management Routes
router.post(
  "/:clinicId/staff",
  verifyToken,
  authorizeClinicStaff(["owner", "admin"]),
  addStaff
);

router.put(
  "/:clinicId/staff/role",
  verifyToken,
  authorizeClinicStaff(["owner", "admin"]),
  updateRole
);

router.delete(
  "/:clinicId/staff",
  verifyToken,
  authorizeClinicStaff(["owner", "admin"]),
  removeStaff
);

router.get(
  "/:clinicId/staff",
  verifyToken,
  authorizeClinicStaff(["owner", "admin", "manager"]),
  getStaffList
);

router.patch(
  "/:clinicId/staff/status",
  verifyToken,
  authorizeClinicStaff(["owner", "admin"]),
  toggleStatus
);

export default router;
