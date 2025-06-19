// controllers/rag.controller.js
import EmbedService from "../services/ragOpenAI.service.js"; // Fixed import path
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import OpenAI from "openai";
import { OPENAI_API_KEY } from "../config/openai.config.js";
import AIChatService from "../services/aiChat.service.js";

// Initialize service once
const service = new EmbedService();
const chatService = new AIChatService();

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

/**
 * Upload and index a document
 */
export async function uploadAndIndex(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No file uploaded",
        message: "Please upload a file to index",
      });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;

    // Generate unique document ID
    const documentId = req.body.id || `doc_${uuidv4()}`;

    console.log(`Processing file: ${fileName} at ${filePath}`);
    console.log(`Document ID: ${documentId}`);

    // Validate file exists
    if (!fs.existsSync(filePath)) {
      return res.status(400).json({
        error: "File not found",
        message: "Uploaded file could not be located",
      });
    }

    // Index the file
    const count = await service.indexFile(documentId, filePath);

    // Clean up uploaded file after processing
    try {
      fs.unlinkSync(filePath);
      console.log(`Cleaned up temporary file: ${filePath}`);
    } catch (cleanupError) {
      console.warn(`Could not cleanup file ${filePath}:`, cleanupError.message);
    }

    res.json({
      status: "success",
      message: "Document indexed successfully",
      documentId: documentId,
      fileName: fileName,
      chunks: count,
      indexedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in uploadAndIndex:", error);

    // Clean up file if error occurs
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.warn(
          `Could not cleanup file after error:`,
          cleanupError.message
        );
      }
    }

    res.status(500).json({
      error: "Indexing failed",
      message: error.message || "An error occurred while indexing the document",
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}

/**
 * Query similar documents
 */
export async function queryDoc(req, res, next) {
  try {
    const { query, k = 5, filters = {} } = req.body;

    // Validate input
    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return res.status(400).json({
        error: "Invalid query",
        message: "Query must be a non-empty string",
      });
    }

    if (k < 1 || k > 50) {
      return res.status(400).json({
        error: "Invalid k value",
        message: "k must be between 1 and 50",
      });
    }

    console.log(`Querying: "${query}" with k=${k}`);

    // Perform similarity search
    const result = await service.querySimilar(
      query.trim(),
      parseInt(k),
      filters
    );

    res.json({
      status: "success",
      ...result,
      queriedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in queryDoc:", error);

    res.status(500).json({
      error: "Query failed",
      message: error.message || "An error occurred while querying documents",
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}

/**
 * Get collection statistics
 */
export async function getStats(req, res, next) {
  try {
    const stats = await service.getStats();

    res.json({
      status: "success",
      ...stats,
      retrievedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in getStats:", error);

    res.status(500).json({
      error: "Failed to get statistics",
      message: error.message || "An error occurred while retrieving statistics",
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}

/**
 * List all documents
 */
export async function listDocuments(req, res, next) {
  try {
    const documents = await service.listDocuments();

    res.json({
      status: "success",
      documents: documents,
      totalCount: documents.length,
      retrievedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in listDocuments:", error);

    res.status(500).json({
      error: "Failed to list documents",
      message: error.message || "An error occurred while listing documents",
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}

/**
 * Delete a document
 */
export async function deleteDocument(req, res, next) {
  try {
    const { documentId } = req.params;

    if (!documentId || documentId.trim().length === 0) {
      return res.status(400).json({
        error: "Invalid document ID",
        message: "Document ID is required",
      });
    }

    console.log(`Deleting document: ${documentId}`);

    const deleted = await service.deleteDocument(documentId.trim());

    if (deleted) {
      res.json({
        status: "success",
        message: "Document deleted successfully",
        documentId: documentId,
        deletedAt: new Date().toISOString(),
      });
    } else {
      res.status(404).json({
        error: "Document not found",
        message: `No document found with ID: ${documentId}`,
      });
    }
  } catch (error) {
    console.error("Error in deleteDocument:", error);

    res.status(500).json({
      error: "Delete failed",
      message: error.message || "An error occurred while deleting the document",
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}

/**
 * Health check endpoint
 */
export async function healthCheck(req, res, next) {
  try {
    // Test basic functionality
    const stats = await service.getStats();

    res.json({
      status: "healthy",
      service: "RAG Service",
      timestamp: new Date().toISOString(),
      stats: stats,
    });
  } catch (error) {
    console.error("Health check failed:", error);

    res.status(503).json({
      status: "unhealthy",
      service: "RAG Service",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}

async function generateConversationContext(question, answer) {
  // Gọi OpenAI để tạo context
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini-2024-07-18",
    messages: [
      {
        role: "system",
        content: `Là một trợ lý AI, nhiệm vụ của bạn là tóm tắt cuộc trò chuyện và trích xuất các điểm chính.
        Hãy phân tích câu hỏi và câu trả lời sau, sau đó:
        1. Tạo một tóm tắt ngắn gọn (2-3 câu)
        2. Liệt kê 2-3 điểm chính quan trọng nhất
        3. Tạo một context ngắn gọn cho câu hỏi tiếp theo
        
        Format phản hồi:
        {
          "summary": "tóm tắt ngắn gọn ở đây",
          "keyPoints": ["điểm 1", "điểm 2", "điểm 3"],
          "lastContext": "context cho câu hỏi tiếp theo"
        }`,
      },
      {
        role: "user",
        content: `Câu hỏi: ${question}\n\nCâu trả lời: ${answer}`,
      },
    ],
    temperature: 0.3,
    max_tokens: 500,
  });

  try {
    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error("Error parsing context generation response:", error);
    return {
      summary: "",
      keyPoints: [],
      lastContext: "",
    };
  }
}

/**
 * Ask a question and get AI-generated answer
 */
export async function askQuestion(req, res) {
  const userId = req.user.userId;
  try {
    const { question, documentId, k = 3, sectionId } = req.body;

    // Validate input
    if (
      !question ||
      typeof question !== "string" ||
      question.trim().length === 0
    ) {
      return res.status(400).json({
        error: "Invalid question",
        message: "Question must be a non-empty string",
      });
    }

    console.log(`🤔 Processing question: "${question}"`);

    // Get relevant documents using RAG
    const filters = documentId ? { documentId } : {};
    const similarDocs = await service.querySimilar(question.trim(), k, filters);

    if (!similarDocs.results || similarDocs.results.length === 0) {
      return res.status(404).json({
        error: "No relevant information found",
        message:
          "Could not find any relevant information to answer your question",
      });
    }

    // Prepare context from similar documents
    const context = similarDocs.results
      .map((doc, i) => `[Đoạn ${i + 1}]: ${doc.content}`)
      .join("\n\n");

    // Lấy context từ section nếu có
    let conversationContext = "";
    if (sectionId) {
      const section = await chatService.getSectionById(sectionId);
      if (section?.conversationContext?.lastContext) {
        conversationContext = section.conversationContext.lastContext;
      }
    }

    // Generate answer using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini-2024-07-18",
      messages: [
        {
          role: "system",
          content: `Bạn là một bác sĩ chuyên nghiệp với kiến thức sâu rộng về y học. Nhiệm vụ của bạn là cung cấp thông tin y tế toàn diện và đáng tin cậy.

          NGUYÊN TẮC TRẢ LỜI:
          1. Cấu trúc câu trả lời:
            - Mở đầu với định nghĩa hoặc tổng quan
            - Phân tích chi tiết từng khía cạnh
            - Kết luận và khuyến nghị (nếu có)

          2. Nội dung:
            - Giải thích chi tiết và đầy đủ
            - Đưa ra ví dụ cụ thể khi cần thiết
            - Giải thích các thuật ngữ y khoa bằng ngôn ngữ đơn giản
            - Nêu rõ mối liên hệ giữa các thông tin

          3. Độ tin cậy:
            - Chỉ sử dụng thông tin từ nguồn được cung cấp
            - Nêu rõ khi thiếu thông tin quan trọng
            - Từ chối trả lời các câu hỏi ngoài chuyên môn y tế

          4. Định dạng:
            - Sử dụng tiêu đề cho các phần chính
            - Dùng bullet points cho danh sách
            - Nhấn mạnh thông tin quan trọng
            - Tổ chức thành các đoạn văn rõ ràng`,
        },
        ...(conversationContext
          ? [
              {
                role: "system",
                content: `Context từ cuộc trò chuyện trước: ${conversationContext}`,
              },
            ]
          : []),
        {
          role: "user",
          content: `Dựa vào các đoạn thông tin sau đây:

          ${context}

          Hãy trả lời thật chi tiết và đầy đủ câu hỏi sau: "${question}"`,
        },
      ],
      temperature: 0.3,
      max_tokens: 4000,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    });

    const answer = completion.choices[0].message.content;

    // Tạo context cho cuộc trò chuyện
    const newContext = await generateConversationContext(question, answer);

    // Chuẩn bị context cho chat
    const chatContext = {
      documentIds: similarDocs.results.map((doc) => doc.metadata.documentId),
      relevantChunks: similarDocs.results.map((doc) => ({
        content: doc.content,
        metadata: doc.metadata,
        relevance: 1 - doc.distance,
      })),
      additionalContext: {
        model: "gpt-4o-mini-2024-07-18",
        processedAt: new Date().toISOString(),
      },
    };

    let section;
    if (sectionId) {
      // Thêm tin nhắn mới vào section hiện có
      await chatService.addMessage(sectionId, "user", question);
      const aiMessage = await chatService.addMessage(
        sectionId,
        "assistant",
        answer
      );

      // Cập nhật context với thông tin mới
      await chatService.updateSectionContext(sectionId, {
        ...chatContext,
        updatedAt: new Date().toISOString(),
      });

      // Cập nhật conversation context
      await chatService.updateConversationContext(sectionId, newContext);

      section = await chatService.getSectionById(sectionId);
    } else {
      // Tạo section mới cho cuộc trò chuyện mới
      section = await chatService.initializeChat(
        userId,
        question,
        answer,
        chatContext,
        newContext
      );
    }

    // Return response
    res.json({
      status: "success",
      data: {
        section,
        metadata: {
          documentId: documentId || "all",
          processedAt: new Date().toISOString(),
          model: "gpt-4o-mini-2024-07-18",
        },
      },
    });
  } catch (error) {
    console.error("❌ Error processing question:", error);
    res.status(500).json({
      error: "Question processing failed",
      message:
        error.message || "An error occurred while processing your question",
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}

/**
 * Delete a specific document and its chunks
 */
export async function deleteDocumentAndChunks(req, res) {
  try {
    const { documentId } = req.params;

    if (!documentId) {
      return res.status(400).json({
        error: "Missing document ID",
        message: "Document ID is required",
      });
    }

    console.log(`🗑️ Deleting document and chunks for ID: ${documentId}`);

    // Delete all chunks with this documentId
    await service.deleteDocumentsByFilter("documents", {
      documentId: documentId,
    });

    res.json({
      status: "success",
      message: `Successfully deleted document and its chunks: ${documentId}`,
      documentId: documentId,
      deletedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error deleting document:", error);
    res.status(500).json({
      error: "Delete failed",
      message: error.message || "An error occurred while deleting the document",
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}
