import express from "express";

import verifyToken from "../middlewares/verifyToken.js";
import {
  calculateBMI,
  calculateBodyFat,
  calculateEMM,
  calculateWHR,
  deleteBMIRecord,
  deleteBodyFatRecord,
  deleteEMMRecord,
  deleteWHRRecord,
  getBMIRecordById,
  getBMIRecords,
  getBodyFatRecordById,
  getBodyFatRecords,
  getEMMRecordById,
  getEMMRecords,
  getWHRRecordById,
  getWHRRecords,
} from "../controllers/bodyIndex.controller.js";
const router = express.Router();

// chỉ số BMI
router.get("/bmi", verifyToken, getBMIRecords);
router.get("/bmi/:id", verifyToken, getBMIRecordById);
router.post("/bmi", verifyToken, calculateBMI);
router.delete("/bmi/:id", verifyToken, deleteBMIRecord);

// Chỉ số BMR
router.get("/emm", verifyToken, getEMMRecords);
router.get("/emm/:id", verifyToken, getEMMRecordById);
router.post("/emm", verifyToken, calculateEMM);
router.delete("/emm/:id", verifyToken, deleteEMMRecord);

// Chỉ số Body Fat
router.get("/body-fat", verifyToken, getBodyFatRecords);
router.get("/body-fat/:id", verifyToken, getBodyFatRecordById);
router.post("/body-fat", verifyToken, calculateBodyFat);
router.delete("/body-fat/:id", verifyToken, deleteBodyFatRecord);

// Chỉ số WHR
router.get("/whr", verifyToken, getWHRRecords);
router.get("/whr/:id", verifyToken, getWHRRecordById);
router.post("/whr", verifyToken, calculateWHR);
router.delete("/whr/:id", verifyToken, deleteWHRRecord);

export default router;
