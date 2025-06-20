import express from "express";
import {
  createCollectionController,
  getAllCollectionsController,
  getCollectionByIdController,
  updateCollectionController,
  deleteCollectionController,
} from "../controllers/collection.controller.js";
import verifyToken from "../middlewares/verifyToken.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

const router = express.Router();

// Tạo Collection mới
router.post(
  "/",
  verifyToken,
  authorizeRoles("admin"),
  createCollectionController
);

// Lấy tất cả Collection (có thể filter qua query)
router.get(
  "/",
  verifyToken,
  authorizeRoles("admin"),
  getAllCollectionsController
);

// Lấy chi tiết Collection theo id
router.get(
  "/:id",
  verifyToken,
  authorizeRoles("admin"),
  getCollectionByIdController
);

// Cập nhật Collection
router.put(
  "/:id",
  verifyToken,
  authorizeRoles("admin"),
  updateCollectionController
);

// Xóa Collection
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("admin"),
  deleteCollectionController
);

export default router;
