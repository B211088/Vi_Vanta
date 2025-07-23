// routes/bookingRoutes.js
import express from "express";
import {
  getDoctorAvailableSlots,
  createAppointment,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
  getUserAppointments,
  getDoctorAppointments,
  confirmPayment,
  getPaymentHistory,
} from "../controllers/booking.controller.js";
import verifyToken from "../middlewares/verifyToken.js";
import { validateAppointment } from "../middlewares/booking.validation.js";

const router = express.Router();

// Lấy slot trống của bác sĩ theo ngày
router.get("/doctors/:doctorId/available-slots", getDoctorAvailableSlots);

// Đặt lịch khám mới
router.post(
  "/appointments",
  verifyToken,
  validateAppointment,
  createAppointment
);

// Lấy thông tin appointment
router.get("/appointments/:appointmentId", verifyToken, getAppointmentById);

// Cập nhật trạng thái appointment (dành cho doctor/admin)
router.patch(
  "/appointments/:appointmentId/status",
  verifyToken,
  authorizeRoles(["doctor", "admin"]),
  updateAppointmentStatus
);

// Hủy appointment
router.delete("/appointments/:appointmentId", verifyToken, cancelAppointment);

// Lấy danh sách appointment của user
router.get("/users/:userId/appointments", verifyToken, getUserAppointments);

// Lấy danh sách appointment của doctor
router.get(
  "/doctors/:doctorId/appointments",
  verifyToken,
  authorizeRoles(["doctor", "admin"]),
  getDoctorAppointments
);

// Xác nhận thanh toán
router.post(
  "/appointments/:appointmentId/payment",
  verifyToken,
  confirmPayment
);

// Lịch sử thanh toán
router.get("/users/:userId/payments", verifyToken, getPaymentHistory);

export default router;
