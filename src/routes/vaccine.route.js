import express from "express";
import {
  createVaccine,
  getAllVaccines,
  getVaccineById,
  updateVaccine,
  deleteVaccine,
  getVaccinesByCategory,
  createVaccinCategory,
  getAllVaccinCategories,
  getVaccinCategoryById,
  updateVaccinCategory,
  deleteVaccinCategory,
} from "../controllers/vaccine.controller.js";
import verifyToken from "../middlewares/verifyToken.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// ===== ROUTES CHO DANH MỤC VẮC-XIN =====
router.post(
  "/categories",
  verifyToken,
  authorizeRoles("admin"),
  createVaccinCategory
);
router.get("/categories", verifyToken, getAllVaccinCategories);
router.get("/categories/:categoryId", verifyToken, getVaccinCategoryById);
router.put(
  "/categories/:categoryId",
  verifyToken,
  authorizeRoles("admin"),
  updateVaccinCategory
);
router.delete(
  "/categories/:categoryId",
  verifyToken,
  authorizeRoles("admin"),
  deleteVaccinCategory
);

// ===== ROUTES CHO VẮC-XIN =====
router.post(
  "/",
  verifyToken,
  authorizeRoles("admin"),
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  createVaccine
);
router.get("/", verifyToken, getAllVaccines);
router.get("/category/:categoryId", verifyToken, getVaccinesByCategory);
router.get("/:vaccineId", verifyToken, authorizeRoles("admin"), getVaccineById);
router.put(
  "/:vaccineId",
  verifyToken,
  authorizeRoles("admin"),
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  updateVaccine
);
router.delete(
  "/:vaccineId",
  verifyToken,
  authorizeRoles("admin"),
  deleteVaccine
);

export default router;
