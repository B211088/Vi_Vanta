import express from "express";
import {
  uploadAndIndex,
  queryDoc,
  getStats,
  listDocuments,
  deleteDocument,
  healthCheck,
} from "../controllers/rag.controller.js";
import upload, { handleMulterError } from "../middlewares/uploadMiddleware.js";
import EmbedService from "../services/rag.service.js";

const router = express.Router();

// Health check endpoint
router.get("/health", healthCheck);

// Document management endpoints
router.post(
  "/upload",
  upload.single("file"),
  handleMulterError,
  uploadAndIndex
);
router.post("/query", queryDoc);
router.get("/stats", getStats);
router.get("/documents", listDocuments);
router.delete("/documents/:documentId", deleteDocument);

// Bulk delete documents endpoint (calls controller logic for consistency)
const service = new EmbedService();

router.delete("/documents", deleteDocument);

export default router;
