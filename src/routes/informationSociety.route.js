import express from "express";
import upload from "../middlewares/uploadMiddleware.js";
import verifyToken from "../middlewares/verifyToken.js";
import {
  createInformationSociety,
  getInformationSociety,
  removeInformationSociety,
  updateInformationSociety,
} from "../controllers/informationSociety.controller.js";

const router = express.Router();

router.get("/getInfo", verifyToken, getInformationSociety);

router.post(
  "/create",
  verifyToken,
  upload.array("pictureDocuments", 10),
  createInformationSociety
);

router.put(
  "/update/:id",
  verifyToken,
  upload.array("pictureDocuments", 10),
  updateInformationSociety
);

router.delete("/delete/:id", verifyToken, removeInformationSociety);

export default router;
