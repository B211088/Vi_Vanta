import { Router } from "express";
import articleController from "../controllers/article.controller.js";
import verifyToken from "../middlewares/verifyToken.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import {
  handleMulterError,
  uploadImage,
} from "../middlewares/uploadMiddleware.js";
const router = Router();
import upload from "../middlewares/uploadImageMiddleware.js";
// Public routes - Không cần xác thực
router.get("/", articleController.getArticles);
router.get("/search", articleController.searchArticles);
router.get("/featured", articleController.getFeaturedArticles);
router.get(
  "/most-viewed",

  articleController.getMostViewedArticles
);
router.get("/latest", articleController.getLatestArticles);
router.get("/stats", articleController.getArticleStats);
router.get("/slug/:slug", articleController.getArticleBySlug);
router.get(
  "/author/:authorId",

  articleController.getArticlesByAuthor
);
router.get(
  "/topic/:topicId",

  articleController.getArticlesByTopic
);
router.get("/:id/related", articleController.getRelatedArticles);
router.get("/:id", articleController.getArticleById);

// Author/Editor routes - Có thể tạo và chỉnh sửa bài viết của mình
router.post(
  "/",
  verifyToken,
  authorizeRoles("admin", "expert"),
  upload.fields([
    {
      name: "images",
      maxCount: 10,
    },

    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  handleMulterError,
  articleController.createArticle
);
router.put(
  "/:id",
  verifyToken,
  authorizeRoles("admin"),
  articleController.updateArticle
);
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("admin"),
  articleController.deleteArticle
);

// Editor/Admin routes - Có thể publish và quản lý bài viết
router.post(
  "/:id/publish",
  verifyToken,
  authorizeRoles("admin"),
  articleController.publishArticle
);

router.post(
  "/:id/approve",
  verifyToken,
  authorizeRoles("admin", "expert"),
  articleController.approveArticle
);
router.patch(
  "/:id/status",
  verifyToken,
  authorizeRoles("admin"),
  articleController.changeArticleStatus
);
router.patch(
  "/:id/featured",
  verifyToken,
  authorizeRoles("admin"),
  articleController.toggleFeatured
);

export default router;
