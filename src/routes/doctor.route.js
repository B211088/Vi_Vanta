import express from "express";
import doctorController from "../controllers/doctor.controller.js";
import verifyToken from "../middlewares/verifyToken.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
const router = express.Router();
const DoctorController = new doctorController();
router.post(
  "/register",
  verifyToken,
  authorizeRoles("user"),
  DoctorController.registerDoctor
);

// Admin duyệt/từ chối, xem danh sách chờ duyệt
router.get(
  "/pending",
  verifyToken,
  authorizeRoles("admin"),
  DoctorController.getPendingDoctors
);
router.patch(
  "/:id/approve",
  verifyToken,
  authorizeRoles("admin"),
  DoctorController.approveDoctor
);
router.patch(
  "/:id/reject",
  verifyToken,
  authorizeRoles("admin"),
  DoctorController.rejectDoctor
);

router.get("/user", verifyToken, DoctorController.getDoctorByUserId);

// Lấy danh sách bác sĩ (public hoặc user)
router.get("/", verifyToken, DoctorController.getDoctors);
router.get("/:id", verifyToken, DoctorController.getDoctorById);

export default router;
