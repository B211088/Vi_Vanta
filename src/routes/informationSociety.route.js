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

// Lấy danh sách tất cả thông tin xã hội
router.get("/getInfo", verifyToken, getInformationSociety);

// Tạo thông tin xã hội
router.post(
  "/create",
  verifyToken,
  upload.array("pictureDocuments", 10),
  createInformationSociety
);

// Cập nhật thông tin xã hội
router.put(
  "/update/:id",
  verifyToken,
  upload.array("pictureDocuments", 10),
  updateInformationSociety
);

// Xóa thông tin xã hội
router.delete("/delete/:id", verifyToken, removeInformationSociety);

export default router;
