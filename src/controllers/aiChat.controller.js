import AIChatService from "../services/aiChat.service.js";

const chatService = new AIChatService();

/**
 * Tạo một section chat mới
 */
export async function createSection(req, res) {
  try {
    const { title } = req.body;
    const userId = req.user.id; // Assuming user is attached by auth middleware

    if (!title) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "Title is required",
      });
    }

    const section = await chatService.createSection(userId, title);

    res.status(201).json({
      status: "success",
      data: section,
    });
  } catch (error) {
    console.error("Error in createSection:", error);
    res.status(500).json({
      error: "Failed to create section",
      message: error.message,
    });
  }
}

/**
 * Thêm tin nhắn mới vào section
 */
export async function addMessage(req, res) {
  try {
    const { sectionId } = req.params;
    const { role, content } = req.body;

    if (!role || !content) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "Role and content are required",
      });
    }

    const message = await chatService.addMessage(sectionId, role, content);

    res.status(201).json({
      status: "success",
      data: message,
    });
  } catch (error) {
    console.error("Error in addMessage:", error);
    res.status(500).json({
      error: "Failed to add message",
      message: error.message,
    });
  }
}

/**
 * Lấy thông tin chi tiết của một section
 */
export async function getSectionById(req, res) {
  try {
    const { sectionId } = req.params;
    const section = await chatService.getSectionByIdUserUse(sectionId);

    if (!section) {
      return res.status(404).json({
        error: "Section not found",
        message: `No section found with id: ${sectionId}`,
      });
    }

    res.json({
      status: "success",
      data: section,
    });
  } catch (error) {
    console.error("Error in getSectionById:", error);
    res.status(500).json({
      error: "Failed to get section",
      message: error.message,
    });
  }
}

/**
 * Lấy danh sách section của user
 */
export async function getUserSections(req, res) {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;

    const result = await chatService.getUserSections(
      userId,
      parseInt(page),
      parseInt(limit)
    );

    res.json({
      status: "success",
      data: result.sections,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error in getUserSections:", error);
    res.status(500).json({
      error: "Failed to get user sections",
      message: error.message,
    });
  }
}

/**
 * Tìm kiếm section
 */
export async function searchSections(req, res) {
  try {
    const userId = req.user.id;
    const { q: searchTerm } = req.query;
    const { page = 1, limit = 10 } = req.query;

    if (!searchTerm) {
      return res.status(400).json({
        error: "Missing search term",
        message: "Search term is required",
      });
    }

    const result = await chatService.searchSections(
      userId,
      searchTerm,
      parseInt(page),
      parseInt(limit)
    );

    res.json({
      status: "success",
      data: result.sections,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error in searchSections:", error);
    res.status(500).json({
      error: "Failed to search sections",
      message: error.message,
    });
  }
}

/**
 * Xóa một section
 */
export async function deleteSection(req, res) {
  try {
    const { sectionId } = req.params;
    const section = await chatService.deleteSection(sectionId);

    res.json({
      section,
      success: true,
      message: "Section deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteSection:", error);
    res.status(500).json({
      error: "Failed to delete section",
      message: error.message,
    });
  }
}

/**
 * Cập nhật context của section
 */
export async function updateSectionContext(req, res) {
  try {
    const { sectionId } = req.params;
    const { context } = req.body;

    if (!context) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "Context is required",
      });
    }

    const section = await chatService.updateSectionContext(sectionId, context);

    res.json({
      status: "success",
      data: section,
    });
  } catch (error) {
    console.error("Error in updateSectionContext:", error);
    res.status(500).json({
      error: "Failed to update section context",
      message: error.message,
    });
  }
}

export const getMessageBySectionId = async (req, res) => {
  try {
    const { sectionId } = req.params;
    if (sectionId) {
      res.status(500).json({
        error: "Không có sectionId",
        message: error.message,
      });
    }
    const messages = await chatService.getMessageBySectionId(sectionId);
    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    res.status(500).json({
      error: "Lỗi khi lấy messages",
      message: error.message,
    });
  }
};
