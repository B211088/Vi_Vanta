import express from "express";
import doctorController from "../controllers/doctor.controller.js";
import verifyToken from "../middlewares/verifyToken.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

const router = express.Router();
const DoctorController = new doctorController();

/* ──────────────────────────────────────────────────────────────
   🟢 PUBLIC ROUTES - không cần đăng nhập
───────────────────────────────────────────────────────────────── */
router.get("/", DoctorController.getDoctors);
router.get("/doctor/:id", DoctorController.getDoctorById);
router.get(
  "/doctor/:doctorId/range",
  DoctorController.getWorkingHoursByDateRange
);
router.get(
  "/doctor/:doctorId/available",
  DoctorController.getAvailableTimeSlots
);

/* ──────────────────────────────────────────────────────────────
   🔵 USER ROUTES - cần đăng nhập với vai trò 'user'
───────────────────────────────────────────────────────────────── */
router.post(
  "/register",
  verifyToken,
  authorizeRoles("user"),
  DoctorController.registerDoctor
);

/* ──────────────────────────────────────────────────────────────
   🟡 DOCTOR ROUTES - bác sĩ quản lý lịch cá nhân
───────────────────────────────────────────────────────────────── */
router.get(
  "/my-schedule",
  verifyToken,
  authorizeRoles("doctor", "admin"),
  DoctorController.getMyWorkingHours
);
router.post(
  "/my-schedule",
  verifyToken,
  authorizeRoles("doctor", "admin"),
  DoctorController.createMyWorkingHour
);
router.put(
  "/my-schedule/:id",
  verifyToken,
  authorizeRoles("doctor", "admin"),
  DoctorController.updateMyWorkingHour
);
router.delete(
  "/my-schedule/hard/:id",
  verifyToken,
  authorizeRoles("doctor", "admin"),
  DoctorController.deleteHardWorkingHour
);
router.get(
  "/user",
  verifyToken,
  authorizeRoles("doctor", "admin"),
  DoctorController.getDoctorByUserId
);

/* ──────────────────────────────────────────────────────────────
   🔴 ADMIN ROUTES - quản lý danh sách bác sĩ và lịch làm việc
───────────────────────────────────────────────────────────────── */
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
router.post(
  "/",
  verifyToken,
  authorizeRoles("admin"),
  DoctorController.createWorkingHour
);
router.post(
  "/doctor/:doctorId/default",
  verifyToken,
  authorizeRoles("admin"),
  DoctorController.createDefaultWorkingSchedule
);

/* ──────────────────────────────────────────────────────────────
   🔶 TIME SLOTS ROUTES - quản lý khung giờ làm việc
───────────────────────────────────────────────────────────────── */
router.post(
  "/:id/slots",
  verifyToken,
  authorizeRoles("admin", "doctor"),
  DoctorController.addTimeSlot
);
router.patch(
  "/:id/slots/:slotIndex",
  verifyToken,
  authorizeRoles("admin", "doctor"),
  DoctorController.updateTimeSlotAvailability
);
router.delete(
  "/:id/slots/:slotIndex",
  verifyToken,
  authorizeRoles("admin", "doctor"),
  DoctorController.removeTimeSlot
);

/* ──────────────────────────────────────────────────────────────
   🟠 COMMON ROUTES (Admin + Doctor)
───────────────────────────────────────────────────────────────── */
router.get(
  "/doctor/:doctorId/stats",
  verifyToken,
  authorizeRoles("admin", "doctor"),
  DoctorController.getWorkingHourStats
);
router.put(
  "/:id",
  verifyToken,
  authorizeRoles("admin", "doctor"),
  DoctorController.updateWorkingHour
);
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("admin", "doctor"),
  DoctorController.deleteWorkingHour
);
router.get(
  "/:id",
  verifyToken,
  authorizeRoles("admin", "doctor"),
  DoctorController.getWorkingHourById
);

export default router;
