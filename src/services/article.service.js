import Article from "../models/article.model.js";
import { ApiError } from "../utils/ApiResponse.js";
import { generateSlug } from "../utils/slugUtils.js";

class ArticleService {
  // Tạo bài viết mới
  async createArticle(articleData, userId) {
    try {
      // Tạo slug từ title nếu chưa có
      if (!articleData.slug) {
        articleData.slug = await this.generateUniqueSlug(articleData.title);
      }

      const article = new Article({
        ...articleData,
        author: userId,
        createdBy: userId,
        updatedBy: userId,
      });

      await article.save();
      return await this.getArticleById(article._id);
    } catch (error) {
      if (error.code === 11000) {
        throw new ApiError(400, "Slug đã tồn tại");
      }
      throw error;
    }
  }

  // Lấy danh sách bài viết với phân trang và filter
  async getArticles(query = {}) {
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
    } = query;

    const filter = {};

    if (status) filter.status = status;
    if (author) filter.author = author;
    if (topic) filter.topic = topic;
    if (isFeatured !== undefined) filter.isFeatured = isFeatured;

    // Text search
    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (page - 1) * limit;
    const sortOptions = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    const [articles, total] = await Promise.all([
      Article.find(filter)
        .select("-sections -__v")
        .populate("author", "fullName email ")
        .populate("topic", "name slug")
        .populate("createdBy", "fullName  email")
        .populate("updatedBy", "fullName email")
        .populate("publishedBy", "fullName email")
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Article.countDocuments(filter),
    ]);

    return {
      articles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Lấy bài viết theo ID
  async getArticleById(id) {
    const article = await Article.findById(id)
      .populate("author", "fullName email ")
      .populate({
        path: "topic",
        select: "name slug parent",
        populate: {
          path: "parent",
          select: "name",
        },
      })
      .populate("createdBy", "fullName  email")
      .populate("updatedBy", "fullName email")
      .populate("publishedBy", "fullName email");

    if (!article) {
      throw new ApiError(404, "Không tìm thấy bài viết");
    }
    return article;
  }

  // Lấy bài viết theo slug
  async getArticleBySlug(slug) {
    const article = await Article.findOne({ slug })
      .populate("author", "fullName email avatar")
      .populate("topic", "name slug")
      .populate("createdBy", "fullName  email")
      .populate("updatedBy", "fullName email");

    if (!article) {
      throw new ApiError(404, "Không tìm thấy bài viết");
    }

    return article;
  }

  // Cập nhật bài viết
  async updateArticle(id, updateData, userId) {
    const article = await Article.findById(id);
    if (!article) {
      throw new ApiError(404, "Không tìm thấy bài viết");
    }

    // Tạo slug mới nếu title thay đổi
    if (updateData.title && updateData.title !== article.title) {
      updateData.slug = await this.generateUniqueSlug(updateData.title, id);
    }

    Object.assign(article, updateData, { updatedBy: userId });
    await article.save();

    return await this.getArticleById(id);
  }

  // Xóa bài viết
  async deleteArticle(id) {
    const article = await Article.findById(id);
    if (!article) {
      throw new ApiError(404, "Không tìm thấy bài viết");
    }

    await Article.findByIdAndDelete(id);
    return article;
  }

  // Publish bài viết
  async publishArticle(id, userId) {
    const article = await Article.findById(id);
    if (!article) {
      throw new ApiError(404, "Không tìm thấy bài viết");
    }

    article.status = "published";
    article.publishedAt = new Date();
    article.publishedBy = userId;
    await article.save();

    return await this.getArticleById(id);
  }

  async approveArticle(id, userId) {
    const article = await Article.findById(id);
    if (!article) {
      throw new ApiError(404, "Không tìm thấy bài viết");
    }

    article.status = "pending";
    await article.save();
    return await this.getArticleById(id);
  }

  // Tăng view count
  async incrementViews(id) {
    await Article.findByIdAndUpdate(id, { $inc: { views: 1 } });
  }

  // Lấy bài viết nổi bật
  async getFeaturedArticles(limit = 5) {
    return await Article.find({
      isFeatured: true,
      status: "published",
    })
      .select("-sections -__v")
      .populate("author", "fullName email avatar")
      .populate("topic", "name slug")
      .sort({ publishedAt: -1 })
      .limit(limit)
      .lean();
  }

  async getMostViewedArticles(limit = 5) {
    return await Article.find({
      status: "published",
    })
      .select("-sections -__v")
      .populate("author", "fullName email avatar")
      .populate("topic", "name slug")
      .sort({ views: -1 }) // Sắp xếp theo lượt xem giảm dần
      .limit(limit)
      .lean();
  }

  async getLatestArticles(limit = 5) {
    return await Article.find({
      status: "published",
    })
      .select("-sections -__v")
      .populate("author", "fullName email avatar")
      .populate("topic", "name slug")
      .sort({ publishedAt: -1 }) // Mới nhất
      .limit(limit)
      .lean();
  }

  async getArticlesByTopic(topicId, limit = 5) {
    return await Article.find({
      status: "published",
      topic: topicId,
    })
      .select("-sections -__v")
      .populate("author", "fullName email avatar")
      .populate("topic", "name slug")
      .sort({ publishedAt: -1 }) // Mới nhất
      .limit(limit)
      .lean();
  }

  // Lấy bài viết liên quan
  async getRelatedArticles(articleId, limit = 5) {
    // Lấy bài viết gốc để biết topic
    const article = await Article.findById(articleId).select("topic");
    if (!article) throw new ApiError(404, "Không tìm thấy bài viết gốc");

    return await Article.find({
      _id: { $ne: articleId },
      topic: article.topic,
      status: "published",
    })
      .select("-sections -__v")
      .populate("author", "fullName email avatar")
      .populate("topic", "name slug")
      .sort({ publishedAt: -1 })
      .limit(limit)
      .lean();
  }

  // Tạo slug unique
  async generateUniqueSlug(title, excludeId = null) {
    let baseSlug = generateSlug(title);
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const filter = { slug };
      if (excludeId) filter._id = { $ne: excludeId };

      const existingArticle = await Article.findOne(filter);
      if (!existingArticle) break;

      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  // Thống kê bài viết
  async getArticleStats() {
    const [totalArticles, publishedArticles, draftArticles, viewsStats] =
      await Promise.all([
        Article.countDocuments(),
        Article.countDocuments({ status: "published" }),
        Article.countDocuments({ status: "draft" }),
        Article.aggregate([
          { $group: { _id: null, totalViews: { $sum: "$views" } } },
        ]),
      ]);

    return {
      totalArticles,
      publishedArticles,
      draftArticles,
      totalViews: viewsStats[0]?.totalViews || 0,
    };
  }
}

export default new ArticleService();
