import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import {
  createInfoPregnancy,
  createPregnancyVisit,
  createPregnancyWeek,
  createVisitType,
  deletePregnancy,
  deletePregnancyVisit,
  deletePregnancyWeek,
  deleteVisitType,
  getAllInfoPregnancies,
  getInfoPregnancy,
  getPregnancyVisits,
  getPregnancyWeek,
  getPregnancyWeeks,
  getVisitTypes,
  updateInfoPregnancy,
  updatePregnancyVisit,
  updatePregnancyWeek,
  updateVisitType,
} from "../controllers/pregnancy.controller.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// lây danh sách tất cả thông tin thai kỳ
router.get("/get_all_pregnancy", verifyToken, getAllInfoPregnancies);

// lây thông tin thai kỳ theo id
router.get("/get_pregnancy/:id", verifyToken, getInfoPregnancy);

// tạo thông tin thai kỳ
router.post("/create", verifyToken, createInfoPregnancy);

// cập nhật thông tin thai kỳ
router.put("/update_info/:id", verifyToken, updateInfoPregnancy);

// xóa thông tin thai kỳ
router.delete("/delete_info/:id", verifyToken, deletePregnancy);

// lấy danh sách các kỳ khám
router.get("/visit_types", verifyToken, getVisitTypes);

// tạo một kỳ khám mới
router.post(
  "/visit_type",
  verifyToken,
  authorizeRoles("admin"),
  createVisitType
);

// cập nhật thông tin một kỳ khám
router.put(
  "/visit_type/:id",
  verifyToken,
  authorizeRoles("admin"),
  updateVisitType
);

// xóa một kỳ khám
router.delete(
  "/visit_type/:id",
  verifyToken,
  authorizeRoles("admin"),
  deleteVisitType
);

// lấy danh sách các kỳ khám của một thai kỳ
router.get("/:pregnancyId/visits", verifyToken, getPregnancyVisits);

// tạo một kỳ khám mới
router.post(
  "/:pregnancyId/visits",
  verifyToken,
  upload.array("imageUrls", 10),
  createPregnancyVisit
);

// cập nhật thông tin một kỳ khám
router.put(
  "/visits/:visitId",
  verifyToken,
  verifyToken,
  upload.array("imageUrls", 10),
  updatePregnancyVisit
);

// xóa một kỳ khám
router.delete("/visits/:visitId", verifyToken, deletePregnancyVisit);

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
