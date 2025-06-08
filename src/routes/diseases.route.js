import express from "express";
import {
  createDisease,
  getAllDiseases,
  getDiseaseById,
  updateDisease,
  deleteDisease,
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

router.get(
  "/get-all-diseases",
  verifyToken,
  authorizeRoles("admin"),
  getAllDiseases
);

router.get("/get-all-diseases/active", verifyToken, getAllDiseasesActive);

router.get("/get-disease/:diseaseId", verifyToken, getDiseaseById);

router.get(
  "/search-disease",
  verifyToken,
  authorizeRoles("admin"),
  searchDisease
);

router.get("/search-disease/active", verifyToken, searchDiseaseActive);

router.get("/get-all-diseases/active", verifyToken, getAllDiseasesActive);

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
