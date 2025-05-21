import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { sanitizeInputMiddleware } from "../middlewares/sanitizeInput.js";
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
  createPregnancyVisitAddress,
  getAllPregnancyVisitAddresses,
  getPregnancyVisitAddressById,
  updatePregnancyVisitAddress,
  deletePregnancyVisitAddress,
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

// lấy danh sách các kỳ khám
router.get("/visit-types", verifyToken, getVisitTypes);

// tạo một kỳ khám mới
router.post(
  "/visit-type",
  sanitizeInputMiddleware,
  verifyToken,
  authorizeRoles("admin"),
  createVisitType
);

// cập nhật thông tin một kỳ khám
router.put(
  "/visit-type/:id",
  sanitizeInputMiddleware,
  verifyToken,
  authorizeRoles("admin"),
  updateVisitType
);

// xóa một kỳ khám
router.delete(
  "/visit-type/:id",
  verifyToken,
  authorizeRoles("admin"),
  deleteVisitType
);

// lấy danh sách các kỳ khám của một thai kỳ
router.get("/:pregnancyId/visits", verifyToken, getPregnancyVisits);

// tạo một kỳ khám mới
router.post(
  "/:pregnancyId/visits",
  sanitizeInputMiddleware,
  verifyToken,
  upload.array("imageUrls", 10),
  createPregnancyVisit
);

// cập nhật thông tin một kỳ khám
router.put(
  "/visits/:visitId",
  sanitizeInputMiddleware,
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

// Tạo một địa chỉ khám thai mới
router.post(
  "/visit-address",
  sanitizeInputMiddleware,
  verifyToken,
  authorizeRoles("admin"),
  createPregnancyVisitAddress
);

// Lấy danh sách tất cả địa chỉ khám thai
router.get(
  "/visit-address",
  sanitizeInputMiddleware,
  verifyToken,
  getAllPregnancyVisitAddresses
);

// Lấy thông tin địa chỉ khám thai theo ID
router.get(
  "/visit-address/:addressId",
  verifyToken,
  getPregnancyVisitAddressById
);

// Cập nhật thông tin địa chỉ khám thai
router.put(
  "/visit-address/:addressId",
  sanitizeInputMiddleware,
  verifyToken,
  authorizeRoles("admin"),
  updatePregnancyVisitAddress
);

// Xóa một địa chỉ khám thai
router.delete(
  "/visit-address/:addressId",
  verifyToken,
  authorizeRoles("admin"),
  deletePregnancyVisitAddress
);

export default router;
