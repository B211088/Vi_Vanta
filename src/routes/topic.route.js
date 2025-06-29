import express from "express";
import { TopicController } from "../controllers/topic.controller.js";
import verifyToken from "../middlewares/verifyToken.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { sanitizeInputMiddleware } from "../middlewares/sanitizeInput.js";
import {
  handleMulterError,
  uploadImage,
} from "../middlewares/uploadMiddleware.js";

const router = express.Router();
const topicController = new TopicController();

router.get("/", topicController.getAllParentTopics);

// GET /api/topics/search - Search topics
router.get("/search", topicController.searchTopics);

// GET /api/topics/stats - Get topics statistics
router.get("/stats", topicController.getTopicsStats);

// GET /api/topics/:id - Get topic by ID
router.get("/:id", topicController.getTopicById);

// POST /api/topics - Create new topic
router.post(
  "/",
  verifyToken,
  authorizeRoles("admin"),
  sanitizeInputMiddleware,
  uploadImage.single("image"),
  handleMulterError,
  topicController.createTopic
);

// PUT /api/topics/:id - Update topic
router.put(
  "/:id",
  verifyToken,
  authorizeRoles("admin"),
  sanitizeInputMiddleware,
  uploadImage.single("image"),
  handleMulterError,
  topicController.updateTopic
);

// PATCH /api/topics/:id - Partial update topic
router.patch(
  "/:id",
  verifyToken,
  authorizeRoles("admin"),
  sanitizeInputMiddleware,
  topicController.updateTopic
);

// DELETE /api/topics/:id - Delete topic (soft delete by default)
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("admin"),
  topicController.deleteTopic
);

// POST /api/topics/:id/restore - Restore deleted topic
router.post(
  "/:id/restore",
  verifyToken,
  authorizeRoles("admin"),
  sanitizeInputMiddleware,
  topicController.restoreTopic
);

export default router;
