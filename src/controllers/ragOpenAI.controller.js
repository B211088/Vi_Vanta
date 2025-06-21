import { v4 as uuidv4 } from "uuid";
import {
  MAX_TOKEN,
  OPENAI_API_KEY,
  TEMPERATURE,
} from "../config/openai.config.js";
import { getCollectionByIdHandle } from "../services/collection.service.js";
import fs from "fs";
import OpenAI from "openai";
import EmbedService from "../services/ragOpenAI.service.js";
import AIChatService from "../services/aiChat.service.js";
import chromadbService from "../services/chromadb.service.js";
import { getAIModelByIdHandle } from "../services/aiModel.service.js";

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
    const userId = req.user.userId;
    const payload = req.body;
    const { collectionId, description } = req.body;
    const file = req.file;
    const filePath = req.file.path;
    console.log({ file });
    const fileName = req.file.originalname;
    if (!collectionId) throw new Error("Thiếu collectionId");
    if (!payload || typeof payload !== "object")
      throw new Error("Payload không hợp lệ");

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
    // lấy collectiojn name
    const collection = await getCollectionByIdHandle(collectionId);
    // Index the file
    const count = await service.indexFile(
      documentId,
      filePath,
      fileName,
      collection.name
    );

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
    const { collectionId } = req.body;

    const collection = await getCollectionByIdHandle(collectionId);
    const documents = await service.listDocuments(collection.name);

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
 * Health check endpoint
 */
export async function healthCheck(req, res, next) {
  try {
    const { collectionId } = req.body;

    const collection = await getCollectionByIdHandle(collectionId);
    const stats = await service.getStats(collection.name);

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
export async function testingCollectionDataChatBot(req, res) {
  const userId = req.user.userId;
  try {
    const {
      collectionId,
      question,
      documentId,
      k = 5,
      sectionId,
      prompt,
      temperature,
      maxToken,
      modelId,
      similarityThreshold = 0.2, // Thêm ngưỡng similarity
    } = req.body;

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

    const collection = await getCollectionByIdHandle(collectionId);

    console.log(`🤔 Processing question: "${question}"`);

    // Get relevant documents using RAG
    const filters = documentId ? { documentId } : {};
    const similarDocs = await service.querySimilar(
      collection.name,
      question.trim(),
      Number(k),
      filters
    );

    const modelData = await getAIModelByIdHandle(modelId);

    // CẢI THIỆN: Kiểm tra cả số lượng và chất lượng kết quả
    if (!similarDocs.results || similarDocs.results.length === 0) {
      return res.json({
        success: false,
        data: {
          section: null,
          metadata: {
            documentId: documentId || "all",
            processedAt: new Date().toISOString(),
            model: modelData.name,
            reason: "no_results_found",
          },
          answer:
            "Xin lỗi, hiện tại hệ thống chưa có thông tin phù hợp để trả lời câu hỏi này. Chúng tôi sẽ cập nhật dữ liệu sớm nhất có thể.",
        },
      });
    }

    // THÊM MỚI: Lọc kết quả theo ngưỡng similarity
    const relevantDocs = similarDocs.results.filter((doc) => {
      const similarity = 1 - doc.distance; // Chuyển distance thành similarity score
      console.log(`📊 Similarity score for chunk: ${similarity.toFixed(3)}`);
      return similarity >= similarityThreshold;
    });

    // Kiểm tra xem có kết quả liên quan hay không
    if (relevantDocs.length === 0) {
      console.log(
        `⚠️ No relevant documents found. Highest similarity: ${(
          1 - Math.min(...similarDocs.results.map((doc) => doc.distance))
        ).toFixed(3)}`
      );

      return res.json({
        success: false,
        data: {
          section: null,
          metadata: {
            documentId: documentId || "all",
            processedAt: new Date().toISOString(),
            model: modelData.name,
            reason: "low_similarity",
            highestSimilarity: (
              1 - Math.min(...similarDocs.results.map((doc) => doc.distance))
            ).toFixed(3),
          },
          answer:
            "Xin lỗi, hiện tại hệ thống chưa có thông tin phù hợp để trả lời câu hỏi này. Dữ liệu hiện có không liên quan đến chủ đề bạn đang hỏi.",
        },
      });
    }

    // Sử dụng relevantDocs thay vì similarDocs.results
    const context = relevantDocs
      .map((doc, i) => {
        const similarity = (1 - doc.distance).toFixed(3);
        return `[Đoạn ${i + 1}] (Độ liên quan: ${similarity}): ${doc.content}`;
      })
      .join("\n\n");

    console.log({ context });
    console.log(`✅ Using ${relevantDocs.length} relevant documents`);

    // Lấy context từ section nếu có
    let conversationContext = "";
    if (sectionId) {
      const section = await chatService.getSectionById(sectionId);
      if (section?.conversationContext?.lastContext) {
        conversationContext = section.conversationContext.lastContext;
      }
    }

    // CẢI THIỆN: Prompt với hướng dẫn rõ ràng hơn
    const systemPrompt =
      prompt !== ""
        ? prompt
        : `Bạn là một bác sĩ chuyên khoa với kinh nghiệm lâm sàng. 
            QUAN TRỌNG: Chỉ trả lời dựa trên thông tin được cung cấp trong context. 
            Nếu thông tin không đủ để trả lời câu hỏi, hãy thẳng thắn nói rằng bạn không có đủ thông tin.
            Nếu không có thông tin đủ để trả lời thì đừng lấy context từ câu chuyện trước ra nói mà chỉ trả lời thẳng tháng là chưa có thông tin gì nên không thể trả lời
            Không bịa đặt hoặc suy đoán thông tin không có trong context.`;

    // Generate answer using OpenAI
    const completion = await openai.chat.completions.create({
      model: modelData ? modelData.name : "gpt-4o-mini-2024-07-18",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        ...(conversationContext
          ? [
              {
                role: "system",
                content: `Context từ cuộc trò chuyện trước: ${conversationContext}  `,
              },
            ]
          : []),
        {
          role: "user",
          content: `Dựa vào các đoạn thông tin sau đây (với độ liên quan đã được kiểm tra):

          ${context}

          Hãy trả lời câu hỏi sau một cách chi tiết dựa HOÀN TOÀN trên thông tin được cung cấp: "${question}"

          LƯU Ý: Nếu thông tin trên không đủ để trả lời đầy đủ câu hỏi, hãy nói rõ những phần nào bạn không có thông tin.`,
        },
      ],
      temperature: temperature || TEMPERATURE,
      max_tokens: maxToken || MAX_TOKEN,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    });

    const answer = completion.choices[0].message.content;

    // Tạo context cho cuộc trò chuyện
    const newContext = await generateConversationContext(question, answer);

    // Chuẩn bị context cho chat với thông tin similarity
    const chatContext = {
      documentIds: relevantDocs.map((doc) => doc.metadata.documentId),
      relevantChunks: relevantDocs.map((doc) => ({
        content: doc.content,
        metadata: doc.metadata,
        relevance: 1 - doc.distance,
        similarityScore: (1 - doc.distance).toFixed(3),
      })),
      additionalContext: {
        model: modelData ? modelData.name : "gpt-4o-mini-2024-07-18",
        processedAt: new Date().toISOString(),
        similarityThreshold: similarityThreshold,
        totalDocumentsFound: similarDocs.results.length,
        relevantDocumentsUsed: relevantDocs.length,
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
      success: true,
      data: {
        section,
        metadata: {
          documentId: documentId || "all",
          processedAt: new Date().toISOString(),
          model: modelData ? modelData.name : "gpt-4o-mini-2024-07-18",
          similarityThreshold: similarityThreshold,
          documentsAnalyzed: similarDocs.results.length,
          relevantDocumentsUsed: relevantDocs.length,
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

// Sửa lại controller
export async function deleteDocumentAndChunks(req, res) {
  try {
    const { collectionId } = req.params;
    const { documentIds } = req.body;

    console.log("🔍 Request details:", {
      collectionId,
      documentIds,
      documentIdsType: typeof documentIds,
      isArray: Array.isArray(documentIds),
    });

    const collection = await getCollectionByIdHandle(collectionId);
    console.log("📦 Collection:", {
      id: collection?.id,
      name: collection?.name,
    });

    if (!documentIds) {
      return res.status(400).json({
        error: "Missing document ID",
        message: "Document ID is required",
      });
    }

    // Kiểm tra và chuẩn hóa documentIds
    let processedIds;
    if (Array.isArray(documentIds)) {
      processedIds = documentIds;
    } else if (typeof documentIds === "string") {
      // Nếu là string, có thể là JSON string hoặc single ID
      try {
        processedIds = JSON.parse(documentIds);
        if (!Array.isArray(processedIds)) {
          processedIds = [documentIds];
        }
      } catch {
        processedIds = [documentIds];
      }
    } else {
      processedIds = [documentIds];
    }

    console.log("📋 Processed IDs:", processedIds);
    console.log(
      `🗑️ Deleting document(s) and chunks for IDs: ${JSON.stringify(
        processedIds
      )}`
    );

    // Trước khi delete, kiểm tra xem documents có tồn tại không
    try {
      const chromaCollection = await chromadbService.getCollection(
        collection.name
      );
      const existingDocs = await chromaCollection.get({ ids: processedIds });
      console.log(
        "🔍 Existing documents found:",
        existingDocs?.ids?.length || 0
      );
    } catch (checkError) {
      console.warn(
        "⚠️ Could not check existing documents:",
        checkError.message
      );
    }

    // Delete all chunks with this documentId
    const deleteData = await chromadbService.deleteDocuments(
      collection.name,
      processedIds
    );

    console.log("✅ Delete operation completed:", deleteData);

    res.json({
      success: true,
      message: `Successfully deleted document(s) and chunks: ${JSON.stringify(
        processedIds
      )}`,
      deleteData,
      deletedCount: processedIds.length,
      deletedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error deleting document:", {
      message: error.message,
      stack: error.stack,
      collectionId: req.params.collectionId,
      documentIds: req.body.documentIds,
    });

    res.status(500).json({
      error: "Delete failed",
      message: error.message || "An error occurred while deleting the document",
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}

export async function getAllCollections(req, res) {
  try {
    console.log(`📊 Getting collection statistics...`);

    const collections = await chromadbService.getAllCollections();

    res.json({
      success: true,
      message: `Successfully get all collections}`,
      collections,
    });
  } catch (error) {
    console.error("❌ Get  All Collectons Failer", error);
    res.status(500).json({
      error: "Delete failed",
      message:
        error.message || "An error occurred while get all the collections",
    });
  }
}
