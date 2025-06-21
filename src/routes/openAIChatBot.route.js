import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import {
  createSection,
  getSectionById,
  getUserSections,
  searchSections,
  deleteSection,
  updateSectionContext,
  addMessage,
} from "../controllers/aiChat.controller.js";
import { testingCollectionDataChatBot } from "../controllers/ragOpenAI.controller.js";

const router = express.Router();

// Middleware xác thực cho tất cả routes
router.use(verifyToken);

// Routes cho RAG OpenAI
router.post("/ask", testingCollectionDataChatBot);

// Routes cho Section
router.post("/sections", createSection);
router.get("/sections/:sectionId", getSectionById);
router.get("/sections", verifyToken, getUserSections);
router.delete("/sections/:sectionId", deleteSection);
router.put("/sections/:sectionId/context", updateSectionContext);

// Routes cho Message
router.post("/sections/:sectionId/messages", addMessage);

// Routes cho tìm kiếm
router.get("/search", searchSections);

export default router;
