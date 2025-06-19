import express from "express";
import {
  uploadAndIndex,
  queryDoc,
  getStats,
  listDocuments,
  deleteDocument,
  healthCheck,
  askQuestion,
  deleteDocumentAndChunks,
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
router.post("/query", verifyToken, authorizeRoles("admin"), queryDoc);

router.post("/ask", verifyToken, askQuestion);

router.get("/stats", verifyToken, authorizeRoles("admin"), getStats);

router.get("/documents", verifyToken, authorizeRoles("admin"), listDocuments);

router.delete(
  "/documents/:documentId",
  verifyToken,
  authorizeRoles("admin"),
  deleteDocumentAndChunks
);

router.delete(
  "/documents",
  verifyToken,
  authorizeRoles("admin"),
  deleteDocument
);

export default router;
