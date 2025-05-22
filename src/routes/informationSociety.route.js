import express from "express";
import upload from "../middlewares/uploadMiddleware.js";
import verifyToken from "../middlewares/verifyToken.js";
import { sanitizeInputMiddleware } from "../middlewares/sanitizeInput.js";
import {
  createInformationSociety,
  getInformationSociety,
  removeInformationSociety,
  updateInformationSociety,
} from "../controllers/informationSociety.controller.js";

const router = express.Router();

// Lấy danh sách tất cả thông tin xã hội
router.get("/", verifyToken, getInformationSociety);

// Tạo thông tin xã hội
router.post(
  "/",
  sanitizeInputMiddleware,
  verifyToken,
  upload.array("pictureDocuments", 10),
  createInformationSociety
);

// Cập nhật thông tin xã hội
router.put(
  "/:id",
  sanitizeInputMiddleware,
  verifyToken,
  upload.array("pictureDocuments", 10),
  updateInformationSociety
);

// Xóa thông tin xã hội
router.delete("/:id", verifyToken, removeInformationSociety);

export default router;
