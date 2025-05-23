import express from "express";
import upload from "../middlewares/uploadMiddleware.js";
import verifyToken from "../middlewares/verifyToken.js";
import { sanitizeInputMiddleware } from "../middlewares/sanitizeInput.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { validateEmailMiddleware } from "../middlewares/validateEmailMiddleware.js";
import {
  register,
  login,
  profile,
  addUserRole,
  setProfile,
  uploadAvatar,
  sendConfirmCodeByRegister,
  confirmCodeByRegister,
  getUserAddress,
  updateUserAddress,
  getDoctorProfile,
  createDoctorProfile,
  updateDoctorProfile,
  removeUserRole,
  sendConfirmCodeByForgotPassword,
  confirmCodeByForgotPassword,
  logout,
} from "../controllers/auth.controller.js";

const router = express.Router();

// Đăng ký tài khoản
router.post("/register", validateEmailMiddleware, register);

// Đăng nhập tài khoản
router.post("/login", validateEmailMiddleware, login);

router.post("/logout", verifyToken, logout);

// set role cho tài khoản
router.post("/set/role", verifyToken, authorizeRoles("admin"), addUserRole);

// xóa role của tài khoản
router.put(
  "/remove/role",
  verifyToken,
  authorizeRoles("admin"),
  removeUserRole
);

// Lấy thông tin tài khoản
router.get("/profile", verifyToken, profile);

router.post(
  "/forgot-password/send_code",
  validateEmailMiddleware,
  verifyToken,
  sendConfirmCodeByForgotPassword
);

// Xác nhận mã xác nhận và đổi mật khẩu
router.post(
  "/forgot-password/confirm_code",
  validateEmailMiddleware,
  verifyToken,
  confirmCodeByForgotPassword
);

// Cập nhật thông tin tài khoản
router.put("/update/profile", sanitizeInputMiddleware, verifyToken, setProfile);

// Cập nhật ảnh đại diện
router.put(
  "/upload_avatar",
  sanitizeInputMiddleware,
  verifyToken,
  upload.single("avatar"),
  uploadAvatar
);

// Cập nhật ảnh đại diện
router.get("/address", verifyToken, getUserAddress);
// Cập nhật ảnh đại diện
router.put("/update/address", verifyToken, updateUserAddress);

// Gửi mã xác nhận qua email
router.post("/register/send_code", sendConfirmCodeByRegister);
// Xác nhận mã xác nhận
router.post("/register/confirm_code", confirmCodeByRegister);

// Lấy thông tin bác sĩ
router.get("/doctor", verifyToken, authorizeRoles("doctor"), getDoctorProfile);
// Tạo thông tin bác sĩ
router.post(
  "/doctor/create",
  sanitizeInputMiddleware,
  verifyToken,
  createDoctorProfile
);
// Cập nhật thông tin bác sĩ
router.put(
  "/doctor/update/:id",
  sanitizeInputMiddleware,
  verifyToken,
  authorizeRoles("doctor"),
  updateDoctorProfile
);

export default router;
