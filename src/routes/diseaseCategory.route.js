import express from "express";
import {
  createDiseaseCategory,
  deleteDiseaseCategory,
  getAllDiseaseCategories,
  getChildrenDiseaseCategories,
  getDiseaseCategoryById,
  updateDiseaseCategory,
} from "../controllers/diseaseCategory.controller.js";
import verifyToken from "../middlewares/verifyToken.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

const router = express.Router();

router.post("/", verifyToken, authorizeRoles("admin"), createDiseaseCategory);

router.get("/", verifyToken, getAllDiseaseCategories);

router.get("/:id/children", verifyToken, getChildrenDiseaseCategories);

router.get("/:id", verifyToken, getDiseaseCategoryById);

router.put("/:id", verifyToken, authorizeRoles("admin"), updateDiseaseCategory);

router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("admin"),
  deleteDiseaseCategory
);

export default router;
