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
