import { v4 as uuidv4 } from "uuid";
import {
  CONTEXT_HISTORY_LIMIT,
  DEFAULT_K,
  DEFAULT_MAX_TOKEN,
  DEFAULT_MODEL,
  DEFAULT_SIMILARITY_THRESHOLD,
  OPENAI_API_KEY,
} from "../config/openai.config.js";
import { getCollectionByIdHandle } from "../services/collection.service.js";
import OpenAI from "openai";
import EmbedService from "../services/ragOpenAI.service.js";
import AIChatService from "../services/aiChat.service.js";
import { getAIModelByIdHandle } from "../services/aiModel.service.js";

const service = new EmbedService();
const chatService = new AIChatService();
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Enhanced cache with memory management
class CacheManager {
  constructor(ttl = 5 * 60 * 1000, maxSize = 1000) {
    this.cache = new Map();
    this.ttl = ttl;
    this.maxSize = maxSize;
    this.cleanupInterval = setInterval(() => this.cleanup(), ttl);
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Update last accessed time
    item.lastAccessed = Date.now();
    return item.data;
  }

  set(key, data) {
    // Cleanup if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      lastAccessed: Date.now(),
    });
  }

  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }

  evictOldest() {
    let oldest = null;
    let oldestTime = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (item.lastAccessed < oldestTime) {
        oldest = key;
        oldestTime = item.lastAccessed;
      }
    }

    if (oldest) {
      this.cache.delete(oldest);
    }
  }

  destroy() {
    clearInterval(this.cleanupInterval);
    this.cache.clear();
  }
}

// Optimized caches
const contextCache = new CacheManager(5 * 60 * 1000, 500);
const queryCache = new CacheManager(10 * 60 * 1000, 300);
const collectionCache = new CacheManager(30 * 60 * 1000, 100);

// Optimized retry utility with exponential backoff
const retry = async (fn, maxRetries = 3, baseDelay = 1000) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;

      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

// Batch processing utility
const batchProcess = async (items, processor, batchSize = 5) => {
  const results = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);
  }
  return results;
};

// Optimized context generation with streaming
async function generateConversationContext(question, answer) {
  const cacheKey = `context_${Buffer.from(question + answer)
    .toString("base64")
    .slice(0, 50)}`;
  const cached = contextCache.get(cacheKey);
  if (cached) return cached;

  try {
    const completion = await retry(() =>
      openai.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: "system",
            content: `Tóm tắt cuộc trò chuyện ngắn gọn dưới 150 từ. Format JSON: {"summary": "...", "keyPoints": ["..."], "lastContext": "..."}`,
          },
          {
            role: "user",
            content: `Q: ${question.slice(0, 200)}\nA: ${answer.slice(0, 300)}`,
          },
        ],
        temperature: 0.1,
        max_tokens: 200,
        stream: false,
      })
    );

    const result = JSON.parse(completion.choices[0].message.content);
    contextCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error("Context generation error:", error);
    return { summary: "", keyPoints: [], lastContext: "" };
  }
}

// Optimized conversation context builder
async function buildConversationContext(
  sectionId,
  limit = CONTEXT_HISTORY_LIMIT
) {
  if (!sectionId) return "";

  const cacheKey = `conv_${sectionId}_${limit}`;
  const cached = contextCache.get(cacheKey);
  if (cached) return cached;

  try {
    // Get minimal chat history
    const chatHistory = await chatService.getChatHistory(
      sectionId,
      Math.min(limit, 3)
    );

    if (!chatHistory?.length) return "";

    // Efficient context building
    const contextMessages = chatHistory
      .slice(-limit)
      .map(
        (msg) =>
          `${msg.role === "user" ? "U" : "A"}: ${msg.content.slice(0, 300)}`
      )
      .join("\n");

    let result = contextMessages;

    // Only summarize if really necessary
    if (contextMessages.length > 2000) {
      const summary = await retry(() =>
        openai.chat.completions.create({
          model: DEFAULT_MODEL,
          messages: [
            {
              role: "system",
              content: "Tóm tắt cuộc trò chuyện thành context ngắn gọn <150 từ",
            },
            { role: "user", content: contextMessages },
          ],
          temperature: 0.1,
          max_tokens: 150,
        })
      );
      result = summary.choices[0].message.content;
    }

    contextCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error("Context building error:", error);
    return "";
  }
}

// Optimized query simplification
export const simplifyQuery = async (userQuestion, context = "") => {
  const cacheKey = `query_${Buffer.from(userQuestion + context)
    .toString("base64")
    .slice(0, 50)}`;
  const cached = queryCache.get(cacheKey);
  if (cached) return cached;

  try {
    const completion = await retry(() =>
      openai.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: "system",
            content: `Chuyên gia y tế. Context: ${context.slice(
              0,
              200
            )}\nChuyển đổi câu hỏi thành mô tả cụ thể về tình trạng sức khỏe, tập trung vào triệu chứng.`,
          },
          { role: "user", content: userQuestion.slice(0, 500) },
        ],
        temperature: 0.3,
        max_tokens: 150,
      })
    );

    const result = completion.choices[0].message.content;
    queryCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error("Query simplification error:", error);
    return userQuestion;
  }
};

// Optimized similarity processing
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

  // Vectorized similarity calculation
  const docsWithSimilarity = similarDocs.results.map((doc) => ({
    ...doc,
    similarity: 1 - doc.distance,
  }));

  const relevantDocs = docsWithSimilarity.filter(
    (doc) => doc.similarity >= similarityThreshold
  );

  if (!relevantDocs.length) {
    const maxSimilarity = Math.max(
      ...docsWithSimilarity.map((doc) => doc.similarity)
    );
    return {
      success: false,
      relevantDocs: [],
      reason: "low_similarity",
      highestSimilarity: maxSimilarity.toFixed(3),
      message:
        "Xin lỗi, hiện tại hệ thống chưa có thông tin phù hợp để trả lời câu hỏi này.",
    };
  }

  // Sort by similarity descending
  relevantDocs.sort((a, b) => b.similarity - a.similarity);

  return {
    success: true,
    relevantDocs,
    totalFound: similarDocs.results.length,
    relevantCount: relevantDocs.length,
  };
}

// Optimized document context builder
function buildDocumentContext(relevantDocs) {
  return relevantDocs
    .slice(0, 5) // Limit to top 5 most relevant
    .map(
      (doc, i) =>
        `[${i + 1}] (${doc.similarity.toFixed(3)}): ${doc.content.slice(
          0,
          800
        )}`
    )
    .join("\n\n");
}

// Optimized AI response generation
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

  if (conversationContext?.trim()) {
    messages.push({
      role: "system",
      content: `Context: ${conversationContext.slice(0, 500)}`,
    });
  }

  messages.push({
    role: "user",
    content: `Thông tin tham khảo:\n${documentContext.slice(
      0,
      3000
    )}\n\nCâu hỏi: "${question}"\n\nTrả lời dựa trên thông tin trên. Nếu không đủ thông tin, hãy nói thẳng.`,
  });

  const completion = await retry(() =>
    openai.chat.completions.create({
      model: modelData?.name || DEFAULT_MODEL,
      messages,
      temperature: temperature || 0.3,
      max_tokens: maxToken || DEFAULT_MAX_TOKEN,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    })
  );

  return completion.choices[0].message.content;
}

// Main optimized chatbot function
export async function chatWithChatBot(req, res) {
  const userId = req.user.userId;
  const startTime = Date.now();

  // Early response helper
  const sendResponse = (data, statusCode = 200) => {
    res.status(statusCode).json({
      ...data,
      processingTime: Date.now() - startTime,
    });
  };

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

    // Fast validation
    if (!question?.trim()) {
      return sendResponse(
        {
          error: "Invalid question",
          message: "Question must be a non-empty string",
        },
        400
      );
    }

    if (!collectionId?.trim()) {
      return sendResponse(
        {
          error: "Invalid collectionId",
          message: "collectionId must be a non-empty string",
        },
        400
      );
    }

    console.log(
      `🤔 Processing: "${question.slice(0, 50)}..." (${
        Date.now() - startTime
      }ms)`
    );

    // Optimized parallel data fetching with caching
    const collectionCacheKey = `collection_${collectionId}`;
    let collection = collectionCache.get(collectionCacheKey);

    const [modelData, contextData] = await Promise.all([
      modelId ? getAIModelByIdHandle(modelId) : Promise.resolve(null),
      sectionId
        ? chatService.getconversationContextSectionById(sectionId)
        : Promise.resolve(null),
      // Fetch collection only if not cached
      !collection
        ? getCollectionByIdHandle(collectionId).then((col) => {
            if (col) collectionCache.set(collectionCacheKey, col);
            return col;
          })
        : Promise.resolve(collection),
    ]);

    collection = collection || collectionCache.get(collectionCacheKey);

    if (!collection) {
      return sendResponse(
        {
          error: "Collection not found",
          message: `No collection found for collectionId: ${collectionId}`,
        },
        404
      );
    }

    const queryConversationContext = contextData?.lastContext || "";

    // Parallel processing of query and context
    const [questionSimify, conversationContext] = await Promise.all([
      simplifyQuery(question.trim(), queryConversationContext),
      buildConversationContext(sectionId),
    ]);

    console.log(`📝 Context prepared (${Date.now() - startTime}ms)`);

    // Optimized document querying
    const filters = documentId ? { documentId } : {};
    const similarDocs = await service.querySimilar(
      collection.name,
      questionSimify,
      Math.min(Number(k), 10), // Limit k to prevent excessive processing
      filters
    );

    const similarityResult = processSimilarityResults(
      similarDocs,
      similarityThreshold
    );

    if (!similarityResult.success) {
      return sendResponse({
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
    const documentContext = buildDocumentContext(relevantDocs);

    console.log(`✅ Documents processed (${Date.now() - startTime}ms)`);

    const systemPrompt =
      prompt ||
      `Bạn là bác sĩ chuyên khoa. Chỉ trả lời dựa trên thông tin được cung cấp. Sử dụng context cuộc trò chuyện để đưa ra câu trả lời liên kết. Nếu thiếu thông tin, hãy nói thẳng.`;

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

    // Generate context AFTER we have the answer
    const newContext = await generateConversationContext(question, answer);

    // Handle section and chat operations
    let section;

    if (sectionId) {
      // Update existing section
      await Promise.all([
        chatService.addMessage(sectionId, "user", question),
        chatService.addMessage(sectionId, "assistant", answer),
      ]);

      section = await chatService.getSectionById(sectionId);

      // Fire and forget context updates
      setImmediate(() => {
        chatService.updateSectionContext(sectionId, {
          documentIds: relevantDocs.map((doc) => doc.metadata.documentId),
          relevantChunks: relevantDocs.slice(0, 3).map((doc) => ({
            content: doc.content.slice(0, 200),
            metadata: doc.metadata,
            relevance: doc.similarity,
            similarityScore: doc.similarity.toFixed(3),
          })),
          additionalContext: {
            model: modelData?.name || DEFAULT_MODEL,
            processedAt: new Date().toISOString(),
            totalDocumentsFound: totalFound,
            relevantDocumentsUsed: relevantCount,
          },
          updatedAt: new Date().toISOString(),
        });
        chatService.updateConversationContext(sectionId, newContext);
      });
    } else {
      // Create new section
      section = await chatService.initializeChat(
        userId,
        question,
        answer,
        {
          documentIds: relevantDocs.map((doc) => doc.metadata.documentId),
          relevantChunks: relevantDocs.slice(0, 3).map((doc) => ({
            content: doc.content.slice(0, 200),
            metadata: doc.metadata,
            relevance: doc.similarity,
            similarityScore: doc.similarity.toFixed(3),
          })),
          additionalContext: {
            model: modelData?.name || DEFAULT_MODEL,
            processedAt: new Date().toISOString(),
            totalDocumentsFound: totalFound,
            relevantDocumentsUsed: relevantCount,
          },
        },
        newContext
      );
    }

    console.log(`✨ Completed (${Date.now() - startTime}ms)`);

    sendResponse({
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
    console.error(`❌ Error (${Date.now() - startTime}ms):`, error);

    sendResponse(
      {
        error: "Question processing failed",
        message:
          error.message || "An error occurred while processing your question",
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      500
    );
  }
}

// Cleanup function for graceful shutdown
export function cleanup() {
  contextCache.destroy();
  queryCache.destroy();
  collectionCache.destroy();
}

// Auto-cleanup on process exit
process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
