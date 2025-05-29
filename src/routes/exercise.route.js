import express from "express";
import {
  getAllExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise,
  getAllExerciseCategories,
  getExerciseCategoryById,
  createExerciseCategory,
  updateExerciseCategory,
  deleteExerciseCategory,
} from "../controllers/exercises.controller.js";
import upload from "../middlewares/uploadMiddleware.js";
import verifyToken from "../middlewares/verifyToken.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

const router = express.Router();

router.get("/categories", getAllExerciseCategories);
router.get("/categories/:id", getExerciseCategoryById);
router.post(
  "/categories",
  verifyToken,
  authorizeRoles("admin"),
  createExerciseCategory
);
router.put(
  "/categories/:id",
  verifyToken,
  authorizeRoles("admin"),
  updateExerciseCategory
);
router.delete(
  "/categories/:id",
  verifyToken,
  authorizeRoles("admin"),
  deleteExerciseCategory
);

router.get("/", getAllExercises);
router.get("/:id", getExerciseById);
router.post(
  "/",
  verifyToken,
  authorizeRoles("admin"),
  upload.fields([
    {
      name: "thumbnail",
      maxCount: 1,
    },
    {
      name: "images",
      maxCount: 5,
    },
    {
      name: "videos",
      maxCount: 1,
    },
  ]),
  createExercise
);
router.put(
  "/:id",
  verifyToken,
  authorizeRoles("admin"),
  upload.fields([
    {
      name: "thumbnail",
      maxCount: 1,
    },
    {
      name: "images",
      maxCount: 5,
    },
    {
      name: "videos",
      maxCount: 1,
    },
  ]),
  updateExercise
);
router.delete("/:id", verifyToken, authorizeRoles("admin"), deleteExercise);

export default router;
