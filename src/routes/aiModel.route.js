import express from "express";
import {
  createAIModelController,
  getAllAIModelsController,
  getAIModelByIdController,
  updateAIModelController,
  deleteAIModelController,
} from "../controllers/aiModel.controller.js";
import verifyToken from "../middlewares/verifyToken.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

const router = express.Router();

router.post("/", verifyToken, authorizeRoles("admin"), createAIModelController);
router.get("/", verifyToken, authorizeRoles("admin"), getAllAIModelsController);
router.get(
  "/:id",
  verifyToken,
  authorizeRoles("admin"),
  getAIModelByIdController
);
router.put(
  "/:id",
  verifyToken,
  authorizeRoles("admin"),
  updateAIModelController
);
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("admin"),
  deleteAIModelController
);

export default router;
