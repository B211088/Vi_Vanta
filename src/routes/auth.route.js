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

router.post("/register", register);

router.post("/login", login);

router.post("/set/role", verifyToken, authorizeRoles("admin"), addUserRole);
router.put(
  "/remove/role",
  verifyToken,
  authorizeRoles("admin"),
  removeUserRole
);

router.get("/profile", verifyToken, profile);

router.post("/set/profile", verifyToken, setProfile);

router.post(
  "/upload_avatar",
  verifyToken,
  upload.single("avatar"),
  uploadAvatar
);

router.get("/address", verifyToken, getUserAddress);
router.put("/update/address", verifyToken, updateUserAddress);

router.post("/register/send_code", sendConfirmCodeByRegister);
router.post("/register/confirm_code", confirmCodeByRegister);

router.get("/doctor", verifyToken, authorizeRoles("doctor"), getDoctorProfile);
router.post("/doctor/create", verifyToken, createDoctorProfile);
router.put(
  "/doctor/update/:id",
  verifyToken,
  authorizeRoles("doctor"),
  updateDoctorProfile
);

export default router;
