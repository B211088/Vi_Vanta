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
  getPaymentHistory,
  vnpayReturnHandler,
  processPayment,
  getDoctorSlots,
  updateAppointmentPaymentStatus,
} from "../controllers/booking.controller.js";
import verifyToken from "../middlewares/verifyToken.js";

import { authorizeRoles } from "../middlewares/authorizeRoles.js";

const router = express.Router();

// Public routes
// Lấy slot trống của bác sĩ theo ngày
router.get("/doctors/:doctorId/slots", getDoctorSlots);

// Protected routes - Require authentication
// Đặt lịch khám mới
router.post("/appointments", verifyToken, createAppointment);

// Lấy thông tin appointment
router.get("/appointments/:appointmentId", verifyToken, getAppointmentById);

// Cập nhật trạng thái appointment (dành cho doctor/admin)
router.patch(
  "/appointments/:appointmentId/status",
  verifyToken,
  authorizeRoles("doctor", "admin"),
  updateAppointmentStatus
);

router.put(
  "/appointments/:appointmentId/payment-status",
  verifyToken,
  authorizeRoles("doctor", "admin"),
  updateAppointmentPaymentStatus
);

// Hủy appointment
router.delete("/appointments/:appointmentId", verifyToken, cancelAppointment);

// Lấy danh sách appointment của user
router.get("/users/:userId/appointments", verifyToken, getUserAppointments);

// Lấy danh sách appointment của doctor
router.get(
  "/doctors/:doctorId/appointments",
  verifyToken,
  authorizeRoles("doctor", "admin"),
  getDoctorAppointments
);

// Payment routes
// Xử lý thanh toán
router.post(
  "/appointments/:appointmentId/payment",
  verifyToken,
  processPayment
);
router.get("/vnpay/return", vnpayReturnHandler);
// Lịch sử thanh toán
router.get("/users/:userId/payments", verifyToken, getPaymentHistory);

// Webhook routes (không cần auth)
// Webhook cho VNPay
router.post("/webhooks/vnpay", async (req, res) => {
  try {
    // Handle VNPay webhook
    const { vnp_TxnRef, vnp_ResponseCode, vnp_TransactionStatus } = req.query;

    if (vnp_ResponseCode === "00" && vnp_TransactionStatus === "00") {
      // Payment successful
      const PaymentService = await import("../services/payment.service.js");
      const paymentService = new PaymentService.default();

      await paymentService.confirmPayment(vnp_TxnRef, req.query);

      return res.status(200).send("OK");
    }

    res.status(400).send("Payment failed");
  } catch (error) {
    console.error("VNPay webhook error:", error);
    res.status(500).send("Internal server error");
  }
});

// Webhook cho MoMo
router.post("/webhooks/momo", async (req, res) => {
  try {
    // Handle MoMo webhook
    const { orderId, resultCode, message } = req.body;

    if (resultCode === 0) {
      // Payment successful
      const PaymentService = await import("../services/paymentService.js");
      const paymentService = new PaymentService.default();

      await paymentService.confirmPayment(orderId, req.body);

      return res.status(200).json({
        success: true,
        message: "Webhook processed successfully",
      });
    }

    res.status(400).json({
      success: false,
      message: "Payment failed",
    });
  } catch (error) {
    console.error("MoMo webhook error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Additional utility routes
// Thống kê appointment
router.get(
  "/statistics/appointments",
  verifyToken,
  authorizeRoles(["admin"]),
  async (req, res) => {
    try {
      const { startDate, endDate, doctorId } = req.query;
      const Appointment = mongoose.model("Appointment");

      const filter = {};

      if (startDate && endDate) {
        filter.date = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      }

      if (doctorId) {
        filter.doctorId = doctorId;
      }

      const stats = await Appointment.aggregate([
        { $match: filter },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalRevenue: { $sum: "$totalFee" },
          },
        },
      ]);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("Statistics error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi lấy thống kê",
      });
    }
  }
);

// Lấy appointment sắp tới của doctor
router.get(
  "/doctors/:doctorId/upcoming",
  verifyToken,
  authorizeRoles("doctor", "admin"),
  async (req, res) => {
    try {
      const { doctorId } = req.params;
      const { limit = 10 } = req.query;

      const Appointment = mongoose.model("Appointment");
      const appointments = await Appointment.getUpcomingAppointments(
        doctorId,
        parseInt(limit)
      );

      res.status(200).json({
        success: true,
        data: appointments,
      });
    } catch (error) {
      console.error("Upcoming appointments error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi lấy lịch khám sắp tới",
      });
    }
  }
);

// Lấy appointment hôm nay của doctor
router.get(
  "/doctors/:doctorId/today",
  verifyToken,
  authorizeRoles(["doctor", "admin"]),
  async (req, res) => {
    try {
      const { doctorId } = req.params;

      const Appointment = mongoose.model("Appointment");
      const appointments = await Appointment.getTodayAppointments(doctorId);

      res.status(200).json({
        success: true,
        data: appointments,
      });
    } catch (error) {
      console.error("Today appointments error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi lấy lịch khám hôm nay",
      });
    }
  }
);

export default router;
