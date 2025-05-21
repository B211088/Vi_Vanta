import express from "express";
import {
  createChild,
  getAllChildren,
  getChildById,
  updateChild,
  deleteChild,
} from "../controllers/children.controller.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

// Tạo thông tin trẻ mới
router.post("/", verifyToken, createChild);

// Lấy danh sách tất cả trẻ
router.get("/", verifyToken, getAllChildren);

// Lấy thông tin chi tiết một trẻ
router.get("/:childId", verifyToken, getChildById);

// Cập nhật thông tin trẻ
router.put("/:childId", verifyToken, updateChild);

// Xóa thông tin trẻ
router.delete("/:childId", verifyToken, deleteChild);

export default router;
