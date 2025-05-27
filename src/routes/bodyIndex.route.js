import express from "express";
import {
  getBasicIndex,
  calculateBMI,
} from "../controllers/bodyIndex.controller.js";
import verifyToken from "../middlewares/verifyToken.js";
const router = express.Router();

// Routes
router.get("/basic-index", verifyToken, getBasicIndex);
router.post("/basic-index", verifyToken, calculateBMI);

export default router;
