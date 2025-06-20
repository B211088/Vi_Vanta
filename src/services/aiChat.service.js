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

    // Tạo message cho câu hỏi của user
    const userMessage = await Message.create({
      role: "user",
      content: question,
      timestamp: new Date(),
    });

    // Tạo message cho câu trả lời của AI
    const aiMessage = await Message.create({
      role: "assistant",
      content: answer,
      timestamp: new Date(),
    });

    // Thêm cả hai message vào section và cập nhật context
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

    // Trả về section đã populate messages
    return await Section.findById(section._id).populate("messages");
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

  /**
   * Lấy chi tiết của một section
   */
  async getSectionById(sectionId) {
    const section = await Section.findById(sectionId).populate("messages");
    return section;
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
    await section.remove();

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
}

export default AIChatService;
