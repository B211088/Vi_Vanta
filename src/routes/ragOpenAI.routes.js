import express from "express";
import {
  uploadAndIndex,
  getStats,
  listDocuments,
  healthCheck,
  deleteDocumentAndChunks,
  getAllCollections,
} from "../controllers/ragOpenAI.controller.js";
import upload, { handleMulterError } from "../middlewares/uploadMiddleware.js";
import verifyToken from "../middlewares/verifyToken.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

const router = express.Router();

// Health check endpoint
router.get("/health", verifyToken, authorizeRoles("admin"), healthCheck);

// Document management endpoints
router.post(
  "/upload",
  verifyToken,
  authorizeRoles("admin"),
  upload.single("file"),
  handleMulterError,
  uploadAndIndex
);

router.get("/stats", verifyToken, authorizeRoles("admin"), getStats);

router.get(
  "/collections",
  verifyToken,
  authorizeRoles("admin"),
  getAllCollections
);

router.get("/collection", verifyToken, authorizeRoles("admin"), listDocuments);

router.delete(
  "/document/:collectionId",
  verifyToken,
  authorizeRoles("admin"),
  deleteDocumentAndChunks
);

export default router;
