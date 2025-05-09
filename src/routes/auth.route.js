import express from "express";
import upload from "../middlewares/uploadMiddleware.js";
import verifyToken from "../middlewares/verifyToken.js";
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
} from "../controllers/auth.controller.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

const router = express.Router();

// Đăng ký tài khoản
router.post("/register", register);

// Đăng nhập tài khoản
router.post("/login", login);

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

// Cập nhật thông tin tài khoản
router.post("/set/profile", verifyToken, setProfile);

// Cập nhật ảnh đại diện
router.post(
  "/upload_avatar",
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
router.post("/doctor/create", verifyToken, createDoctorProfile);
// Cập nhật thông tin bác sĩ
router.put(
  "/doctor/update/:id",
  verifyToken,
  authorizeRoles("doctor"),
  updateDoctorProfile
);

export default router;
