import { v4 as uuidv4 } from "uuid";
import {
  CONTEXT_HISTORY_LIMIT,
  DEFAULT_K,
  DEFAULT_MAX_TOKEN,
  DEFAULT_MODEL,
  DEFAULT_SIMILARITY_THRESHOLD,
  DEFAULT_TEMPERATURE,
  OPENAI_API_KEY,
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

// Cache để lưu trữ kết quả tạm thời
const contextCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 phút

// Utility function để tạo cache key
function createCacheKey(sectionId, limit) {
  return `${sectionId}_${limit}`;
}

async function generateConversationContext(question, answer) {
  // Tối ưu: Giảm max_tokens và temperature để tăng tốc
  const completion = await openai.chat.completions.create({
    model: DEFAULT_MODEL,
    messages: [
      {
        role: "system",
        content: `Tóm tắt cuộc trò chuyện và trích xuất điểm chính:
        1. Ý chính cuộc trò chuyện
        2. Tóm tắt ngắn gọn (2-3 câu)
        3. 2-3 điểm chính
        4. Context cho câu hỏi tiếp theo
        
        Format JSON:
        {"summary": "...", "keyPoints": ["..."], "lastContext": "..."}`,
      },
      {
        role: "user",
        content: `Q: ${question}\nA: ${answer}`,
      },
    ],
    temperature: 0.1, // Giảm từ 0.3 xuống 0.1 để tăng tốc
    max_tokens: 300, // Giảm từ 500 xuống 300
  });

  try {
    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error("Error parsing context:", error);
    return { summary: "", keyPoints: [], lastContext: "" };
  }
}

/**
 * Optimized conversation context builder với caching
 */
async function buildConversationContext(
  sectionId,
  limit = CONTEXT_HISTORY_LIMIT
) {
  if (!sectionId) return "";

  const cacheKey = createCacheKey(sectionId, limit);
  const cached = contextCache.get(cacheKey);

  // Kiểm tra cache
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log("📋 Using cached conversation context");
    return cached.data;
  }

  try {
    const chatHistory = await chatService.getChatHistory(sectionId, limit);

    if (!chatHistory?.length) return "";

    // Tối ưu: Xử lý song song và giảm độ phức tạp
    const contextMessages = chatHistory
      .slice(-limit)
      .map((msg) => `${msg.role === "user" ? "U" : "A"}: ${msg.content}`)
      .join("\n");

    let result = contextMessages;

    // Chỉ tóm tắt nếu thực sự cần thiết (> 1500 chars thay vì 1000)
    if (contextMessages.length > 1500) {
      const summaryCompletion = await openai.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: "system",
            content: `Tóm tắt cuộc trò chuyện thành context ngắn gọn (<200 từ):
            1. Chủ đề chính
            2. Thông tin quan trọng
            3. Vấn đề chưa giải quyết`,
          },
          { role: "user", content: contextMessages },
        ],
        temperature: 0.1, // Giảm temperature
        max_tokens: 250, // Giảm max_tokens
      });

      result = summaryCompletion.choices[0].message.content;
    }

    // Lưu vào cache
    contextCache.set(cacheKey, {
      data: result,
      timestamp: Date.now(),
    });

    return result;
  } catch (error) {
    console.error("Error building context:", error);
    return "";
  }
}

// Tối ưu simplifyQuery với caching
const queryCache = new Map();

export const simplifyQuery = async (userQuestion, context = "") => {
  const cacheKey = `${userQuestion}_${context}`.substring(0, 100);
  const cached = queryCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const completion = await openai.chat.completions.create({
    model: DEFAULT_MODEL,
    messages: [
      {
        role: "system",
        content: `Chuyên gia y tế hỗ trợ truy vấn. Context: ${context}
        Chuyển đổi câu hỏi thành mô tả cụ thể về tình trạng sức khỏe.
        Tập trung vào triệu chứng cụ thể, tránh từ chung chung.`,
      },
      { role: "user", content: userQuestion },
    ],
    temperature: 0.3,
    max_tokens: 200, // Giảm từ 300 xuống 200
  });

  const result = completion.choices[0].message.content;

  // Cache kết quả
  queryCache.set(cacheKey, {
    data: result,
    timestamp: Date.now(),
  });

  return result;
};

/**
 * Tối ưu processSimilarityResults - không thay đổi logic
 */
function processSimilarityResults(similarDocs, similarityThreshold) {
  if (!similarDocs?.results?.length) {
    return {
      success: false,
      relevantDocs: [],
      reason: "no_results_found",
      message:
        "Xin lỗi, hiện tại hệ thống chưa có thông tin phù hợp để trả lời câu hỏi này.",
    };
  }

  // Tối ưu: Tính toán song song với map
  const relevantDocs = similarDocs.results.filter((doc) => {
    const similarity = 1 - doc.distance;
    return similarity >= similarityThreshold;
  });

  if (!relevantDocs.length) {
    const highestSimilarity =
      1 - Math.min(...similarDocs.results.map((doc) => doc.distance));

    return {
      success: false,
      relevantDocs: [],
      reason: "low_similarity",
      highestSimilarity: highestSimilarity.toFixed(3),
      message:
        "Xin lỗi, hiện tại hệ thống chưa có thông tin phù hợp để trả lời câu hỏi này.",
    };
  }

  return {
    success: true,
    relevantDocs,
    totalFound: similarDocs.results.length,
    relevantCount: relevantDocs.length,
  };
}

/**
 * Tối ưu buildDocumentContext
 */
function buildDocumentContext(relevantDocs) {
  // Tối ưu: Sử dụng map với template literals
  return relevantDocs
    .map(
      (doc, i) =>
        `[${i + 1}] (${(1 - doc.distance).toFixed(3)}): ${doc.content}`
    )
    .join("\n\n");
}

/**
 * Tối ưu generateAIResponse
 */
async function generateAIResponse({
  question,
  documentContext,
  conversationContext,
  systemPrompt,
  modelData,
  temperature,
  maxToken,
}) {
  const messages = [{ role: "system", content: systemPrompt }];

  // Tối ưu: Chỉ thêm context nếu có và không trống
  if (conversationContext?.trim()) {
    messages.push({
      role: "system",
      content: `Context: ${conversationContext}`,
    });
  }

  messages.push({
    role: "user",
    content: `Thông tin tham khảo:
${documentContext}

Câu hỏi: "${question}"

Trả lời dựa trên thông tin trên. Nếu không đủ thông tin, hãy nói thẳng.`,
  });

  const completion = await openai.chat.completions.create({
    model: modelData?.name || DEFAULT_MODEL,
    messages,
    temperature: temperature || 0.3,
    max_tokens: maxToken || DEFAULT_MAX_TOKEN,
    presence_penalty: 0.1,
    frequency_penalty: 0.1,
  });

  return completion.choices[0].message.content;
}

/**
 * Main optimized chatbot function
 */
export async function testingCollectionDataChatBot(req, res) {
  const userId = req.user.userId;
  const startTime = Date.now();

  try {
    const {
      collectionId,
      question,
      documentId,
      k = DEFAULT_K,
      sectionId,
      prompt = "",
      temperature,
      maxToken,
      modelId,
      similarityThreshold = DEFAULT_SIMILARITY_THRESHOLD,
    } = req.body;

    // Validation nhanh
    if (!question?.trim()) {
      return res.status(400).json({
        error: "Invalid question",
        message: "Question must be a non-empty string",
      });
    }

    if (!collectionId?.trim()) {
      return res.status(400).json({
        error: "Invalid collectionId",
        message: "collectionId must be a non-empty string",
      });
    }

    console.log(`🤔 Processing: "${question}" (${Date.now() - startTime}ms)`);

    // Tối ưu: Thực hiện các tác vụ song song
    const [collection, modelData, contextData] = await Promise.all([
      getCollectionByIdHandle(collectionId),
      modelId ? getAIModelByIdHandle(modelId) : null,
      sectionId
        ? chatService.getconversationContextSectionById(sectionId)
        : null,
    ]);

    if (!collection) {
      return res.status(404).json({
        error: "Collection not found",
        message: `No collection found for collectionId: ${collectionId}`,
      });
    }

    const queryConversationContext = contextData?.lastContext || "";

    // Song song: Simplify query và build conversation context
    const [questionSimify, conversationContext] = await Promise.all([
      simplifyQuery(question.trim(), queryConversationContext),
      buildConversationContext(sectionId),
    ]);

    console.log(`📝 Context prepared (${Date.now() - startTime}ms)`);

    // Query documents
    const filters = documentId ? { documentId } : {};
    const similarDocs = await service.querySimilar(
      collection.name,
      questionSimify,
      Number(k),
      filters
    );

    const similarityResult = processSimilarityResults(
      similarDocs,
      similarityThreshold
    );

    if (!similarityResult.success) {
      return res.json({
        success: false,
        data: {
          section: null,
          metadata: {
            documentId: documentId || "all",
            processedAt: new Date().toISOString(),
            model: modelData?.name || DEFAULT_MODEL,
            reason: similarityResult.reason,
            processingTime: Date.now() - startTime,
            ...(similarityResult.highestSimilarity && {
              highestSimilarity: similarityResult.highestSimilarity,
            }),
          },
          answer: similarityResult.message,
        },
      });
    }

    const { relevantDocs, totalFound, relevantCount } = similarityResult;
    const documentContext = buildDocumentContext(relevantDocs);

    console.log(`✅ Documents processed (${Date.now() - startTime}ms)`);

    const systemPrompt =
      prompt ||
      `Bạn là bác sĩ chuyên khoa. 
    Chỉ trả lời dựa trên thông tin được cung cấp.
    Sử dụng context cuộc trò chuyện để đưa ra câu trả lời liên kết.
    Nếu thiếu thông tin, hãy nói thẳng.`;

    // Generate AI response
    const answer = await generateAIResponse({
      question,
      documentContext,
      conversationContext,
      systemPrompt,
      modelData,
      temperature,
      maxToken,
    });

    console.log(`🤖 AI response generated (${Date.now() - startTime}ms)`);

    // Song song: Generate context và prepare chat context
    const [newContext] = await Promise.all([
      generateConversationContext(question, answer),
    ]);

    const chatContext = {
      documentIds: relevantDocs.map((doc) => doc.metadata.documentId),
      relevantChunks: relevantDocs.map((doc) => ({
        content: doc.content,
        metadata: doc.metadata,
        relevance: 1 - doc.distance,
        similarityScore: (1 - doc.distance).toFixed(3),
      })),
      additionalContext: {
        model: modelData?.name || DEFAULT_MODEL,
        processedAt: new Date().toISOString(),
        similarityThreshold,
        totalDocumentsFound: totalFound,
        relevantDocumentsUsed: relevantCount,
        conversationContextUsed: conversationContext.length > 0,
        processingTime: Date.now() - startTime,
      },
    };

    let section;
    if (sectionId) {
      // Tuần tự để đảm bảo thứ tự message
      await chatService.addMessage(sectionId, "user", question);
      await chatService.addMessage(sectionId, "assistant", answer);

      // Song song: Update contexts
      const [updatedSection] = await Promise.all([
        chatService.getSectionById(sectionId),
        chatService.updateSectionContext(sectionId, {
          ...chatContext,
          updatedAt: new Date().toISOString(),
        }),
        chatService.updateConversationContext(sectionId, newContext),
      ]);

      section = updatedSection;
    } else {
      section = await chatService.initializeChat(
        userId,
        question,
        answer,
        chatContext,
        newContext
      );
    }

    console.log(`✨ Completed (${Date.now() - startTime}ms)`);

    // Clear old cache entries periodically
    if (Math.random() < 0.1) {
      // 10% chance
      clearExpiredCache();
    }

    res.json({
      success: true,
      data: {
        section,
        answer: {
          _id: uuidv4(),
          role: "assistant",
          content: answer,
          timestamp: new Date().toISOString(),
        },
        metadata: {
          documentId: documentId || "all",
          processedAt: new Date().toISOString(),
          model: modelData?.name || DEFAULT_MODEL,
          similarityThreshold,
          documentsAnalyzed: totalFound,
          relevantDocumentsUsed: relevantCount,
          conversationContextUsed: conversationContext.length > 0,
          conversationContextLength: conversationContext.length,
          processingTime: Date.now() - startTime,
        },
      },
    });
  } catch (error) {
    console.error(`❌ Error (${Date.now() - startTime}ms):`, error);

    res.status(500).json({
      error: "Question processing failed",
      message:
        error.message || "An error occurred while processing your question",
      processingTime: Date.now() - startTime,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}

// Utility function để clear expired cache
function clearExpiredCache() {
  const now = Date.now();
  for (const [key, value] of contextCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      contextCache.delete(key);
    }
  }
  for (const [key, value] of queryCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      queryCache.delete(key);
    }
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

    // Xóa tất cả các chunk cùng với documents ids
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
    const { collectionId, source } = req.body;
    const filePath = req.file.path;

    const fileName = req.file.originalname;
    if (!collectionId) throw new Error("Thiếu collectionId");
    if (!payload || typeof payload !== "object")
      throw new Error("Payload không hợp lệ");

    const documentId = req.body.id || `doc_${uuidv4()}`;

    console.log(`Processing file: ${fileName} at ${filePath}`);
    console.log(`Document ID: ${documentId}`);

    // Validate file tồn tại
    if (!fs.existsSync(filePath)) {
      return res.status(400).json({
        error: "File not found",
        message: "Uploaded file could not be located",
      });
    }
    // lấy collectiojn name
    const collection = await getCollectionByIdHandle(collectionId);
    // Index file
    const count = await service.indexFile(
      documentId,
      filePath,
      fileName,
      collection.name,
      userId,
      source
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
      document: {
        documentId: documentId,
        fileName: fileName,
        chunks: count,
        indexedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error in uploadAndIndex:", error);

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
