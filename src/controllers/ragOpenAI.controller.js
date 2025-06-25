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
    model: DEFAULT_MODEL,
    messages: [
      {
        role: "system",
        content: `Là một trợ lý AI, nhiệm vụ của bạn là tóm tắt cuộc trò chuyện và trích xuất các điểm chính.
        Hãy phân tích câu hỏi và câu trả lời sau, sau đó:
        1. Hãy ghi lại ý chính của cuộc trò chuyện người dùng và chat bot đang bàn luận về vấn đề gì
        2. Tạo một tóm tắt ngắn gọn (2-3 câu)
        3. Liệt kê 2-3 điểm chính quan trọng nhất
        4. Tạo một context ngắn gọn cho câu hỏi tiếp theo
        
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
 * Build comprehensive conversation context from chat history
 */
async function buildConversationContext(
  sectionId,
  limit = CONTEXT_HISTORY_LIMIT
) {
  if (!sectionId) return "";

  try {
    // Lấy lịch sử chat gần nhất
    const chatHistory = await chatService.getChatHistory(sectionId, limit);

    if (!chatHistory || chatHistory.length === 0) {
      return "";
    }

    // Tạo context từ lịch sử chat
    const contextMessages = chatHistory
      .slice(-limit) // Lấy N tin nhắn gần nhất
      .map((msg, index) => {
        const role = msg.role === "user" ? "Người dùng" : "Trợ lý";
        return `${role}: ${msg.content}`;
      })
      .join("\n");

    // Tóm tắt context nếu quá dài
    if (contextMessages.length > 1000) {
      const summaryCompletion = await openai.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: "system",
            content: `Hãy tóm tắt cuộc trò chuyện sau thành một đoạn context ngắn gọn (tối đa 200 từ) 
            để giúp hiểu bối cảnh cho câu hỏi tiếp theo. Tập trung vào:
            1. Chủ đề chính đang được thảo luận
            2. Thông tin quan trọng đã được đề cập
            3. Câu hỏi hoặc vấn đề chưa được giải quyết hoàn toàn`,
          },
          {
            role: "user",
            content: `Cuộc trò chuyện:\n${contextMessages}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 300,
      });

      return summaryCompletion.choices[0].message.content;
    }

    return contextMessages;
  } catch (error) {
    console.error("Error building conversation context:", error);
    return "";
  }
}
export const simplifyQuery = async (userQuestion, context = "") => {
  const completion = await openai.chat.completions.create({
    model: DEFAULT_MODEL,
    messages: [
      {
        role: "system",
        content: `Bạn là một chuyên gia y tế đang hỗ trợ hệ thống truy vấn kiến thức. 
          Đây là bối cảnh cuộc trò chuyện giữa người dùng và hệ thống: ${context}
          Nếu có bối cảnh thì hãy tạo mô tả theo bối cảnh trò chuyện, 
          Nếu không có bối cảnh thì đây là cuộc trò chuyện mới và cứ xây dựng bối cảnh theo câu hỏi
          Nhiệm vụ của bạn là: 
          1. Nhận câu hỏi từ người dùng có thể mơ hồ, trừu tượng, có thể sai chính tả.
          2. Chuyển đổi nó thành một đoạn văn mô tả cụ thể về tình trạng sức khỏe, để hệ thống vector database có thể tìm kiếm chính xác hơn.
          3. Hạn chế dùng từ chung chung, hãy viết như đang mô tả triệu chứng để bác sĩ dễ hiểu.`,
      },
      {
        role: "user",
        content: userQuestion,
      },
    ],
    temperature: 0.5,
    max_tokens: 300,
  });

  return completion.choices[0].message.content;
};

/**
 * Validate and process similarity results
 */
function processSimilarityResults(similarDocs, similarityThreshold) {
  if (!similarDocs?.results || similarDocs.results.length === 0) {
    return {
      success: false,
      relevantDocs: [],
      reason: "no_results_found",
      message:
        "Xin lỗi, hiện tại hệ thống chưa có thông tin phù hợp để trả lời câu hỏi này.",
    };
  }

  // Lọc kết quả theo ngưỡng similarity
  const relevantDocs = similarDocs.results.filter((doc) => {
    const similarity = 1 - doc.distance;
    console.log(`📊 Similarity score for chunk: ${similarity.toFixed(3)}`);
    return similarity >= similarityThreshold;
  });

  if (relevantDocs.length === 0) {
    const highestSimilarity =
      1 - Math.min(...similarDocs.results.map((doc) => doc.distance));
    console.log(
      `⚠️ No relevant documents found. Highest similarity: ${highestSimilarity.toFixed(
        3
      )}`
    );

    return {
      success: false,
      relevantDocs: [],
      reason: "low_similarity",
      highestSimilarity: highestSimilarity.toFixed(3),
      message:
        "Xin lỗi, hiện tại hệ thống chưa có thông tin phù hợp để trả lời câu hỏi này. Dữ liệu hiện có không liên quan đến chủ đề bạn đang hỏi.",
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
 * Build context string from relevant documents
 */
function buildDocumentContext(relevantDocs) {
  return relevantDocs
    .map((doc, i) => {
      const similarity = (1 - doc.distance).toFixed(3);
      return `[Đoạn ${i + 1}] (Độ liên quan: ${similarity}): ${doc.content}`;
    })
    .join("\n\n");
}

/**
 * Generate AI response using OpenAI
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
  const messages = [
    {
      role: "system",
      content: systemPrompt,
    },
  ];

  // Thêm context từ cuộc trò chuyện trước nếu có
  if (conversationContext) {
    messages.push({
      role: "system",
      content: `Context từ cuộc trò chuyện trước:\n${conversationContext}`,
    });
  }

  // Thêm câu hỏi và context tài liệu
  messages.push({
    role: "user",
    content: `Dựa vào các đoạn thông tin sau đây (với độ liên quan đã được kiểm tra):

    ${documentContext}

    Hãy trả lời câu hỏi sau một cách chi tiết dựa HOÀN TOÀN trên thông tin được cung cấp: "${question}"

    LƯU Ý: 
    - Nếu thông tin trên không đủ để trả lời đầy đủ câu hỏi. thì hãy thẳng thắng nói rằng hệ thống không có đủ thông tin đó.
    - Kết hợp với context từ cuộc trò chuyện trước để đưa ra câu trả lời phù hợp và liên kết.`,
  });

  const completion = await openai.chat.completions.create({
    model: modelData?.name || DEFAULT_MODEL,
    messages,
    temperature: temperature || DEFAULT_TEMPERATURE,
    max_tokens: maxToken || DEFAULT_MAX_TOKEN,
    presence_penalty: 0.1,
    frequency_penalty: 0.1,
  });

  return completion.choices[0].message.content;
}

/**
 * Main chat bot function - refactored version
 */
export async function testingCollectionDataChatBot(req, res) {
  const userId = req.user.userId;

  try {
    // Extract and validate parameters
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

    console.log({ sectionId });
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
    console.log(
      `📊 Parameters: k=${k}, threshold=${similarityThreshold}, model=${modelId}`
    );

    if (
      !collectionId ||
      typeof collectionId !== "string" ||
      collectionId.trim().length === 0
    ) {
      return res.status(400).json({
        error: "Invalid collectionId",
        message: "collectionId must be a non-empty string",
      });
    }

    const [collection, modelData] = await Promise.all([
      getCollectionByIdHandle(collectionId),
      modelId ? getAIModelByIdHandle(modelId) : Promise.resolve(null),
    ]);

    if (!collection) {
      return res.status(404).json({
        error: "Collection not found",
        message: `No collection found for collectionId: ${collectionId}`,
      });
    }

    const filters = documentId ? { documentId } : {};
    let queryConversationContext = "";

    if (sectionId) {
      const contextData = await chatService.getconversationContextSectionById(
        sectionId
      );
      queryConversationContext = contextData.lastContext || "";
      console.log("📝 Last context:", queryConversationContext);
    }

    const questionSimify = await simplifyQuery(
      question.trim(),
      queryConversationContext
    );

    const similarDocs = await service.querySimilar(
      collection.name,
      questionSimify,
      Number(k),
      filters
    );

    // Process similarity results
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
            ...(similarityResult.highestSimilarity && {
              highestSimilarity: similarityResult.highestSimilarity,
            }),
          },
          answer: similarityResult.message,
        },
      });
    }

    const { relevantDocs, totalFound, relevantCount } = similarityResult;

    // Build contexts
    const [documentContext, conversationContext] = await Promise.all([
      Promise.resolve(buildDocumentContext(relevantDocs)),
      buildConversationContext(sectionId),
    ]);

    console.log(
      `✅ Using ${relevantCount} relevant documents out of ${totalFound} found`
    );
    console.log(
      `📝 Conversation context length: ${conversationContext.length} characters`
    );

    // Set up system prompt
    const systemPrompt =
      prompt ||
      `Bạn là một bác sĩ chuyên khoa với kinh nghiệm lâm sàng. 
        QUAN TRỌNG: 
        - Chỉ trả lời dựa trên thông tin được cung cấp trong context và tài liệu.
        - Sử dụng thông tin từ cuộc trò chuyện trước để đưa ra câu trả lời liên kết và phù hợp.
        - Nếu thông tin không đủ để trả lời câu hỏi, hãy thẳng thắn nói rằng bạn không có đủ thông tin.
        - Không bịa đặt hoặc suy đoán thông tin không có trong context.
        - Khi trả lời, hãy tham khảo và liên kết với những gì đã thảo luận trước đó nếu có liên quan.`;

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

    // Generate new conversation context
    const newContext = await generateConversationContext(question, answer);

    // Prepare chat context
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
      },
    };

    let section;
    if (sectionId) {
      // CÁCH 1: Tuần tự để đảm bảo thứ tự
      await chatService.addMessage(sectionId, "user", question);
      await chatService.addMessage(sectionId, "assistant", answer);

      // Cập nhật context song song
      await Promise.all([
        chatService.updateSectionContext(sectionId, {
          ...chatContext,
          updatedAt: new Date().toISOString(),
        }),
        chatService.updateConversationContext(sectionId, newContext),
      ]);

      section = await chatService.getSectionById(sectionId);
    } else {
      // Initialize new chat section
      section = await chatService.initializeChat(
        userId,
        question,
        answer,
        chatContext,
        newContext
      );
    }

    // Return successful response
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
