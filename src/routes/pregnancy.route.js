import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { sanitizeInputMiddleware } from "../middlewares/sanitizeInput.js";
import {
  createInfoPregnancy,
  createPregnancyWeek,
  deletePregnancy,
  deletePregnancyWeek,
  getAllInfoPregnancies,
  getInfoPregnancy,
  getPregnancyWeek,
  getPregnancyWeeks,
  updateInfoPregnancy,
  updatePregnancyWeek,
} from "../controllers/pregnancy.controller.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// lây danh sách tất cả thông tin thai kỳ
router.get("/get-all-pregnancy", verifyToken, getAllInfoPregnancies);

// lây thông tin thai kỳ theo id
router.get("/get-pregnancy/:id", verifyToken, getInfoPregnancy);

// tạo thông tin thai kỳ
router.post("/create", verifyToken, createInfoPregnancy);

// cập nhật thông tin thai kỳ
router.put("/update-info/:id", verifyToken, updateInfoPregnancy);

// xóa thông tin thai kỳ
router.delete("/delete-info/:id", verifyToken, deletePregnancy);

// Lấy danh sách các tuần thai kỳ
router.get("/weeks", verifyToken, getPregnancyWeeks);

// Lấy thông tin tuần thai kỳ theo số tuần
router.get("/weeks/:weekNumber", verifyToken, getPregnancyWeek);

// Tạo một tuần thai kỳ mới
router.post(
  "/weeks",
  verifyToken,
  authorizeRoles("admin"),
  upload.single("imageUrl"),
  createPregnancyWeek
);

// Cập nhật thông tin một tuần thai kỳ
router.put(
  "/weeks/:weekId",
  verifyToken,
  authorizeRoles("admin"),
  upload.single("imageUrl"),
  updatePregnancyWeek
);

// Xóa một tuần thai kỳ
router.delete(
  "/weeks/:weekId",
  verifyToken,
  authorizeRoles("admin"),
  deletePregnancyWeek
);

export default router;
