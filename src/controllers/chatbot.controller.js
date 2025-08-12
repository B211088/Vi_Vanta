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
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from "url";
import VoiceMessage from "../models/voiceMessage.model.js";
import Health from "../models/health.model.js";
import User from "../models/user.model.js";
import Appointment from "../models/appointment.model.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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
    )}\n\nCâu hỏi: "${question}"\n\nTrả lời dựa trên thông tin trên. *
    Lưu ý: Nếu câu hỏi hoàn toàn không liên quan đến y tế thì không trả lời và đưa ra thông báo, và có thể người dùng đánh sai chính tả thuật ngữ y tế, tên bệnh hoặc tên thuốc bạn nên kiểm tra cho kỹ `,
  });

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

    const systemPrompt =
      prompt ||
      `Bạn là bác sĩ chuyên khoa. Trả lời dựa trên thông tin được cung cấp. Ngắn gọn và chính xác.`;

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

// --- Helpers: Cải thiện để xử lý nhiều loại câu hỏi hơn ---

/**
 * Kiểm tra xem câu hỏi có phải về thông tin cá nhân của user không
 * Bao gồm cả y tế và thông tin cá nhân khác
 */
function isPersonalQuestion(text) {
  if (!text) return false;

  const pronouns =
    /(tôi|mình|em|anh|chị|tui|của tôi|của mình|cho tôi|giúp tôi)\b/i;
  const personalTopics =
    /(bmi|cân nặng|chiều cao|tuổi|mỡ|vòng\s*eo|dị ứng|bệnh nền|nhóm máu|hồ\s*sơ|profile|thông tin|dữ liệu|lịch sử)/i;
  const healthTopics =
    /(sức khỏe|khám bệnh|thuốc|bác sĩ|triệu chứng|đau|ốm|khỏe|dinh dưỡng|ăn uống|tập luyện|vận động)/i;
  const appointmentTopics =
    /(lịch\s*khám|cuộc\s*hẹn|đặt lịch|hủy lịch|bác sĩ|phòng khám)/i;

  return (
    pronouns.test(text) ||
    personalTopics.test(text) ||
    (pronouns.test(text) &&
      (healthTopics.test(text) || appointmentTopics.test(text)))
  );
}

/**
 * Tạo tóm tắt thông tin cá nhân đầy đủ hơn
 */
function createPersonalSummary({ user, health, appointments }) {
  const sections = [];

  // Thông tin cơ bản
  if (user) {
    const basicInfo = [];
    if (user.fullName) basicInfo.push(`Tên: ${user.fullName}`);
    if (user.gender && user.gender !== "other") {
      const genderText =
        user.gender === "male"
          ? "Nam"
          : user.gender === "female"
          ? "Nữ"
          : user.gender;
      basicInfo.push(`Giới tính: ${genderText}`);
    }
    if (user.phone) basicInfo.push(`SĐT: ${user.phone}`);
    if (user.dateOfBirth) {
      const age = Math.max(
        0,
        Math.floor(
          (Date.now() - new Date(user.dateOfBirth)) /
            (365.25 * 24 * 3600 * 1000)
        )
      );
      basicInfo.push(`Tuổi: ${age}`);
    }
    if (user.userType && user.userType !== "normal") {
      basicInfo.push(`Loại người dùng: ${user.userType}`);
    }
    if (basicInfo.length)
      sections.push(`THÔNG TIN CÁ NHÂN: ${basicInfo.join(" • ")}`);
  }

  // Thông tin sức khỏe
  if (health) {
    const healthInfo = [];

    // Chỉ số cơ thể
    const measurements = [];
    if (health.height) measurements.push(`cao ${health.height}cm`);
    if (health.weight) measurements.push(`nặng ${health.weight}kg`);
    if (health.waist) measurements.push(`eo ${health.waist}cm`);
    if (health.hip) measurements.push(`mông ${health.hip}cm`);
    if (health.neck) measurements.push(`cổ ${health.neck}cm`);
    if (measurements.length)
      healthInfo.push(`Số đo: ${measurements.join(", ")}`);

    // Tính BMI nếu có đủ thông tin
    if (health.height && health.weight && health.height > 0) {
      const bmi = (health.weight / Math.pow(health.height / 100, 2)).toFixed(1);
      let bmiStatus = "";
      if (bmi < 18.5) bmiStatus = "(thiếu cân)";
      else if (bmi < 25) bmiStatus = "(bình thường)";
      else if (bmi < 30) bmiStatus = "(thừa cân)";
      else bmiStatus = "(béo phì)";
      healthInfo.push(`BMI: ${bmi} ${bmiStatus}`);
    }

    // Thông tin y tế
    if (health.bloodType && health.bloodType !== "unknown") {
      healthInfo.push(`Nhóm máu: ${health.bloodType}`);
    }
    if (health.heartRate && health.heartRate > 0) {
      healthInfo.push(`Nhịp tim: ${health.heartRate} bpm`);
    }
    if (health.activityLevel) {
      const activityMap = {
        sedentary: "ít vận động",
        light: "vận động nhẹ",
        moderate: "vận động vừa",
        active: "vận động nhiều",
        very_active: "vận động rất nhiều",
      };
      healthInfo.push(
        `Mức độ vận động: ${
          activityMap[health.activityLevel] || health.activityLevel
        }`
      );
    }
    if (health.goal) {
      const goalMap = {
        lose: "giảm cân",
        maintain: "duy trì cân nặng",
        gain: "tăng cân",
      };
      healthInfo.push(`Mục tiêu: ${goalMap[health.goal] || health.goal}`);
    }

    // Bệnh lý và dị ứng
    if (
      Array.isArray(health.chronicDiseases) &&
      health.chronicDiseases.length
    ) {
      healthInfo.push(`Bệnh nền: ${health.chronicDiseases.join(", ")}`);
    }
    if (Array.isArray(health.allergies) && health.allergies.length) {
      healthInfo.push(`Dị ứng: ${health.allergies.join(", ")}`);
    }

    if (healthInfo.length)
      sections.push(`THÔNG TIN SỨC KHỎE: ${healthInfo.join(" • ")}`);
  }

  // Lịch khám gần nhất
  if (appointments?.length) {
    const recentAppointments = appointments.slice(0, 3).map((a) => {
      const date = a?.date
        ? new Date(a.date).toLocaleDateString("vi-VN")
        : "N/A";
      const time = a?.timeSlots
        ? `${a.timeSlots.startTime}-${a.timeSlots.endTime}`
        : "";
      const doctor = a?.doctorId?.name
        ? `BS ${a.doctorId.name}`
        : "Bác sĩ không rõ";
      const status = a?.status ? `(${a.status})` : "";
      return `${date} ${time} ${doctor} ${status}`.trim();
    });
    sections.push(`LỊCH KHÁM GỦI NHẤT: ${recentAppointments.join(" | ")}`);
  }

  return sections.join("\n");
}

/**
 * Kiểm tra xem câu hỏi có liên quan đến y tế/sức khỏe không
 */
function isHealthRelated(text) {
  if (!text) return false;

  const healthKeywords =
    /(y tế|sức khỏe|bệnh|thuốc|triệu chứng|đau|ốm|khỏe|bác sĩ|phòng khám|khám bệnh|chữa trị|điều trị|dị ứng|cảm cúm|sốt|ho|nhức đầu|bụng|tim|gan|thận|phổi|da|mắt|tai|miệng|răng|xương|khớp|cơ|máu|huyết áp|tiểu đường|cholesterol|vitamin|khoáng chất|dinh dưỡng|ăn uống|tập luyện|vận động|yoga|gym|chạy bộ|đạp xe|bơi lội|giảm cân|tăng cân|diet|kiêng ăn|chế độ ăn|bmi|calo|protein|carb|chất béo|nước|ngủ|mất ngủ|stress|trầm cảm|lo âu|tâm lý|tinh thần)/i;

  return healthKeywords.test(text);
}

/**
 * Main function xử lý chat với voice
 */
export async function chatWithVoice(req, res) {
  const { question, userId } = req.body;

  if (!question?.trim()) {
    return res.status(400).json({ error: "Vui lòng nhập câu hỏi." });
  }

  try {
    let context = [];
    let personalSummary = null;
    let userProfile = null;
    let healthProfile = null;
    let appointmentList = [];

    // Lấy thông tin người dùng nếu có userId
    if (userId) {
      // Lấy lịch sử hội thoại gần nhất
      const recentMessages = await VoiceMessage.find({ userId })
        .select("role content")
        .sort({ createdAt: -1 })
        .limit(8); // Tăng lên 8 để có context tốt hơn

      if (recentMessages?.length) {
        context = recentMessages.reverse(); // Đảo ngược để có thứ tự cũ -> mới
      }

      // Lấy thông tin profile
      userProfile = await User.findById(userId).lean();

      // Lấy thông tin sức khỏe
      healthProfile = await Health.findOne({ userId }).lean();

      // Lấy danh sách lịch khám
      appointmentList = await Appointment.find({ userId })
        .populate("services")
        .populate({
          path: "doctorId",
          select: "name specialty infoClinic",
          populate: {
            path: "infoClinic.address.wardId infoClinic.address.districtId infoClinic.address.provinceId",
            select: "name",
          },
        })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

      // Tạo summary nếu câu hỏi liên quan đến cá nhân
      if (isPersonalQuestion(question)) {
        personalSummary = createPersonalSummary({
          user: userProfile,
          health: healthProfile,
          appointments: appointmentList,
        });
      }
    }

    // Tạo context cho AI
    const contextString = context.length
      ? context.map((m) => `${m.role}: ${m.content}`).join("\n")
      : "Không có lịch sử trò chuyện trước đó.";

    const personalInfo = personalSummary
      ? `\n=== THÔNG TIN CÁ NHÂN CỦA NGƯỜI DÙNG ===\n${personalSummary}\n=== KẾT THÚC THÔNG TIN CÁ NHÂN ===\n`
      : "";

    // Kiểm tra xem có phải câu hỏi về y tế không
    const isHealthQuestion = isHealthRelated(question);

    // Tạo system message
    let systemMessage = "";

    if (isHealthQuestion) {
      systemMessage =
        `Bạn là trợ lý AI chuyên về y tế và sức khỏe. Hãy trả lời bằng tiếng Việt một cách thân thiện, chính xác và hữu ích.\n` +
        `QUAN TRỌNG: Luôn khuyên người dùng tham khảo ý kiến bác sĩ chuyên khoa cho những vấn đề sức khỏe nghiêm trọng.\n` +
        personalInfo +
        `Lịch sử cuộc trò chuyện:\n${contextString}\n\n` +
        `Hãy trả lời câu hỏi dựa trên thông tin cá nhân (nếu có) và kiến thức y tế. Bắt đầu câu trả lời bằng cách tương tác thân thiện với người dùng. nên gọi người dùng bằng tên hạn chế gọi cả họ và tên`;
    } else {
      systemMessage =
        `Tôi là trợ lý AI chuyên về y tế và sức khỏe. Tôi chỉ có thể trả lời các câu hỏi liên quan đến:\n` +
        `- Y tế, sức khỏe, bệnh tật\n` +
        `- Dinh dưỡng, chế độ ăn uống\n` +
        `- Tập luyện, vận động\n` +
        `- Chăm sóc sức khỏe cá nhân\n` +
        `- Quản lý thông tin sức khỏe và lịch khám\n\n` +
        personalInfo +
        `Với câu hỏi "${question}", tôi không thể trả lời vì nó nằm ngoài phạm vi chuyên môn của tôi. ` +
        `Vui lòng hỏi tôi về các vấn đề liên quan đến sức khỏe nhé!`;
    }

    // Gọi OpenAI API
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: question },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const answer = chatCompletion.choices[0].message.content;

    // Tạo file âm thanh
    const speechResponse = await openai.audio.speech.create({
      model: "tts-1",
      input: answer,
      voice: "nova",
      response_format: "mp3",
      speed: 1.1,
    });

    const filename = `${uuidv4()}.mp3`;
    const audioFilePath = path.resolve(__dirname, "../voices", filename);

    const buffer = Buffer.from(await speechResponse.arrayBuffer());
    fs.writeFileSync(audioFilePath, buffer);

    // Lưu lịch sử hội thoại
    if (userId) {
      await VoiceMessage.create({
        userId,
        role: "user",
        content: question,
      });

      await VoiceMessage.create({
        userId,
        role: "assistant",
        content: answer,
        voiceUrl: `/voices/${filename}`,
      });
    }

    return res.json({
      success: true,
      answer,
      file: `/voices/${filename}`,
      isHealthRelated: isHealthQuestion,
      hasPersonalInfo: !!personalSummary,
    });
  } catch (error) {
    console.error("❌ Error in chatWithVoice:", error);
    return res.status(500).json({
      error: "Không thể xử lý yêu cầu.",
      message: error?.message || "Lỗi không xác định",
    });
  }
}

export async function getVoiceMessages(req, res) {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ error: "Thiếu userId trong query." });
  }
  try {
    let messages = await VoiceMessage.find({ userId })
      .sort({ createdAt: -1 }) // mới nhất trước
      .limit(50); // chỉ lấy 50 cái

    messages = messages.reverse(); // để client render từ cũ → mới

    return res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error("❌ Lỗi khi lấy voice messages:", error);
    return res.status(500).json({
      success: false,
      error: "Lỗi máy chủ.",
      message: error?.message || "Unknown error",
    });
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
