import express from "express";
import {
  createMedicationReminder,
  getMedicationReminders,
  getMedicationReminderById,
  updateMedicationReminder,
  deleteMedicationReminder,
  updateMedicationReminderStatus,
  // Prescription controllers
  createMedicationPrescription,
  getMedicationPrescriptions,
  getMedicationPrescriptionById,
  updateMedicationPrescription,
  deleteMedicationPrescription,
} from "../controllers/medicationReminder.controller.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();
// Toa thuốc (prescription)
router.get("/prescriptions", verifyToken, getMedicationPrescriptions);

router.post("/prescriptions", verifyToken, createMedicationPrescription);

router.get("/prescriptions/:id", verifyToken, getMedicationPrescriptionById);

router.put("/prescriptions/:id", verifyToken, updateMedicationPrescription);

router.delete("/prescriptions/:id", verifyToken, deleteMedicationPrescription);
// Lấy danh sách nhắc nhở (cần xác thực)
router.get("/", verifyToken, getMedicationReminders);

// Tạo mới nhắc nhở (cần xác thực)
router.post("/", verifyToken, createMedicationReminder);

// Lấy chi tiết một nhắc nhở (cần xác thực)
router.get("/:id", verifyToken, getMedicationReminderById);

// Cập nhật nhắc nhở (cần xác thực)
router.put("/:id", verifyToken, updateMedicationReminder);

// Xóa nhắc nhở (cần xác thực)
router.delete("/:id", verifyToken, deleteMedicationReminder);

// Cập nhật trạng thái nhắc nhở (cần xác thực)
router.patch("/:id/status", verifyToken, updateMedicationReminderStatus);

export default router;
