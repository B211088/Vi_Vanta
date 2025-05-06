import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import {
  createInfoPregnancy,
  deletePregnancy,
  getAllInfoPregnancies,
  getInfoPregnancy,
  updateInfoPregnancy,
} from "../controllers/pregnancy.controller.js";

const router = express.Router();

router.get("/", verifyToken, getAllInfoPregnancies);
router.get("/:id", verifyToken, getInfoPregnancy);
router.post("/create", verifyToken, createInfoPregnancy);
router.put("/update_info/:id", verifyToken, updateInfoPregnancy);
router.delete("/delete_info/:id", verifyToken, deletePregnancy);

export default router;
