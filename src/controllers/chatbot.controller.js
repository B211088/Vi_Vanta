import { v4 as uuidv4 } from "uuid";
import {
  DEFAULT_K,
  DEFAULT_MAX_TOKEN,
  DEFAULT_MODEL,
  DEFAULT_SIMILARITY_THRESHOLD,
  OPENAI_API_KEY,
  OPENAI_EMBEDDING_MODEL,
} from "../config/openai.config.js";
import { getCollectionByIdHandle } from "../services/collection.service.js";
import OpenAI from "openai";
import EmbedService from "../services/ragOpenAI.service.js";
import AIChatService from "../services/aiChat.service.js";
import { getAIModelByIdHandle } from "../services/aiModel.service.js";
import chromadbService from "../services/chromadb.service.js";
import Message from "../models/message.model.js";
import Section from "../models/section.model.js";

const service = new EmbedService();
const chatService = new AIChatService();
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Simplified cache manager
class SimpleCache {
  constructor(ttl = 5 * 60 * 1000, maxSize = 500) {
    this.cache = new Map();
    this.ttl = ttl;
    this.maxSize = maxSize;

    setInterval(() => this.cleanup(), ttl / 2);
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item || Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }

  set(key, data) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Cache instances
const embeddingCache = new SimpleCache(30 * 60 * 1000, 1000);
const collectionCache = new SimpleCache(60 * 60 * 1000, 100);

// Circuit breaker for OpenAI calls
class CircuitBreaker {
  constructor(threshold = 3, timeout = 30000) {
    this.failureThreshold = threshold;
    this.timeout = timeout;
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.state = "CLOSED";
  }

  async execute(fn) {
    if (this.state === "OPEN") {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = "HALF_OPEN";
      } else {
        throw new Error("Circuit breaker is OPEN");
      }
    }

    try {
      const result = await fn();
      this.reset();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  recordFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.failureThreshold) {
      this.state = "OPEN";
    }
  }

  reset() {
    this.failureCount = 0;
    this.state = "CLOSED";
  }
}

const openaiCircuitBreaker = new CircuitBreaker();

// Retry with exponential backoff
const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 500) => {
  return openaiCircuitBreaker.execute(async () => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === maxRetries - 1) throw error;
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  });
};

// Get cached embedding
async function getCachedEmbedding(text) {
  const cacheKey = `embed_${Buffer.from(text).toString("base64").slice(0, 32)}`;
  const cached = embeddingCache.get(cacheKey);
  if (cached) return cached;

  const response = await retryWithBackoff(() =>
    openai.embeddings.create({
      model: OPENAI_EMBEDDING_MODEL,
      input: text.slice(0, 8000),
    })
  );

  const embedding = response.data[0].embedding;
  embeddingCache.set(cacheKey, embedding);
  return embedding;
}

// Build conversation context from recent messages
async function buildConversationContext(sectionId, limit = 5) {
  if (!sectionId) return "";

  try {
    // Get recent messages directly from database
    const section = await Section.findById(sectionId)
      .populate({
        path: "messages",
        options: {
          sort: { timestamp: -1 },
          limit: limit,
        },
      })
      .lean();

    if (!section?.messages?.length) return "";

    // Build context from recent messages
    const context = section.messages
      .reverse() // Reverse to get chronological order
      .map(
        (msg) =>
          `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content.slice(
            0,
            200
          )}`
      )
      .join("\n");

    return context;
  } catch (error) {
    console.error("Context building error:", error);
    return "";
  }
}

// Generate session ID for anonymous users
function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Get or create session identifier
function getSessionIdentifier(req) {
  const userId = req.user?.userId;
  const sessionId =
    req.body.sessionId || req.headers["x-session-id"] || generateSessionId();

  return { userId, sessionId };
}

// Query similar documents
async function querySimilarDocuments(
  collectionName,
  query,
  k = 5,
  filters = {}
) {
  try {
    console.log(`🔍 Querying: "${query.slice(0, 50)}" with k=${k}`);

    const queryVector = await getCachedEmbedding(query);
    console.log(
      `🔢 Retrieved query embedding (dimension: ${queryVector.length})`
    );

    const results = await chromadbService.queryDocuments(
      collectionName,
      null,
      Math.min(Number(k), 8),
      filters,
      [queryVector]
    );

    const formattedResults = {
      query: query,
      results: results.documents[0].map((doc, i) => ({
        content: doc,
        metadata: results.metadatas[0][i],
        distance: results.distances[0][i],
        similarity: 1 - results.distances[0][i],
        id: results.ids[0][i],
      })),
      totalResults: results.documents[0].length,
    };

    console.log(`✅ Found ${formattedResults.totalResults} similar documents`);
    return formattedResults;
  } catch (error) {
    console.error("❌ Error querying similar documents:", error);
    throw error;
  }
}

// Process similarity results
function processSimilarityResults(
  similarDocs,
  similarityThreshold,
  maxDocs = 5
) {
  if (!similarDocs?.results?.length) {
    return {
      success: false,
      relevantDocs: [],
      reason: "no_results_found",
      message:
        "Xin lỗi, hiện tại hệ thống chưa có thông tin phù hợp để trả lời câu hỏi này.",
    };
  }

  const relevantDocs = similarDocs.results
    .filter((doc) => doc.similarity >= similarityThreshold)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, maxDocs);

  if (!relevantDocs.length) {
    const maxSimilarity = Math.max(
      ...similarDocs.results.map((doc) => doc.similarity)
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

  return {
    success: true,
    relevantDocs,
    totalFound: similarDocs.results.length,
    relevantCount: relevantDocs.length,
  };
}

// Build document context
function buildDocumentContext(relevantDocs, maxLength = 2500) {
  let context = "";
  let currentLength = 0;

  for (let i = 0; i < Math.min(relevantDocs.length, 5); i++) {
    const doc = relevantDocs[i];
    const docText = `[${i + 1}] (${doc.similarity.toFixed(3)}): ${doc.content}`;

    if (currentLength + docText.length > maxLength) {
      const remainingSpace = maxLength - currentLength;
      context += docText.slice(0, remainingSpace) + "...";
      break;
    }

    context += docText + "\n\n";
    currentLength += docText.length + 2;
  }

  return context.trim();
}

// Generate AI response
async function generateAIResponse({
  question,
  documentContext,
  conversationContext,
  systemPrompt,
  modelData,
  temperature,
  maxToken,
}) {
  const messages = [];

  if (conversationContext?.trim()) {
    messages.push({
      role: "system",
      content: `Bối cảnh cuộc trò chuyện trước:\n${conversationContext.slice(
        0,
        800
      )}`,
    });
  }

  messages.push({
    role: "user",
    content: `
    Yêu cầu hệ thống : \n${systemPrompt}\n
    Thông tin tham khảo:\n${documentContext.slice(
      0,
      2500
    )}\n\nCâu hỏi: "${question}"\n\nTrả lời dựa trên thông tin trên.`,
  });

  console.log({ messages });

  const completion = await retryWithBackoff(() =>
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

// Save chat messages
async function saveChatMessages(
  sectionId,
  question,
  answer,
  { userId, sessionId }
) {
  try {
    // Create messages
    const userMessage = new Message({
      role: "user",
      content: question,
    });

    const assistantMessage = new Message({
      role: "assistant",
      content: answer,
    });

    await Promise.all([userMessage.save(), assistantMessage.save()]);

    let section;

    if (sectionId) {
      // Update existing section
      section = await Section.findByIdAndUpdate(
        sectionId,
        {
          $push: {
            messages: {
              $each: [userMessage._id, assistantMessage._id],
            },
          },
          updatedAt: new Date(),
        },
        { new: true }
      ).populate("messages");
    } else {
      // Create new section
      section = new Section({
        userId: userId || null,
        sessionId,
        title:
          question.length > 50 ? question.substring(0, 50) + "..." : question,
        messages: [userMessage._id, assistantMessage._id],
      });
      await section.save();
      section = await Section.findById(section._id).populate("messages");
    }

    return section;
  } catch (error) {
    console.error("Error saving chat messages:", error);
    throw error;
  }
}

// Main optimized chatbot function
export async function chatWithChatBot(req, res) {
  const startTime = Date.now();
  const { userId, sessionId } = getSessionIdentifier(req);

  const sendResponse = (data, statusCode = 200) => {
    res.status(statusCode).json({
      ...data,
      processingTime: Date.now() - startTime,
      sessionId, // Always return sessionId for client tracking
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

    // Validation
    if (!question?.trim() || !collectionId?.trim()) {
      return sendResponse(
        {
          error: "Invalid input",
          message: "Question and collectionId are required",
        },
        400
      );
    }

    console.log(
      `🤔 Processing: "${question.slice(0, 30)}..." for ${
        userId ? "user" : "anonymous"
      }`
    );

    // Get collection (with caching)
    const collectionCacheKey = `col_${collectionId}`;
    let collection = collectionCache.get(collectionCacheKey);

    if (!collection) {
      collection = await getCollectionByIdHandle(collectionId);
      if (collection) {
        collectionCache.set(collectionCacheKey, collection);
      }
    }

    if (!collection) {
      return sendResponse(
        {
          error: "Collection not found",
          message: `No collection found for collectionId: ${collectionId}`,
        },
        404
      );
    }

    // Get model data and conversation context in parallel
    const [modelData, conversationContext] = await Promise.all([
      modelId ? getAIModelByIdHandle(modelId) : null,
      buildConversationContext(sectionId),
    ]);
    console.log({ conversationContext });
    // Query similar documents
    const filters = documentId ? { documentId } : {};
    const similarDocs = await querySimilarDocuments(
      collection.name,
      question.trim(),
      Math.min(Number(k), 8),
      filters
    );

    const similarityResult = processSimilarityResults(
      similarDocs,
      similarityThreshold,
      5
    );

    console.log("similarityResult.relevantDocs", similarityResult.relevantDocs);

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
    const documentContext = buildDocumentContext(relevantDocs, 2000);
    console.log({ documentContext });
    // Generate AI response
    const systemPrompt =
      prompt ||
      `Bạn là bác sĩ chuyên khoa. Trả lời dựa trên thông tin được cung cấp. Ngắn gọn và chính xác.`;

    console.log({ prompt });

    const answer = await generateAIResponse({
      question,
      documentContext,
      conversationContext,
      systemPrompt,
      modelData,
      temperature,
      maxToken,
    });

    // Save messages
    const section = await saveChatMessages(sectionId, question, answer, {
      userId,
      sessionId,
    });

    console.log(`✨ Completed in ${Date.now() - startTime}ms`);

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
          isAuthenticated: !!userId,
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

// Get chat history for user or session
export async function getChatHistory(req, res) {
  try {
    const { userId, sessionId } = getSessionIdentifier(req);
    const { page = 1, limit = 20 } = req.query;

    const query = userId ? { userId } : { sessionId };

    const sections = await Section.find(query)
      .populate("messages")
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Section.countDocuments(query);

    res.json({
      success: true,
      data: {
        sections,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
        },
      },
      sessionId,
    });
  } catch (error) {
    console.error("Error getting chat history:", error);
    res.status(500).json({
      error: "Failed to get chat history",
      message: error.message,
    });
  }
}

// Health check
export function getHealthStats() {
  return {
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    circuitBreaker: {
      state: openaiCircuitBreaker.state,
      failureCount: openaiCircuitBreaker.failureCount,
    },
  };
}

// Cleanup
process.on("SIGINT", () => {
  console.log("Cleaning up...");
  process.exit(0);
});
