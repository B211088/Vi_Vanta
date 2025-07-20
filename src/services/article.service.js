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

  async findRelatedArticlesByQuery(userQuestion, options = {}) {
    const {
      limit = 5,
      userId = null,
      minScore = 0.1,
      topics = null,
      excludeIds = [],
    } = options;

    try {
      console.log(
        `📚 Searching articles for query: "${userQuestion.slice(0, 50)}..."`
      );

      // Tạo search terms từ câu hỏi
      const searchTerms = this.extractSearchTerms(userQuestion);
      console.log(`🔍 Extracted search terms:`, searchTerms);

      const pipeline = [
        // 1. Text search với scoring
        {
          $match: {
            $and: [
              {
                $text: {
                  $search: searchTerms.join(" "),
                  $caseSensitive: false,
                  $diacriticSensitive: false,
                },
              },
              { status: "published" },
              ...(topics ? [{ topic: { $in: topics } }] : []),
              ...(excludeIds.length > 0 ? [{ _id: { $nin: excludeIds } }] : []),
            ],
          },
        },

        // 2. Add text score
        {
          $addFields: {
            textScore: { $meta: "textScore" },
          },
        },

        // 3. Add relevance scoring based on multiple factors
        {
          $addFields: {
            relevanceScore: {
              $add: [
                "$textScore",
                // Boost recent articles
                {
                  $cond: {
                    if: {
                      $gte: [
                        "$publishedAt",
                        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                      ],
                    },
                    then: 0.2,
                    else: 0,
                  },
                },
                // Boost featured articles
                {
                  $cond: {
                    if: "$isFeatured",
                    then: 0.3,
                    else: 0,
                  },
                },
                // Boost articles with more views (normalized)
                {
                  $multiply: [{ $divide: ["$views", 1000] }, 0.1],
                },
              ],
            },
          },
        },

        // 4. Filter by minimum score
        {
          $match: {
            relevanceScore: { $gte: minScore },
          },
        },

        // 5. Sort by relevance score
        {
          $sort: { relevanceScore: -1, publishedAt: -1 },
        },

        // 6. Limit results
        { $limit: limit },

        // 7. Populate and select fields
        {
          $lookup: {
            from: "users",
            localField: "author",
            foreignField: "_id",
            as: "author",
            pipeline: [{ $project: { fullName: 1, email: 1, avatar: 1 } }],
          },
        },
        {
          $lookup: {
            from: "topics",
            localField: "topic",
            foreignField: "_id",
            as: "topic",
            pipeline: [{ $project: { name: 1, slug: 1 } }],
          },
        },

        // 8. Format output
        {
          $project: {
            title: 1,
            slug: 1,
            summary: 1,
            thumbnail: 1,
            publishedAt: 1,
            views: 1,
            isFeatured: 1,
            author: { $arrayElemAt: ["$author", 0] },
            topic: { $arrayElemAt: ["$topic", 0] },
            relevanceScore: 1,
            textScore: 1,
          },
        },
      ];

      const articles = await Article.aggregate(pipeline);

      console.log(
        `📚 Found ${articles.length} related articles with scores:`,
        articles.map((a) => ({
          title: a.title.slice(0, 30),
          score: a.relevanceScore.toFixed(3),
        }))
      );

      return {
        articles,
        searchTerms,
        totalFound: articles.length,
      };
    } catch (error) {
      console.error("❌ Error finding related articles:", error);
      return {
        articles: [],
        searchTerms: [],
        totalFound: 0,
      };
    }
  }

  // Trích xuất từ khóa tìm kiếm từ câu hỏi
  extractSearchTerms(question) {
    // Loại bỏ stop words tiếng Việt và các từ không quan trọng
    const stopWords = [
      "là",
      "của",
      "và",
      "có",
      "được",
      "một",
      "không",
      "này",
      "đó",
      "khi",
      "với",
      "cho",
      "từ",
      "tôi",
      "bạn",
      "anh",
      "chị",
      "em",
      "bác",
      "sĩ",
      "làm",
      "thế",
      "nào",
      "như",
      "gì",
      "đâu",
      "bao",
      "nhiều",
      "nào",
      "ai",
      "sao",
      "the",
      "a",
      "an",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
      "what",
      "how",
      "why",
      "when",
      "where",
      "who",
    ];

    // Làm sạch và tách từ
    const words = question
      .toLowerCase()
      .replace(
        /[^\w\sàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/g,
        " "
      )
      .split(/\s+/)
      .filter(
        (word) =>
          word.length > 2 && !stopWords.includes(word) && !/^\d+$/.test(word) // Loại bỏ số
      );

    // Lấy các từ quan trọng (danh từ y tế, triệu chứng, bệnh)
    const medicalTerms = this.extractMedicalTerms(words);

    return [...new Set([...medicalTerms, ...words])].slice(0, 10);
  }

  // Trích xuất thuật ngữ y tế
  extractMedicalTerms(words) {
    const medicalKeywords = [
      "đau",
      "viêm",
      "nhiễm",
      "trùng",
      "khó",
      "thở",
      "ho",
      "sốt",
      "đỏ",
      "sưng",
      "bệnh",
      "triệu",
      "chứng",
      "điều",
      "trị",
      "thuốc",
      "vitamin",
      "kháng",
      "sinh",
      "tim",
      "phổi",
      "gan",
      "thận",
      "dạ",
      "dày",
      "ruột",
      "não",
      "xương",
      "khớp",
      "da",
      "mắt",
      "tai",
      "mũi",
      "họng",
      "răng",
      "miệng",
      "tử",
      "cung",
      "buồng",
      "trứng",
      "tiền",
      "liệt",
      "tuyến",
      "ung",
      "thư",
      "ký",
      "sinh",
      "chăm",
      "sóc",
    ];

    return words.filter((word) =>
      medicalKeywords.some(
        (keyword) => word.includes(keyword) || keyword.includes(word)
      )
    );
  }

  // Lấy bài viết được đề xuất cho người dùng
  async getRecommendedArticlesForUser(userId, userQuestion, options = {}) {
    const { limit = 3 } = options;

    try {
      // Nếu có userId, có thể lấy lịch sử đọc để cải thiện đề xuất
      // Hiện tại chỉ dựa vào câu hỏi
      const result = await this.findRelatedArticlesByQuery(userQuestion, {
        limit,
        userId,
        ...options,
      });

      return result;
    } catch (error) {
      console.error("❌ Error getting recommended articles:", error);
      return {
        articles: [],
        searchTerms: [],
        totalFound: 0,
      };
    }
  }
}

export default new ArticleService();
