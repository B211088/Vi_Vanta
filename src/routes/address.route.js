import express from "express";
import {
  provinces,
  districts,
  wards,
  createProvinceHandler,
  createDistrictsHandler,
  createWardsHandler,
} from "../controllers/address.controller.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import verifyToken from "../middlewares/verifyToken.js";
const router = express.Router();

// Lấy danh sách tất cả tỉnh thành
router.get("/provinces", provinces);
// Lấy danh sách tất cả quận huyện
router.get("/districts", districts);
// Lấy danh sách tất cả phường xã
router.get("/wards", wards);

// Tạo tỉnh thành
router.post(
  "/create/provinces",
  verifyToken,
  authorizeRoles("admin"),
  createProvinceHandler
);

// Tạo quận huyện
router.post(
  "/create/districts",
  verifyToken,
  authorizeRoles("admin"),
  createDistrictsHandler
);

// Tạo phường xã
router.post(
  "/create/wards",
  verifyToken,
  authorizeRoles("admin"),
  createWardsHandler
);

export default router;
