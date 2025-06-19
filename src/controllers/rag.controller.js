// controllers/rag.controller.js
import EmbedService from "../services/rag.service.js"; // Fixed import path
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

// Initialize service once
const service = new EmbedService();

/**
 * Upload and index a document
 */
export async function uploadAndIndex(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No file uploaded",
        message: "Please upload a file to index",
      });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;

    // Generate unique document ID
    const documentId = req.body.id || `doc_${uuidv4()}`;

    console.log(`Processing file: ${fileName} at ${filePath}`);
    console.log(`Document ID: ${documentId}`);

    // Validate file exists
    if (!fs.existsSync(filePath)) {
      return res.status(400).json({
        error: "File not found",
        message: "Uploaded file could not be located",
      });
    }

    // Index the file
    const count = await service.indexFile(documentId, filePath);

    // Clean up uploaded file after processing
    try {
      fs.unlinkSync(filePath);
      console.log(`Cleaned up temporary file: ${filePath}`);
    } catch (cleanupError) {
      console.warn(`Could not cleanup file ${filePath}:`, cleanupError.message);
    }

    res.json({
      status: "success",
      message: "Document indexed successfully",
      documentId: documentId,
      fileName: fileName,
      chunks: count,
      indexedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in uploadAndIndex:", error);

    // Clean up file if error occurs
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.warn(
          `Could not cleanup file after error:`,
          cleanupError.message
        );
      }
    }

    res.status(500).json({
      error: "Indexing failed",
      message: error.message || "An error occurred while indexing the document",
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}

/**
 * Query similar documents
 */
export async function queryDoc(req, res, next) {
  try {
    const { query, k = 5, filters = {} } = req.body;

    // Validate input
    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return res.status(400).json({
        error: "Invalid query",
        message: "Query must be a non-empty string",
      });
    }

    if (k < 1 || k > 50) {
      return res.status(400).json({
        error: "Invalid k value",
        message: "k must be between 1 and 50",
      });
    }

    console.log(`Querying: "${query}" with k=${k}`);

    // Perform similarity search
    const result = await service.querySimilar(
      query.trim(),
      parseInt(k),
      filters
    );

    res.json({
      status: "success",
      ...result,
      queriedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in queryDoc:", error);

    res.status(500).json({
      error: "Query failed",
      message: error.message || "An error occurred while querying documents",
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}

/**
 * Get collection statistics
 */
export async function getStats(req, res, next) {
  try {
    const stats = await service.getStats();

    res.json({
      status: "success",
      ...stats,
      retrievedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in getStats:", error);

    res.status(500).json({
      error: "Failed to get statistics",
      message: error.message || "An error occurred while retrieving statistics",
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}

/**
 * List all documents
 */
export async function listDocuments(req, res, next) {
  try {
    const documents = await service.listDocuments();

    res.json({
      status: "success",
      documents: documents,
      totalCount: documents.length,
      retrievedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in listDocuments:", error);

    res.status(500).json({
      error: "Failed to list documents",
      message: error.message || "An error occurred while listing documents",
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}

/**
 * Delete a document
 */
export async function deleteDocument(req, res, next) {
  try {
    const { documentId } = req.params;

    if (!documentId || documentId.trim().length === 0) {
      return res.status(400).json({
        error: "Invalid document ID",
        message: "Document ID is required",
      });
    }

    console.log(`Deleting document: ${documentId}`);

    const deleted = await service.deleteDocument(documentId.trim());

    if (deleted) {
      res.json({
        status: "success",
        message: "Document deleted successfully",
        documentId: documentId,
        deletedAt: new Date().toISOString(),
      });
    } else {
      res.status(404).json({
        error: "Document not found",
        message: `No document found with ID: ${documentId}`,
      });
    }
  } catch (error) {
    console.error("Error in deleteDocument:", error);

    res.status(500).json({
      error: "Delete failed",
      message: error.message || "An error occurred while deleting the document",
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}

/**
 * Health check endpoint
 */
export async function healthCheck(req, res, next) {
  try {
    // Test basic functionality
    const stats = await service.getStats();

    res.json({
      status: "healthy",
      service: "RAG Service",
      timestamp: new Date().toISOString(),
      stats: stats,
    });
  } catch (error) {
    console.error("Health check failed:", error);

    res.status(503).json({
      status: "unhealthy",
      service: "RAG Service",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}
