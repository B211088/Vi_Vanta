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
  createDiseaseCategory,
  getAllDiseaseCategories,
  getDiseaseCategoryById,
  updateDiseaseCategory,
  deleteDiseaseCategory,
} from "../controllers/diseases.controller.js";
import upload from "../middlewares/uploadMiddleware.js";
import verifyToken from "../middlewares/verifyToken.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

const router = express.Router();

/* ===== ROUTES CHO DANH MỤC BỆNH ===== */
router.post(
  "/categories",
  verifyToken,
  authorizeRoles("admin"),
  createDiseaseCategory
);

router.get("/categories", verifyToken, getAllDiseaseCategories);

router.get("/categories/:categoryId", verifyToken, getDiseaseCategoryById);

router.put(
  "/categories/:categoryId",
  verifyToken,
  authorizeRoles("admin"),
  updateDiseaseCategory
);

router.delete(
  "/categories/:categoryId",
  verifyToken,
  authorizeRoles("admin"),
  deleteDiseaseCategory
);

/* ===== ROUTES CHO PREVENTION (Biện pháp phòng ngừa) ===== */
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

/* ===== ROUTES CHO SYMPTOM (Triệu chứng) ===== */
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

/* ===== ROUTES CHO TREATMENT (Phương pháp điều trị) ===== */
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

/* ===== ROUTES CHO CAUSE (Nguyên nhân) ===== */
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

/* ===== ROUTES CHO BỆNH ===== */
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

router.get("/get-all-diseases", verifyToken, getAllDiseases);

router.get(
  "/get-all-diseases/active",
  verifyToken,
  authorizeRoles("admin"),
  getAllDiseasesActive
);

router.get("/get-disease/:diseaseId", verifyToken, getDiseaseById);

router.get(
  "/search-disease",
  verifyToken,
  authorizeRoles("admin"),
  searchDisease
);

router.get("/search-disease/active", verifyToken, searchDiseaseActive);

router.get("/disease-category/:categoryId", verifyToken, getDiseasesByCategory);

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

router.patch(
  "/:diseaseId/toggle-active",
  verifyToken,
  authorizeRoles("admin"),
  toggleDiseaseActive
);

router.delete(
  "/delete-disease/:diseaseId",
  verifyToken,
  authorizeRoles("admin"),
  deleteDisease
);

export default router;
