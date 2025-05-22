import express from "express";
import {
  createDisease,
  getAllDiseases,
  getDiseaseById,
  updateDisease,
  deleteDisease,
  createPrevention,
  getAllPreventions,
  getPreventionById,
  updatePrevention,
  deletePrevention,
  createSymptom,
  getAllSymptoms,
  getSymptomById,
  updateSymptom,
  deleteSymptom,
  createTreatment,
  getAllTreatments,
  getTreatmentById,
  updateTreatment,
  deleteTreatment,
  createCause,
  getAllCauses,
  getCauseById,
  updateCause,
  deleteCause,
  getDiseasesByCategory,
  searchDisease,
  getAllDiseasesActive,
  toggleDiseaseActive,
  searchDiseaseActive,
} from "../controllers/diseases.controller.js";
import upload from "../middlewares/uploadMiddleware.js";
import verifyToken from "../middlewares/verifyToken.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

const router = express.Router();

// Routes cho Disease (Bệnh)
// Tạo một bệnh mới
router.post(
  "/create-disease",
  verifyToken,
  authorizeRoles("admin"),
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "thumbnail", maxCount: 1 },
  ]),

  createDisease
);

// Lấy danh sách tất cả các bệnh
router.get("/get-all-diseases", verifyToken, getAllDiseases);

// Lấy danh sách tất cả các bệnh được active
router.get(
  "/get-all-diseases/active",
  verifyToken,
  authorizeRoles("admin"),
  getAllDiseasesActive
);

// Lấy thông tin chi tiết một bệnh
router.get("/get-disease/:diseaseId", verifyToken, getDiseaseById);

// Tìm kiếm bệnh theo tên
router.get(
  "/search-disease",
  verifyToken,
  authorizeRoles("admin"),
  searchDisease
);

// Tìm kiếm bệnh theo tên
router.get("/search-disease/active", verifyToken, searchDiseaseActive);

// Lấy danh sách bệnh theo danh mục
router.get("/disease-category/:categoryId", verifyToken, getDiseasesByCategory);

// Cập nhật thông tin bệnh
router.put(
  "/update-disease/:diseaseId",
  verifyToken,
  authorizeRoles("admin"),
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  updateDisease
);

//chuyển trạng thái bệnh
router.patch(
  "/:diseaseId/toggle-active",
  verifyToken,
  authorizeRoles("admin"),
  toggleDiseaseActive
);

// Xóa một bệnh
router.delete(
  "/delete-disease/:diseaseId",
  verifyToken,
  authorizeRoles("admin"),
  deleteDisease
);

// Routes cho Prevention (Biện pháp phòng ngừa)
router.post(
  "/prevention",
  verifyToken,
  authorizeRoles("admin"),
  upload.array("images", 10),
  createPrevention
);
router.get("/preventions", getAllPreventions);
router.get("/prevention/:preventionId", getPreventionById);
router.put(
  "/prevention/:preventionId",
  verifyToken,
  authorizeRoles("admin"),
  upload.array("images", 10),
  updatePrevention
);
router.delete(
  "/prevention/:preventionId",
  verifyToken,
  authorizeRoles("admin"),
  deletePrevention
);

// Routes cho Symptom (Triệu chứng)
router.post(
  "/symptom",
  verifyToken,
  authorizeRoles("admin"),
  upload.array("images", 10),
  createSymptom
);
router.get("/symptoms", verifyToken, getAllSymptoms);
router.get("/symptom/:symptomId", verifyToken, getSymptomById);
router.put(
  "/symptom/:symptomId",
  verifyToken,
  authorizeRoles("admin"),
  upload.array("images", 10),
  updateSymptom
);
router.delete(
  "/symptom/:symptomId",
  verifyToken,
  authorizeRoles("admin"),
  deleteSymptom
);

// Routes cho Treatment (Phương pháp điều trị)
router.post(
  "/treatment",
  verifyToken,
  authorizeRoles("admin"),
  upload.array("images", 10),
  createTreatment
);
router.get("/treatment", verifyToken, getAllTreatments);
router.get("/treatment/:treatmentId", verifyToken, getTreatmentById);
router.put(
  "/treatment/:treatmentId",
  verifyToken,
  authorizeRoles("admin"),
  upload.array("images", 10),
  updateTreatment
);
router.delete(
  "/treatment/:treatmentId",
  verifyToken,
  authorizeRoles("admin"),
  deleteTreatment
);

// Routes cho Cause (Nguyên nhân)
router.post(
  "/cause",
  verifyToken,
  authorizeRoles("admin"),
  upload.array("images", 10),
  createCause
);
router.get("/cause", verifyToken, getAllCauses);
router.get("/cause/:causeId", verifyToken, getCauseById);
router.put(
  "/cause/:causeId",
  verifyToken,
  authorizeRoles("admin"),
  upload.array("images", 10),
  updateCause
);
router.delete(
  "/cause/:causeId",
  verifyToken,
  authorizeRoles("admin"),
  deleteCause
);

export default router;
