import { Message, Section } from "../models/index.js";

class AIChatService {
  /**
   * Tạo một section chat mới với tin nhắn đầu tiên
   */
  async createSection(userId, title) {
    const section = await Section.create({
      userId,
      title,
      messages: [],
      context: {
        documentIds: [],
        relevantChunks: [],
        additionalContext: new Map(),
      },
      conversationContext: {
        summary: "",
        keyPoints: [],
        lastContext: "",
        updatedAt: new Date(),
      },
    });
    return section;
  }

  /**
   * Khởi tạo cuộc trò chuyện mới với câu hỏi và câu trả lời đầu tiên
   */
  async initializeChat(
    userId,
    question,
    answer,
    context = {},
    conversationContext = {}
  ) {
    // Tạo section mới với tiêu đề là câu hỏi
    const section = await this.createSection(userId, question);

    const now = new Date();

    // Tạo message cho câu hỏi của user (timestamp trước)
    const userMessage = await Message.create({
      role: "user",
      content: question,
      timestamp: now,
    });

    // Tạo message cho câu trả lời của AI (timestamp sau 1ms)
    const aiMessage = await Message.create({
      role: "assistant",
      content: answer,
      timestamp: new Date(now.getTime() + 1), // +1ms để đảm bảo sau user message
    });

    // Thêm cả hai message vào section theo đúng thứ tự
    await Section.findByIdAndUpdate(section._id, {
      $push: {
        messages: {
          $each: [userMessage._id, aiMessage._id],
        },
      },
      context,
      conversationContext: {
        ...conversationContext,
        updatedAt: new Date(),
      },
    });

    // Trả về section đã populate messages với sort
    return await Section.findById(section._id).populate({
      path: "messages",
      options: { sort: { timestamp: 1 } },
    });
  }

  /**
   * Thêm tin nhắn mới vào section
   */
  async addMessage(sectionId, role, content) {
    const message = await Message.create({
      role,
      content,
      timestamp: new Date(),
    });

    await Section.findByIdAndUpdate(sectionId, {
      $push: { messages: message._id },
    });

    return message;
  }

  /**
   * Cập nhật context của section
   */
  async updateSectionContext(sectionId, context) {
    const section = await Section.findByIdAndUpdate(
      sectionId,
      { context },
      { new: true }
    );
    return section;
  }

  /**
   * Cập nhật conversation context của section
   */
  async updateConversationContext(sectionId, conversationContext) {
    const section = await Section.findByIdAndUpdate(
      sectionId,
      {
        conversationContext: {
          ...conversationContext,
          updatedAt: new Date(),
        },
      },
      { new: true }
    );
    return section;
  }

  async getSectionById(sectionId) {
    const section = await Section.findById(sectionId).populate({
      path: "messages",
      options: { sort: { timestamp: 1 } }, // Sort theo timestamp tăng dần
    });
    return section;
  }

  async getMessageBySectionId(sectionId) {
    try {
      const messages = await Message.find({ sectionId })
        .sort({ timestamp: 1 }) // hoặc createdAt: 1
        .exec();
      if (messages) {
        throw new Error("Không tìm thấy messages!");
      }
      return messages;
    } catch (error) {
      throw new Error("Lỗi khi lấy messages:", error);
    }
  }

  /**
   * Lấy section cho user - FIXED VERSION
   */
  async getSectionByIdUserUse(sectionId) {
    const section = await Section.findById(sectionId)
      .populate({
        path: "messages",
        options: { sort: { timestamp: 1 } }, // Sort theo timestamp tăng dần
      })
      .select("-__v -context ");
    return section;
  }

  /**
   * Lấy lịch sử chat với nhiều tùy chọn
   * @param {string} userId - ID của user
   * @param {Object} options - Các tùy chọn cho việc lấy lịch sử
   * @param {number} options.page - Trang hiện tại (default: 1)
   * @param {number} options.limit - Số lượng section trên mỗi trang (default: 10)
   * @param {Date} options.fromDate - Lấy từ ngày (optional)
   * @param {Date} options.toDate - Lấy đến ngày (optional)
   * @param {boolean} options.includeMessages - Có include messages không (default: true)
   * @param {boolean} options.includeContext - Có include context không (default: false)
   * @param {string} options.sortBy - Sắp xếp theo ('updatedAt', 'createdAt') (default: 'updatedAt')
   * @param {string} options.sortOrder - Thứ tự sắp xếp ('asc', 'desc') (default: 'desc')
   * @param {boolean} options.activeOnly - Chỉ lấy các section active (default: true)
   * @returns {Object} Kết quả chứa sections và thông tin phân trang
   */
  async getChatHistory(userId, options = {}) {
    const {
      page = 1,
      limit = 10,
      fromDate,
      toDate,
      includeMessages = true,
      includeContext = false,
      sortBy = "updatedAt",
      sortOrder = "desc",
      activeOnly = true,
    } = options;

    try {
      // Xây dựng query
      const query = { userId };

      // Thêm điều kiện active
      if (activeOnly) {
        query.isActive = true;
      }

      // Thêm điều kiện ngày tháng
      if (fromDate || toDate) {
        query[sortBy] = {};
        if (fromDate) {
          query[sortBy].$gte = new Date(fromDate);
        }
        if (toDate) {
          query[sortBy].$lte = new Date(toDate);
        }
      }

      // Xây dựng sort object
      const sortObject = {};
      sortObject[sortBy] = sortOrder === "desc" ? -1 : 1;

      // Xây dựng select fields
      let selectFields = "_id title createdAt updatedAt";
      if (!includeContext) {
        selectFields += " -context";
      }

      // Query cơ bản
      let sectionsQuery = Section.find(query)
        .sort(sortObject)
        .skip((page - 1) * limit)
        .limit(limit)
        .select(selectFields);

      // Populate messages nếu cần
      if (includeMessages) {
        sectionsQuery = sectionsQuery.populate({
          path: "messages",
          select: "role content timestamp",
          options: { sort: { timestamp: 1 } },
        });
      }

      // Thực hiện query
      const sections = await sectionsQuery.exec();

      // Đếm tổng số documents
      const total = await Section.countDocuments(query);

      // Tính toán thống kê
      const stats = await this._getChatHistoryStats(userId, query);

      return {
        success: true,
        data: {
          sections,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: page < Math.ceil(total / limit),
            hasPrev: page > 1,
          },
          stats,
          filters: {
            fromDate,
            toDate,
            includeMessages,
            includeContext,
            sortBy,
            sortOrder,
            activeOnly,
          },
        },
      };
    } catch (error) {
      console.error("Lỗi khi lấy chat history:", error);
      return {
        success: false,
        error: "Không thể lấy lịch sử chat",
        details: error.message,
      };
    }
  }

  /**
   * Lấy thống kê cho chat history
   * @private
   */
  async _getChatHistoryStats(userId, baseQuery) {
    try {
      const [totalSections, activeSections, totalMessages] = await Promise.all([
        Section.countDocuments({ userId }),
        Section.countDocuments({ userId, isActive: true }),
        Section.aggregate([
          { $match: { userId: mongoose.Types.ObjectId(userId) } },
          { $project: { messageCount: { $size: "$messages" } } },
          { $group: { _id: null, total: { $sum: "$messageCount" } } },
        ]),
      ]);

      // Lấy ngày của section đầu tiên và cuối cùng
      const [firstSection, lastSection] = await Promise.all([
        Section.findOne({ userId }).sort({ createdAt: 1 }).select("createdAt"),
        Section.findOne({ userId }).sort({ createdAt: -1 }).select("createdAt"),
      ]);

      return {
        totalSections,
        activeSections,
        inactiveSections: totalSections - activeSections,
        totalMessages: totalMessages[0]?.total || 0,
        firstChatDate: firstSection?.createdAt || null,
        lastChatDate: lastSection?.createdAt || null,
      };
    } catch (error) {
      console.error("Lỗi khi tính thống kê:", error);
      return {
        totalSections: 0,
        activeSections: 0,
        inactiveSections: 0,
        totalMessages: 0,
        firstChatDate: null,
        lastChatDate: null,
      };
    }
  }

  /**
   * Lấy lịch sử chat theo khoảng thời gian cụ thể
   */
  async getChatHistoryByDateRange(userId, startDate, endDate, options = {}) {
    return this.getChatHistory(userId, {
      ...options,
      fromDate: startDate,
      toDate: endDate,
    });
  }

  /**
   * Lấy các cuộc trò chuyện gần đây nhất
   */
  async getRecentChats(userId, limit = 5) {
    return this.getChatHistory(userId, {
      limit,
      page: 1,
      includeMessages: true,
      sortBy: "updatedAt",
      sortOrder: "desc",
    });
  }

  /**
   * Lấy danh sách section của user
   */
  async getUserSections(userId, page = 1, limit = 10) {
    const sections = await Section.find({ userId })
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("_id title");

    const total = await Section.countDocuments({ userId });

    return {
      sections,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Tìm kiếm section theo nội dung
   */
  async searchSections(userId, searchTerm, page = 1, limit = 10) {
    const query = {
      userId,
      $text: { $search: searchTerm },
    };

    const sections = await Section.find(query)
      .sort({ score: { $meta: "textScore" } })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("messages");

    const total = await Section.countDocuments(query);

    return {
      sections,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Xóa một section và tất cả messages liên quan
   */
  async deleteSection(sectionId) {
    const section = await Section.findById(sectionId).populate("messages");

    if (!section) {
      throw new Error("Section not found");
    }

    // Xóa tất cả messages
    await Message.deleteMany({ _id: { $in: section.messages } });

    // Xóa section
    await Section.findByIdAndDelete(sectionId);

    return true;
  }

  /**
   * Đánh dấu section là không hoạt động
   */
  async deactivateSection(sectionId) {
    const section = await Section.findByIdAndUpdate(
      sectionId,
      { isActive: false },
      { new: true }
    );
    return section;
  }

  async getconversationContextSectionById(sectionId) {
    try {
      const section = await Section.findById(sectionId).select(
        "conversationContext"
      );

      if (!section) {
        return {
          summary: "",
          keyPoints: [],
          lastContext: "",
          updatedAt: new Date(),
        };
      }

      return (
        section.conversationContext || {
          summary: "",
          keyPoints: [],
          lastContext: "",
          updatedAt: new Date(),
        }
      );
    } catch (error) {
      console.error("Lỗi khi lấy conversation context:", error);
      // Trả về default thay vì throw error để không làm crash app
      return {
        summary: "",
        keyPoints: [],
        lastContext: "",
        updatedAt: new Date(),
      };
    }
  }
}

export default AIChatService;
