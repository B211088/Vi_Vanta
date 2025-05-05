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

router.get("/provinces", provinces);
router.get("/districts", districts);
router.get("/wards", wards);

router.post(
  "/create/provinces",
  verifyToken,
  authorizeRoles("admin"),
  createProvinceHandler
);

router.post(
  "/create/districts",
  verifyToken,
  authorizeRoles("admin"),
  createDistrictsHandler
);

router.post(
  "/create/wards",
  verifyToken,
  authorizeRoles("admin"),
  createWardsHandler
);

export default router;
