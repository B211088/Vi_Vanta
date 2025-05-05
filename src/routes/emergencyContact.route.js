import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import {
  createEmergencyContact,
  getEmergencyContact,
  removeEmergencyContact,
  updateEmergencyContact,
} from "../controllers/emergencyContact.controller.js";

const router = express.Router();

router.get("/getAll", verifyToken, getEmergencyContact);
router.post("/create", verifyToken, createEmergencyContact);
router.put("/update/:id", verifyToken, updateEmergencyContact);
router.delete("/delete/:id", verifyToken, removeEmergencyContact);

export default router;
