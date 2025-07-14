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
    const now = new Date();
    const userMessage = { role: "user", content: question, timestamp: now };
    const aiMessage = {
      role: "assistant",
      content: answer,
      timestamp: new Date(now.getTime() + 1),
    };
    const messages = await Message.insertMany([userMessage, aiMessage]);

    const section = await Section.create({
      userId,
      title: question,
      messages: messages.map((m) => m._id),
      context,
      conversationContext: { ...conversationContext, updatedAt: new Date() },
    });

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
        .sort({ timestamp: 1 })
        .exec();
      if (!messages || messages.length === 0) {
        throw new Error("Không tìm thấy messages!");
      }
      return messages;
    } catch (error) {
      throw new Error(`Lỗi khi lấy messages: ${error.message}`);
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
    const [stats] = await Section.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalSections: { $sum: 1 },
          activeSections: {
            $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
          },
          totalMessages: { $sum: { $size: "$messages" } },
          firstChatDate: { $min: "$createdAt" },
          lastChatDate: { $max: "$createdAt" },
        },
      },
    ]);
    return {
      totalSections: stats?.totalSections || 0,
      activeSections: stats?.activeSections || 0,
      inactiveSections:
        (stats?.totalSections || 0) - (stats?.activeSections || 0),
      totalMessages: stats?.totalMessages || 0,
      firstChatDate: stats?.firstChatDate || null,
      lastChatDate: stats?.lastChatDate || null,
    };
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
