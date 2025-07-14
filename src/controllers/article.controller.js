import articleService from "../services/article.service.js";
import { ApiError, ApiResponse } from "../utils/ApiResponse.js";
import {
  validateArticleData,
  validateArticleQuery,
} from "../utils/article.validation.js";
import { uploads } from "../utils/uploadImagesToCloud.js";

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

class ArticleController {
  // Tạo bài viết mới
  createArticle = asyncHandler(async (req, res) => {
    const { images, thumbnail: thumbnailFiles } = req.files;
    const userId = req.user.userId;

    console.log({
      images: images ? images.map((f) => f.originalname) : [],
      thumbnail: thumbnailFiles
        ? thumbnailFiles.map((f) => f.originalname)
        : [],
    });

    const thumbnailFile = thumbnailFiles?.[0];

    if (!thumbnailFile) {
      throw new ApiError(400, "Thiếu ảnh thumbnail");
    }

    const { sections: rawSections, ...otherFields } = req.body;

    // Upload thumbnail
    const uploadedThumb = await uploads(
      thumbnailFile,
      userId,
      "article_thumbnail"
    );
    const thumbnailData = {
      url: uploadedThumb.url,
      public_id: uploadedThumb.public_id,
    };

    // Parse sections
    let sections;
    try {
      sections =
        typeof rawSections === "string" ? JSON.parse(rawSections) : rawSections;

      if (!Array.isArray(sections) || sections.length === 0) {
        throw new ApiError(400, "Phải có ít nhất 1 section");
      }
    } catch (err) {
      throw new ApiError(400, `Xử lý section thất bại: ${err.message}`);
    }
    let sectionsData = [];
    // Upload section images + build sectionsData
    if (Array.isArray(images) && images.length > 0) {
      sectionsData = await Promise.all(
        sections.map(async (section, index) => {
          const file = images[index];
          let uploadedImage = {};
          if (file) {
            uploadedImage = await uploads(file, userId, "article_section");
          }

          return {
            heading: section.heading,
            content: section.content,
            image: {
              url: uploadedImage.url || "",
              public_id: uploadedImage.public_id || "",
              description: uploadedImage.url ? section.imageDescription : "",
            },
          };
        })
      );
    } else {
      // Nếu không có ảnh section, vẫn cần map sections để giữ heading + content
      sectionsData = sections.map((section) => ({
        heading: section.heading,
        content: section.content,
        image: {
          url: "",
          public_id: "",
          description: "",
        },
      }));
    }

    let { topic } = req.body;

    // Create article
    const article = await articleService.createArticle(
      {
        ...otherFields,
        thumbnail: thumbnailData,
        sections: sectionsData,
        topic: topic,
      },
      userId
    );

    res
      .status(201)
      .json(new ApiResponse(201, article, "Tạo bài viết thành công"));
  });

  // Lấy danh sách bài viết
  getArticles = asyncHandler(async (req, res) => {
    const {
      page = 1,
      limit = 10,
      status,
      author,
      topic,
      isFeatured,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;
    const result = await articleService.getArticles({
      page,
      limit,
      status,
      author,
      topic,
      isFeatured,
      search,
      sortBy,
      sortOrder,
    });

    res
      .status(200)
      .json(new ApiResponse(200, result, "Lấy danh sách bài viết thành công"));
  });

  // Lấy bài viết theo ID
  getArticleById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const article = await articleService.getArticleById(id);
    await articleService.incrementViews(article._id);
    res
      .status(200)
      .json(new ApiResponse(200, article, "Lấy bài viết thành công"));
  });

  // Lấy bài viết theo slug
  getArticleBySlug = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const article = await articleService.getArticleBySlug(slug);

    // Tăng view count (có thể thêm logic để tránh spam)
    await articleService.incrementViews(article._id);

    res
      .status(200)
      .json(new ApiResponse(200, article, "Lấy bài viết thành công"));
  });

  // Cập nhật bài viết
  updateArticle = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;
    const validation = validateArticleData(req.body, true); // partial update
    if (!validation.success) {
      throw new ApiError(400, "Dữ liệu không hợp lệ", validation.errors);
    }

    const existingArticle = await articleService.getArticleById(id);
    if (!existingArticle) {
      throw new ApiError(404, "Bài viết không tồn tại");
    }

    const { sections: rawSections, ...otherFields } = req.body;
    let sectionsData = existingArticle.sections;

    if (rawSections) {
      const sections =
        typeof rawSections === "string" ? JSON.parse(rawSections) : rawSections;

      if (!Array.isArray(sections)) {
        throw new ApiError(400, "Sections phải là mảng");
      }

      if (req.files && req.files.length !== sections.length) {
        throw new ApiError(400, "Số lượng ảnh phải bằng số lượng section");
      }

      // Xử lý section mới
      sectionsData = await Promise.all(
        sections.map(async (section, index) => {
          const file = req.files ? req.files[index] : null;

          let imageData = section.image || {};

          // Nếu có _id -> tìm section cũ
          const existingSection = existingArticle.sections.find(
            (sec) => sec._id.toString() === section._id
          );

          if (file) {
            // Nếu có ảnh mới -> xóa ảnh cũ nếu có
            if (
              existingSection &&
              existingSection.image &&
              existingSection.image.public_id
            ) {
              await deleteFromCloudinary(existingSection.image.public_id);
            }

            const uploadedImage = await uploads(
              file,
              userId,
              "article_section"
            );

            imageData = {
              url: uploadedImage.url,
              public_id: uploadedImage.public_id,
              description: section.imageDescription || "",
            };
          } else if (existingSection && existingSection.image) {
            // Không có ảnh mới, giữ ảnh cũ
            imageData = existingSection.image;
          }

          return {
            heading: section.heading,
            content: section.content,
            image: imageData,
          };
        })
      );
    }

    const updatedArticle = await articleService.updateArticle(
      id,
      { ...otherFields, sections: sectionsData },
      req.user.id
    );

    res
      .status(200)
      .json(
        new ApiResponse(200, updatedArticle, "Cập nhật bài viết thành công")
      );
  });

  // Xóa bài viết
  deleteArticle = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await articleService.deleteArticle(id);

    res
      .status(200)
      .json(new ApiResponse(200, result, "Xóa bài viết thành công"));
  });

  // Publish bài viết
  publishArticle = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;
    const article = await articleService.publishArticle(id, userId);

    res
      .status(200)
      .json(new ApiResponse(200, article, "Xuất bản bài viết thành công"));
  });

  approveArticle = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;
    const article = await articleService.approveArticle(id, userId);

    res
      .status(200)
      .json(new ApiResponse(200, article, "Xin duyệt bài viết thành công"));
  });
  // Lấy bài viết nổi bật
  getFeaturedArticles = asyncHandler(async (req, res) => {
    const { limit } = req.query;
    const articles = await articleService.getFeaturedArticles(limit);

    res
      .status(200)
      .json(new ApiResponse(200, articles, "Lấy bài viết nổi bật thành công"));
  });

  getMostViewedArticles = asyncHandler(async (req, res) => {
    const { limit } = req.query;
    const articles = await articleService.getMostViewedArticles(limit);

    res
      .status(200)
      .json(
        new ApiResponse(200, articles, "Lấy bài viết xem nhiều nhất thành công")
      );
  });

  getLatestArticles = asyncHandler(async (req, res) => {
    const { limit } = req.query;
    const limitNumber = parseInt(limit) || 5;

    const articles = await articleService.getLatestArticles(limitNumber);

    res
      .status(200)
      .json(new ApiResponse(200, articles, "Lấy bài viết mới nhất thành công"));
  });

  // Lấy bài viết liên quan
  getRelatedArticles = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 5;

    const relatedArticles = await articleService.getRelatedArticles(id, limit);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          relatedArticles,
          "Lấy bài viết liên quan thành công"
        )
      );
  });

  // Thống kê bài viết
  getArticleStats = asyncHandler(async (req, res) => {
    const stats = await articleService.getArticleStats();

    res
      .status(200)
      .json(new ApiResponse(200, stats, "Lấy thống kê bài viết thành công"));
  });

  // Tìm kiếm bài viết
  searchArticles = asyncHandler(async (req, res) => {
    const { q: search, ...otherQuery } = req.query;
    const result = await articleService.getArticles({
      search,
      ...otherQuery,
      status: "published", // Chỉ tìm trong bài viết đã publish
    });

    res
      .status(200)
      .json(new ApiResponse(200, result, "Tìm kiếm bài viết thành công"));
  });

  // Lấy bài viết theo author
  getArticlesByAuthor = asyncHandler(async (req, res) => {
    const { authorId } = req.params;
    const result = await articleService.getArticles({
      author: authorId,
      status: "published",
      ...req.query,
    });

    res
      .status(200)
      .json(
        new ApiResponse(200, result, "Lấy bài viết theo tác giả thành công")
      );
  });

  getArticlesByTopic = asyncHandler(async (req, res) => {
    const { limit } = req.query;
    const { topicId } = req.params;

    const result = await articleService.getArticlesByTopic(topicId, limit);

    res
      .status(200)
      .json(
        new ApiResponse(200, result, "Lấy bài viết theo chủ đề thành công")
      );
  });

  // Thay đổi trạng thái bài viết
  changeArticleStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (
      !["draft", "pending", "published", "archived", "rejected"].includes(
        status
      )
    ) {
      throw new ApiError(400, "Trạng thái không hợp lệ");
    }

    const updateData = { status };
    if (status === "published") {
      updateData.publishedAt = new Date();
    }

    const article = await articleService.updateArticle(
      id,
      updateData,
      req.user.id
    );

    res
      .status(200)
      .json(
        new ApiResponse(200, article, "Thay đổi trạng thái bài viết thành công")
      );
  });

  // Toggle featured status
  toggleFeatured = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const article = await articleService.getArticleById(id);

    const updatedArticle = await articleService.updateArticle(
      id,
      { isFeatured: !article.isFeatured },
      req.user.id
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedArticle,
          "Cập nhật trạng thái nổi bật thành công"
        )
      );
  });
}

export default new ArticleController();
